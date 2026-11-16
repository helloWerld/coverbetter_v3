import {
	emptyProfile,
	newItemId,
	bulletSchema,
	certificationSchema,
	educationSchema,
	otherSchema,
	positionSchema,
	profileSchema,
	projectSchema,
	skillSchema,
	summarySchema,
	type Bullet,
	type Certification,
	type Education,
	type OtherItem,
	type OtherKind,
	type Position,
	type Profile,
	type Project,
	type Skill,
	type SkillGroup,
} from './types';
import { docxToLines, pdfToLines, type Line } from './resume-lines';

export type ParseResult = { profile: Profile; unsure: string[] };

// ---------- small helpers ----------

const cut = (s: string, max: number) => (s.length > max ? s.slice(0, max).trim() : s);
const words = (s: string) => s.split(/\s+/).filter(Boolean);
const BULLET_START = /^[•·▪▫‣◦●■□○◆▸►➢✓✔*\-–—]\s+|^[•·▪▫‣◦●■□○◆▸►➢✓✔]/;
const isBulletLine = (l: Line) => l.listItem || BULLET_START.test(l.text);
const stripBullet = (s: string) => s.replace(BULLET_START, '').trim();
const END_PUNCT = /[.!?;:]["')\]]?$/;
const startsLower = (s: string) => /^[a-z]/.test(s);
const startsUpperOrDigit = (s: string) => /^[A-Z0-9]/.test(s);

function normalizeLines(lines: Line[]): Line[] {
	const out: Line[] = [];
	for (const l of lines) {
		const text = (l.text ?? '')
			.replace(/[\u0000​-‍﻿]/g, '')
			.replace(/[\s ]+/g, ' ')
			.trim();
		if (!text) continue;
		if (/^(page\s*)?\d+\s*(of|\/)\s*\d+$/i.test(text)) continue;
		out.push({ ...l, text });
	}
	return out;
}

// ---------- dates ----------

const MONTH =
	'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE = `(?:(?<![a-z])${MONTH}\\.?,?\\s*\\d{4}|\\d{1,2}\\s*[/.]\\s*\\d{4}|\\d{4})`;
const OPEN_END = '(?:present|current|now|today|ongoing|date)';
const RANGE_SEP = '(?:\\s*[–—‒−-]+\\s*|\\s+(?:to|until|through)\\s+)';
const RANGE_RE = new RegExp(`(?<![\\w/.])(${DATE})${RANGE_SEP}(${DATE}|${OPEN_END})(?![\\w])`, 'i');
const LONE_DATE_RE = new RegExp(`(?<![\\w/.])(?:expected\\s+|class of\\s+|graduated\\s+)?(${DATE})(?![\\w])`, 'i');
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Mar 2020", "03/2020", "2020" to "2020-03" or "2020". Empty when it cannot tell. */
function toYearMonth(s: string): string {
	const t = s.trim().toLowerCase();
	const year = /(\d{4})/.exec(t)?.[1];
	if (!year) return '';
	const y = Number(year);
	if (y < 1950 || y > 2100) return '';
	const mm = /^(\d{1,2})\s*[/.]/.exec(t);
	if (mm) {
		const n = Number(mm[1]);
		return n >= 1 && n <= 12 ? `${year}-${String(n).padStart(2, '0')}` : year;
	}
	const mn = MONTHS.findIndex((m) => t.startsWith(m));
	if (mn >= 0) return `${year}-${String(mn + 1).padStart(2, '0')}`;
	return year;
}

type DateRange = { start: string; end: string; current: boolean; before: string; after: string };

function findRange(text: string): DateRange | null {
	const m = RANGE_RE.exec(text);
	if (!m) return null;
	const open = new RegExp(`^${OPEN_END}$`, 'i').test(m[2].trim());
	return {
		start: toYearMonth(m[1]),
		end: open ? '' : toYearMonth(m[2]),
		current: open,
		before: text.slice(0, m.index),
		after: text.slice(m.index + m[0].length),
	};
}

const trimSep = (s: string) => {
	let t = s
		.replace(/^[\s|,;:·•–—\-@]+/, '')
		.replace(/[\s|,;:·•–—\-@]+$/, '')
		.replace(/\(\s*\)/g, '')
		.trim();
	// Keep a closing bracket that has an opening one, as in "Acme (Remote)".
	if (!t.includes('(')) t = t.replace(/^[(\[]+|[)\]]+$/g, '');
	else if (t.endsWith('(')) t = t.slice(0, -1).trim();
	return t;
};

/** The line text with the date range cut out, joined at the cut. */
function withoutRange(r: DateRange): string {
	return trimSep(`${trimSep(r.before)} | ${trimSep(r.after)}`.replace(/^\s*\|\s*|\s*\|\s*$/g, ''));
}

// ---------- sections ----------

type SectionKind =
	| 'experience'
	| 'education'
	| 'skills'
	| 'certifications'
	| 'projects'
	| 'summary'
	| 'volunteer'
	| 'awards'
	| 'publications'
	| 'languages'
	| 'misc'
	| 'drop';

const HEADINGS: Record<SectionKind, string[]> = {
	experience: [
		'experience', 'work experience', 'professional experience', 'employment history', 'work history',
		'relevant experience', 'career history', 'professional background', 'employment',
		'employment experience', 'related experience', 'professional history', 'career experience',
	],
	education: [
		'education', 'education and training', 'academic background', 'academic qualifications',
		'education and certifications', 'educational background',
	],
	skills: [
		'skills', 'technical skills', 'core competencies', 'key skills', 'core skills', 'skills and tools',
		'skills and technologies', 'technologies', 'technical proficiencies', 'areas of expertise',
		'competencies', 'tools and technologies', 'professional skills', 'skills and expertise',
		'technical expertise',
	],
	certifications: [
		'certifications', 'certification', 'licenses', 'certificates', 'licenses and certifications',
		'certifications and licenses', 'professional certifications', 'certifications and training',
		'training and certifications',
	],
	projects: [
		'projects', 'personal projects', 'selected projects', 'key projects', 'side projects',
		'academic projects', 'technical projects', 'open source', 'open source projects',
	],
	summary: [
		'summary', 'professional summary', 'profile', 'professional profile', 'about', 'about me',
		'objective', 'career objective', 'career summary', 'executive summary', 'personal statement',
		'summary of qualifications',
	],
	volunteer: [
		'volunteer', 'volunteering', 'volunteer experience', 'community involvement', 'volunteer work',
		'community service', 'leadership and volunteering',
	],
	awards: [
		'awards', 'honors', 'honors and awards', 'awards and honors', 'awards and recognition',
		'achievements', 'accomplishments', 'honours', 'honours and awards', 'awards and achievements',
	],
	publications: ['publications', 'selected publications', 'papers', 'research'],
	languages: ['languages', 'language skills'],
	misc: [
		'leadership', 'activities', 'extracurricular activities', 'memberships', 'affiliations',
		'professional affiliations', 'patents', 'presentations', 'training', 'courses',
		'military service',
	],
	drop: [
		'interests', 'hobbies', 'interests and hobbies', 'references', 'additional information', 'additional',
	],
};

const HEADING_LOOKUP = new Map<string, SectionKind>();
for (const [kind, names] of Object.entries(HEADINGS)) {
	for (const n of names) HEADING_LOOKUP.set(n, kind as SectionKind);
}

function headingKind(line: Line): SectionKind | null {
	if (isBulletLine(line)) return null;
	const raw = line.text.replace(/[:：]+$/, '').trim();
	if (raw.length > 40 || words(raw).length > 4) return null;
	const norm = raw
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return HEADING_LOOKUP.get(norm) ?? null;
}

type Section = { kind: SectionKind; lines: Line[] };

function splitSections(lines: Line[]): { header: Line[]; sections: Section[] } {
	const sections: Section[] = [];
	const header: Line[] = [];
	let current: Section | null = null;
	for (const l of lines) {
		const kind = headingKind(l);
		if (kind) {
			current = { kind, lines: [] };
			sections.push(current);
		} else if (current) {
			current.lines.push(l);
		} else {
			header.push(l);
		}
	}
	return { header, sections };
}

// ---------- contact ----------

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?<![\w/])(\+?\(?\d[\d\s().-]{7,}\d)(?![\w/])/;
const TLDS =
	'com|org|net|io|dev|me|co|app|ai|info|tech|design|page|site|xyz|us|uk|ca|de|mx|fr|es|nl|au|in|edu|gov|online|work|blog|studio';
const URL_RE = new RegExp(
	`(?<![\\w@.-])(?:https?:\\/\\/)?(?:www\\.)?[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${TLDS})(?![a-z0-9])(?:\\/[^\\s|,;()]*)?`,
	'gi',
);
const LOCATION_RE = /^[A-Z][A-Za-z.'’ -]{1,30},\s*(?:[A-Z]{2}|[A-Z][A-Za-z.'’ -]{2,30})(?:\s+\d{5}(?:-\d{4})?)?$/;

