import { describe, expect, it } from 'vitest';
import {
	appendText,
	filterByType,
	formatTimer,
	groupAiQuestions,
	hasContent,
	parseSavedAnswer,
	profileItems,
	resolveUse,
} from './helpers';
import type { Question } from '@/lib/prep/question-bank';
import type { PrepQuestion } from '@/lib/prep/ai-prompt';
import { emptyProfile } from '@/lib/profile/types';

const q = (id: string, type: Question['type']): Question => ({ id, text: id, type, families: ['general'], tip: '', star: false });

describe('filterByType', () => {
	const list = [q('a', 'about_you'), q('b', 'behavioral'), q('c', 'about_you')];
	it('keeps all for "all"', () => expect(filterByType(list, 'all')).toHaveLength(3));
	it('filters by type', () => expect(filterByType(list, 'about_you').map((x) => x.id)).toEqual(['a', 'c']));
	it('gives an empty list for an unused type', () => expect(filterByType(list, 'closing')).toEqual([]));
});

describe('profileItems and resolveUse', () => {
	const profile = emptyProfile();
	profile.positions = [
		{
			id: 'pos_1',
			company: 'Acme',
			title: 'Analyst',
			location: '',
			start: '',
			end: '',
			current: false,
			employmentType: '',
			bullets: [{ id: 'b_1', text: 'Cut report time by 40%', hidden: false }],
		},
	];
	profile.skills = [{ id: 'sk_1', name: 'SQL', group: 'technical' }];
	const items = profileItems(profile);

	it('lists positions, bullets, and skills', () => {
		expect(items.map((i) => i.id)).toEqual(['pos_1', 'b_1', 'sk_1']);
		expect(items[1]).toMatchObject({ kind: 'bullet', text: 'Cut report time by 40%', label: 'Analyst at Acme' });
	});
	it('resolves ids in order and skips unknown ids', () => {
		expect(resolveUse(items, ['sk_1', 'nope', 'b_1', 'sk_1']).map((i) => i.id)).toEqual(['sk_1', 'b_1']);
	});
});

describe('formatTimer', () => {
	it('formats mm:ss', () => {
		expect(formatTimer(0)).toBe('00:00');
		expect(formatTimer(65)).toBe('01:05');
		expect(formatTimer(600)).toBe('10:00');
		expect(formatTimer(59.9)).toBe('00:59');
	});
	it('handles bad values', () => {
		expect(formatTimer(-5)).toBe('00:00');
		expect(formatTimer(NaN)).toBe('00:00');
	});
});

describe('parseSavedAnswer', () => {
	it('reads a star answer', () => {
		const a = parseSavedAnswer(JSON.stringify({ mode: 'star', star: { situation: 'S', task: 'T', action: 'A' } }));
		expect(a).toEqual({ mode: 'star', star: { situation: 'S', task: 'T', action: 'A', result: '' } });
		expect(hasContent(a)).toBe(true);
	});
	it('reads a text answer', () => {
		expect(parseSavedAnswer('{"mode":"text","text":"Hi"}')).toEqual({ mode: 'text', text: 'Hi' });
	});
	it('returns null for bad data', () => {
		expect(parseSavedAnswer('not json')).toBeNull();
		expect(parseSavedAnswer('{}')).toBeNull();
		expect(parseSavedAnswer('null')).toBeNull();
	});
	it('treats blank answers as no content', () => {
		expect(hasContent(parseSavedAnswer('{"mode":"text","text":"  "}'))).toBe(false);
		expect(hasContent(null)).toBe(false);
	});
});

describe('appendText', () => {
	it('sets text in an empty field', () => expect(appendText('  ', 'x')).toBe('x'));
	it('adds a new line', () => expect(appendText('a\n', 'b')).toBe('a\nb'));
	it('ignores empty additions', () => expect(appendText('a', ' ')).toBe('a'));
});

describe('groupAiQuestions', () => {
	const p = (type: PrepQuestion['type']): PrepQuestion => ({ type, text: type, why: '', cover: '', use: [] });
	it('puts gap first and keeps pack indexes', () => {
		const groups = groupAiQuestions([p('behavioral'), p('gap'), p('behavioral'), p('role')]);
		expect(groups.map((g) => g.type)).toEqual(['gap', 'role', 'behavioral']);
		expect(groups[2].items.map((i) => i.index)).toEqual([0, 2]);
	});
	it('skips empty groups', () => expect(groupAiQuestions([])).toEqual([]));
});
