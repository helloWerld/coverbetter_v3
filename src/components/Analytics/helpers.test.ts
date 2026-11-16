import { describe, expect, it } from 'vitest';
import { flowLayout } from './flow-layout';
import { sankeyData } from '@/lib/applications/analytics';
import { DEFAULT_SETTINGS, type AppSnapshot } from '@/lib/applications/types';
import {
	chartSize,
	flowSummary,
	formatDays,
	formatRate,
	fullName,
	highlightPath,
	linkText,
	nodeLabel,
	percentOf,
	weekLabel,
} from './helpers';

const links = [
	{ source: 'saved', target: 'applied', value: 10 },
	{ source: 'applied', target: 'interview', value: 4 },
	{ source: 'applied', target: 'rejected@applied', value: 3 },
	{ source: 'interview', target: 'offer', value: 1 },
	{ source: 'interview', target: 'rejected@interview', value: 2 },
	{ source: 'saved', target: 'not-applied', value: 2 },
];

describe('formatting', () => {
	it('shows a dash for rates with no applied jobs', () => {
		expect(formatRate(0, 0)).toBe('—');
		expect(formatRate(40, 5)).toBe('40%');
		expect(formatRate(0, 5)).toBe('0%');
	});
	it('formats days', () => {
		expect(formatDays(null)).toBe('—');
		expect(formatDays(7)).toBe('7');
		expect(formatDays(3.5)).toBe('3.5');
	});
	it('computes percents', () => {
		expect(percentOf(9, 32)).toBe(28);
		expect(percentOf(1, 0)).toBe(0);
	});
	it('formats the link tooltip', () => {
		expect(linkText('Applied', 'Interview', 9, 32)).toBe('Applied → Interview: 9 (28%)');
	});
	it('formats week labels', () => {
		expect(weekLabel('2026-11-09')).toBe('Nov 9');
	});
});

describe('fullName', () => {
	it('adds the stage to stage-bound nodes', () => {
		expect(fullName('rejected@interview', 'Rejected')).toBe('Rejected after Interview');
		expect(fullName('in-progress@final', 'In progress')).toBe('In progress at Final interview');
		expect(fullName('offer', 'Offer')).toBe('Offer');
	});
});

describe('chartSize and labels', () => {
	it('is taller in compact mode', () => {
		const a = chartSize(false);
		const b = chartSize(true);
		expect(b.height / b.width).toBeGreaterThan(a.height / a.width);
		expect(b.nodeWidth).toBeGreaterThanOrEqual(8);
		expect(a.nodeWidth).toBeLessThanOrEqual(10);
	});
	it('shortens labels only when short', () => {
		expect(nodeLabel('Final interview', true)).toBe('Final');
		expect(nodeLabel('Final interview', false)).toBe('Final interview');
		expect(nodeLabel('Offer', true)).toBe('Offer');
	});
});

describe('highlightPath', () => {
	it('keeps upstream and downstream of a middle node', () => {
		const h = highlightPath('interview', links);
		expect([...h.nodes].sort()).toEqual(
			['applied', 'interview', 'offer', 'rejected@interview', 'saved'].sort(),
		);
		expect([...h.links].sort()).toEqual([0, 1, 3, 4]);
	});
	it('does not follow sibling branches', () => {
		const h = highlightPath('offer', links);
		expect(h.nodes.has('rejected@applied')).toBe(false);
		expect(h.nodes.has('not-applied')).toBe(false);
		expect([...h.links].sort()).toEqual([0, 1, 3]);
	});
	it('handles a root node', () => {
		const h = highlightPath('saved', links);
		expect(h.links.size).toBe(links.length);
	});
	it('handles an unknown node', () => {
		const h = highlightPath('nope', links);
		expect(h.links.size).toBe(0);
		expect([...h.nodes]).toEqual(['nope']);
	});
});

describe('flowSummary', () => {
	it('reads the counts', () => {
		const text = flowSummary(
			[
				{ id: 'applied', label: 'Applied', value: 8 },
				{ id: 'interview', label: 'Interview', value: 3 },
			],
			1,
		);
		expect(text).toContain('1 application,');
		expect(text).toContain('8 applied');
		expect(text).toContain('3 reached an interview');
		expect(text).toContain('0 got an offer');
	});
});

describe('flow map layout for the sankeyData shape', () => {
	const d = (days: number) => new Date(Date.UTC(2026, 10, 1) + days * 86400000);
	const app = (id: string, over: Partial<AppSnapshot>): AppSnapshot => ({
		id,
		status: 'applied',
		source: 'linkedin',
		createdAt: d(0),
		appliedAt: d(1),
		hasResume: false,
		hasLetter: false,
		fitScore: null,
		events: [],
		interviews: [],
		...over,
	});
	it('produces finite positions', () => {
		const apps = [
			app('a', { status: 'saved', appliedAt: null }),
			app('b', {}),
			app('c', { status: 'rejected' }),
			app('d', { status: 'interview', interviews: [{ round: 'first', at: d(5) }] }),
			app('e', {
				status: 'offer',
				interviews: [
					{ round: 'first', at: d(5) },
					{ round: 'final', at: d(9) },
				],
			}),
		];
		const data = sankeyData(apps, d(10), DEFAULT_SETTINGS);
		const out = flowLayout(data.nodes, data.links, 900);
		expect(out.cards).toHaveLength(data.nodes.length);
		expect(out.edges).toHaveLength(data.links.length);
		for (const c of out.cards) for (const v of [c.x, c.y]) expect(Number.isFinite(v)).toBe(true);
		for (const e of out.edges) expect(e.width).toBeGreaterThan(0);
	});
});