function looksLikeContact(s: string): boolean {
	return EMAIL_RE.test(s) || PHONE_RE.test(s) || new RegExp(URL_RE.source, 'i').test(s);
}

function looksLikeName(s: string): boolean {
	if (/[\d@/:|]/.test(s)) return false;
	const w = words(s);
	if (w.length < 2 || w.length > 5) return false;
	if (headingKind({ text: s } as Line)) return false;
	return w.every((x) => /^(?:[A-Z][A-Za-z.'’-]*|[A-Z]\.|de|da|di|del|la|le|van|von|der|den|bin|al|el|y|e)$/.test(x));
}

function linkLabel(url: string): string {
	if (/linkedin\./i.test(url)) return 'LinkedIn';
	if (/github\./i.test(url)) return 'GitHub';
	return 'Website';
}

function parseBasics(header: Line[]): { basics: Profile['basics'] } {
	const basics: Profile['basics'] = { name: '', headline: '', email: '', phone: '', location: '', links: [] };
	const top = header.slice(0, 10);

	// Name: the largest line that looks like a name. Ties go to the earlier line.
	let nameIdx = -1;
	top.forEach((l, i) => {
		if (looksContactish(l.text) || !looksLikeName(l.text)) return;
		if (nameIdx < 0 || l.size > top[nameIdx].size + 0.5) nameIdx = i;
	});
	if (nameIdx < 0) {
		const first = top.findIndex((l) => !looksContactish(l.text) && words(l.text).length <= 6);
		if (first === 0) nameIdx = 0;
	}
	if (nameIdx >= 0) basics.name = cut(top[nameIdx].text, 120);

	for (let i = 0; i < top.length; i++) {
		if (i === nameIdx) continue;
		let text = top[i].text;
		const email = EMAIL_RE.exec(text);
		if (email) {
			if (!basics.email) basics.email = cut(email[0], 200);
			text = text.replace(email[0], ' | ');
		}
		const urls = text.match(URL_RE) ?? [];
		for (const u of urls) {
			const clean = u.replace(/[.,;)]+$/, '');
			const full = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
			if (basics.links.length < 8 && !basics.links.some((x) => x.url === full)) {
				basics.links.push({ label: linkLabel(full), url: cut(full, 300) });
			}
			text = text.replace(u, ' | ');
		}
		const phone = PHONE_RE.exec(text);
		if (phone && !/[/]/.test(phone[1]) && !RANGE_RE.test(phone[1])) {
			const digits = phone[1].replace(/\D/g, '').length;
			if (digits >= 9 && digits <= 15) {
				if (!basics.phone) basics.phone = cut(phone[1].trim(), 60);
				text = text.replace(phone[1], ' | ');
			}
		}
		const parts = text.split(/\s*[|•·▪●]\s*|\s+[–—-]\s+|\s{3,}/).map((p) => p.trim()).filter(Boolean);
		for (const p of parts) {
			const clean = p.replace(/^(?:location|address|based in)\s*:\s*/i, '');
			if (!basics.location && LOCATION_RE.test(clean) && words(clean).length <= 6) {
				basics.location = cut(clean, 120);
			}
		}
	}

	// Headline: a short line right after the name that is not contact data.
	if (nameIdx >= 0) {
		const next = top[nameIdx + 1];
		if (
			next &&
			!looksContactish(next.text) &&
			!LOCATION_RE.test(next.text) &&
			words(next.text).length <= 12 &&
			!END_PUNCT.test(next.text)
		) {
			basics.headline = cut(next.text, 200);
		}
	}
	return { basics };
}

function looksContactish(s: string): boolean {
	return looksLikeContact(s) || LOCATION_RE.test(s);
}

// ---------- title and company ----------

const TITLE_WORDS =
	/\b(engineer|developer|manager|director|analyst|designer|lead|consultant|specialist|coordinator|assistant|associate|intern|internship|president|officer|architect|administrator|scientist|representative|supervisor|technician|head|vp|founder|co-?founder|owner|teacher|professor|nurse|accountant|writer|editor|strategist|advisor|adviser|executive|clerk|cashier|trainer|instructor|researcher|producer|programmer|tester|recruiter|agent|manager|principal|partner|chef|driver|operator|planner|buyer|auditor|attorney|counsel|paralegal|therapist|tutor|volunteer|fellow|freelancer|contractor|ceo|cto|cfo|coo|sde|swe|qa)\b/i;
const COMPANY_WORDS =
	/\b(inc|llc|ltd|llp|corp|corporation|co|company|group|technologies|technology|systems|labs|laboratories|solutions|university|college|bank|partners|agency|studio|studios|foundation|institute|associates|enterprises|holdings|consulting|services|school|hospital|clinic|industries|software|networks|media|ventures|gmbh|plc|sa|ag)\b\.?/i;
const EMPLOYMENT_TYPE = /^(full[- ]?time|part[- ]?time|contract(?:or)?|freelance|internship|temporary|seasonal|remote|hybrid|on-?site)$/i;

type Order = 'ab' | 'ba' | null;

function titleHit(s: string) {
	return TITLE_WORDS.test(s);
}
function companyHit(s: string) {
	return COMPANY_WORDS.test(s);
}

function orderOf(a: string, b: string): Order {
	const ta = titleHit(a);
	const tb = titleHit(b);
	const ca = companyHit(a);
	const cb = companyHit(b);
	if (ta && !tb) return 'ab';
	if (tb && !ta) return 'ba';
	if (ca && !cb) return 'ba';
	if (cb && !ca) return 'ab';
	return null;
}


/** Put "City" and "ST" back together after a comma split. */
function joinStates(parts: string[]): string[] {
	const out: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		if (i + 1 < parts.length && /^[A-Z]{2}(?:\s+\d{5})?$/.test(parts[i + 1]) && !false) {
			out.push(`${parts[i]}, ${parts[i + 1]}`);
			i++;
		} else out.push(parts[i]);
	}
	return out;
}

type Header = { title: string; company: string; location: string; employmentType: string; sure: boolean };

/** Split one header text on the strongest separator that is present. */
function splitHeaderText(s: string, allowAt = true): { parts: string[]; at: boolean } {
	if (/\s\|\s|\|/.test(s)) return { parts: s.split('|'), at: false };
	if (/\s[—–]\s|—/.test(s)) return { parts: s.split(/\s*[—–]\s*/), at: false };
	if (/\s-\s/.test(s)) return { parts: s.split(/\s+-\s+/), at: false };
	if (allowAt && /\s(?:at|@)\s/i.test(s)) return { parts: s.split(/\s+(?:at|@)\s+/i), at: true };
	if (/·|•/.test(s)) return { parts: s.split(/\s*[·•]\s*/), at: false };
	if (s.includes(',')) return { parts: s.split(/,\s*/), at: false };
	return { parts: [s], at: false };
}

function readHeader(sources: string[]): Header {
	const out: Header = { title: '', company: '', location: '', employmentType: '', sure: true };
	const kept: string[] = [];
	let sawAt = false;
	const joinedRaw = sources.join(' | ');
	for (const src of sources) {
		// Brackets hold a place or a job type. Take them out before the split.
		const bare = src.replace(/\(([^)]*)\)/g, (_, inner: string) => {
			const v = inner.trim();
			if (EMPLOYMENT_TYPE.test(v)) out.employmentType ||= v;
			else if (/^(?:remote|hybrid|on-?site)$/i.test(v) || LOCATION_RE.test(v)) out.location ||= v;
			else return ` ${v} `;
			return ' ';
		});
		const { parts, at } = splitHeaderText(bare.trim());
		if (at) sawAt = true;
		let pending = parts.map((p) => p.trim()).filter(Boolean);
		// A comma split can cut "City, ST". Put the pieces back together.
		pending = joinStates(pending);
		for (const p of pending) {
			const noParen = p.replace(/\(([^)]*)\)/g, (_, inner: string) => {
				if (EMPLOYMENT_TYPE.test(inner.trim())) out.employmentType ||= inner.trim();
				else if (LOCATION_RE.test(inner.trim()) || /^remote$/i.test(inner.trim())) out.location ||= inner.trim();
				return '';
			}).trim();
			if (!noParen) continue;
			if (EMPLOYMENT_TYPE.test(noParen)) {
				if (/^remote|hybrid|on-?site$/i.test(noParen)) out.location ||= noParen;
				else out.employmentType ||= noParen;
			} else if (LOCATION_RE.test(noParen) && !titleHit(noParen) && !companyHit(noParen)) {
				out.location ||= noParen;
			} else kept.push(noParen);
		}
	}
	if (kept.length === 0) {
		out.sure = false;
		return out;
	}
	if (kept.length === 1) {
		const only = kept[0];
		if (companyHit(only) && !titleHit(only)) out.company = only;
		else out.title = only;
		// Only one half is known. The user should add the other half.
		out.sure = false;
		return out;
	}
	if (sawAt) {
		out.title = kept[0];
		out.company = kept[1];
		out.sure = kept.length === 2;
		return out;
	}
	const [a, b] = kept;
	const order = orderOf(a, b);
	if (order === 'ab') {
		out.title = a;
		out.company = b;
	} else if (order === 'ba') {
		out.title = b;
		out.company = a;
	} else {
		out.title = cut(joinedRaw, 200);
		out.company = '';
		out.sure = false;
		return out;
	}
	out.sure = kept.length === 2;
	return out;
}

