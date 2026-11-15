import { extractJobPost, readSelection } from './extract.js';

const SITE = 'https://coverbetter.io';
const $ = (id) => document.getElementById(id);
const VIEWS = ['view-loading', 'view-connect', 'view-no-resume', 'view-form', 'view-result'];

let session = { token: '', baseUrl: SITE };
let lastLetterUrl = '';

function show(view) {
	for (const v of VIEWS) $(v).hidden = v !== view;
	$('disconnect').hidden = !session.token || view === 'view-connect' || view === 'view-loading';
}

function openTab(url) {
	chrome.tabs.create({ url });
	window.close();
}

async function api(path, init = {}) {
	const res = await fetch(session.baseUrl + path, {
		...init,
		// The token is the only sign-in. Site cookies stay out of it.
		credentials: 'omit',
		headers: {
			Authorization: `Bearer ${session.token}`,
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
		},
	});
	let data = {};
	try {
		data = await res.json();
	} catch {
		// The body is empty or not JSON. The status code is enough.
	}
	if (res.status === 401) {
		await chrome.storage.local.remove(['token', 'baseUrl']);
		session.token = '';
	}
	return { ok: res.ok, status: res.status, data };
}

const MIN_TEXT = 50;
const PENDING_MAX_AGE_MS = 10 * 60 * 1000;

/** Text saved by the right-click menu item (background.js) for this tab, if it is new. */
async function takePendingSelection(tab) {
	try {
		const { pendingJob } = await chrome.storage.session.get('pendingJob');
		if (!pendingJob) return null;
		await chrome.storage.session.remove('pendingJob');
		chrome.action.setBadgeText({ text: '', tabId: tab.id });
		const fresh = Date.now() - pendingJob.at < PENDING_MAX_AGE_MS;
		if (!fresh || pendingJob.tabId !== tab.id || pendingJob.description.length < MIN_TEXT) return null;
		return pendingJob;
	} catch {
		return null;
	}
}

async function readJobPost() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab || !tab.id || !/^https?:/.test(tab.url || '')) return null;

	const pending = await takePendingSelection(tab);
	try {
		const target = { tabId: tab.id };
		const [main] = await chrome.scripting.executeScript({ target, func: extractJobPost });
		const job = main && main.result ? main.result : { title: '', company: '', description: '', source: 'none' };
		if (pending) return { ...job, description: pending.description, source: 'selection' };

		// Some career pages show the job in an iframe. Use the longest highlight in any frame.
		if (job.source !== 'selection') {
			const frames = await chrome.scripting
				.executeScript({ target: { ...target, allFrames: true }, func: readSelection })
				.catch(() => []);
			const best = frames.map((f) => f.result || '').sort((a, b) => b.length - a.length)[0] || '';
			if (best.length >= MIN_TEXT) return { ...job, description: best, source: 'selection' };
		}
		return job;
	} catch {
		// Chrome blocks scripts on some pages, for example the Chrome Web Store.
		return pending ? { title: '', company: '', description: pending.description, source: 'selection' } : null;
	}
}

const FOUND_HINT =
	'We found the job description on this page. Check it. To use other text, highlight it on the page and click the CoverBetter icon again.';
const HIGHLIGHT_HINT =
	'Highlight the job description on the page, then click the CoverBetter icon again. You can also right-click the highlighted text, or paste the text here.';

const SOURCE_HINTS = {
	selection: 'From the text you highlighted.',
	'structured-data': FOUND_HINT,
	site: FOUND_HINT,
	none: HIGHLIGHT_HINT,
};

function fillJob(job) {
	const parts = job ? [job.title, job.company].filter(Boolean) : [];
	$('job-heading').textContent = parts.length ? parts.join(' at ') : 'Job post';
	$('description').value = job ? job.description : '';
	$('description').placeholder = 'Highlight the job description on the page, or paste it here.';
	$('source-hint').textContent = job ? SOURCE_HINTS[job.source] || HIGHLIGHT_HINT : HIGHLIGHT_HINT;
}

function showFit(fit) {
	$('fit').hidden = !fit;
	if (!fit) return;
	$('fit-number').textContent = String(fit.score);
	$('fit-label').textContent = fit.label;
	$('fit-summary').textContent = fit.summary || '';
	const gaps = [...(fit.missing || []), ...(fit.partial || []).map((p) => `${p} (partly)`)];
	$('fit-gaps').textContent = gaps.length ? `Gaps: ${gaps.join(', ')}.` : 'No gaps found in the main requirements.';
}

