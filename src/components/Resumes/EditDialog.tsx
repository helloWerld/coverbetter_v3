'use client';

import { useState, useTransition } from 'react';
import { updateResumeAction } from '@/app/dashboard/resumes/actions';
import { MAX_TEXT_CHARS } from '@/lib/resume-limit';
import Dialog from './Dialog';
import type { ResumeView } from './types';

export default function EditDialog({
	resume,
	showHint,
	onClose,
}: Readonly<{
	resume: ResumeView | null;
	showHint: boolean;
	onClose: () => void;
}>) {
	return (
		<Dialog open={resume !== null} onClose={onClose} labelledBy="edit-title" wide>
			{/* key resets the form when another resume opens */}
			{resume && (
				<EditForm key={resume.id} resume={resume} showHint={showHint} onClose={onClose} />
			)}
		</Dialog>
	);
}

function EditForm({
	resume,
	showHint,
	onClose,
}: Readonly<{ resume: ResumeView; showHint: boolean; onClose: () => void }>) {
	const [title, setTitle] = useState(resume.title);
	const [text, setText] = useState(resume.text);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function save(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		startTransition(async () => {
			const res = await updateResumeAction({ id: resume.id, title, text });
			if (res.ok) onClose();
			else setError(res.error);
		});
	}

	return (
		<form onSubmit={save} className="flex flex-col gap-4">
			<h2 id="edit-title" className="text-xl">
				Edit resume
			</h2>
			{showHint && (
				<p className="rounded-btn border border-secondary/40 bg-secondary/10 p-3 text-sm">
					Check the text we pulled from your file. Fix any mistakes before you use it.
				</p>
			)}
			<div className="form-control">
				<label htmlFor="edit-resume-name" className="label px-0 text-base-100/80">
					Title
				</label>
				<input
					id="edit-resume-name"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					maxLength={100}
					required
					className="input input-bordered min-h-11 bg-primary text-base-100 focus:outline-secondary"
				/>
			</div>
			<div className="form-control">
				<label htmlFor="edit-resume-text" className="label px-0 text-base-100/80">
					Resume text
				</label>
				<textarea
					id="edit-resume-text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					maxLength={MAX_TEXT_CHARS}
					required
					rows={16}
					className="textarea textarea-bordered w-full bg-primary font-mono text-sm leading-relaxed text-base-100 focus:outline-secondary"
				/>
				<span className="mt-1 text-xs text-base-100/60">
					{text.length.toLocaleString('en-US')} of {MAX_TEXT_CHARS.toLocaleString('en-US')} characters
				</span>
			</div>
			{error && (
				<p role="alert" className="text-sm text-error">
					{error}
				</p>
			)}
			<div className="flex flex-wrap justify-end gap-3">
				<button type="button" onClick={onClose} className="btn btn-outline min-h-11 border-base-100/40 text-base-100">
					Cancel
				</button>
				<button type="submit" disabled={pending} className="btn btn-secondary min-h-11">
					{pending ? 'Saving...' : 'Save changes'}
				</button>
			</div>
		</form>
	);
}
