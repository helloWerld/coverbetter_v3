import { hasColumn, parseCsv, pick } from './csv';
import {
	emptyProfile,
	newItemId,
	profileSchema,
	type Bullet,
	type OtherItem,
	type Profile,
} from './types';

type Row = Record<string, string>;

const MAX_BULLET = 500;
const SENTENCE_SPLIT_MIN = 300;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Cut text to a maximum length. Cuts at a word when it can. */
function cut(text: string, max: number): string {
	const s = text.trim();
	if (s.length <= max) return s;
	const head = s.slice(0, max);
	const space = head.lastIndexOf(' ');
	return (space > max * 0.5 ? head.slice(0, space) : head).trim();
}

/** Turn a LinkedIn date into YYYY or YYYY-MM. Returns '' when the date is not known. */
export function parseDate(raw: string): string {
	const s = raw.trim();
	if (!s) return '';
	let m = /^(\d{4})$/.exec(s);
	if (m) return m[1];
	m = /^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/.exec(s);
	if (m) return monthOrYear(m[1], Number(m[2]));
	m = /^(\d{1,2})[/.-](\d{4})$/.exec(s);
	if (m) return monthOrYear(m[2], Number(m[1]));
	m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
	if (m) return monthOrYear(m[3], Number(m[1]));
	const year = /\b(\d{4})\b/.exec(s);
	if (!year) return '';
	const word = /[A-Za-z]{3,}/.exec(s);
	const idx = word ? MONTHS.indexOf(word[0].slice(0, 3).toLowerCase()) : -1;
	return idx >= 0 ? monthOrYear(year[1], idx + 1) : year[1];
}

function monthOrYear(year: string, month: number): string {
	if (month >= 1 && month <= 12) return `${year}-${String(month).padStart(2, '0')}`;
	return year;
}

/** Split a description into bullet texts. */
export function splitBullets(description: string): string[] {
	const text = description.replace(/\r\n?/g, '\n').trim();
	if (!text) return [];
	const hasBreak = text.includes('\n');
	let pieces: string[] = [];
	for (const line of text.split('\n')) {
		// Inline bullet marks split a line. Dashes and stars only count at the start of a line.
		for (const part of line.split(/[•·▪●]/)) {
			pieces.push(part.replace(/^\s*(?:[-*–—]+|\d+[.)])\s+/, '').replace(/^\s*[-*–—]+(?=\S)/, ''));
		}
	}
	pieces = pieces.map((p) => p.trim()).filter(Boolean);
	if (pieces.length === 1 && !hasBreak && text.length > SENTENCE_SPLIT_MIN) {
		pieces = text
			.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
			.map((p) => p.trim())
			.filter(Boolean);
	}
	return pieces.map((p) => cut(p, MAX_BULLET)).filter(Boolean);
}

function makeBullets(description: string, max: number): Bullet[] {
	return splitBullets(description)
		.slice(0, max)
		.map((text) => ({ id: newItemId('b'), text, hidden: false }));
}