// ---------- experience ----------

type RawJob = {
	header: Header;
	range: { start: string; end: string; current: boolean } | null;
	bullets: { text: string; sure: boolean }[];
	headerSure: boolean;
};

const isDateLine = (l: Line): DateRange | null => {
	if (isBulletLine(l)) return null;
	const r = findRange(l.text);
	if (!r) return null;
	if (words(r.before).length > 10 || words(r.after).length > 10) return null;
	if (END_PUNCT.test(l.text) && words(l.text).length > 12) return null;
	return r;
};

function bodySize(lines: Line[]): number {
	const counts = new Map<number, number>();
	for (const l of lines) {
		const k = Math.round(l.size * 2) / 2;
		counts.set(k, (counts.get(k) ?? 0) + l.text.length);
	}
	let best = 11;
	let n = 0;
	for (const [k, v] of counts) {
		if (v > n) {
			best = k;
			n = v;
		}
	}
	return best;
}

/** Add bullet text to a list. Joins wrapped lines. */
function collectBullets(lines: Line[]): { text: string; sure: boolean }[] {
	const bullets: { text: string; sure: boolean; open: boolean }[] = [];
	for (const l of lines) {
		if (isBulletLine(l)) {
			bullets.push({ text: stripBullet(l.text), sure: true, open: true });
			continue;
		}
		const last = bullets[bullets.length - 1];
		if (last && (startsLower(l.text) || !END_PUNCT.test(last.text))) {
			last.text = `${last.text} ${l.text}`;
			// Joined only because the last line had no end mark: worth a look.
			if (!startsLower(l.text)) last.sure = false;
		} else {
			bullets.push({ text: l.text, sure: !last, open: false });
		}
	}
	return bullets.filter((b) => b.text).map(({ text, sure }) => ({ text, sure }));
}

