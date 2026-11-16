import type { Profile, TailoredSelection } from './types';

export type ResumeItem = {
	heading: string;
	subheading: string;
	dates: string;
	bullets: string[];
	text?: string;
};
export type ResumeDoc = {
	name: string;
	headline: string;
	contactLine: string;
	summary: string;
	sections: { title: string; items: ResumeItem[] }[];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2020-01" gives "Jan 2020". "2018" stays "2018". */
function fmt(ym: string): string {
	const m = /^(\d{4})(?:-(\d{2}))?$/.exec(ym);
	if (!m) return '';
	return m[2] ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : m[1];
}

function range(start: string, end: string, current = false): string {
	const a = fmt(start);
	const b = current ? 'Present' : fmt(end);
	if (a && b) return a === b ? a : `${a} – ${b}`;
	return a || b;
}

const join = (parts: string[], sep = ', ') => parts.map((s) => s.trim()).filter(Boolean).join(sep);

/** Picks the selected bullets in order. Hidden and unknown bullets are skipped. */
function pickBullets(
	bullets: { id: string; text: string; hidden: boolean }[],
	ids: string[],
	rewrites: Record<string, string>,
): string[] {
	const byId = new Map(bullets.map((b) => [b.id, b]));
	const out: string[] = [];
	for (const id of ids) {
		const b = byId.get(id);
		if (b && !b.hidden) out.push(rewrites[id] ?? b.text);
	}
	return out;
}

export function selectionToDoc(p: Profile, s: TailoredSelection): ResumeDoc {
	const rewrites = s.rewrites ?? {};
	const sections: ResumeDoc['sections'] = [];
	const add = (title: string, items: ResumeItem[]) => {
		if (items.length) sections.push({ title, items });
	};

	const positions = new Map(p.positions.map((x) => [x.id, x]));
	const experience: ResumeItem[] = [];
	for (const sel of s.positions) {
		const x = positions.get(sel.id);
		if (!x) continue;
		experience.push({
			heading: x.title || x.company,
			subheading: x.title ? join([x.company, x.location]) : x.location,
			dates: range(x.start, x.end, x.current),
			bullets: pickBullets(x.bullets, sel.bullets, rewrites),
		});
	}
	add('Experience', experience);

	const projects = new Map(p.projects.map((x) => [x.id, x]));
	const projectItems: ResumeItem[] = [];
	for (const sel of s.projects) {
		const x = projects.get(sel.id);
		if (!x) continue;
		projectItems.push({
			heading: x.name,
			subheading: x.role,
			dates: range(x.start, x.end),
			bullets: pickBullets(x.bullets, sel.bullets, rewrites),
			...(x.url ? { text: x.url } : {}),
		});
	}
	add('Projects', projectItems);

	const education = new Map(p.education.map((x) => [x.id, x]));
	const eduItems: ResumeItem[] = [];
	for (const id of s.education) {
		const x = education.get(id);
		if (!x) continue;
		const text = join([x.gpa ? `GPA ${x.gpa}` : '', x.honors, x.courses ? `Courses: ${x.courses}` : ''], ' | ');
		eduItems.push({
			heading: x.school,
			subheading: join([x.degree, x.field]),
			dates: range(x.start, x.end),
			bullets: [],
			...(text ? { text } : {}),
		});
	}
	add('Education', eduItems);

	const certs = new Map(p.certifications.map((x) => [x.id, x]));
	const certItems: ResumeItem[] = [];
	for (const id of s.certifications) {
		const x = certs.get(id);
		if (!x) continue;
		certItems.push({ heading: x.name, subheading: x.issuer, dates: fmt(x.date), bullets: [] });
	}
	add('Certifications', certItems);

	const skills = new Map(p.skills.map((x) => [x.id, x]));
	const names = s.skills.map((id) => skills.get(id)?.name).filter((n): n is string => Boolean(n));
	if (names.length) add('Skills', [{ heading: '', subheading: '', dates: '', bullets: [], text: names.join(', ') }]);

	const others = new Map(p.other.map((x) => [x.id, x]));
	const otherItems: ResumeItem[] = [];
	for (const id of s.other) {
		const x = others.get(id);
		if (!x) continue;
		otherItems.push({
			heading: x.title,
			subheading: x.organization,
			dates: fmt(x.date),
			bullets: [],
			...(x.description ? { text: x.description } : {}),
		});
	}
	add('Other', otherItems);

	const b = p.basics;
	return {
		name: b.name,
		headline: b.headline,
		contactLine: join([b.email, b.phone, b.location, ...b.links.map((l) => l.url || l.label)], ' | '),
		summary: s.summary,
		sections,
	};
}

/** Compact plain text. It goes to the cover-letter AI, so it has no extra markup. */
export function docToText(doc: ResumeDoc): string {
	const blocks: string[] = [];
	const head = [doc.name, doc.headline, doc.contactLine].filter(Boolean).join('\n');
	if (head) blocks.push(head);
	if (doc.summary) blocks.push(`SUMMARY\n${doc.summary}`);
	for (const sec of doc.sections) {
		const lines = [sec.title.toUpperCase()];
		for (const it of sec.items) {
			const top = join([it.heading, it.subheading, it.dates], ' | ');
			if (top) lines.push(top);
			if (it.text) lines.push(it.text);
			for (const b of it.bullets) lines.push(`- ${b}`);
		}
		blocks.push(lines.join('\n'));
	}
	return blocks.join('\n\n');
}

/** Everything visible, in profile order, with the first summary. */
export function defaultSelection(p: Profile): TailoredSelection {
	const visibleIds = (bullets: { id: string; hidden: boolean }[]) => bullets.filter((b) => !b.hidden).map((b) => b.id);
	return {
		version: 1,
		summary: p.summaries[0]?.text ?? '',
		positions: p.positions.map((x) => ({ id: x.id, bullets: visibleIds(x.bullets) })),
		education: p.education.map((x) => x.id),
		certifications: p.certifications.map((x) => x.id),
		skills: p.skills.map((x) => x.id),
		projects: p.projects.map((x) => ({ id: x.id, bullets: visibleIds(x.bullets) })),
		other: p.other.map((x) => x.id),
		rewrites: {},
		template: 'classic',
	};
}

export function profileToText(p: Profile): string {
	return docToText(selectionToDoc(p, defaultSelection(p)));
}