/** Find a file by base name. Case, spaces, and punctuation do not matter. */
function baseKey(path: string): string {
	const base = path.split(/[\\/]/).pop() ?? path;
	return base.replace(/\.csv$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function parseWebsites(raw: string): { label: string; url: string }[] {
	const links: { label: string; url: string }[] = [];
	for (const part of raw.split(/[,;\n]/)) {
		let p = part.trim().replace(/^\[|\]$/g, '');
		if (!p) continue;
		let label = '';
		const typed = /^([A-Za-z ]{2,20}):(https?:.*)$/.exec(p);
		if (typed) {
			label = typed[1].trim();
			p = typed[2];
		}
		if (!label) {
			try {
				label = new URL(p.startsWith('http') ? p : `https://${p}`).hostname.replace(/^www\./, '');
			} catch {
				label = '';
			}
		}
		links.push({ label: cut(label, 60), url: cut(p, 300) });
	}
	return links;
}

type Kind =
	| 'profile'
	| 'email'
	| 'phone'
	| 'positions'
	| 'education'
	| 'skills'
	| 'certifications'
	| 'projects'
	| 'languages'
	| 'honors'
	| 'volunteering'
	| 'courses';

const FILES: Record<string, { kind: Kind; name: string }> = {
	profile: { kind: 'profile', name: 'Profile.csv' },
	emailaddresses: { kind: 'email', name: 'Email Addresses.csv' },
	phonenumbers: { kind: 'phone', name: 'PhoneNumbers.csv' },
	positions: { kind: 'positions', name: 'Positions.csv' },
	education: { kind: 'education', name: 'Education.csv' },
	skills: { kind: 'skills', name: 'Skills.csv' },
	certifications: { kind: 'certifications', name: 'Certifications.csv' },
	projects: { kind: 'projects', name: 'Projects.csv' },
	languages: { kind: 'languages', name: 'Languages.csv' },
	honors: { kind: 'honors', name: 'Honors.csv' },
	volunteering: { kind: 'volunteering', name: 'Volunteering.csv' },
	courses: { kind: 'courses', name: 'Courses.csv' },
};

/** Turn the CSV files of a LinkedIn export into a career profile. Never throws on bad data. */
export function parseLinkedInFiles(files: Record<string, string>): {
	profile: Profile;
	found: string[];
	warnings: string[];
} {
	const profile = emptyProfile();
	const found: string[] = [];
	const warnings: string[] = [];

	const tables = new Map<Kind, Row[]>();
	for (const [path, content] of Object.entries(files)) {
		const entry = FILES[baseKey(path)];
		if (!entry || tables.has(entry.kind)) continue;
		let rows: Row[] = [];
		try {
			rows = parseCsv(content);
		} catch {
			warnings.push(`${entry.name} could not be read.`);
			continue;
		}
		tables.set(entry.kind, rows);
		found.push(entry.name);
		if (rows.length === 0) warnings.push(`${entry.name} had no rows.`);
	}

	/** Warn once when a file has rows but no column matches. */
	const need = (kind: Kind, label: string, names: string[]) => {
		const rows = tables.get(kind);
		if (rows && rows.length > 0 && !hasColumn(rows[0], names)) {
			warnings.push(`${FILES[fileKey(kind)].name} had no ${label} column.`);
		}
	};
	const rowsOf = (kind: Kind) => tables.get(kind) ?? [];

	// Profile.csv
	const p = rowsOf('profile')[0];
	if (p) {
		const first = pick(p, ['First Name', 'FirstName']);
		const last = pick(p, ['Last Name', 'LastName']);
		profile.basics.name = cut(`${first} ${last}`, 120);
		profile.basics.headline = cut(pick(p, ['Headline']), 200);
		profile.basics.location = cut(pick(p, ['Geo Location', 'Location', 'Locale']), 120);
		profile.basics.links = parseWebsites(pick(p, ['Websites', 'Website'])).slice(0, 8);
		const summary = pick(p, ['Summary', 'About']);
		if (summary) profile.summaries.push({ id: newItemId('sum'), text: cut(summary, 1500) });
		if (!first && !last) warnings.push('Profile.csv had no name.');
	}

	// Email and phone
	const emails = rowsOf('email');
	if (emails.length > 0) {
		const primary = emails.find((r) => /^(yes|true)$/i.test(pick(r, ['Primary'])));
		const row = primary ?? emails[0];
		profile.basics.email = cut(pick(row, ['Email Address', 'Email', 'Address']), 200);
	}
	const phones = rowsOf('phone');
	if (phones.length > 0) {
		profile.basics.phone = cut(pick(phones[0], ['Number', 'Phone Number', 'Phone']), 60);
	}

	// Positions
	need('positions', 'Title', ['Title', 'Position']);
	need('positions', 'Company Name', ['Company Name', 'Company', 'Organization']);
	for (const r of rowsOf('positions')) {
		const company = pick(r, ['Company Name', 'Company', 'Organization']);
		const title = pick(r, ['Title', 'Position', 'Role']);
		if (!company && !title) continue;
		const start = parseDate(pick(r, ['Started On', 'Start Date', 'Start']));
		const end = parseDate(pick(r, ['Finished On', 'End Date', 'End']));
		profile.positions.push({
			id: newItemId('pos'),
			company: cut(company, 200),
			title: cut(title, 200),
			location: cut(pick(r, ['Location']), 200),
			start,
			end,
			current: end === '',
			employmentType: '',
			bullets: makeBullets(pick(r, ['Description', 'Summary']), 40),
		});
	}
	profile.positions = sortPositions(profile.positions).slice(0, 60);

	// Education
	need('education', 'School Name', ['School Name', 'School', 'Institution']);
	for (const r of rowsOf('education')) {
		const school = pick(r, ['School Name', 'School', 'Institution']);
		const degree = pick(r, ['Degree Name', 'Degree']);
		if (!school && !degree) continue;
		const notes = pick(r, ['Notes']);
		const activities = pick(r, ['Activities', 'Activities and Societies']);
		profile.education.push({
			id: newItemId('edu'),
			school: cut(school, 200),
			degree: cut(degree, 200),
			field: '',
			start: parseDate(pick(r, ['Start Date', 'Started On'])),
			end: parseDate(pick(r, ['End Date', 'Finished On'])),
			gpa: '',
			honors: cut([notes, activities].filter(Boolean).join('. '), 300),
			courses: '',
		});
	}
	profile.education = profile.education.slice(0, 20);

	// Skills
	need('skills', 'Name', ['Name', 'Skill']);
	const seen = new Set<string>();
	for (const r of rowsOf('skills')) {
		const name = cut(pick(r, ['Name', 'Skill']), 80);
		if (!name || seen.has(name.toLowerCase())) continue;
		seen.add(name.toLowerCase());
		profile.skills.push({ id: newItemId('sk'), name, group: 'other' });
	}
	profile.skills = profile.skills.slice(0, 200);

	// Certifications
	need('certifications', 'Name', ['Name', 'Title']);
	for (const r of rowsOf('certifications')) {
		const name = pick(r, ['Name', 'Title']);
		if (!name) continue;
		profile.certifications.push({
			id: newItemId('cert'),
			name: cut(name, 200),
			issuer: cut(pick(r, ['Authority', 'Issuer', 'Organization']), 200),
			date: parseDate(pick(r, ['Started On', 'Issued On', 'Start Date'])),
			expires: parseDate(pick(r, ['Finished On', 'Expires On', 'End Date'])),
			credentialId: cut(pick(r, ['License Number', 'Credential ID']), 100),
			url: cut(pick(r, ['Url', 'URL', 'Link']), 300),
		});
	}
	profile.certifications = profile.certifications.slice(0, 60);

	// Projects
	need('projects', 'Title', ['Title', 'Name']);
	for (const r of rowsOf('projects')) {
		const name = pick(r, ['Title', 'Name']);
		if (!name) continue;
		profile.projects.push({
			id: newItemId('prj'),
			name: cut(name, 200),
			role: '',
			start: parseDate(pick(r, ['Started On', 'Start Date'])),
			end: parseDate(pick(r, ['Finished On', 'End Date'])),
			url: cut(pick(r, ['Url', 'URL', 'Link']), 300),
			bullets: makeBullets(pick(r, ['Description']), 20),
		});
	}
	profile.projects = profile.projects.slice(0, 40);

	// Other items: volunteering, honors, languages, courses
	const other: OtherItem[] = [];
	const addOther = (o: Omit<OtherItem, 'id'>) => {
		if (!o.title) return;
		other.push({
			id: newItemId('oth'),
			kind: o.kind,
			title: cut(o.title, 200),
			organization: cut(o.organization, 200),
			date: o.date,
			description: cut(o.description, 1000),
		});
	};
	for (const r of rowsOf('volunteering')) {
		addOther({
			kind: 'volunteer',
			title: pick(r, ['Role', 'Title']),
			organization: pick(r, ['Company Name', 'Organization', 'Company']),
			date: parseDate(pick(r, ['Started On', 'Start Date'])),
			description: pick(r, ['Description']),
		});
	}
	for (const r of rowsOf('honors')) {
		addOther({
			kind: 'award',
			title: pick(r, ['Title', 'Name']),
			organization: pick(r, ['Issuer', 'Organization']),
			date: parseDate(pick(r, ['Issued On', 'Date'])),
			description: pick(r, ['Description']),
		});
	}
	for (const r of rowsOf('languages')) {
		addOther({
			kind: 'language',
			title: pick(r, ['Name', 'Language']),
			organization: '',
			date: '',
			description: pick(r, ['Proficiency', 'Level']),
		});
	}
	for (const r of rowsOf('courses')) {
		addOther({
			kind: 'other',
			title: pick(r, ['Name', 'Title']),
			organization: '',
			date: '',
			description: pick(r, ['Number']),
		});
	}
	profile.other = other.slice(0, 60);

	// Final pass: the schema is the contract.
	return { profile: profileSchema.parse(profile), found, warnings };
}

function fileKey(kind: Kind): string {
	return Object.keys(FILES).find((k) => FILES[k].kind === kind) as string;
}

/** Current positions first, then newest end date, then newest start date. */
function sortPositions<T extends { current: boolean; start: string; end: string }>(list: T[]): T[] {
	return list
		.map((p, i) => ({ p, i }))
		.sort((a, b) => {
			if (a.p.current !== b.p.current) return a.p.current ? -1 : 1;
			const ea = a.p.end || a.p.start;
			const eb = b.p.end || b.p.start;
			if (ea !== eb) return ea < eb ? 1 : -1;
			if (a.p.start !== b.p.start) return a.p.start < b.p.start ? 1 : -1;
			return a.i - b.i;
		})
		.map((x) => x.p);
}
