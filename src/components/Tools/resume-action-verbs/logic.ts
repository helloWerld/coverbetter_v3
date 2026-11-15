// Pure logic and fixed data for the resume action verbs tool. No React.

export type VerbGroupId =
	| 'leadership'
	| 'building'
	| 'improving'
	| 'fixing'
	| 'sales'
	| 'communication'
	| 'analysis'
	| 'operations'
	| 'teaching'
	| 'finance'
	| 'technical';

export type VerbGroup = { id: VerbGroupId; label: string; verbs: string[] };

const words = (s: string) => s.trim().split(/\s+/);

// Past tense verbs. Each verb is in one group only. The strongest, most common verbs come first,
// because the weak phrase finder suggests the first verbs of a group.
export const VERB_GROUPS: VerbGroup[] = [
	{
		id: 'leadership',
		label: 'Leadership',
		verbs: words(
			`led directed managed supervised coordinated guided oversaw headed chaired spearheaded championed mobilized
			delegated motivated aligned unified steered orchestrated governed commanded recruited hired represented
			sponsored appointed authorized united rallied inspired ran administered`,
		),
	},
	{
		id: 'building',
		label: 'Building and creating',
		verbs: words(
			`built created designed developed launched established founded invented pioneered authored crafted engineered
			formulated generated initiated introduced produced prototyped originated assembled constructed devised conceived
			instituted shaped started architected fashioned outlined composed drafted piloted debuted`,
		),
	},
	{
		id: 'improving',
		label: 'Improving',
		verbs: words(
			`improved increased boosted accelerated streamlined optimized strengthened enhanced upgraded refined revamped
			modernized simplified overhauled transformed expanded maximized amplified advanced raised lifted reduced cut
			lowered trimmed consolidated standardized automated revitalized restructured reengineered renovated sharpened
			bolstered expedited tuned`,
		),
	},
	{
		id: 'fixing',
		label: 'Fixing and problem solving',
		verbs: words(
			`resolved fixed repaired corrected troubleshot remedied rectified restored recovered mitigated eliminated
			prevented stabilized reconciled settled addressed averted overcame untangled patched salvaged reversed defused
			neutralized cleared intervened rescued reworked remediated normalized safeguarded unblocked revived diagnosed`,
		),
	},
	{
		id: 'sales',
		label: 'Sales and growth',
		verbs: words(
			`sold acquired won secured negotiated closed prospected converted grew captured penetrated upsold
			cultivated pitched marketed promoted campaigned attracted retained broadened partnered signed landed brokered
			booked drove netted exceeded surpassed outsold clinched targeted positioned branded advertised canvassed
			solicited`,
		),
	},
	{
		id: 'communication',
		label: 'Communication',
		verbs: words(
			`wrote presented communicated articulated briefed conveyed corresponded edited published reported documented
			facilitated mediated persuaded advocated announced clarified collaborated consulted liaised interviewed
			translated summarized narrated publicized lectured demonstrated explained informed influenced proposed
			responded engaged testified`,
		),
	},
	{
		id: 'analysis',
		label: 'Analysis and research',
		verbs: words(
			`analyzed researched evaluated assessed investigated audited examined measured forecasted modeled mapped
			surveyed tested validated benchmarked identified discovered quantified calculated compared tracked monitored
			interpreted inspected reviewed studied explored uncovered projected classified categorized synthesized
			scrutinized detected verified appraised`,
		),
	},
	{
		id: 'operations',
		label: 'Organization and operations',
		verbs: words(
			`organized scheduled planned prioritized allocated arranged dispatched processed maintained logged filed
			cataloged inventoried sourced procured executed implemented deployed delivered fulfilled operated staffed
			routed stocked shipped supplied registered recorded compiled sorted sequenced`,
		),
	},
	{
		id: 'teaching',
		label: 'Teaching and support',
		verbs: words(
			`taught trained coached mentored tutored instructed educated advised counseled supported nurtured equipped
			enabled prepared welcomed accompanied cared served enrolled oriented reassured comforted referred screened
			onboarded`,
		),
	},
	{
		id: 'finance',
		label: 'Finance',
		verbs: words(
			`budgeted accounted billed invoiced reimbursed funded financed invested underwrote saved collected disbursed
			amortized capitalized balanced priced bid valued hedged reserved refinanced apportioned tallied costed
			depreciated paid taxed credited debited`,
		),
	},
	{
		id: 'technical',
		label: 'Technical',
		verbs: words(
			`programmed coded integrated migrated configured installed scripted provisioned refactored encrypted
			virtualized containerized wired calibrated ported indexed queried parsed scraped merged synced instrumented
			hosted debugged`,
		),
	},
];

