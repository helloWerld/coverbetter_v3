import { describe, expect, it } from 'vitest';
import { MESSAGE_MAX, SUBJECT_MAX, topicLabel, validateSupport } from './validate';

const good = { topic: 'billing', subject: '  Charged   twice ', message: 'I paid two times for credits today.' };

describe('validateSupport', () => {
	it('accepts a good request and cleans the spaces', () => {
		const out = validateSupport(good);
		expect(out).toEqual({ ok: true, value: { topic: 'billing', subject: 'Charged twice', message: 'I paid two times for credits today.' } });
	});
	it('refuses an unknown topic', () => {
		expect(validateSupport({ ...good, topic: 'hack' }).ok).toBe(false);
	});
	it('refuses an empty subject', () => {
		expect(validateSupport({ ...good, subject: '   ' }).ok).toBe(false);
	});
	it('refuses a long subject', () => {
		expect(validateSupport({ ...good, subject: 'a'.repeat(SUBJECT_MAX + 1) }).ok).toBe(false);
	});
	it('refuses a short or a long message', () => {
		expect(validateSupport({ ...good, message: 'help' }).ok).toBe(false);
		expect(validateSupport({ ...good, message: 'a'.repeat(MESSAGE_MAX + 1) }).ok).toBe(false);
	});
	it('refuses fields that are not text', () => {
		expect(validateSupport({ topic: 1, subject: null, message: {} }).ok).toBe(false);
	});
	it('gives the label of a topic', () => {
		expect(topicLabel('bug')).toBe('Something does not work');
		expect(topicLabel('x')).toBe('x');
	});
});
