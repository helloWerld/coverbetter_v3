'use client';

import { useState } from 'react';
import { FaFilePdf, FaFileWord } from 'react-icons/fa6';
import type { LetterDoc, TemplateId } from '@/lib/templates';
import { downloadDocx, downloadPdf } from './download';

/** Download PDF and DOCX in the chosen template. Runs in the browser. */
export default function DownloadButtons({
	getDoc,
	template,
	company,
}: Readonly<{
	getDoc: () => LetterDoc;
	template: TemplateId;
	company: string;
}>) {
	const [busy, setBusy] = useState<'pdf' | 'docx' | null>(null);
	const [error, setError] = useState('');

	async function run(kind: 'pdf' | 'docx') {
		setBusy(kind);
		setError('');
		try {
			const doc = getDoc();
			if (kind === 'pdf') await downloadPdf(doc, template, company);
			else await downloadDocx(doc, template, company);
		} catch {
			setError('The download failed. Try again.');
		} finally {
			setBusy(null);
		}
	}

	return (
		<>
			<button
				type="button"
				className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-base-100 hover:bg-base-100/10"
				onClick={() => run('pdf')}
				disabled={busy !== null}
			>
				<FaFilePdf aria-hidden /> {busy === 'pdf' ? 'Making PDF' : 'Download PDF'}
			</button>
			<button
				type="button"
				className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-base-100 hover:bg-base-100/10"
				onClick={() => run('docx')}
				disabled={busy !== null}
			>
				<FaFileWord aria-hidden />{' '}
				{busy === 'docx' ? 'Making DOCX' : 'Download DOCX'}
			</button>
			<p role="alert" className="w-full text-sm text-red-300 empty:hidden">
				{error}
			</p>
		</>
	);
}