function parseJobs(lines: Line[]): RawJob[] {
	const body = bodySize(lines);
	const dates = lines.map(isDateLine);
	const claimed = new Array<boolean>(lines.length).fill(false);

	const inBulletBlock = (i: number) => {
		// Is line i part of a bullet (a bullet start or a wrapped tail)?
		for (let k = i; k >= 0; k--) {
			if (dates[k]) return false;
			if (isBulletLine(lines[k])) return true;
			if (k < i && (END_PUNCT.test(lines[k].text) || lines[k].gapBefore >= 1.4)) return false;
			if (i - k > 3) return false;
		}
		return false;
	};

	/** Could this line be part of a job header at all? */
	const plausible = (idx: number) => {
		if (idx < 0 || idx >= lines.length || claimed[idx]) return false;
		const l = lines[idx];
		if (isBulletLine(l) || dates[idx]) return false;
		return words(l.text).length <= 12 && !END_PUNCT.test(l.text) && startsUpperOrDigit(l.text);
	};
	/** The first line of a header block must stand out. A tight line right after a bullet is a wrapped tail. */
	const startsBlock = (idx: number) => {
		const l = lines[idx];
		const strong = l.bold || l.size > body * 1.03 || l.gapBefore >= 1.25 || /\s[|—–]\s|\sat\s/.test(l.text);
		return strong || idx === 0 || !inBulletBlock(idx - 1);
	};
	/** Up to `max` header lines directly above line i, nearest last. */
	const linesAbove = (i: number, max: number) => {
		const block: number[] = [];
		for (let k = 1; k <= max && plausible(i - k); k++) block.unshift(i - k);
		while (block.length > 0 && !startsBlock(block[0])) block.shift();
		return block;
	};

	type Pending = { idx: number; range: DateRange; sources: { idx: number; text: string }[]; below: boolean };
	const jobs: Pending[] = [];
	lines.forEach((_, i) => {
		const range = dates[i];
		if (!range) return;
		const rest = withoutRange(range);
		const sources: { idx: number; text: string }[] = [];
		if (rest) sources.push({ idx: i, text: rest });
		const sepCount = rest ? splitHeaderText(rest).parts.filter((p) => p.trim()).length : 0;
		const need = rest ? (sepCount >= 2 ? 0 : 1) : 2;
		const above = linesAbove(i, need);
		sources.unshift(...above.map((idx) => ({ idx, text: lines[idx].text })));
		for (const idx of above) claimed[idx] = true;
		let below = false;
		if (sources.filter((s) => s.idx !== i).length === 0 && sepCount < 2) {
			const nb = i + 1;
			if (plausible(nb)) {
				sources.push({ idx: nb, text: lines[nb].text });
				claimed[nb] = true;
				below = true;
			}
		}
		claimed[i] = true;
		jobs.push({ idx: i, range, sources, below });
	});

	const out: RawJob[] = [];
	jobs.forEach((job, n) => {
		const lastHeaderIdx = Math.max(...job.sources.map((s) => s.idx), job.idx);
		const next = jobs[n + 1];
		const nextStart = next ? Math.min(...next.sources.map((s) => s.idx), next.idx) : lines.length;
		const header = readHeader(job.sources.map((s) => s.text));
		const bulletLines = lines.slice(lastHeaderIdx + 1, nextStart);
		out.push({
			header,
			range: { start: job.range.start, end: job.range.end, current: job.range.current },
			bullets: collectBullets(bulletLines),
			headerSure: header.sure && !!job.range.start,
		});
	});
	return out;
}

