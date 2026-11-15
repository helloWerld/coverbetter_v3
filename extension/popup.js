import { extractJobPost } from './extract.js';

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

async function readJobPost() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab || !tab.id || !/^https?:/.test(tab.url || '')) return null;
	try {
		const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractJobPost });
		return res ? res.result : null;
	} catch {
		// Chrome blocks scripts on some pages, for example the Chrome Web Store.
		return null;
	}
}

const SOURCE_HINTS = {
	selection: 'From the text you selected. Check it before you write.',
	'structured-data': 'Read from this job post. Check it before you write.',
	site: 'Read from this job post. Check it before you write.',
	page: 'This is all the text on the page. Delete the parts that are not the job post.',
};

function fillJob(job) {
	const parts = job ? [job.title, job.company].filter(Boolean) : [];
	$('job-heading').textContent = parts.length ? parts.join(' at ') : 'Paste the job post below';
	$('description').value = job ? job.description : '';
	$('source-hint').textContent = job
		? SOURCE_HINTS[job.source] || ''
		: 'We could not read this page. Copy the job post and paste it here.';
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
	if (description.length < 50) return showError('The job post is too short. Paste at least 50 characters.');

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
		const { jobTitle, company, body, url } = res.data;
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
