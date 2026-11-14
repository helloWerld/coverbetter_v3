import { describe, expect, it } from 'vitest';
import { PDFDocument, PDFDict, PDFName } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { renderPdf } from './export-pdf';
import { renderDocxBytes } from './export-docx';
import { TEMPLATE_IDS, toLetterDoc } from './templates';
import { LANGUAGE_CODES, getLanguage } from './languages';
import { sampleDoc } from './export-samples';
import type { FontIO } from './pdf-fonts';

/** Names of all fonts in the PDF. */
async function fontNames(bytes: Uint8Array): Promise<string[]> {
	const pdf = await PDFDocument.load(bytes);
	const names: string[] = [];
	for (const [, obj] of pdf.context.enumerateIndirectObjects()) {
		if (obj instanceof PDFDict) {
			const base = obj.get(PDFName.of('BaseFont'));
			if (base) names.push(base.toString());
		}
	}
	return names;
}

const PUBLIC = path.join(process.cwd(), 'public');
const nodeIO: FontIO = {
	font: async (f) => new Uint8Array(await readFile(path.join(PUBLIC, 'fonts', f))),
	wasm: async () => new Uint8Array(await readFile(path.join(PUBLIC, 'wasm', 'harfbuzz-subset.wasm'))),
};

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

describe('every letter language', () => {
	it.each(LANGUAGE_CODES)('renders PDF and DOCX for %s', async (code) => {
		const doc = sampleDoc(code);
		for (const id of ['classic', 'modern'] as const) {
			const bytes = await renderPdf(doc, id, nodeIO);
			expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
			expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
			if (['noto-sc', 'noto-jp', 'noto-kr'].includes(getLanguage(code).fontSet)) {
				expect(bytes.length).toBeLessThan(300_000);
			}
		}
		const docx = await renderDocxBytes(doc, 'classic');
		expect(String.fromCharCode(docx[0], docx[1])).toBe('PK');
	});

	it('keeps the standard fonts for English', async () => {
		const names = await fontNames(
			await renderPdf(sampleDoc('en'), 'modern', {
				font: () => Promise.reject(new Error('no font download for English')),
				wasm: () => Promise.reject(new Error('no wasm for English')),
			}),
		);
		expect(names).toContain('/Helvetica');
		expect(names.some((n) => n.includes('Noto'))).toBe(false);
	});

	it('uses Noto Serif for Polish in the classic template', async () => {
		const names = await fontNames(await renderPdf(sampleDoc('pl'), 'classic', nodeIO));
		expect(names.some((n) => n.includes('NotoSerif'))).toBe(true);
	});
});

describe('DOCX script settings', () => {
	async function xml(code: 'ar' | 'ja' | 'en') {
		const zip = await JSZip.loadAsync(await renderDocxBytes(sampleDoc(code), 'modern'));
		return zip.file('word/document.xml')!.async('string');
	}

	it('marks Arabic paragraphs and runs right to left', async () => {
		const x = await xml('ar');
		expect(x).toContain('<w:bidi');
		expect(x).toContain('<w:rtl');
		expect(x).toContain('w:jc w:val="right"');
	});

	it('sets the East Asian font for Japanese', async () => {
		expect(await xml('ja')).toContain('w:eastAsia="Yu Gothic"');
	});

	it('adds no script settings for English', async () => {
		const x = await xml('en');
		expect(x).not.toContain('<w:bidi');
		expect(x).not.toContain('<w:rtl');
		expect(x).not.toContain('<w:lang');
	});
});