/** Fallback when a section has no dates: blocks of heading-like lines followed by bullets. */
function parseUndatedJobs(lines: Line[]): RawJob[] {
	const out: RawJob[] = [];
	let head: Line[] = [];
	let tail: Line[] = [];
	const push = () => {
		if (head.length === 0) return;
		const header = readHeader(head.slice(0, 2).map((l) => l.text));
		out.push({ header, range: null, bullets: collectBullets(tail), headerSure: false });
		head = [];
		tail = [];
	};
	for (const l of lines) {
		const plainHead = !isBulletLine(l) && words(l.text).length <= 10 && !END_PUNCT.test(l.text);
		if (plainHead && tail.length === 0 && head.length < 2) head.push(l);
		else if (plainHead && tail.length > 0 && (l.bold || l.gapBefore >= 1.4)) {
			push();
			head.push(l);
		} else if (head.length > 0) tail.push(l);
	}
	push();
	return out;
}

function buildPositions(lines: Line[], unsure: Set<string>): Position[] {
	const dated = lines.some((l) => isDateLine(l));
	const jobs = dated ? parseJobs(lines) : parseUndatedJobs(lines);
	const out: Position[] = [];
	for (const job of jobs) {
		const id = newItemId('pos');
		const bullets: Bullet[] = [];
		for (const b of job.bullets.slice(0, 40)) {
			const bid = newItemId('b');
			const text = cut(b.text, 500);
			if (!text) continue;
			bullets.push({ id: bid, text, hidden: false });
			if (!b.sure || b.text.length > 500) unsure.add(bid);
		}
		const pos: Position = {
			id,
			company: cut(job.header.company, 200),
			title: cut(job.header.title, 200),
			location: cut(job.header.location, 200),
			start: job.range?.start ?? '',
			end: job.range?.end ?? '',
			current: job.range?.current ?? false,
			employmentType: cut(job.header.employmentType, 60),
			bullets,
		};
		if (!job.headerSure || !pos.title) unsure.add(id);
		out.push(pos);
	}
	return out;
}

// ---------- education ----------

const SCHOOL_RE = /\b(university|college|institute|school|academy|polytechnic|universidad|université|universität|conservatory)\b/i;
// Short forms like "BA" or "MS" count only in capitals.
const DEGREE_CAPS_RE =
	/\b(?:B\.?S\.?(?:c\.?)?|B\.?A\.?|B\.?F\.?A\.?|B\.?B\.?A\.?|B\.?Eng\.?|B\.?Tech\.?|M\.?S\.?(?:c\.?)?|M\.?A\.?|M\.?F\.?A\.?|M\.?B\.?A\.?|M\.?Eng\.?|M\.?Ed\.?|Ph\.?D\.?|A\.?A\.?S?\.?|A\.?S\.?|J\.?D\.?|M\.?D\.?)(?![A-Za-z])/;
const hasDegree = (s: string) =>
	/\b(bachelor|master|associate|doctor(?:ate)?|diploma|certificate)\b/i.test(s) || DEGREE_CAPS_RE.test(s) || /\bph\.?d\b/i.test(s);
const FIELD_WORD = /(ics|ogy|ing|ence|ences|ture|try|omy|ory|ies|ation|ism|law|arts|art|math|history)$/i;
const GPA_RE = /\bGPA\s*[:\-]?\s*([0-4](?:\.\d{1,2})?)(?:\s*\/\s*([0-4](?:\.\d{1,2})?))?/i;

