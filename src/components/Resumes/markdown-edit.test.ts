import { describe, expect, it } from 'vitest';
import { prefixLines, wrap } from './markdown-edit';

describe('wrap', () => {
	it('makes the selection bold and keeps it selected', () => {
		const out = wrap({ text: 'Led a team', start: 6, end: 10 }, '**', 'bold text');
		expect(out).toEqual({ text: 'Led a **team**', start: 8, end: 12 });
	});
	it('takes the marks off on a second click', () => {
		expect(wrap({ text: 'Led a **team**', start: 8, end: 12 }, '**', 'bold text')).toEqual({ text: 'Led a team', start: 6, end: 10 });
	});
	it('adds italic to bold text, and does not take the bold off', () => {
		expect(wrap({ text: '**team**', start: 2, end: 6 }, '*', 'italic text').text).toBe('***team***');
	});
	it('adds a placeholder when nothing is selected', () => {
		expect(wrap({ text: 'x ', start: 2, end: 2 }, '*', 'italic text').text).toBe('x *italic text*');
	});
});

describe('prefixLines', () => {
	it('makes every selected line a list item, and replaces a heading mark', () => {
		const text = 'Intro\n## One\nTwo\nEnd';
		const out = prefixLines({ text, start: 7, end: 15 }, '- ');
		expect(out.text).toBe('Intro\n- One\n- Two\nEnd');
	});
	it('keeps the selection on the words, not on the new mark', () => {
		const out = prefixLines({ text: 'Skills', start: 0, end: 6 }, '## ');
		expect(out.text.slice(out.start, out.end)).toBe('Skills');
	});
	it('takes the mark off when every line has it', () => {
		expect(prefixLines({ text: '## Skills', start: 3, end: 3 }, '## ').text).toBe('Skills');
	});
});
