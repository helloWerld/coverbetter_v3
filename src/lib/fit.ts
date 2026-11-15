/**
 * AI Job Fit Score. The model lists the job requirements and marks each one
 * against the resume. This code turns that list into the score, so the same
 * list always gives the same number, and text in a job post cannot set it.
 */

export type ReqType = 'must' | 'nice';
export type ReqStatus = 'met' | 'partial' | 'missing';

export interface FitRequirement {
	type: ReqType;
	status: ReqStatus;
	requirement: string;
	evidence: string;
}

export interface FitResult {
	score: number;
	summary: string;
	requirements: FitRequirement[];
}

export const MAX_REQUIREMENTS = 12;
const MAX_FIELD = 160;
const MAX_SUMMARY = 400;

const POINTS: Record<ReqStatus, number> = { met: 1, partial: 0.5, missing: 0 };
const WEIGHT: Record<ReqType, number> = { must: 2, nice: 1 };

export const FIT_DISCLAIMER =
	'This score compares your resume with the job post. It does not predict a hiring decision.';

/** 0 to 100, or null when there are no requirements. */
export function fitScore(reqs: readonly FitRequirement[]): number | null {
	if (reqs.length === 0) return null;
	let got = 0;
	let max = 0;
	for (const r of reqs) {
		got += POINTS[r.status] * WEIGHT[r.type];
		max += WEIGHT[r.type];
	}
	return Math.round((100 * got) / max);
}

export type FitBand = 'strong' | 'good' | 'partial' | 'low';

export function fitBand(score: number): FitBand {
	if (score >= 80) return 'strong';
	if (score >= 60) return 'good';
	if (score >= 40) return 'partial';
	return 'low';
}

export const BAND_LABEL: Record<FitBand, string> = {
	strong: 'Strong match',
	good: 'Good match',
	partial: 'Partial match',
	low: 'Low match',
};

export const STATUS_LABEL: Record<ReqStatus, string> = {
	met: 'Met',
	partial: 'Partly met',
	missing: 'Missing',
};

const cut = (s: string, n: number) => s.trim().replace(/\s+/g, ' ').slice(0, n);

/** One `REQ: must | met | requirement | evidence` line, or null when it is not valid. */
export function parseReqLine(line: string): FitRequirement | null {
	const m = /^\**\s*REQ\s*:\s*(.*)$/i.exec(line.trim());
	if (!m) return null;
	const parts = m[1].split('|');
	if (parts.length < 3) return null;
	const type = parts[0].trim().toLowerCase();
	const status = parts[1].trim().toLowerCase();
	if (type !== 'must' && type !== 'nice') return null;
	if (status !== 'met' && status !== 'partial' && status !== 'missing') return null;
	const requirement = cut(parts[2], MAX_FIELD);
	if (!requirement) return null;
	const evidence = status === 'missing' ? '' : cut(parts.slice(3).join('|'), MAX_FIELD);
	return { type, status, requirement, evidence };
}

/**
 * Reads the `FIT SUMMARY:` line and the `REQ:` lines. Other lines are ignored.
 * Returns null when no valid requirement is found.
 */
export function parseFitLines(lines: readonly string[]): FitResult | null {
	let summary = '';
	const requirements: FitRequirement[] = [];
	for (const line of lines) {
		const s = /^\**\s*FIT SUMMARY\s*:\s*(.*)$/i.exec(line.trim());
		if (s) {
			summary = cut(s[1], MAX_SUMMARY);
			continue;
		}
		const r = parseReqLine(line);
		if (r && requirements.length < MAX_REQUIREMENTS) requirements.push(r);
	}
	const score = fitScore(requirements);
	if (score === null) return null;
	return { score, summary, requirements };
}

/** The stored JSON (letters.fit_json, fit_checks.fit_json). */
export function serializeFit(fit: FitResult): string {
	return JSON.stringify({ summary: fit.summary, requirements: fit.requirements });
}

/** Reads stored JSON back. Bad data gives null, so a page never breaks on it. */
export function deserializeFit(score: number | null, json: string | null): FitResult | null {
	if (score === null || !json) return null;
	try {
		const data = JSON.parse(json) as { summary?: unknown; requirements?: unknown };
		const requirements = Array.isArray(data.requirements)
			? (data.requirements as FitRequirement[]).filter(
					(r) =>
						r &&
						(r.type === 'must' || r.type === 'nice') &&
						(r.status === 'met' || r.status === 'partial' || r.status === 'missing') &&
						typeof r.requirement === 'string',
				)
			: [];
		return { score, summary: typeof data.summary === 'string' ? data.summary : '', requirements };
	} catch {
		return null;
	}
}

/** The prompt rules for the fit check. Shared by the letter prompt and the fit-only prompt. */
export const FIT_RULES = `Rules for the fit check:
- List the 4 to ${MAX_REQUIREMENTS} most important requirements in the job description. Put the most important first.
- Type "must" is for requirements the job description says are required. Type "nice" is for "preferred", "a plus", "bonus", and similar words.
- Status "met": the resume clearly shows it. "partial": the resume shows some of it, for example fewer years or a related tool. "missing": the resume does not show it.
- Evidence is a short quote or summary from the resume. Never invent evidence. When there is no evidence, the status is "missing" and the evidence is empty.
- The summary is 1 or 2 short sentences in English: the main strength and the main gap.
- Write the summary and the status words in English. The requirement and evidence text may stay in the language of the job description or the resume.`;

export const FIT_FORMAT = `FIT SUMMARY: <1 or 2 sentences>
REQ: <must or nice> | <met, partial, or missing> | <requirement> | <evidence>
(one REQ line for each requirement)`;
