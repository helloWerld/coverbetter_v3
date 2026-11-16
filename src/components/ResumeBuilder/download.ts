import { renderResumeDocx } from '@/lib/export-resume-docx';
import { renderResumePdf } from '@/lib/export-resume-pdf';
import type { ResumeDoc } from '@/lib/profile/render';

/** "Resume - Company.ext", or "Resume.ext" with no company. */
export function resumeFileName(company: string, ext: 'pdf' | 'docx'): string {
	const safe = company
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 80);
	return `${safe ? `Resume - ${safe}` : 'Resume'}.${ext}`;
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

export async function downloadResumePdf(doc: ResumeDoc, template: string, company: string) {
	const bytes = await renderResumePdf(doc, template);
	save(new Blob([bytes as BlobPart], { type: 'application/pdf' }), resumeFileName(company, 'pdf'));
}

export async function downloadResumeDocx(doc: ResumeDoc, template: string, company: string) {
	save(await renderResumeDocx(doc, template), resumeFileName(company, 'docx'));
}
