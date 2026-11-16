import type { PrepQuestion } from '@/lib/prep/ai-prompt';
import type { Question, QuestionType } from '@/lib/prep/question-bank';
import type { Profile } from '@/lib/profile/types';
import type { StarAnswer } from '@/lib/prep/star';

export const TYPE_FILTERS: { id: 'all' | QuestionType; label: string }[] = [
	{ id: 'all', label: 'All' },
	{ id: 'about_you', label: 'About you' },
	{ id: 'behavioral', label: 'Behavioral' },
	{ id: 'situational', label: 'Situational' },
	{ id: 'role', label: 'Role' },
	{ id: 'company', label: 'Company' },
	{ id: 'closing', label: 'Closing' },
];

export function filterByType(questions: Question[], type: string): Question[] {
	return type === 'all' ? questions : questions.filter((q) => q.type === type);
}

/** A profile item the user can pick as evidence. `kind` is "bullet" for bullets, "item" for the rest. */
export type ProfileItem = { id: string; kind: 'bullet' | 'item'; label: string; text: string };

function join(parts: string[], sep: string): string {
	return parts.map((p) => p.trim()).filter(Boolean).join(sep);
}

/** Flattens the profile into items with ids. Hidden bullets are kept, because the AI may point to them. */
export function profileItems(profile: Profile): ProfileItem[] {
	const out: ProfileItem[] = [];
	for (const p of profile.positions) {
		const label = join([p.title, p.company], ' at ') || 'Position';
		out.push({ id: p.id, kind: 'item', label, text: label });
		for (const b of p.bullets) out.push({ id: b.id, kind: 'bullet', label, text: b.text });
	}
	for (const p of profile.projects) {
		const label = join([p.name, p.role], ', ') || 'Project';
		out.push({ id: p.id, kind: 'item', label, text: label });
		for (const b of p.bullets) out.push({ id: b.id, kind: 'bullet', label, text: b.text });
	}
	for (const e of profile.education) {
		const text = join([join([e.degree, e.field], ' in '), e.school], ', ');
		if (text) out.push({ id: e.id, kind: 'item', label: 'Education', text });
	}
	for (const c of profile.certifications) {
		const text = join([c.name, c.issuer], ', ');
		if (text) out.push({ id: c.id, kind: 'item', label: 'Certification', text });
	}
	for (const s of profile.skills) out.push({ id: s.id, kind: 'item', label: 'Skill', text: s.name });
	for (const o of profile.other) {
		const text = join([join([o.title, o.organization], ', '), o.description], '. ');
		if (text) out.push({ id: o.id, kind: 'item', label: 'Other', text });
	}
	return out;
}

/** Turns ids into items, in order. Unknown ids are skipped. */
export function resolveUse(items: ProfileItem[], ids: string[]): ProfileItem[] {
	const byId = new Map(items.map((i) => [i.id, i]));
	const out: ProfileItem[] = [];
	for (const id of ids) {
		const item = byId.get(id);
		if (item && !out.includes(item)) out.push(item);
	}
	return out;
}

/** mm:ss. Negative or bad values give 00:00. */
export function formatTimer(totalSeconds: number): string {
	const s = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
	const m = Math.floor(s / 60);
	return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export const TARGET_SECONDS = 120;

export const EMPTY_STAR: StarAnswer = { situation: '', task: '', action: '', result: '' };

export type SavedAnswer = { mode: 'star' | 'text'; star?: StarAnswer; text?: string };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Reads a saved answer from its JSON. Bad data gives null. */
export function parseSavedAnswer(json: string): SavedAnswer | null {
	try {
		const raw = JSON.parse(json) as Record<string, unknown> | null;
		if (!raw || typeof raw !== 'object') return null;
		if (raw.mode === 'star') {
			const s = (raw.star ?? {}) as Record<string, unknown>;
			return { mode: 'star', star: { situation: str(s.situation), task: str(s.task), action: str(s.action), result: str(s.result) } };
		}
		if (raw.mode === 'text') return { mode: 'text', text: str(raw.text) };
		return null;
	} catch {
		return null;
	}
}

/** True when a saved answer has any text. Only these show the "Saved" badge. */
export function hasContent(a: SavedAnswer | null): boolean {
	if (!a) return false;
	if (a.mode === 'text') return (a.text ?? '').trim() !== '';
	return Object.values(a.star ?? EMPTY_STAR).some((v) => v.trim() !== '');
}

export function wordCount(text: string): number {
	const t = text.trim();
	return t === '' ? 0 : t.split(/\s+/).length;
}

/** Adds text to the end of a field, on a new line when the field has text. */
export function appendText(current: string, add: string): string {
	const a = add.trim();
	if (!a) return current;
	return current.trim() === '' ? a : `${current.replace(/\s+$/, '')}\n${a}`;
}

export const AI_TYPE_LABEL: Record<PrepQuestion['type'], string> = {
	gap: 'Gap questions',
	requirement: 'Job requirements',
	role: 'Role',
	behavioral: 'Behavioral',
	motivation: 'Motivation',
};

const AI_ORDER: PrepQuestion['type'][] = ['gap', 'requirement', 'role', 'behavioral', 'motivation'];

/** Groups AI questions by type, gap first. `index` is the position in the pack (for the id `ai:<index>`). */
export function groupAiQuestions(questions: PrepQuestion[]): { type: PrepQuestion['type']; items: { q: PrepQuestion; index: number }[] }[] {
	return AI_ORDER.map((type) => ({
		type,
		items: questions.flatMap((q, index) => (q.type === type ? [{ q, index }] : [])),
	})).filter((g) => g.items.length > 0);
}

/** Behavioral and gap AI questions fit the STAR shape. */
export function aiQuestionIsStar(q: PrepQuestion): boolean {
	return q.type === 'behavioral' || q.type === 'gap' || q.type === 'requirement';
}
