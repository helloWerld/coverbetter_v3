// Pure logic for the LinkedIn headline generator. No React.

/** LinkedIn's limit today. It can change, so the tool says so. */
export const HEADLINE_LIMIT = 220;

export type OpenStyle = 'none' | 'open' | 'seeking';
export type AudienceKind = 'people' | 'industry';

export type HeadlineInput = {
	role: string;
	/** Skills, separated by commas, pipes, semicolons, or new lines. */
	skills: string;
	audience: string;
	audienceKind: AudienceKind;
	result: string;
};

export type Headline = { text: string; length: number; overLimit: boolean; pattern: string };

const clean = (s: string) => s.trim().replace(/\s+/g, ' ');

export function charCount(text: string): number {
	return [...text].length;
}

/** Split the skills field. Keep at most 4. */
export function parseSkills(raw: string): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const part of raw.split(/[,|;\n]+/)) {
		const s = clean(part);
		const key = s.toLowerCase();
		if (s && !seen.has(key)) {
			seen.add(key);
			out.push(s);
		}
	}
	return out.slice(0, 4);
}

/** "A", "A and B", "A, B, and C". */
export function joinList(items: string[]): string {
	if (items.length <= 1) return items.join('');
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function openSuffix(style: OpenStyle, role: string): string {
	const r = clean(role) || '[Role]';
	if (style === 'open') return `Open to ${r} roles`;
	if (style === 'seeking') return `Seeking ${r} opportunities`;
	return '';
}

type Ctx = {
	role: string;
	skills: string[];
	skillList: string;
	firstTwo: string;
	audience: string;
	kind: AudienceKind;
	result: string;
};

type Pattern = {
	id: string;
	needs: { audience?: boolean; result?: boolean };
	build: (c: Ctx) => string;
};

// Fixed patterns. They use plain words only. The user's own words fill the gaps.
export const PATTERNS: Pattern[] = [
	{ id: 'role-skills-commas', needs: {}, build: (c) => `${c.role} | ${c.skills.join(', ')}` },
	{
		id: 'role-for-audience',
		needs: { audience: true },
		build: (c) =>
			c.kind === 'people' ? `${c.role} for ${c.audience} | ${c.firstTwo}` : `${c.role} in ${c.audience} | ${c.firstTwo}`,
	},
	{
		id: 'helping-audience',
		needs: { audience: true },
		build: (c) =>
			c.kind === 'people'
				? `${c.role} | Helping ${c.audience} with ${c.firstTwo}`
				: `${c.role} | ${c.firstTwo} for ${c.audience}`,
	},
	{ id: 'role-focus', needs: {}, build: (c) => `${c.role} with a focus on ${c.firstTwo}` },
	{ id: 'role-result-skills', needs: { result: true }, build: (c) => `${c.role} | ${c.result} | ${c.firstTwo}` },
	{
		id: 'result-first',
		needs: { result: true, audience: true },
		build: (c) =>
			c.kind === 'people' ? `${c.result} | ${c.role} for ${c.audience}` : `${c.result} | ${c.role} in ${c.audience}`,
	},
	{ id: 'skills-pipes', needs: {}, build: (c) => `${c.role} | ${c.skills.join(' | ')}` },
	{ id: 'role-colon', needs: {}, build: (c) => `${c.role}: ${c.skillList}` },
	{ id: 'role-skilled', needs: {}, build: (c) => `${c.role} skilled in ${c.skillList}` },
];

/** Make 5 to 8 headlines from fixed patterns. A pattern that needs an answer you did not give is skipped. */
export function buildHeadlines(input: HeadlineInput, style: OpenStyle): Headline[] {
	const role = clean(input.role) || '[Role]';
	const parsed = parseSkills(input.skills);
	const skills = parsed.length >= 2 ? parsed : [...parsed, ...['[Skill 1]', '[Skill 2]'].slice(parsed.length)];
	const audience = clean(input.audience);
	const result = clean(input.result);
	const ctx: Ctx = {
		role,
		skills,
		skillList: joinList(skills),
		firstTwo: joinList(skills.slice(0, 2)),
		audience,
		kind: input.audienceKind,
		result,
	};
	const suffix = openSuffix(style, role);
	const out: Headline[] = [];
	for (const p of PATTERNS) {
		if (p.needs.audience && !audience) continue;
		if (p.needs.result && !result) continue;
		const base = p.build(ctx);
		const text = suffix ? `${base} | ${suffix}` : base;
		const length = charCount(text);
		out.push({ text, length, overLimit: length > HEADLINE_LIMIT, pattern: p.id });
		if (out.length === 8) break;
	}
	return out;
}
