'use client';

import { useRef, useState } from 'react';
import { parseLinkedInFiles } from '@/lib/profile/linkedin';
import { readLinkedInZip } from '@/lib/profile/linkedin-zip';
import type { Profile } from '@/lib/profile/types';
import { dateRange } from './ui';

export type ImportMode = 'replace' | 'add';
export interface ImportResult {
	profile: Profile;
	unsure: string[];
	warnings: string[];
	source: string;
}

const MAX_ZIP_BYTES = 200 * 1024 * 1024;


export default function ImportPanel({
	hasData,
	onApply,
}: Readonly<{ hasData: boolean; onApply: (r: ImportResult, mode: ImportMode) => void }>) {
	const [open, setOpen] = useState(!hasData);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState<ImportResult | null>(null);
	const [mode, setMode] = useState<ImportMode>('add');
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	async function run(file: File | undefined, read: (f: File) => Promise<ImportResult>) {
		if (!file) return;
		setError('');
		setBusy(true);
		try {
			setResult(await read(file));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'The file could not be read.');
		} finally {
			setBusy(false);
		}
	}

	const fromLinkedIn = (file: File | undefined) =>
		run(file, async (f) => {
			if (!f.name.toLowerCase().endsWith('.zip')) throw new Error('Use the ZIP file from LinkedIn.');
			if (f.size > MAX_ZIP_BYTES) throw new Error('The file is too large.');
			const files = readLinkedInZip(new Uint8Array(await f.arrayBuffer()));
			const out = parseLinkedInFiles(files);
			if (out.found.length === 0) throw new Error('This ZIP has no LinkedIn data files. Check that you picked the right file.');
			return { profile: out.profile, unsure: [], warnings: out.warnings, source: 'LinkedIn' };
		});

	function apply() {
		if (!result) return;
		onApply(result, hasData ? mode : 'replace');
		setMode('add');
		setResult(null);
		setOpen(false);
	}

	if (!open) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-100/10 bg-base-300 p-4">
				<p className="min-w-0 text-base-100/70">Add your jobs, education, and skills fast with your LinkedIn data.</p>
				<button
					type="button"
					className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11"
					onClick={() => setOpen(true)}
				>
					Import from LinkedIn
				</button>
			</div>
		);
	}

	return (
		<section aria-labelledby="import-h" className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<h2 id="import-h" className="text-xl text-base-100">
					{result ? `Check what we found in ${result.source}` : 'Import from LinkedIn'}
				</h2>
				{hasData && (
					<button
						type="button"
						className="btn btn-ghost text-base-100/70 hover:bg-base-200 hover:text-base-100 min-h-11"
						onClick={() => {
							setOpen(false);
							setResult(null);
							setError('');
						}}
					>
						Close
					</button>
				)}
			</div>

			<div aria-live="polite" className="mt-2 text-base-100/70">
				{busy && <p>Reading the file…</p>}
			</div>
			{error && (
				<p role="alert" className="mt-2 text-error">
					{error}
				</p>
			)}

			{result ? (
				<Review result={result} hasData={hasData} mode={mode} setMode={setMode} onApply={apply} onCancel={() => setResult(null)} />
			) : (
				<div className="mt-4 flex max-w-2xl flex-col gap-3">
					<ol className="list-decimal space-y-1 pl-5 text-base-100/70">
						<li>On LinkedIn, open Settings, then Data privacy.</li>
						<li>Select Get a copy of your data.</li>
						<li>Pick Profile, Positions, Education, Skills, and Certifications. You can also pick the full archive.</li>
						<li>Request the archive. LinkedIn sends an email with a ZIP file in a few minutes.</li>
						<li>Download the ZIP. Pick it below.</li>
					</ol>
					{/* The same drop area as the resume upload on Manage Resumes. */}
					<input
						ref={inputRef}
						type="file"
						accept=".zip,application/zip"
						className="sr-only"
						tabIndex={-1}
						aria-hidden="true"
						onChange={(e) => {
							fromLinkedIn(e.target.files?.[0]);
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
							fromLinkedIn(e.dataTransfer.files?.[0]);
						}}
						disabled={busy}
						className={`flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed p-6 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ${
							dragging ? 'border-secondary bg-secondary/10' : 'border-base-100/30 hover:border-secondary'
						}`}
					>
						<span className="text-base-100">Drop the LinkedIn ZIP file here</span>
						<span className="text-sm text-base-100/70">The ZIP file from your LinkedIn data email</span>
						<span className="btn btn-secondary btn-sm pointer-events-none mt-3 min-h-11 px-5">Choose file</span>
					</button>
					<p className="text-sm text-base-100/70">CoverBetter reads the ZIP in your browser. The ZIP does not go to our server.</p>
				</div>
			)}
		</section>
	);
}

function Check() {
	return <span className="badge badge-warning ml-2 align-middle">Check this</span>;
}

