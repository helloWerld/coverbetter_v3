'use client';

import { useId, useState } from 'react';
import { parseLinkedInFiles } from '@/lib/profile/linkedin';
import { readLinkedInZip } from '@/lib/profile/linkedin-zip';
import type { Profile } from '@/lib/profile/types';
import { importResumeFile } from './resume-import';
import { dateRange, labelClass } from './ui';

export type ImportMode = 'replace' | 'add';
export interface ImportResult {
	profile: Profile;
	unsure: string[];
	warnings: string[];
	source: string;
}

const MAX_ZIP_BYTES = 200 * 1024 * 1024;
const fileClass =
	'file-input file-input-bordered min-h-11 w-full bg-base-300 text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';

export default function ImportPanel({
	hasData,
	onApply,
}: Readonly<{ hasData: boolean; onApply: (r: ImportResult, mode: ImportMode) => void }>) {
	const [open, setOpen] = useState(!hasData);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState<ImportResult | null>(null);
	const [mode, setMode] = useState<ImportMode>('add');
	const zipId = useId();
	const resumeId = useId();

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

	const fromResume = (file: File | undefined) =>
		run(file, async (f) => {
			const out = await importResumeFile(f);
			return { profile: out.profile, unsure: out.unsure, warnings: [], source: 'your resume' };
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
			<div>
				<button type="button" className="btn btn-outline min-h-11 border-base-100/30 text-base-100" onClick={() => setOpen(true)}>
					Import
				</button>
			</div>
		);
	}

	return (
		<section aria-labelledby="import-h" className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-4 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<h2 id="import-h" className="text-xl text-base-100">
					{result ? `Check what we found in ${result.source}` : 'Import your data'}
				</h2>
				{hasData && (
					<button
						type="button"
						className="btn btn-ghost min-h-11 text-base-100"
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
				<div className="mt-4 grid gap-6 md:grid-cols-2">
					<div className="flex flex-col gap-3">
						<h3 className="text-base text-base-100">Import from LinkedIn</h3>
						<ol className="list-decimal space-y-1 pl-5 text-base-100/70">
							<li>On LinkedIn, open Settings, then Data privacy.</li>
							<li>Select Get a copy of your data.</li>
							<li>Pick Profile, Positions, Education, Skills, and Certifications. You can also pick the full archive.</li>
							<li>Request the archive. LinkedIn sends an email with a ZIP file in a few minutes.</li>
							<li>Download the ZIP. Pick it below.</li>
						</ol>
						<p className="text-sm text-base-100/70">CoverBetter reads the ZIP in your browser. The ZIP does not go to our server.</p>
						<div>
							<label htmlFor={zipId} className={labelClass}>
								LinkedIn ZIP file
							</label>
							<input id={zipId} type="file" accept=".zip,application/zip" disabled={busy} className={fileClass} onChange={(e) => fromLinkedIn(e.target.files?.[0])} />
						</div>
					</div>
					<div className="flex flex-col gap-3">
						<h3 className="text-base text-base-100">Import from a resume file</h3>
						<p className="text-base-100/70">Use a PDF or DOCX file. The file can be up to 5 MB. CoverBetter reads it in your browser.</p>
						<div>
							<label htmlFor={resumeId} className={labelClass}>
								Resume file
							</label>
							<input
								id={resumeId}
								type="file"
								accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								disabled={busy}
								className={fileClass}
								onChange={(e) => fromResume(e.target.files?.[0])}
							/>
						</div>
					</div>
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
				<button type="button" className="btn btn-outline min-h-11 border-base-100/30 text-base-100" onClick={onCancel}>
					Cancel
				</button>
			</div>
			<p className="text-sm text-base-100/60">The editor opens with this data. Nothing is saved until you save.</p>
		</div>
	);
}