// A verb stays in the first group that lists it, so every verb shows once.
const seen = new Set<string>();
export const GROUPS: VerbGroup[] = VERB_GROUPS.map((g) => ({
	...g,
	verbs: g.verbs.filter((v) => {
		if (seen.has(v)) return false;
		seen.add(v);
		return true;
	}),
}));

export const ALL_VERBS: { verb: string; group: VerbGroupId }[] = GROUPS.flatMap((g) =>
	g.verbs.map((verb) => ({ verb, group: g.id })),
);

export function groupLabel(id: VerbGroupId): string {
	return GROUPS.find((g) => g.id === id)?.label ?? id;
}

/** Search by prefix or part of a verb, and by group. An empty search shows the whole group. */
export function filterVerbs(query: string, group: VerbGroupId | 'all'): { verb: string; group: VerbGroupId }[] {
	const q = query.trim().toLowerCase();
	return ALL_VERBS.filter((v) => (group === 'all' || v.group === group) && (q === '' || v.verb.includes(q)));
}

type WeakPhrase = {
	phrase: string;
	/** true: flag only when the phrase opens the bullet. false: flag it anywhere. */
	opener: boolean;
	/** Groups to suggest from when the line has no better clue. */
	groups: VerbGroupId[];
};

export const WEAK_PHRASES: WeakPhrase[] = [
	{ phrase: 'responsible for', opener: false, groups: ['leadership', 'operations'] },
	{ phrase: 'responsibilities included', opener: false, groups: ['operations', 'leadership'] },
	{ phrase: 'duties included', opener: false, groups: ['operations', 'leadership'] },
	{ phrase: 'duties', opener: true, groups: ['operations', 'leadership'] },
	{ phrase: 'worked on', opener: false, groups: ['building', 'improving'] },
	{ phrase: 'worked with', opener: true, groups: ['communication', 'leadership'] },
	{ phrase: 'helped with', opener: false, groups: ['improving', 'teaching'] },
	{ phrase: 'helped to', opener: false, groups: ['improving', 'teaching'] },
	{ phrase: 'helped', opener: true, groups: ['improving', 'teaching'] },
	{ phrase: 'assisted with', opener: false, groups: ['teaching', 'operations'] },
	{ phrase: 'assisted in', opener: false, groups: ['teaching', 'operations'] },
	{ phrase: 'assisted', opener: true, groups: ['teaching', 'operations'] },
	{ phrase: 'was involved in', opener: false, groups: ['building', 'leadership'] },
	{ phrase: 'were involved in', opener: false, groups: ['building', 'leadership'] },
	{ phrase: 'involved in', opener: false, groups: ['building', 'leadership'] },
	{ phrase: 'tasked with', opener: false, groups: ['operations', 'building'] },
	{ phrase: 'in charge of', opener: false, groups: ['leadership', 'operations'] },
	{ phrase: 'participated in', opener: false, groups: ['communication', 'building'] },
	{ phrase: 'was part of', opener: false, groups: ['building', 'leadership'] },
	{ phrase: 'dealt with', opener: false, groups: ['fixing', 'communication'] },
	{ phrase: 'tried to', opener: false, groups: ['building', 'improving'] },
	{ phrase: 'attempted to', opener: false, groups: ['building', 'improving'] },
	{ phrase: 'handled', opener: true, groups: ['operations', 'fixing'] },
	{ phrase: 'utilized', opener: true, groups: ['technical', 'operations'] },
	{ phrase: 'used', opener: true, groups: ['technical', 'operations'] },
	{ phrase: 'did', opener: true, groups: ['building', 'operations'] },
	{ phrase: 'made', opener: true, groups: ['building', 'improving'] },
	{ phrase: 'got', opener: true, groups: ['sales', 'improving'] },
];