function Review({
	result,
	hasData,
	mode,
	setMode,
	onApply,
	onCancel,
}: Readonly<{
	result: ImportResult;
	hasData: boolean;
	mode: ImportMode;
	setMode: (m: ImportMode) => void;
	onApply: () => void;
	onCancel: () => void;
}>) {
	const p = result.profile;
	const unsure = new Set(result.unsure);
	const counts: [string, number][] = [
		['positions', p.positions.length],
		['bullets', p.positions.reduce((n, x) => n + x.bullets.length, 0)],
		['schools', p.education.length],
		['certifications', p.certifications.length],
		['skills', p.skills.length],
		['projects', p.projects.length],
		['other items', p.other.length],
	];
	const bulletUnsure = (x: { id: string; bullets: { id: string }[] }) => unsure.has(x.id) || x.bullets.some((b) => unsure.has(b.id));
	const plain = 'flex flex-col gap-1 text-base-100/70';

	return (
		<div className="mt-4 flex flex-col gap-5">
			<p className="text-base-100">
				Found: {counts.filter(([, n]) => n > 0).map(([l, n]) => `${n} ${l}`).join(', ') || 'nothing we can use'}.
			</p>
			{result.warnings.length > 0 && (
				<div role="status">
					<h3 className="text-base text-base-100">Notes</h3>
					<ul className="list-disc pl-5 text-base-100/70">
						{result.warnings.map((w, i) => (
							<li key={i}>{w}</li>
						))}
					</ul>
				</div>
			)}
			{(p.basics.name || p.basics.email || p.basics.headline) && (
				<p className="break-words text-base-100/70">
					{[p.basics.name, p.basics.headline, p.basics.email, p.basics.location].filter(Boolean).join(' · ')}
				</p>
			)}
			{p.positions.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Positions</h3>
					<ul className="flex flex-col gap-2">
						{p.positions.map((x) => (
							<li key={x.id} className="rounded-box border border-base-100/10 bg-base-300 px-3 py-2">
								<details>
									<summary className="min-h-11 cursor-pointer py-2 text-base-100">
										<span className="break-words">{[x.title, x.company].filter(Boolean).join(' at ') || 'Position'}</span>
										<span className="text-sm text-base-100/60">
											{' · '}
											{dateRange(x.start, x.end, x.current)} · {x.bullets.length} bullets
										</span>
										{bulletUnsure(x) && <Check />}
									</summary>
									<ul className="list-disc space-y-1 pb-2 pl-5 text-base-100/70">
										{x.bullets.map((b) => (
											<li key={b.id} className="break-words">
												{b.text}
												{unsure.has(b.id) && <Check />}
											</li>
										))}
									</ul>
								</details>
							</li>
						))}
					</ul>
				</div>
			)}
			{p.education.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Education</h3>
					<ul className={plain}>
						{p.education.map((e) => (
							<li key={e.id} className="break-words">
								{[e.degree, e.field, e.school].filter(Boolean).join(', ') || 'School'}
								{unsure.has(e.id) && <Check />}
							</li>
						))}
					</ul>
				</div>
			)}
			{p.certifications.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Certifications</h3>
					<ul className={plain}>
						{p.certifications.map((c) => (
							<li key={c.id} className="break-words">
								{c.name}
								{c.issuer && ` · ${c.issuer}`}
								{unsure.has(c.id) && <Check />}
							</li>
						))}
					</ul>
				</div>
			)}
			{p.skills.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Skills</h3>
					<p className="break-words text-base-100/70">{p.skills.map((s) => s.name).join(', ')}</p>
				</div>
			)}
			{p.projects.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Projects</h3>
					<ul className={plain}>
						{p.projects.map((x) => (
							<li key={x.id} className="break-words">
								{x.name || 'Project'}
								{bulletUnsure(x) && <Check />}
							</li>
						))}
					</ul>
				</div>
			)}
			{p.other.length > 0 && (
				<div>
					<h3 className="mb-2 text-base text-base-100">Other</h3>
					<ul className={plain}>
						{p.other.map((o) => (
							<li key={o.id} className="break-words">
								{o.title} ({o.kind})
								{unsure.has(o.id) && <Check />}
							</li>
						))}
					</ul>
				</div>
			)}

			{hasData && (
				<fieldset className="flex flex-col gap-1">
					<legend className="mb-1 text-base text-base-100">What do you want to do?</legend>
					{(
						[
							['add', 'Add to my profile', 'Keep what you have. Add only the new items.'],
							['replace', 'Replace my profile', 'Delete what you have. Use only this import.'],
						] as const
					).map(([value, label, hint]) => (
						<label key={value} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-base-100">
							<input type="radio" name="import-mode" className="radio radio-sm mt-1" checked={mode === value} onChange={() => setMode(value)} />
							<span>
								{label}
								<span className="block text-sm text-base-100/60">{hint}</span>
							</span>
						</label>
					))}
				</fieldset>
			)}

			<div className="flex flex-wrap gap-3">
				<button type="button" className="btn btn-secondary min-h-11" onClick={onApply}>
					Use this data
				</button>
				<button type="button" className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11" onClick={onCancel}>
					Cancel
				</button>
			</div>
			<p className="text-sm text-base-100/60">The editor opens with this data. Nothing is saved until you save.</p>
		</div>
	);
}
