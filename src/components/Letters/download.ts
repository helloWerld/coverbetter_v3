import { renderDocx } from '@/lib/export-docx';
import { renderPdf } from '@/lib/export-pdf';
import type { LetterDoc, TemplateId } from '@/lib/templates';

/** "Cover Letter - Company.ext", or "Cover Letter.ext" with no company. */
export function letterFileName(company: string, ext: 'pdf' | 'docx'): string {
	const safe = company
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 80);
	return `${safe ? `Cover Letter - ${safe}` : 'Cover Letter'}.${ext}`;
}

function save(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadPdf(
	doc: LetterDoc,
	template: TemplateId,
	company: string,
) {
	const bytes = await renderPdf(doc, template);
	save(
		new Blob([bytes as BlobPart], { type: 'application/pdf' }),
		letterFileName(company, 'pdf'),
	);
}

export async function downloadDocx(
	doc: LetterDoc,
	template: TemplateId,
	company: string,
) {
	save(await renderDocx(doc, template), letterFileName(company, 'docx'));
}