const KEYWORDS: { group: VerbGroupId; re: RegExp }[] = [
	{ group: 'sales', re: /\b(sales?|revenue|clients?|customers?|prospects?|accounts?|marketing|campaigns?|deals?)\b/i },
	{ group: 'finance', re: /\b(budgets?|costs?|invoices?|financ\w*|payroll|expenses?|audits?|billing)\b/i },
	{ group: 'technical', re: /\b(code|software|systems?|servers?|databases?|api|websites?|apps?|cloud|network\w*|sql|python)\b/i },
	{ group: 'analysis', re: /\b(data|analy\w*|research\w*|reports?|metrics?|surveys?|insights?)\b/i },
	{ group: 'teaching', re: /\b(train\w*|teach\w*|students?|mentor\w*|onboard\w*|coach\w*|patients?|interns?)\b/i },
	{ group: 'leadership', re: /\b(team|teams|staff|manag\w*|supervis\w*|hir\w*)\b/i },
	{ group: 'communication', re: /\b(presentations?|emails?|writing|content|blogs?|press|stakeholders?)\b/i },
	{ group: 'fixing', re: /\b(issues?|bugs?|problems?|errors?|complaints?|incidents?|tickets?)\b/i },
	{ group: 'building', re: /\b(design\w*|build\w*|launch\w*|creat\w*|develop\w*|prototypes?)\b/i },
	{ group: 'improving', re: /\b(improv\w*|efficien\w*|streamlin\w*|faster|reduc\w*|increas\w*)\b/i },
	{ group: 'operations', re: /\b(schedul\w*|inventory|process\w*|logistics|vendors?|supply|orders?|workflows?|projects?)\b/i },
];

export type WeakFinding = { phrase: string; atStart: boolean; suggestions: string[] };
export type LineResult = { line: string; findings: WeakFinding[] };

function escapeRe(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PHRASE_RE = new RegExp(
	`\\b(${[...WEAK_PHRASES].sort((a, b) => b.phrase.length - a.phrase.length).map((p) => escapeRe(p.phrase)).join('|')})\\b`,
	'gi',
);

// Bullet marks and number marks at the start of a line. Dashes use code points, so the source has no dash characters.
const LEADING_MARK = /^[\s•·▪●◦*\u2013\u2014-]+/;

/** Pick 3 to 5 verbs. Groups that match the line come first, then the default groups of the phrase. */
export function suggestVerbs(line: string, defaults: VerbGroupId[], count = 5): string[] {
	const fromLine = KEYWORDS.filter((k) => k.re.test(line)).map((k) => k.group);
	const order = [...new Set([...fromLine.slice(0, 2), ...defaults])].slice(0, 3);
	const lower = line.toLowerCase();
	const pools = order.map((id) => (GROUPS.find((g) => g.id === id)?.verbs ?? []).filter((v) => !lower.includes(v)));
	const out: string[] = [];
	for (let i = 0; out.length < count && pools.some((p) => i < p.length); i++) {
		for (const pool of pools) {
			if (out.length < count && i < pool.length && !out.includes(pool[i])) out.push(pool[i]);
		}
	}
	return out;
}

/** Find weak openers and phrases in each line of a resume text. Lines with no weak phrase are left out. */
export function findWeakPhrases(text: string): { lines: LineResult[]; lineCount: number } {
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.replace(LEADING_MARK, '').trim())
		.filter((l) => l.length > 0);
	const results: LineResult[] = [];
	for (const line of lines) {
		const findings: WeakFinding[] = [];
		for (const m of line.matchAll(PHRASE_RE)) {
			const info = WEAK_PHRASES.find((p) => p.phrase === m[1].toLowerCase());
			if (!info) continue;
			const atStart = m.index === 0;
			if (info.opener && !atStart) continue;
			findings.push({ phrase: m[1], atStart, suggestions: suggestVerbs(line, info.groups) });
		}
		if (findings.length > 0) results.push({ line, findings });
	}
	return { lines: results, lineCount: lines.length };
}
