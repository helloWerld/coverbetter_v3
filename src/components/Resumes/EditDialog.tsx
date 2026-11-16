'use client';

import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { updateResumeAction } from '@/app/dashboard/resumes/actions';
import { MAX_TEXT_CHARS } from '@/lib/resume-limit';
import { prefixLines, wrap, type Edit } from './markdown-edit';
import Dialog from './Dialog';
import MarkdownView from './MarkdownView';
import { formatDate, type ResumeView } from './types';

const field =
	'w-full rounded-box border border-base-100/10 bg-primary px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';
const tool =
	'btn btn-sm btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11 min-w-11';
const outline = 'btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100';

export default function EditDialog({
	resume,
	showHint,
	onClose,
	onDelete,
}: Readonly<{
	resume: ResumeView | null;
	showHint: boolean;
	onClose: () => void;
	onDelete: (id: string) => void;
}>) {
	return (
		<Dialog open={resume !== null} onClose={onClose} labelledBy="edit-title" wide="xl">
			{/* key resets the form when another resume opens */}
			{resume && <EditForm key={resume.id} resume={resume} showHint={showHint} onClose={onClose} onDelete={onDelete} />}
		</Dialog>
	);
}

function EditForm({
	resume,
	showHint,
	onClose,
	onDelete,
}: Readonly<{ resume: ResumeView; showHint: boolean; onClose: () => void; onDelete: (id: string) => void }>) {
	const [title, setTitle] = useState(resume.title);
	const [text, setText] = useState(resume.text);
	const [view, setView] = useState<'write' | 'preview'>('write');
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const area = useRef<HTMLTextAreaElement>(null);
	const nextSel = useRef<[number, number] | null>(null);
	const dirty = title !== resume.title || text !== resume.text;

	function apply(fn: (e: Edit) => Edit) {
		const el = area.current;
		if (!el) return;
		const out = fn({ text, start: el.selectionStart, end: el.selectionEnd });
		if (out.text.length > MAX_TEXT_CHARS) return;
		nextSel.current = [out.start, out.end];
		setText(out.text);
	}

	// Keep the selection on the changed text, after React writes the new value.
	useLayoutEffect(() => {
		const el = area.current;
		const sel = nextSel.current;
		if (!el || !sel) return;
		nextSel.current = null;
		el.focus();
		el.setSelectionRange(sel[0], sel[1]);
	}, [text]);

	function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (!(e.metaKey || e.ctrlKey)) return;
		const k = e.key.toLowerCase();
		if (k === 'b' || k === 'i') {
			e.preventDefault();
			apply((x) => (k === 'b' ? wrap(x, '**', 'bold text') : wrap(x, '*', 'italic text')));
		}
	}

	function save(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		startTransition(async () => {
			const res = await updateResumeAction({ id: resume.id, title, text });
			if (res.ok) onClose();
			else setError(res.error);
		});
	}

	const tabBtn = (v: 'write' | 'preview', label: string) => (
		<button type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`btn btn-sm min-h-11 ${view === v ? 'btn-secondary' : outline}`}>
			{label}
		</button>
	);

	return (
		<form onSubmit={save} className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 id="edit-title" className="text-xl text-base-100">
						Edit resume
					</h2>
					<p className="break-all text-sm text-base-100/60">
						{resume.fileName ? `${resume.fileName} · uploaded` : 'Added'} {formatDate(resume.createdAt)}
					</p>
				</div>
				<div className="flex gap-2 lg:hidden">
					{tabBtn('write', 'Write')}
					{tabBtn('preview', 'Preview')}
				</div>
			</div>
			{showHint && (
				<p className="rounded-box border border-secondary/40 bg-secondary/10 p-3 text-sm">
					Check the text that we read from your file. Fix any mistakes and the formatting before you use it.
				</p>
			)}
			<div>
				<label htmlFor="edit-resume-name" className="mb-2 block text-sm font-medium text-base-100">
					Title
				</label>
				<input id="edit-resume-name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required className={`${field} min-h-11`} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className={`min-w-0 flex-col gap-2 ${view === 'write' ? 'flex' : 'hidden lg:flex'}`}>
					<div role="toolbar" aria-label="Formatting" aria-controls="edit-resume-text" className="flex flex-wrap gap-2">
						<button type="button" className={tool} onClick={() => apply((x) => prefixLines(x, '## '))}>
							Heading
						</button>
						<button type="button" className={tool} aria-label="Bold" title="Bold (Ctrl or Cmd + B)" onClick={() => apply((x) => wrap(x, '**', 'bold text'))}>
							<strong aria-hidden="true">B</strong>
						</button>
						<button type="button" className={tool} aria-label="Italic" title="Italic (Ctrl or Cmd + I)" onClick={() => apply((x) => wrap(x, '*', 'italic text'))}>
							<em aria-hidden="true">I</em>
						</button>
						<button type="button" className={tool} onClick={() => apply((x) => prefixLines(x, '- '))}>
							List
						</button>
					</div>
					<label htmlFor="edit-resume-text" className="sr-only">
						Resume text in Markdown
					</label>
					<textarea
						id="edit-resume-text"
						ref={area}
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={onKey}
						maxLength={MAX_TEXT_CHARS}
						required
						aria-describedby="edit-resume-help"
						className={`${field} h-[55vh] min-h-64 resize-y font-mono text-sm leading-relaxed`}
					/>
					<p id="edit-resume-help" className="text-xs text-base-100/60">
						Markdown: # for a heading, **bold**, *italic*, and - for a list item. {text.length.toLocaleString('en-US')} of{' '}
						{MAX_TEXT_CHARS.toLocaleString('en-US')} characters.
					</p>
				</div>

				<div className={`min-w-0 ${view === 'preview' ? '' : 'hidden lg:block'}`}>
					<p className="mb-2 text-sm font-medium text-base-100" id="edit-preview-h">
						Preview
					</p>
					<div
						role="region"
						aria-labelledby="edit-preview-h"
						tabIndex={0}
						className="h-[55vh] min-h-64 overflow-y-auto rounded-sm bg-white p-6 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
					>
						<MarkdownView source={text} />
					</div>
				</div>
			</div>

			{error && (
				<p role="alert" className="text-sm text-error">
					{error}
				</p>
			)}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<button type="button" onClick={() => onDelete(resume.id)} className="btn btn-ghost min-h-11 text-error hover:bg-error/10">
					Delete resume
				</button>
				<div className="flex flex-wrap gap-3">
					<button type="button" onClick={onClose} className={`btn min-h-11 ${outline}`}>
						{dirty ? 'Cancel' : 'Close'}
					</button>
					<button type="submit" disabled={pending || !dirty} className="btn btn-secondary min-h-11">
						{pending ? 'Saving…' : 'Save changes'}
					</button>
				</div>
			</div>
		</form>
	);
}
