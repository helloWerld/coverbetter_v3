import { extractText, getDocumentProxy } from 'unpdf';
import mammoth from 'mammoth';
import { MAX_FILE_BYTES } from '@/lib/resume-limit';
import { htmlToMarkdown, textToMarkdown } from '@/lib/resume-markdown';

export type ExtractError = 'unsupported' | 'too_large' | 'scanned' | 'parse_failed';
export type ExtractResult = { ok: true; text: string } | { ok: false; error: ExtractError };

const DOCX_MIME =
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MIN_NON_SPACE_CHARS = 200;

/** Trims every line, drops null characters, and collapses runs of blank lines. */
export function normalizeText(raw: string): string {
	return raw
		.replace(/\u0000/g, '')
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map((line) => line.replace(/[ \t\f\v ]+/g, ' ').trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function kindOf(mime: string, fileName: string): 'pdf' | 'docx' | null {
	const name = fileName.toLowerCase();
	if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
	if (mime === DOCX_MIME || name.endsWith('.docx')) return 'docx';
	return null;
}

/**
 * mammoth reads `buffer` in its Node build and `arrayBuffer` in its browser
 * build. A bundler can pick either, so try both.
 */
async function docxToMarkdown(bytes: Uint8Array): Promise<string> {
	// HTML keeps the headings, bold text, and lists. Then it becomes Markdown.
	try {
		const res = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) });
		return htmlToMarkdown(res.value);
	} catch (err) {
		if (!String(err).includes('Could not find file')) throw err;
		const arrayBuffer = bytes.slice().buffer as ArrayBuffer;
		const res = await mammoth.convertToHtml({ arrayBuffer });
		return htmlToMarkdown(res.value);
	}
}

export async function extractResumeText(
	bytes: Uint8Array,
	mime: string,
	fileName: string,
): Promise<ExtractResult> {
	const kind = kindOf(mime, fileName);
	if (!kind) return { ok: false, error: 'unsupported' };
	if (bytes.byteLength > MAX_FILE_BYTES) return { ok: false, error: 'too_large' };

	let raw: string;
	try {
		if (kind === 'pdf') {
			// unpdf may detach the buffer, so give it a copy.
			const pdf = await getDocumentProxy(new Uint8Array(bytes));
			const { text } = await extractText(pdf, { mergePages: true });
			raw = textToMarkdown(normalizeText(text));
		} else {
			raw = await docxToMarkdown(bytes);
		}
	} catch {
		return { ok: false, error: 'parse_failed' };
	}

	const text = normalizeText(raw);
	// Count letters only, so Markdown marks do not hide a scanned file.
	if (text.replace(/[\s#*_-]/g, '').length < MIN_NON_SPACE_CHARS) {
		return { ok: false, error: 'scanned' };
	}
	return { ok: true, text };
}
