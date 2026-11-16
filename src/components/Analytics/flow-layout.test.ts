import { describe, expect, it } from 'vitest';
import { CARD_W, columns, flowLayout, minFlowWidth, pathThrough } from './flow-layout';
import type { SankeyLink, SankeyNode } from '@/lib/applications/analytics';

const n = (id: string, value: number, kind: SankeyNode['kind'] = 'go'): SankeyNode => ({ id, label: id, kind, value });
const nodes = [n('saved', 10), n('applied', 8), n('not-applied', 2, 'end'), n('interview', 3), n('rejected@applied', 5, 'end'), n('offer', 1, 'win')];
const links: SankeyLink[] = [
	{ source: 'saved', target: 'applied', value: 8 },
	{ source: 'saved', target: 'not-applied', value: 2 },
	{ source: 'applied', target: 'interview', value: 3 },
	{ source: 'applied', target: 'rejected@applied', value: 5 },
	{ source: 'interview', target: 'offer', value: 1 },
];

describe('columns', () => {
	it('puts each node one column right of its source', () => {
		const c = columns(nodes, links);
		expect([c.get('saved'), c.get('applied'), c.get('not-applied'), c.get('interview'), c.get('offer')]).toEqual([0, 1, 1, 2, 3]);
	});
});

describe('flowLayout', () => {
	it('places cards inside the width, without overlap in a column', () => {
		const out = flowLayout(nodes, links, 900);
		expect(out.cards).toHaveLength(6);
		for (const c of out.cards) {
			expect(c.x).toBeGreaterThanOrEqual(0);
			expect(c.x + c.w).toBeLessThanOrEqual(900 + 0.001);
			expect(c.y).toBeGreaterThanOrEqual(0);
			expect(c.y + c.h).toBeLessThanOrEqual(out.height);
		}
		const col1 = out.cards.filter((c) => c.col === 1).sort((a, b) => a.y - b.y);
		expect(col1[1].y).toBeGreaterThanOrEqual(col1[0].y + col1[0].h);
	});

	it('grows to the minimum width when the box is too small', () => {
		const out = flowLayout(nodes, links, 300);
		expect(out.width).toBe(minFlowWidth(4));
		expect(out.width).toBeGreaterThan(4 * CARD_W);
	});

	it('makes one thin edge for each link, thickest for the biggest flow', () => {
		const out = flowLayout(nodes, links, 900);
		expect(out.edges).toHaveLength(5);
		const w = Object.fromEntries(out.edges.map((e) => [e.target, e.width]));
		expect(w.applied).toBe(4);
		expect(w.offer).toBeGreaterThanOrEqual(1);
		expect(w.offer).toBeLessThan(w.applied);
		expect(out.edges.every((e) => e.d.startsWith('M'))).toBe(true);
	});

	it('handles no data', () => {
		expect(flowLayout([], [], 900)).toEqual({ cards: [], edges: [], width: 900, height: 0 });
	});
});

describe('pathThrough', () => {
	it('keeps the upstream and downstream path of a node', () => {
		const p = pathThrough('interview', links);
		expect([...p.nodes].sort()).toEqual(['applied', 'interview', 'offer', 'saved']);
		expect(p.links.has('saved>applied')).toBe(true);
		expect(p.links.has('applied>rejected@applied')).toBe(false);
	});
});
