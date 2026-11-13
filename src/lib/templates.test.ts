import { describe, expect, it } from 'vitest';
import {
	TEMPLATE_IDS,
	TEMPLATES,
	getTemplate,
	isTemplateId,
	toLetterDoc,
} from './templates';

const TODAY = new Date(2026, 10, 13);

describe('toLetterDoc', () => {
	it('splits paragraphs on blank lines', () => {
		const doc = toLetterDoc('One.\n\nTwo.\r\n\r\n\n\nThree.', TODAY);
		expect(doc.paragraphs).toEqual(['One.', 'Two.', 'Three.']);
	});

	it('formats the date', () => {
		expect(toLetterDoc('Hi.', TODAY).date).toBe('November 13, 2026');
	});

	it('reads name and contact line from the first lines', () => {
		const body =
			'Jane Doe\njane@example.com | 555-123-4567\n\nDear Hiring Manager,\n\nBody text.\n\nSincerely,\nJane Doe';
		const doc = toLetterDoc(body, TODAY);
		expect(doc.name).toBe('Jane Doe');
		expect(doc.contactLine).toBe('jane@example.com | 555-123-4567');
		expect(doc.paragraphs[0]).toBe('Dear Hiring Manager,');
		expect(doc.paragraphs.at(-1)).toBe('Sincerely,\nJane Doe');
	});

	it('reads the name from the closing and the contact line below it', () => {
		const body =
			'Dear Team,\n\nBody text here.\n\nSincerely,\nJohn Smith\njohn@example.com';
		const doc = toLetterDoc(body, TODAY);
		expect(doc.name).toBe('John Smith');
		expect(doc.contactLine).toBe('john@example.com');
		expect(doc.paragraphs.at(-1)).toBe('Sincerely,\nJohn Smith');
	});

	it('falls back to body only when nothing is found', () => {
		const doc = toLetterDoc('Dear Team,\n\nI like the job.', TODAY);
		expect(doc.name).toBe('');
		expect(doc.contactLine).toBe('');
		expect(doc.paragraphs).toEqual(['Dear Team,', 'I like the job.']);
	});

	it('handles an empty body', () => {
		const doc = toLetterDoc('  \n ', TODAY);
		expect(doc.paragraphs).toEqual([]);
	});
});

describe('template tokens', () => {
	it('defines the three templates', () => {
		expect(TEMPLATE_IDS).toEqual(['classic', 'modern', 'minimal']);
		expect(isTemplateId('modern')).toBe(true);
		expect(isTemplateId('fancy')).toBe(false);
	});

	it('classic uses Times, centered header, 1 inch margins', () => {
		const t = getTemplate('classic');
		expect(t.pdfFont).toBe('TimesRoman');
		expect(t.headerAlign).toBe('center');
		expect(t.marginIn).toBe(1);
		expect(t.accentRule).toBeNull();
	});

	it('modern uses Helvetica, left header and a purple rule', () => {
		const t = getTemplate('modern');
		expect(t.pdfFont).toBe('Helvetica');
		expect(t.headerAlign).toBe('left');
		expect(t.accentRule?.color).toBe('#9333ea');
	});

	it('minimal uses Helvetica, small grey header and 1.25 inch margins', () => {
		const t = getTemplate('minimal');
		expect(t.pdfFont).toBe('Helvetica');
		expect(t.marginIn).toBe(1.25);
		expect(t.namePt).toBeLessThan(TEMPLATES.modern.namePt);
		expect(t.contactColor).not.toBe(t.bodyColor);
	});

	it('falls back to classic for an unknown id', () => {
		expect(getTemplate('zzz').id).toBe('classic');
	});
});
