import { describe, expect, it } from 'vitest';
import type { ResumeDoc } from '@/lib/profile/render';
import type { TailoredSelection } from '@/lib/profile/types';
import {
	estimateLines,
	moveEntryBullet,
	moveItem,
	pageHint,
	pruneRewrites,
	setRewrite,
	splitSelected,
	toggleEntry,
	toggleEntryBullet,
	toggleId,
} from './helpers';

describe('moveItem', () => {
	it('moves down and up', () => {
		expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
		expect(moveItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
	});
	it('keeps the order at the edges and does not change the input', () => {
		const list = ['a', 'b'];
		expect(moveItem(list, 0, -1)).toEqual(['a', 'b']);
		expect(moveItem(list, 1, 1)).toEqual(['a', 'b']);
		expect(moveItem(list, 5, 1)).toEqual(['a', 'b']);
		expect(list).toEqual(['a', 'b']);
	});
});

describe('toggleId', () => {
	it('removes a selected id', () => {
		expect(toggleId(['a', 'c'], 'c', ['a', 'b', 'c'])).toEqual(['a']);
	});
	it('adds in profile order', () => {
		expect(toggleId(['a', 'c'], 'b', ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
		expect(toggleId(['c'], 'a', ['a', 'b', 'c'])).toEqual(['a', 'c']);
	});
	it('keeps a custom order of the other ids', () => {
		expect(toggleId(['c', 'a'], 'b', ['a', 'b', 'c'])).toEqual(['c', 'a', 'b']);
	});
});

describe('entries', () => {
	const entries = [{ id: 'p1', bullets: ['b1'] }];
	it('adds an entry with start bullets', () => {
		expect(toggleEntry(entries, 'p0', ['p0', 'p1'], ['x', 'y'])).toEqual([
			{ id: 'p0', bullets: ['x', 'y'] },
			{ id: 'p1', bullets: ['b1'] },
		]);
	});
	it('removes an entry', () => {
		expect(toggleEntry(entries, 'p1', ['p1'], [])).toEqual([]);
	});
	it('toggles and moves bullets of one entry', () => {
		const e = [
			{ id: 'p1', bullets: ['b1', 'b3'] },
			{ id: 'p2', bullets: ['z'] },
		];
		const added = toggleEntryBullet(e, 'p1', 'b2', ['b1', 'b2', 'b3']);
		expect(added[0].bullets).toEqual(['b1', 'b2', 'b3']);
		expect(added[1].bullets).toEqual(['z']);
		expect(moveEntryBullet(added, 'p1', 2, -1)[0].bullets).toEqual(['b1', 'b3', 'b2']);
	});
});

describe('splitSelected', () => {
	it('keeps selection order and drops unknown ids', () => {
		expect(splitSelected(['c', 'x', 'a'], ['a', 'b', 'c'])).toEqual({ selected: ['c', 'a'], rest: ['b'] });
	});
});

describe('rewrites', () => {
	it('sets and clears a rewrite', () => {
		const r = setRewrite({}, 'b1', 'New text', 'Old text');
		expect(r).toEqual({ b1: 'New text' });
		expect(setRewrite(r, 'b1', 'Old text', 'Old text')).toEqual({});
		expect(setRewrite(r, 'b1', '   ', 'Old text')).toEqual({});
	});
	it('prunes rewrites for bullets that are not selected', () => {
		const s: TailoredSelection = {
			version: 1,
			summary: '',
			positions: [{ id: 'p1', bullets: ['b1'] }],
			education: [],
			certifications: [],
			skills: [],
			projects: [],
			other: [],
			rewrites: { b1: 'x', b9: 'y' },
			template: 'classic',
		};
		expect(pruneRewrites(s).rewrites).toEqual({ b1: 'x' });
	});
});

describe('page estimate', () => {
	const doc = (bullets: number): ResumeDoc => ({
		name: 'A',
		headline: '',
		contactLine: 'a@b.c',
		summary: '',
		sections: [
			{
				title: 'Experience',
				items: [{ heading: 'H', subheading: 'S', dates: '2020', bullets: Array.from({ length: bullets }, () => 'word '.repeat(10)) }],
			},
		],
	});
	it('counts lines', () => {
		expect(estimateLines(doc(2))).toBeGreaterThan(estimateLines(doc(1)));
	});
	it('gives page hints', () => {
		expect(pageHint(doc(3))).toEqual({ text: 'About 1 page.', warn: false });
		expect(pageHint(doc(60)).text).toBe('About 2 pages.');
		expect(pageHint(doc(120)).warn).toBe(true);
	});
});