function buildEducation(lines: Line[], unsure: Set<string>): Education[] {
	type Draft = {
		school: string;
		degree: string;
		field: string;
		start: string;
		end: string;
		gpa: string;
		honors: string[];
		courses: string;
		looseSchool: boolean;
	};
	const drafts: Draft[] = [];
	const fresh = (): Draft => ({
		school: '', degree: '', field: '', start: '', end: '', gpa: '', honors: [], courses: '', looseSchool: false,
	});
	let cur: Draft | null = null;

	for (const l of lines) {
		let text = l.text;
		if (isBulletLine(l)) {
			if (cur) cur.honors.push(stripBullet(text));
			continue;
		}
		const course = /^(?:relevant\s+)?(?:course ?work|courses)\s*[:\-]\s*(.+)$/i.exec(text);
		if (course && cur) {
			cur.courses = cut(course[1], 500);
			continue;
		}
		if (/^(?:honou?rs?|awards?|achievements?)\s*[:\-]/i.test(text) && cur) {
			cur.honors.push(text.replace(/^[^:\-]+[:\-]\s*/, ''));
			continue;
		}
		if (/\b(cum laude|magna|summa|dean'?s list)\b/i.test(text) && cur && !SCHOOL_RE.test(text) && !hasDegree(text)) {
			cur.honors.push(text);
			continue;
		}

		let gpa = '';
		const g = GPA_RE.exec(text);
		if (g) {
			gpa = g[2] ? `${g[1]}/${g[2]}` : g[1];
			text = text.replace(g[0], ' ');
		}
		let start = '';
		let end = '';
		const range = findRange(text);
		if (range) {
			start = range.start;
			end = range.end;
			text = `${range.before} | ${range.after}`;
		} else {
			const lone = LONE_DATE_RE.exec(text);
			if (lone) {
				end = toYearMonth(lone[1]);
				text = text.replace(lone[0], ' ');
			}
		}
		const parts = splitHeaderText(trimSep(text), false).parts.map((p) => trimSep(p)).filter(Boolean);
		// Drop locations. "City, ST" is one piece.
		const items = joinStates(parts).filter(
			(p) => !(LOCATION_RE.test(p) && /,/.test(p) && !SCHOOL_RE.test(p) && !hasDegree(p)),
		);

		const lineSchool = items.find((p) => SCHOOL_RE.test(p));
		const lineDegree = items.find((p) => hasDegree(p) && p !== lineSchool);
		const startsNew =
			!cur ||
			(lineSchool && cur.school) ||
			(lineDegree && cur.degree) ||
			(items.length > 0 && !lineSchool && !lineDegree && cur.school && cur.degree && l.gapBefore >= 1.3);
		if (startsNew && (items.length > 0 || !cur)) {
			cur = fresh();
			drafts.push(cur);
		}
		const d = cur as Draft;
		if (start) d.start ||= start;
		if (end) d.end ||= end;
		if (gpa) d.gpa ||= gpa;

		let left = items.filter((p) => p !== lineSchool && p !== lineDegree);
		if (lineSchool) {
			// "University of California, Berkeley": a lone place name belongs to the school.
			const tail = left.find((p) => /^[A-Z][a-z]{2,}$/.test(p) && !FIELD_WORD.test(p));
			d.school ||= tail && !lineDegree ? `${lineSchool}, ${tail}` : lineSchool;
			if (tail && !lineDegree) left = left.filter((p) => p !== tail);
		}
		if (lineDegree) {
			const m = /^(.+?)\s+in\s+(.+)$/i.exec(lineDegree);
			if (m) {
				d.degree ||= m[1];
				d.field ||= m[2];
			} else d.degree ||= lineDegree;
		}
		for (const p of left) {
			if (!d.degree && !lineDegree && !d.school) {
				d.school = p;
				d.looseSchool = true;
			} else if (!d.field && (d.degree || lineDegree)) d.field = p;
			else if (!d.school) {
				d.school = p;
				d.looseSchool = true;
			} else if (!d.field) d.field = p;
		}
	}

	const out: Education[] = [];
	for (const d of drafts) {
		if (!d.school && !d.degree && !d.field) continue;
		const id = newItemId('edu');
		out.push({
			id,
			school: cut(d.school, 200),
			degree: cut(d.degree, 200),
			field: cut(d.field, 200),
			start: d.start,
			end: d.end,
			gpa: cut(d.gpa, 20),
			honors: cut(d.honors.join('; '), 300),
			courses: cut(d.courses, 500),
		});
		if (!d.school || !d.degree || d.looseSchool) unsure.add(id);
	}
	return out;
}

// ---------- skills ----------

const PROG_LANGS = new Set(
	['python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'r', 'scala', 'bash', 'html', 'css'],
);

function splitTopLevel(s: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = '';
	for (const ch of s) {
		if (ch === '(' || ch === '[') depth++;
		if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
		if (depth === 0 && /[,;|•·▪‣●\t]/.test(ch)) {
			out.push(cur);
			cur = '';
		} else cur += ch;
	}
	out.push(cur);
	return out.map((x) => x.replace(/\s{2,}/g, ' ').trim()).filter(Boolean);
}

function groupFor(category: string, tokens: string[]): SkillGroup {
	const c = category.toLowerCase();
	if (/soft|interpersonal|leadership|management|communication/.test(c)) return 'soft';
	if (/tool|software|platform|cloud|devops|database|infrastructure|ide/.test(c)) return 'tool';
	if (/programming|coding|frameworks?|libraries|technical|backend|frontend|front-end|back-end|data|web/.test(c)) return 'technical';
	if (/^languages?$/.test(c)) {
		return tokens.some((t) => PROG_LANGS.has(t.toLowerCase())) ? 'technical' : 'language';
	}
	return 'other';
}

function buildSkills(lines: Line[], defaultGroup: SkillGroup = 'other'): Skill[] {
	const seen = new Set<string>();
	const out: Skill[] = [];
	for (const l of lines) {
		let text = stripBullet(l.text);
		let category = '';
		const m = /^([A-Za-z][A-Za-z &/+-]{1,30}):\s*(.+)$/.exec(text);
		if (m) {
			category = m[1];
			text = m[2];
		}
		const tokens = splitTopLevel(text);
		const group = m ? groupFor(category, tokens) : defaultGroup;
		for (const t of tokens) {
			const name = cut(t.replace(/^and\s+/i, '').replace(/[.]+$/, ''), 80);
			const key = name.toLowerCase();
			if (!name || words(name).length > 8 || seen.has(key)) continue;
			seen.add(key);
			out.push({ id: newItemId('skill'), name, group });
		}
	}
	return out.slice(0, 200);
}

// ---------- certifications ----------

function buildCertifications(lines: Line[]): Certification[] {
	const items: string[] = [];
	for (const l of lines) {
		const t = stripBullet(l.text);
		if (isBulletLine(l) || items.length === 0 || !startsLower(t)) items.push(t);
		else items[items.length - 1] += ` ${t}`;
	}
	const out: Certification[] = [];
	for (let text of items) {
		let credentialId = '';
		const cid = /(?:credential|certificate|cert)\s*(?:id|#|no\.?)\s*[:#]?\s*([A-Za-z0-9-]{3,})/i.exec(text);
		if (cid) {
			credentialId = cid[1];
			text = text.replace(cid[0], ' ');
		}
		let expires = '';
		const exp = new RegExp(`(?:expires?|expiration|valid (?:until|through))\\s*:?\\s*(${DATE})`, 'i').exec(text);
		if (exp) {
			expires = toYearMonth(exp[1]);
			text = text.replace(exp[0], ' ');
		}
		let date = '';
		const range = findRange(text);
		if (range) {
			date = range.start;
			expires ||= range.end;
			text = `${range.before} | ${range.after}`;
		} else {
			const lone = LONE_DATE_RE.exec(text);
			if (lone) {
				date = toYearMonth(lone[1]);
				text = text.replace(lone[0], ' ');
			}
		}
		const parts = splitHeaderText(trimSep(text), false).parts.map(trimSep).filter(Boolean);
		const name = parts[0] ?? '';
		if (!name) continue;
		const cert: Certification = {
			id: newItemId('cert'),
			name: cut(name, 200),
			issuer: cut(parts[1] ?? '', 200),
			date,
			expires,
			credentialId: cut(credentialId, 100),
			url: '',
		};
		out.push(cert);
	}
	return out.slice(0, 60);
}

// ---------- projects ----------

function buildProjects(lines: Line[]): Project[] {
	const out: Project[] = [];
	let cur: { head: Line; rest: Line[] } | null = null;
	const groups: { head: Line; rest: Line[] }[] = [];
	for (const l of lines) {
		const prev = cur?.rest[cur.rest.length - 1];
		const plain =
			!isBulletLine(l) &&
			words(l.text).length <= 12 &&
			!END_PUNCT.test(l.text) &&
			(!cur || cur.rest.length > 0) &&
			(!prev || isBulletLine(prev) || END_PUNCT.test(prev.text) || l.bold || l.gapBefore >= 1.4) &&
			!startsLower(l.text);
		if (!cur || plain) {
			cur = { head: l, rest: [] };
			groups.push(cur);
		} else cur.rest.push(l);
	}
	for (const g of groups) {
		let text = g.head.text;
		const urls = text.match(URL_RE) ?? [];
		let url = '';
		if (urls[0]) {
			const clean = urls[0].replace(/[.,;)]+$/, '');
			url = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
			text = text.replace(urls[0], ' ');
		}
		const range = findRange(text);
		let start = '';
		let end = '';
		if (range) {
			start = range.start;
			end = range.end;
			text = `${range.before} | ${range.after}`;
		}
		const parts = splitHeaderText(trimSep(text), false).parts.map(trimSep).filter(Boolean);
		const name = parts[0] ?? '';
		if (!name) continue;
		const bullets: Bullet[] = collectBullets(g.rest)
			.slice(0, 20)
			.map((b) => ({ id: newItemId('b'), text: cut(b.text, 500), hidden: false }));
		out.push({
			id: newItemId('proj'),
			name: cut(name, 200),
			role: cut(parts.slice(1).join(', '), 200),
			start,
			end,
			url: cut(url, 300),
			bullets,
		});
	}
	return out.slice(0, 40);
}

// ---------- other sections ----------

function buildOther(kind: OtherKind, lines: Line[], unsure: Set<string>): OtherItem[] {
	const out: OtherItem[] = [];
	if (kind === 'volunteer' && lines.some((l) => isDateLine(l))) {
		for (const job of parseJobs(lines)) {
			const id = newItemId('oth');
			out.push({
				id,
				kind,
				title: cut(job.header.title, 200),
				organization: cut(job.header.company, 200),
				date: job.range?.start ?? '',
				description: cut(job.bullets.map((b) => b.text).join(' '), 1000),
			});
			if (!job.headerSure) unsure.add(id);
		}
		return out;
	}
	const items: string[] = [];
	for (const l of lines) {
		const t = stripBullet(l.text);
		if (isBulletLine(l) || items.length === 0 || (!startsLower(t) && END_PUNCT.test(items[items.length - 1]))) {
			items.push(t);
		} else if (startsLower(t) || !END_PUNCT.test(items[items.length - 1])) {
			items[items.length - 1] += ` ${t}`;
		} else items.push(t);
	}
	for (let text of items) {
		let date = '';
		const lone = LONE_DATE_RE.exec(text);
		if (lone) {
			date = toYearMonth(lone[1]);
			text = text.replace(lone[0], ' ');
		}
		const parts = splitHeaderText(trimSep(text), false).parts.map(trimSep).filter(Boolean);
		if (parts.length === 0) continue;
		out.push({
			id: newItemId('oth'),
			kind,
			title: cut(parts[0], 200),
			organization: kind === 'language' ? '' : cut(parts[1] ?? '', 200),
			date,
			description: cut(parts.slice(kind === 'language' ? 1 : 2).join(', '), 1000),
		});
	}
	return out.slice(0, 60);
}

// ---------- assemble ----------

const OTHER_KIND_OF: Partial<Record<SectionKind, OtherKind>> = {
	volunteer: 'volunteer',
	awards: 'award',
	publications: 'publication',
	misc: 'other',
};

/** Keep only items the schema accepts. Never throws. */
function keepValid<T>(items: T[], schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } }): T[] {
	const out: T[] = [];
	for (const item of items) {
		const r = schema.safeParse(item);
		if (r.success) out.push(r.data as T);
	}
	return out;
}

