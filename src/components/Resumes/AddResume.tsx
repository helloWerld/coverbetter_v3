'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { pasteResumeAction } from '@/app/dashboard/resumes/actions';
import {
	MAX_FILE_BYTES,
	MAX_RESUMES,
	MAX_TEXT_CHARS,
	MESSAGES,
	MIN_PASTE_CHARS,
} from '@/lib/resume-limit';
import { tabClickAction, type ResumeTab as Tab } from './tab-click';

function formatSize(bytes: number): string {
	return bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowed(file: File): boolean {
	return /\.(pdf|docx)$/i.test(file.name);
}

export default function AddResume({
	count,
	onCreated,
}: Readonly<{ count: number; onCreated: (id: string, fromFile: boolean) => void }>) {
	const [tab, setTab] = useState<Tab>('upload');
	const atLimit = count >= MAX_RESUMES;
	const uid = useId();
	const openPickerRef = useRef<() => void>(() => {});

	function onTabClick(t: Tab) {
		const action = tabClickAction(tab, t);
		if (action === 'switch') setTab(t);
		if (action === 'open-picker') openPickerRef.current();
	}

	function onTabKey(e: React.KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
			const next = tab === 'upload' ? 'paste' : 'upload';
			setTab(next);
			document.getElementById(`${uid}-tab-${next}`)?.focus();
		}
	}

	return (
		<section
			aria-labelledby={`${uid}-heading`}
			className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-6"
		>
			<h2 id={`${uid}-heading`} className="mb-4 text-xl text-base-100">
				Add a resume
			</h2>
			{atLimit ? (
				<p role="status" className="text-base-100/80">
					{MESSAGES.limit}
				</p>
			) : (
				<>
					<div role="tablist" aria-label="How to add a resume" className="mb-5 flex gap-2" onKeyDown={onTabKey}>
						{(['upload', 'paste'] as const).map((t) => (
							<button
								key={t}
								id={`${uid}-tab-${t}`}
								type="button"
								role="tab"
								aria-selected={tab === t}
								aria-controls={`${uid}-panel-${t}`}
								tabIndex={tab === t ? 0 : -1}
								onClick={() => onTabClick(t)}
								className={`btn min-h-11 ${tab === t ? 'btn-secondary' : 'btn-outline border-base-100/40 text-base-100'}`}
							>
								{t === 'upload' ? 'Upload a file' : 'Paste text'}
							</button>
						))}
					</div>
					<div id={`${uid}-panel-upload`} role="tabpanel" aria-labelledby={`${uid}-tab-upload`} hidden={tab !== 'upload'}>
						<UploadPanel onCreated={onCreated} openPickerRef={openPickerRef} />
					</div>
					<div id={`${uid}-panel-paste`} role="tabpanel" aria-labelledby={`${uid}-tab-paste`} hidden={tab !== 'paste'}>
						<PastePanel onCreated={onCreated} />
					</div>
				</>
			)}
		</section>
	);
}

function UploadPanel({
	onCreated,
	openPickerRef,
}: Readonly<{
	onCreated: (id: string, fromFile: boolean) => void;
	openPickerRef: React.RefObject<() => void>;
}>) {
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		openPickerRef.current = () => inputRef.current?.click();
	}, [openPickerRef]);
	const [file, setFile] = useState<File | null>(null);
	const [title, setTitle] = useState('');
	const [dragging, setDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const titleId = useId();

	function pick(f: File | undefined) {
		if (!f) return;
		if (!isAllowed(f) || f.size > MAX_FILE_BYTES) {
			setFile(null);
			setError(MESSAGES.unsupported);
			return;
		}
		setError(null);
		setFile(f);
		setTitle(f.name.replace(/\.(pdf|docx)$/i, '').slice(0, 100));
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!file) return;
		setError(null);
		setPending(true);
		try {
			const body = new FormData();
			body.set('file', file);
			body.set('title', title);
			const res = await fetch('/api/resumes/upload', { method: 'POST', body });
			const data = (await res
				.json()
				.catch(() => ({ ok: false, error: MESSAGES.generic }))) as {
				ok: boolean;
				id?: string;
				error?: string;
			};
			if (data.ok && data.id) {
				setFile(null);
				setTitle('');
				onCreated(data.id, true);
			} else {
				setError(data.error ?? MESSAGES.generic);
			}
		} catch {
			setError(MESSAGES.generic);
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				onChange={(e) => {
					pick(e.target.files?.[0]);
					e.target.value = '';
				}}
			/>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					pick(e.dataTransfer.files?.[0]);
				}}
				disabled={pending}
				className={`flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed p-6 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ${
					dragging ? 'border-secondary bg-secondary/10' : 'border-base-100/30 hover:border-secondary'
				}`}
			>
				<span className="text-base-100">Drop a PDF or DOCX here</span>
				<span className="text-sm text-base-100/70">PDF or DOCX, up to 5 MB</span>
				<span className="btn btn-secondary btn-sm pointer-events-none mt-3 min-h-11 px-5">
					{file ? 'Choose a different file' : 'Choose file'}
				</span>
			</button>

			{file && (
				<p className="text-sm text-base-100" aria-live="polite">
					<span className="break-all font-medium">{file.name}</span>{' '}
					<span className="text-base-100/70">({formatSize(file.size)})</span>
				</p>
			)}
			{error && (
				<p role="alert" className="text-sm text-error">
					{error}
				</p>
			)}
			{file && (
				<>
					<div className="form-control">
						<label htmlFor={titleId} className="label px-0 text-base-100/80">
							Title
						</label>
						<input
							id={titleId}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={100}
							required
							className="input input-bordered min-h-11 bg-primary text-base-100 focus:outline-secondary"
						/>
					</div>
					<button type="submit" disabled={pending} className="btn btn-secondary min-h-11 self-start">
						{pending ? 'Reading your file...' : 'Save resume'}
					</button>
				</>
			)}
		</form>
	);
}

function PastePanel({ onCreated }: Readonly<{ onCreated: (id: string, fromFile: boolean) => void }>) {
	const [title, setTitle] = useState('');
	const [text, setText] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const titleId = useId();
	const textId = useId();

	function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		startTransition(async () => {
			const res = await pasteResumeAction({ title, text });
			if (res.ok && res.id) {
				setTitle('');
				setText('');
				onCreated(res.id, false);
			} else if (!res.ok) {
				setError(res.error);
			}
		});
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
			<div className="form-control">
				<label htmlFor={titleId} className="label px-0 text-base-100/80">
					Title
				</label>
				<input
					id={titleId}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					maxLength={100}
					required
					placeholder="Product manager resume"
					className="input input-bordered min-h-11 bg-primary text-base-100 placeholder:text-base-100/50 focus:outline-secondary"
				/>
			</div>
			<div className="form-control">
				<label htmlFor={textId} className="label px-0 text-base-100/80">
					Resume text
				</label>
				<textarea
					id={textId}
					value={text}
					onChange={(e) => setText(e.target.value)}
					maxLength={MAX_TEXT_CHARS}
					minLength={MIN_PASTE_CHARS}
					required
					rows={10}
					className="textarea textarea-bordered w-full bg-primary text-base-100 focus:outline-secondary"
				/>
			</div>
			{error && (
				<p role="alert" className="text-sm text-error">
					{error}
				</p>
			)}
			<button type="submit" disabled={pending} className="btn btn-secondary min-h-11 self-start">
				{pending ? 'Saving...' : 'Save resume'}
			</button>
		</form>
	);
}
