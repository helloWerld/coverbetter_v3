import type { Profile } from '@/lib/profile/types';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Read a PDF or DOCX resume in the browser. Throws an Error with a message the user can read. */
export async function importResumeFile(file: File): Promise<{ profile: Profile; unsure: string[] }> {
	const name = file.name.toLowerCase();
	const kind = name.endsWith('.pdf') ? 'pdf' : name.endsWith('.docx') ? 'docx' : null;
	if (!kind) throw new Error('Use a PDF or DOCX file.');
	if (file.size > MAX_RESUME_BYTES) throw new Error('The file is larger than 5 MB.');
	const bytes = new Uint8Array(await file.arrayBuffer());
	const { parseResumeFile } = await import('@/lib/profile/resume-parse');
	return parseResumeFile(bytes, kind);
}
