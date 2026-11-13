import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import { extractResumeText, normalizeText } from '@/lib/resume-extract';

const LONG =
	'Jane Doe is a senior software engineer with ten years of experience building web applications, leading small teams, and shipping reliable products for customers in logistics and finance. She writes clear code and clear documents, mentors junior developers, and reviews designs with product managers before each release.';

async function makePdf(text: string | null): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const page = doc.addPage([612, 792]);
	if (text) {
		page.drawText(text, { x: 40, y: 700, size: 10, font, maxWidth: 520, lineHeight: 12 });
	}
	return doc.save();
}

async function makeDocx(text: string): Promise<Uint8Array> {
	const doc = new Document({
		sections: [{ children: [new Paragraph(text), new Paragraph('Second paragraph.')] }],
	});
	return new Uint8Array(await Packer.toBuffer(doc));
}

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('extractResumeText', () => {
	it('reads text from a PDF', async () => {
		const res = await extractResumeText(await makePdf(LONG), PDF, 'cv.pdf');
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.text).toContain('senior software engineer');
	});

	it('flags a PDF without text as scanned', async () => {
		const res = await extractResumeText(await makePdf(null), PDF, 'scan.pdf');
		expect(res).toEqual({ ok: false, error: 'scanned' });
	});

	it('reads text from a DOCX', async () => {
		const res = await extractResumeText(await makeDocx(LONG), DOCX, 'cv.docx');
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.text).toContain('Second paragraph.');
	});

	it('accepts a file by extension when the mime type is empty', async () => {
		const res = await extractResumeText(await makeDocx(LONG), '', 'CV.DOCX');
		expect(res.ok).toBe(true);
	});

	it('rejects a txt file', async () => {
		const res = await extractResumeText(new TextEncoder().encode(LONG), 'text/plain', 'cv.txt');
		expect(res).toEqual({ ok: false, error: 'unsupported' });
	});

	it('rejects a file over 5 MB', async () => {
		const big = new Uint8Array(5 * 1024 * 1024 + 1);
		const res = await extractResumeText(big, PDF, 'big.pdf');
		expect(res).toEqual({ ok: false, error: 'too_large' });
	});

	it('returns parse_failed for garbage named .pdf', async () => {
		const res = await extractResumeText(new Uint8Array([1, 2, 3, 4, 5, 6]), PDF, 'bad.pdf');
		expect(res).toEqual({ ok: false, error: 'parse_failed' });
	});

	it('returns parse_failed for garbage named .docx', async () => {
		const res = await extractResumeText(new Uint8Array([1, 2, 3, 4]), DOCX, 'bad.docx');
		expect(res).toEqual({ ok: false, error: 'parse_failed' });
	});
});

describe('normalizeText', () => {
	it('trims lines and collapses blank lines', () => {
		expect(normalizeText('  a  \r\n\r\n\r\n\r\n  b\t\n')).toBe('a\n\nb');
	});
	it('removes null characters', () => {
		expect(normalizeText('a\u0000b')).toBe('ab');
	});
});
