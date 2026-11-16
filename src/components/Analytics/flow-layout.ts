import type { SankeyLink, SankeyNode } from '@/lib/applications/analytics';

export const CARD_W = 128;
export const CARD_H = 68;
const ROW_GAP = 16;
const MIN_COL_GAP = 40;
const PAD_Y = 24;

export type CardBox = SankeyNode & { x: number; y: number; w: number; h: number; col: number };
export type Edge = {
	source: string;
	target: string;
	value: number;
	kind: SankeyNode['kind'];
	/** SVG path from the right side of the source card to the left side of the target card. */
	d: string;
	/** Stroke width, 1 to 4 px. Thin lines; the count is on the cards. */
	width: number;
};

/** The smallest width that keeps a gap of MIN_COL_GAP between the columns. */
export function minFlowWidth(cols: number): number {
	return cols * CARD_W + Math.max(0, cols - 1) * MIN_COL_GAP;
}

/** Column of each node: the longest path from "saved", so every link goes left to right. */
export function columns(nodes: SankeyNode[], links: SankeyLink[]): Map<string, number> {
	const col = new Map(nodes.map((n) => [n.id, 0]));
	// Links come in stage order, so a few passes settle every depth.
	for (let pass = 0; pass < nodes.length; pass++) {
		let changed = false;
		for (const l of links) {
			const next = (col.get(l.source) ?? 0) + 1;
			if (next > (col.get(l.target) ?? 0)) {
				col.set(l.target, next);
				changed = true;
			}
		}
		if (!changed) break;
	}
	return col;
}

/** Places the cards in columns (stage order inside a column) and builds the line paths. */
export function flowLayout(
	nodes: SankeyNode[],
	links: SankeyLink[],
	width: number,
): { cards: CardBox[]; edges: Edge[]; width: number; height: number } {
	if (nodes.length === 0) return { cards: [], edges: [], width, height: 0 };
	const col = columns(nodes, links);
	const cols = Math.max(...col.values()) + 1;
	const w = Math.max(width, minFlowWidth(cols));
	const gap = cols > 1 ? (w - cols * CARD_W) / (cols - 1) : 0;

	const byCol: SankeyNode[][] = Array.from({ length: cols }, () => []);
	for (const n of nodes) byCol[col.get(n.id) ?? 0].push(n);
	const tallest = Math.max(...byCol.map((c) => c.length));
	const height = PAD_Y * 2 + tallest * CARD_H + (tallest - 1) * ROW_GAP;

	const cards: CardBox[] = [];
	byCol.forEach((list, c) => {
		const colH = list.length * CARD_H + (list.length - 1) * ROW_GAP;
		let y = (height - colH) / 2;
		for (const n of list) {
			cards.push({ ...n, x: c * (CARD_W + gap), y, w: CARD_W, h: CARD_H, col: c });
			y += CARD_H + ROW_GAP;
		}
	});

	const box = new Map(cards.map((b) => [b.id, b]));
	const maxValue = Math.max(1, ...links.map((l) => l.value));
	const edges: Edge[] = [];
	for (const l of links) {
		const s = box.get(l.source);
		const t = box.get(l.target);
		if (!s || !t) continue;
		const x0 = s.x + s.w;
		const y0 = s.y + s.h / 2;
		const x1 = t.x;
		const y1 = t.y + t.h / 2;
		const mx = (x0 + x1) / 2;
		edges.push({
			source: l.source,
			target: l.target,
			value: l.value,
			kind: t.kind,
			d: `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`,
			width: 1 + 3 * (l.value / maxValue),
		});
	}
	return { cards, edges, width: w, height };
}

/** The nodes and links on every path through `id` (up and down), for the hover highlight. */
export function pathThrough(id: string, links: SankeyLink[]): { nodes: Set<string>; links: Set<string> } {
	const nodes = new Set([id]);
	const keys = new Set<string>();
	const walk = (start: string, dir: 'up' | 'down') => {
		const stack = [start];
		while (stack.length) {
			const cur = stack.pop()!;
			for (const l of links) {
				const from = dir === 'down' ? l.source : l.target;
				const to = dir === 'down' ? l.target : l.source;
				if (from !== cur) continue;
				keys.add(`${l.source}>${l.target}`);
				if (!nodes.has(to)) {
					nodes.add(to);
					stack.push(to);
				}
			}
		}
	};
	walk(id, 'down');
	walk(id, 'up');
	return { nodes, links: keys };
}
