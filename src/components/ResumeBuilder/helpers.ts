import type { ResumeDoc } from '@/lib/profile/render';
import type { TailoredSelection } from '@/lib/profile/types';

type Entry = { id: string; bullets: string[] };

/** Moves the item at `index` one step. Returns the same order when the move leaves the list. */
export function moveItem<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
	const to = index + delta;
	if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list];
	const out = [...list];
	[out[index], out[to]] = [out[to], out[index]];
	return out;
}

/**
 * Adds or removes an id. A new id goes in after the last selected id that comes
 * before it in `order` (the profile order), so the list stays in profile order by default.
 */
export function toggleId(ids: readonly string[], id: string, order: readonly string[]): string[] {
	if (ids.includes(id)) return ids.filter((x) => x !== id);
	const pos = order.indexOf(id);
	let at = 0;
	ids.forEach((x, i) => {
		const p = order.indexOf(x);
		if (p !== -1 && p < pos) at = i + 1;
	});
	const out = [...ids];
	out.splice(at, 0, id);
	return out;
}

/** Adds or removes a position or project. A new one starts with the given bullet ids. */
export function toggleEntry(
	entries: readonly Entry[],
	id: string,
	order: readonly string[],
	startBullets: readonly string[],
): Entry[] {
	if (entries.some((e) => e.id === id)) return entries.filter((e) => e.id !== id);
	const ids = toggleId(
		entries.map((e) => e.id),
		id,
		order,
	);
	const at = ids.indexOf(id);
	const out = [...entries];
	out.splice(at, 0, { id, bullets: [...startBullets] });
	return out;
}

export function toggleEntryBullet(
	entries: readonly Entry[],
	entryId: string,
	bulletId: string,
	bulletOrder: readonly string[],
): Entry[] {
	return entries.map((e) => (e.id === entryId ? { ...e, bullets: toggleId(e.bullets, bulletId, bulletOrder) } : e));
}

export function moveEntryBullet(entries: readonly Entry[], entryId: string, index: number, delta: -1 | 1): Entry[] {
	return entries.map((e) => (e.id === entryId ? { ...e, bullets: moveItem(e.bullets, index, delta) } : e));
}

/** Splits all ids into the selected ones (in selection order) and the rest (in profile order). */
export function splitSelected(selected: readonly string[], all: readonly string[]) {
	const known = new Set(all);
	const chosen = selected.filter((id) => known.has(id));
	const set = new Set(chosen);
	return { selected: chosen, rest: all.filter((id) => !set.has(id)) };
}

/** Sets text for one bullet in this resume. Empty text or the profile text removes the rewrite. */
export function setRewrite(
	rewrites: Readonly<Record<string, string>>,
	id: string,
	text: string,
	original: string,
): Record<string, string> {
	const out = { ...rewrites };
	const clean = text.trim();
	if (!clean || clean === original.trim()) delete out[id];
	else out[id] = text.slice(0, 500);
	return out;
}

/** Drops rewrites for bullets that are not in the selection. */
export function pruneRewrites(s: TailoredSelection): TailoredSelection {
	const used = new Set([...s.positions, ...s.projects].flatMap((e) => e.bullets));
	const rewrites = Object.fromEntries(Object.entries(s.rewrites).filter(([id]) => used.has(id)));
	return { ...s, rewrites };
}

const CHARS_PER_LINE = 95;
const LINES_PER_PAGE = 54;

const wrapLines = (text: string, width = CHARS_PER_LINE) =>
	text
		.split('\n')
		.reduce((n, l) => n + Math.max(1, Math.ceil(l.length / width)), 0);

/** A simple line count for the resume. About 54 lines fill a page. */
export function estimateLines(doc: ResumeDoc): number {
	let lines = 0;
	if (doc.name) lines += 2;
	if (doc.headline) lines += 1;
	if (doc.contactLine) lines += wrapLines(doc.contactLine);
	if (doc.summary) lines += 2 + wrapLines(doc.summary);
	for (const sec of doc.sections) {
		lines += 2;
		for (const it of sec.items) {
			if (it.heading || it.dates) lines += 1;
			if (it.subheading) lines += 1;
			if (it.text) lines += wrapLines(it.text);
			for (const b of it.bullets) lines += wrapLines(b, CHARS_PER_LINE - 4);
			lines += 0.5;
		}
	}
	return Math.ceil(lines);
}

export function estimatePages(doc: ResumeDoc): number {
	return estimateLines(doc) / LINES_PER_PAGE;
}

export function pageHint(doc: ResumeDoc): { text: string; warn: boolean } {
	const pages = estimatePages(doc);
	if (pages <= 1) return { text: 'About 1 page.', warn: false };
	if (pages <= 2) return { text: 'About 2 pages.', warn: false };
	return {
		text: `About ${Math.ceil(pages)} pages. This is long. Remove some items to keep it to 2 pages.`,
		warn: true,
	};
}
