import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { TEMPLATE_IDS } from './templates';
import { renderResumePdf } from './export-resume-pdf';
import { renderResumeDocx, renderResumeDocxBytes } from './export-resume-docx';
import type { ResumeDoc } from './profile/render';

function longDoc(): ResumeDoc {
	const items = Array.from({ length: 8 }, (_, i) => ({
		heading: `Role ${i} & Co`,
		subheading: `Company ${i}, Remote`,
		dates: 'Jan 2020 – Present',
		bullets: Array.from({ length: 5 }, (_, j) => `Bullet ${j} with a long sentence that should wrap across more than one line when the page is narrow enough to need it, up 30%.`),
	}));
	return {
		name: 'Ada Lovelace',
		headline: 'Data analyst',
		contactLine: 'ada@example.com | 555-0100',
		summary: 'A summary. '.repeat(20),
		sections: [
			{ title: 'Experience', items },
			{ title: 'Skills', items: [{ heading: '', subheading: '', dates: '', bullets: [], text: 'SQL, Excel' }] },
		],
	};
}

describe.each(TEMPLATE_IDS)('resume export (%s)', (id) => {
	it('makes a multi-page PDF', async () => {
		const bytes = await renderResumePdf(longDoc(), id);
		expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
		const pdf = await PDFDocument.load(bytes);
		expect(pdf.getPageCount()).toBeGreaterThan(1);
		expect(pdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
	});

	it('makes a DOCX zip with the name and real bullets', async () => {
		const zip = await JSZip.loadAsync(await renderResumeDocxBytes(longDoc(), id));
		const xml = await zip.file('word/document.xml')!.async('string');
		expect(xml).toContain('Ada Lovelace');
		expect(xml).toContain('w:numPr');
		expect(xml).toContain('Heading1');
		expect(zip.file('word/numbering.xml')).not.toBeNull();
	});
});

describe('resume export edge cases', () => {
	it('renders a tiny doc as one page', async () => {
		const doc: ResumeDoc = { name: 'A B', headline: '', contactLine: '', summary: '', sections: [] };
		expect((await PDFDocument.load(await renderResumePdf(doc, 'classic'))).getPageCount()).toBe(1);
	});

	it('gives Classic for an unknown template and returns a Blob', async () => {
		expect((await renderResumePdf(longDoc(), 'nope')).length).toBeGreaterThan(100);
		const blob = await renderResumeDocx(longDoc(), 'nope');
		expect(blob.size).toBeGreaterThan(100);
	});
});