export function parseResumeLines(input: Line[]): ParseResult {
	try {
		return parseInner(input);
	} catch {
		return { profile: emptyProfile(), unsure: [] };
	}
}

function parseInner(input: Line[]): ParseResult {
	const lines = normalizeLines(input);
	const unsure = new Set<string>();
	let { header, sections } = splitSections(lines);


	// No experience heading but dates in the body: treat the body as experience.
	if (sections.length === 0) {
		const firstDate = lines.findIndex((l) => isDateLine(l));
		const firstBullet = lines.findIndex((l) => isBulletLine(l));
		const marks = [firstDate, firstBullet].filter((n) => n >= 0);
		let end = marks.length ? Math.min(...marks) : lines.length;
		// Walk back over up to two lines that look like a job header, not contact data.
		for (let k = 0; k < 2 && end > 2 && !looksContactish(lines[end - 1].text); k++) end--;
		end = Math.min(end, 8);
		if (marks.length) {
			header = lines.slice(0, end);
			sections = [{ kind: 'experience', lines: lines.slice(end) }];
		} else {
			header = lines.slice(0, 8);
			sections = [];
		}
	}

	const { basics } = parseBasics(header);
	const draft = emptyProfile();
	draft.basics = basics;

	for (const s of sections) {
		const sec = s.lines;
		switch (s.kind) {
			case 'experience':
				draft.positions.push(...buildPositions(sec, unsure));
				break;
			case 'education':
				draft.education.push(...buildEducation(sec, unsure));
				break;
			case 'skills':
				draft.skills.push(...buildSkills(sec));
				break;
			case 'languages':
				draft.skills.push(...buildSkills(sec, 'language'));
				break;
			case 'certifications':
				draft.certifications.push(...buildCertifications(sec));
				break;
			case 'projects':
				draft.projects.push(...buildProjects(sec));
				break;
			case 'summary': {
				const text = sec.map((l) => stripBullet(l.text)).join(' ').replace(/\s+/g, ' ').trim();
				if (text) draft.summaries.push({ id: newItemId('sum'), text: cut(text, 1500) });
				break;
			}
			case 'drop':
				break;
			default: {
				const kind = OTHER_KIND_OF[s.kind] ?? 'other';
				draft.other.push(...buildOther(kind, sec, unsure));
			}
		}
	}

	// Cut to what the schema accepts. Items that do not fit are dropped, not thrown.
	const dedupSkills = new Map<string, Skill>();
	for (const sk of draft.skills) if (!dedupSkills.has(sk.name.toLowerCase())) dedupSkills.set(sk.name.toLowerCase(), sk);
	const positions = keepValid(draft.positions, positionSchema)
		.slice(0, 60)
		.map((p) => ({ ...p, bullets: keepValid(p.bullets, bulletSchema) }));
	const projects = keepValid(draft.projects, projectSchema).map((p) => ({
		...p,
		bullets: keepValid(p.bullets, bulletSchema),
	}));
	let profile: Profile;
	try {
		profile = profileSchema.parse({
			...draft,
			positions,
			projects,
			education: keepValid(draft.education, educationSchema),
			certifications: keepValid(draft.certifications, certificationSchema),
			skills: keepValid([...dedupSkills.values()], skillSchema),
			other: keepValid(draft.other, otherSchema),
			summaries: keepValid(draft.summaries, summarySchema),
		});
	} catch {
		profile = emptyProfile();
		try {
			profile.basics = profileSchema.shape.basics.parse(basics);
		} catch {
			// Keep the empty basics.
		}
	}

	const ids = new Set<string>();
	for (const p of profile.positions) {
		ids.add(p.id);
		for (const b of p.bullets) ids.add(b.id);
	}
	for (const e of profile.education) ids.add(e.id);
	return { profile, unsure: [...unsure].filter((id) => ids.has(id)) };
}

export async function parseResumeFile(bytes: Uint8Array, kind: 'pdf' | 'docx'): Promise<ParseResult> {
	const lines = kind === 'pdf' ? await pdfToLines(bytes) : await docxToLines(bytes);
	return parseResumeLines(lines);
}
