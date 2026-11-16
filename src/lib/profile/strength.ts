import type { Position, Profile } from './types';

export interface StrengthTip {
	id: string;
	text: string;
	/** The item id to scroll to. */
	target?: string;
}

const RECENT_YEARS = 10;
const MAX_TIPS = 6;

/** Month count since year 0. A bare year means January (start) or December (end). */
function monthIndex(ym: string, asEnd: boolean): number | null {
	const m = /^(\d{4})(?:-(\d{2}))?$/.exec(ym);
	if (!m) return null;
	const month = m[2] ? Number(m[2]) - 1 : asEnd ? 11 : 0;
	return Number(m[1]) * 12 + month;
}

function label(p: Position): string {
	const title = p.title || 'this role';
	return p.company ? `${title} at ${p.company}` : title;
}

const visible = (p: Position) => p.bullets.filter((b) => !b.hidden);
const hasNumber = (text: string) => /[\d%$]/.test(text);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Scores the profile from 0 to 100 and lists the best next steps. */
export function profileStrength(p: Profile, now: Date): { score: number; tips: StrengthTip[] } {
	const nowM = now.getFullYear() * 12 + now.getMonth();
	const cutoff = nowM - RECENT_YEARS * 12;
	// Each tip carries the points it can win, so the list sorts by value.
	const tips: (StrengthTip & { gain: number })[] = [];
	let score = 0;
	const tip = (id: string, text: string, gain: number, target?: string) => {
		if (gain > 0.01) tips.push({ id, text, target, gain });
	};

	// Contact: 10
	const hasContact = Boolean(p.basics.name.trim() && p.basics.email.trim());
	if (hasContact) score += 10;
	else {
		const missing = !p.basics.name.trim() && !p.basics.email.trim() ? 'name and email' : !p.basics.name.trim() ? 'name' : 'email';
		tip('contact', `Add your ${missing}.`, 10);
	}

	// Summary: 5
	if (p.summaries.some((s) => s.text.trim())) score += 5;
	else tip('summary', 'Add a short summary.', 5);

	// Positions: 10
	const positions = p.positions;
	if (positions.length > 0) score += 10;
	else tip('positions', 'Add your work experience.', 10);

	const endOf = (x: Position) => (x.current || !x.end ? (x.current ? nowM : null) : monthIndex(x.end, true));
	// A position is recent when it ends in the last 10 years, or has no known end and no known start.
	const recent = positions.filter((x) => {
		const end = endOf(x);
		if (end !== null) return end >= cutoff;
		const start = monthIndex(x.start, false);
		return start === null || start >= cutoff;
	});
	const scored = recent.length > 0 ? recent : positions;

	// Bullets per recent position: 20
	if (scored.length > 0) {
		const each = 20 / scored.length;
		for (const x of scored) {
			const n = visible(x).length;
			score += each * (Math.min(n, 3) / 3);
			if (n < 3) tip(`bullets-${x.id}`, `Add ${plural(3 - n, 'more bullet')} to ${label(x)}.`, each * ((3 - n) / 3), x.id);
		}
	}

	// Bullets with a number: 15
	const all = positions.flatMap((x) => visible(x).map((b) => ({ pos: x, b })));
	if (all.length > 0) {
		const share = all.filter((e) => hasNumber(e.b.text)).length / all.length;
		score += 15 * Math.min(share / 0.5, 1);
		if (share < 0.5) {
			const first = all.find((e) => !hasNumber(e.b.text));
			tip('numbers', 'Add numbers to your bullets. Use %, $, or counts.', 15 * (1 - share / 0.5), first?.pos.id);
		}
	} else if (positions.length > 0) {
		tip('numbers', 'Add bullets with numbers.', 15, positions[0].id);
	}

	// Complete dates: 10
	if (positions.length > 0) {
		const each = 10 / positions.length;
		for (const x of positions) {
			const ok = Boolean(x.start) && (Boolean(x.end) || x.current);
			if (ok) score += each;
			else tip(`dates-${x.id}`, `Add dates to ${label(x)}.`, each, x.id);
		}
	}

	// No gap over 6 months in the last 10 years: 5
	if (positions.length > 0) {
		const dated = recent
			.map((x) => ({ x, s: monthIndex(x.start, false), e: endOf(x) }))
			.filter((d): d is { x: Position; s: number; e: number } => d.s !== null && d.e !== null)
			.sort((a, b) => a.s - b.s);
		let maxEnd = -Infinity;
		let gapAt: Position | null = null;
		for (const d of dated) {
			if (maxEnd !== -Infinity && d.s - maxEnd > 6 && !gapAt) gapAt = d.x;
			maxEnd = Math.max(maxEnd, d.e);
		}
		if (gapAt) tip('gap', `Explain the gap before ${label(gapAt)}.`, 5, gapAt.id);
		else score += 5;
	}

	// Education: 10
	if (p.education.length > 0) score += 10;
	else tip('education', 'Add your education.', 10);

	// Skills: 10
	const nSkills = p.skills.length;
	score += 10 * (Math.min(nSkills, 10) / 10);
	if (nSkills < 10) tip('skills', `Add ${plural(10 - nSkills, 'more skill')}.`, 10 - nSkills);

	// Certifications or projects: 5
	if (p.certifications.length > 0 || p.projects.length > 0) score += 5;
	else tip('extras', 'Add a certification or a project.', 5);

	tips.sort((a, b) => b.gain - a.gain);
	return {
		score: Math.max(0, Math.min(100, Math.round(score))),
		tips: tips.slice(0, MAX_TIPS).map(({ gain: _gain, ...t }) => (t.target ? t : { id: t.id, text: t.text })),
	};
}
