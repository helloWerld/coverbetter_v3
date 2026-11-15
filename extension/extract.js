/**
 * Reads the job post on the current page.
 *
 * Chrome copies this function into the page with chrome.scripting.executeScript,
 * so it must not use anything from outside its own body.
 *
 * Order: text the user selected, then JobPosting structured data,
 * then known job sites, then the main part of the page.
 *
 * @returns {{ title: string, company: string, description: string, source: string, url: string }}
 */
export function extractJobPost() {
	const MAX = 20000;

	const clean = (text) =>
		String(text || '')
			.replace(/ /g, ' ')
			.replace(/[ \t]+/g, ' ')
			.replace(/ *\n */g, '\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();

	const textOf = (el) => clean(el ? el.innerText || el.textContent : '');

	const first = (selectors) => {
		for (const s of selectors) {
			const el = document.querySelector(s);
			const t = textOf(el);
			if (t) return t;
		}
		return '';
	};

	const htmlToText = (html) => {
		const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
		doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
		doc.querySelectorAll('p, li, div, h1, h2, h3, h4, ul, ol').forEach((el) => el.append('\n'));
		doc.querySelectorAll('li').forEach((li) => li.prepend('- '));
		return clean(doc.body ? doc.body.textContent : '');
	};

	const result = (title, company, description, source) => ({
		title: clean(title).slice(0, 200),
		company: clean(company).slice(0, 200),
		description: clean(description).slice(0, MAX),
		source,
		url: location.href,
	});

	// 1. Structured data. Many job boards and career sites publish it.
	const findPosting = (node) => {
		if (!node || typeof node !== 'object') return null;
		if (Array.isArray(node)) {
			for (const n of node) {
				const hit = findPosting(n);
				if (hit) return hit;
			}
			return null;
		}
		const type = node['@type'];
		if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) return node;
		return findPosting(node['@graph']);
	};
	let posting = null;
	for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
		try {
			posting = findPosting(JSON.parse(s.textContent || ''));
		} catch {
			posting = null;
		}
		if (posting) break;
	}

	// 2. Known job sites. Class names change often, so each site has more than one selector.
	const host = location.hostname;
	const SITES = [
		{
			test: /(^|\.)linkedin\.com$/,
			title: ['.job-details-jobs-unified-top-card__job-title', '.jobs-unified-top-card__job-title', '.top-card-layout__title', 'h1'],
			company: ['.job-details-jobs-unified-top-card__company-name', '.jobs-unified-top-card__company-name', '.topcard__org-name-link'],
			description: ['#job-details', '.jobs-description__content', '.jobs-box__html-content', '.show-more-less-html__markup'],
		},
		{
			test: /(^|\.)indeed\.com$/,
			title: ['[data-testid="jobsearch-JobInfoHeader-title"]', '.jobsearch-JobInfoHeader-title', 'h1'],
			company: ['[data-testid="inlineHeader-companyName"]', '[data-company-name="true"]'],
			description: ['#jobDescriptionText'],
		},
		{
			test: /greenhouse\.io$/,
			title: ['.job__title h1', '.app-title', 'h1'],
			company: ['.company-name'],
			description: ['.job__description', '#content'],
		},
		{
			test: /lever\.co$/,
			title: ['.posting-headline h2'],
			company: [],
			description: ['.posting-page .content', '.section-wrapper.page-full-width'],
		},
		{
			test: /myworkdayjobs\.com$|workday\.com$/,
			title: ['[data-automation-id="jobPostingHeader"]'],
			company: [],
			description: ['[data-automation-id="jobPostingDescription"]'],
		},
		{
			test: /ashbyhq\.com$/,
			title: ['.ashby-job-posting-heading', 'h1'],
			company: [],
			description: ['.ashby-job-posting-right-pane', '#overview'],
		},
		{
			test: /(^|\.)glassdoor\.[a-z.]+$/,
			title: ['[data-test="job-title"]', 'h1'],
			company: ['[data-test="employer-name"]'],
			description: ['[class*="JobDetails_jobDescription"]', '.jobDescriptionContent'],
		},
	];
	const site = SITES.find((s) => s.test.test(host));

	const selected = clean(window.getSelection ? String(window.getSelection()) : '');

	let title = '';
	let company = '';
	if (posting) {
		title = posting.title || '';
		const org = posting.hiringOrganization;
		company = typeof org === 'string' ? org : (org && org.name) || '';
	}
	if (site) {
		title = title || first(site.title);
		company = company || first(site.company);
	}
	title = title || first(['h1']);
	if (!company) {
		// Many career pages use a tab title like "Job Application for Analyst at Northwind".
		const m = /\sat\s+([^|]+?)\s*(?:\||$)/.exec(document.title);
		company = m ? m[1] : '';
	}

	if (selected.length >= 200) return result(title, company, selected, 'selection');
	if (posting && posting.description) {
		const d = htmlToText(posting.description);
		if (d.length >= 200) return result(title, company, d, 'structured-data');
	}
	if (site) {
		const d = first(site.description);
		if (d.length >= 200) return result(title, company, d, 'site');
	}
	const main = first(['main', '[role="main"]', 'article']) || textOf(document.body);
	return result(title, company, main, 'page');
}
