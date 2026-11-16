import { describe, expect, it } from 'vitest';
import { parseInline, parseMarkdown } from './markdown-lite';
import { htmlToMarkdown, textToMarkdown } from './resume-markdown';

describe('parseMarkdown', () => {
	it('reads headings, lists, and paragraphs', () => {
		const blocks = parseMarkdown('# Ana Lima\nData analyst\n\n## Experience\n- Built **12** dashboards\n- Cut costs\n\n1. First\n2. Second');
		expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'heading', 'list', 'list']);
		expect(blocks[3]).toMatchObject({ type: 'list', ordered: false });
		expect(blocks[4]).toMatchObject({ type: 'list', ordered: true });
	});
	it('makes plain text for HTML, so nothing runs', () => {
		const [p] = parseMarkdown('<script>alert(1)</script>');
		expect(p).toEqual({ type: 'paragraph', lines: [[{ text: '<script>alert(1)</script>' }]] });
	});
	it('reads bold and italic, and leaves a lone star alone', () => {
		expect(parseInline('a **b** *c* _d_ 5 * 3')).toEqual([
			{ text: 'a ' },
			{ text: 'b', bold: true },
			{ text: ' ' },
			{ text: 'c', italic: true },
			{ text: ' ' },
			{ text: 'd', italic: true },
			{ text: ' 5 * 3' },
		]);
		expect(parseInline('***both***')).toEqual([{ text: 'both', bold: true, italic: true }]);
		expect(parseInline('file_name_here')).toEqual([{ text: 'file_name_here' }]);
	});
});

describe('htmlToMarkdown', () => {
	it('keeps headings, bold, italic, and lists from a DOCX', () => {
		const md = htmlToMarkdown('<h1>Ana Lima</h1><p>Data <strong>analyst</strong> &amp; <em>writer</em></p><ul><li>One</li><li><strong>Two</strong></li></ul><ol><li>A</li></ol>');
		expect(md).toBe('# Ana Lima\n\nData **analyst** & *writer*\n\n- One\n- **Two**\n\n1. A');
	});
	it('drops other tags and empty bold', () => {
		expect(htmlToMarkdown('<p><a href="x">Link</a> <strong> </strong>text</p>')).toBe('Link text');
	});
});

describe('textToMarkdown', () => {
	it('turns bullet characters into list items and short caps lines into headings', () => {
		expect(textToMarkdown('EXPERIENCE\n• Built dashboards\n– Cut costs\nNorthwind, 2021 to now\nI LED THE TEAM.')).toBe(
			'## EXPERIENCE\n- Built dashboards\n- Cut costs\nNorthwind, 2021 to now\nI LED THE TEAM.',
		);
	});
});
