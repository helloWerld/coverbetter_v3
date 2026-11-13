import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderPdf } from './export-pdf';
import { renderDocxBytes } from './export-docx';
import { TEMPLATE_IDS, toLetterDoc } from './templates';

const SHORT = toLetterDoc(
	'Jane Doe\njane@example.com | 555-123-4567\n\nDear Hiring Manager,\n\nI like this job — “quotes” ☃.\n\nSincerely,\nJane Doe',
	new Date(2026, 10, 13),
);
const LONG = toLetterDoc(
	Array.from({ length: 40 }, () =>
		'This is a long paragraph. '.repeat(30),
	).join('\n\n'),
	new Date(2026, 10, 13),
);

describe('renderPdf', () => {
	it.each(TEMPLATE_IDS)('renders a valid PDF for %s', async (id) => {
		const bytes = await renderPdf(SHORT, id);
		expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
		const pdf = await PDFDocument.load(bytes);
		expect(pdf.getPageCount()).toBe(1);
		const page = pdf.getPage(0);
		expect(page.getSize()).toEqual({ width: 612, height: 792 });
	});

	it('adds pages for a very long body', async () => {
		const pdf = await PDFDocument.load(await renderPdf(LONG, 'classic'));
		expect(pdf.getPageCount()).toBeGreaterThan(3);
	});
});

describe('renderDocxBytes', () => {
	it.each(TEMPLATE_IDS)('renders a zip with document.xml for %s', async (id) => {
		const bytes = await renderDocxBytes(SHORT, id);
		expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK');
		expect(Buffer.from(bytes).includes('word/document.xml')).toBe(true);
	});
});
