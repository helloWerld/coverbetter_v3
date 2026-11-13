/** Resume limits shared by the server and the UI. No server-only imports here. */
export const MAX_RESUMES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MIN_PASTE_CHARS = 50;
export const MAX_TEXT_CHARS = 30000;

export function canAddResume(currentCount: number): boolean {
	return currentCount < MAX_RESUMES;
}

export const MESSAGES = {
	limit: 'You can save up to 5 resumes. Delete one to add a new one.',
	scanned: 'This PDF looks like a scanned image. Paste the text instead.',
	unsupported: 'Use a PDF or DOCX file up to 5 MB.',
	parseFailed: 'We could not read this file. Try another file or paste the text.',
	signedOut: 'Sign in to save a resume.',
	generic: 'Something went wrong. Try again.',
} as const;