function letterCount(n) {
	if (n <= 0) return 'You have no letters left.';
	return n === 1 ? '1 letter left.' : `${n} letters left.`;
}

async function start() {
	show('view-loading');
	const stored = await chrome.storage.local.get(['token', 'baseUrl']);
	session = { token: stored.token || '', baseUrl: stored.baseUrl || SITE };
	if (!session.token) return show('view-connect');

	const [me, job] = await Promise.all([api('/api/ext/me').catch(() => null), readJobPost()]);
	if (!me) {
		show('view-form');
		fillJob(job);
		return showError('We could not reach CoverBetter. Check your connection and open the popup again.');
	}
	if (me.status === 401) return show('view-connect');

	const { email, lettersLeft, canChooseStyle, resumes } = me.data;
	$('account').textContent = email || '';
	if (!resumes || resumes.length === 0) return show('view-no-resume');

	const select = $('resume');
	select.replaceChildren(
		...resumes.map((r) => {
			const o = document.createElement('option');
			o.value = r.id;
			o.textContent = r.title;
			return o;
		}),
	);
	const { lastResumeId } = await chrome.storage.local.get('lastResumeId');
	if (resumes.some((r) => r.id === lastResumeId)) select.value = lastResumeId;

	$('tone').disabled = !canChooseStyle;
	$('length').disabled = !canChooseStyle;
	$('style-hint').hidden = !!canChooseStyle;
	$('left').textContent = letterCount(lettersLeft);

	fillJob(job);
	show('view-form');
}

function showError(message) {
	const el = $('form-error');
	el.textContent = message;
	el.hidden = !message;
}

async function write(e) {
	e.preventDefault();
	showError('');
	const description = $('description').value.trim();
	if (description.length < MIN_TEXT) {
		return showError('Add the job description first. Highlight it on the page, or paste at least 50 characters.');
	}

	const button = $('write');
	button.disabled = true;
	button.textContent = 'Writing your letter…';
	const resumeId = $('resume').value;
	chrome.storage.local.set({ lastResumeId: resumeId });

	try {
		const res = await api('/api/ext/letters', {
			method: 'POST',
			body: JSON.stringify({
				resumeId,
				jobDescription: description,
				tone: $('tone').value,
				length: $('length').value,
			}),
		});
		if (res.status === 401) return show('view-connect');
		if (!res.ok) {
			showError(res.data.error || 'We could not write your letter. Try again.');
			if (res.data.code === 'no_credits' || res.data.code === 'pro_cap') {
				$('left').textContent = 'Buy credits on CoverBetter to keep going.';
			}
			return;
		}
		const { jobTitle, company, body, url, fit } = res.data;
		showFit(fit);
		lastLetterUrl = url;
		$('result-heading').textContent = [jobTitle, company].filter(Boolean).join(' at ') || 'Your letter';
		$('letter').value = body;
		$('copy-status').textContent = '';
		show('view-result');
	} catch {
		showError('We could not reach CoverBetter. Check your connection and try again.');
	} finally {
		button.disabled = false;
		button.textContent = 'Write my cover letter';
	}
}

$('connect').addEventListener('click', () => openTab(`${SITE}/dashboard/extension`));
$('add-resume').addEventListener('click', () => openTab(`${session.baseUrl}/dashboard/resumes`));
$('view-form').addEventListener('submit', write);
$('open').addEventListener('click', () => lastLetterUrl && openTab(lastLetterUrl));
$('back').addEventListener('click', () => start());
$('copy').addEventListener('click', async () => {
	try {
		await navigator.clipboard.writeText($('letter').value);
		$('copy-status').textContent = 'Copied.';
	} catch {
		$('letter').select();
		$('copy-status').textContent = 'Press Ctrl+C or Cmd+C to copy.';
	}
});
$('disconnect').addEventListener('click', async () => {
	await api('/api/ext/token', { method: 'DELETE' }).catch(() => null);
	await chrome.storage.local.remove(['token', 'baseUrl', 'lastResumeId']);
	session.token = '';
	$('account').textContent = '';
	show('view-connect');
});

start();
