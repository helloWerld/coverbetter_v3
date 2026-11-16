'use client';

import { useId, useState, useTransition } from 'react';
import type { UserSettings } from '@/lib/applications/types';
import { saveSettingsAction } from './actions';

export const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const labelClass = 'mb-2 block text-sm font-medium text-base-100';
const hintClass = 'mt-1 text-sm text-base-100/60';
const box = 'flex flex-col gap-5 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6';

const TONES = [
	['professional', 'Professional'],
	['friendly', 'Friendly'],
	['confident', 'Confident'],
	['enthusiastic', 'Enthusiastic'],
] as const;
const LENGTHS = [
	['short', 'Short (about 200 words)'],
	['standard', 'Standard (about 300 words)'],
	['detailed', 'Detailed (about 400 words)'],
] as const;

export default function SettingsForm({
	settings,
	paid,
	resumes,
	languages,
	templates,
}: Readonly<{
	settings: UserSettings;
	paid: boolean;
	resumes: { id: string; title: string }[];
	languages: { code: string; label: string }[];
	templates: { id: string; label: string }[];
}>) {
	const id = useId();
	const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
	const [pending, startTransition] = useTransition();

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setStatus(null);
		const data = new FormData(e.currentTarget);
		startTransition(async () => {
			const out = await saveSettingsAction(data);
			setStatus(out.ok ? { kind: 'ok', text: 'Settings saved.' } : { kind: 'error', text: out.error });
		});
	}

	const select = (name: keyof UserSettings, label: string, options: readonly (readonly [string, string])[], hint?: string) => (
		<div>
			<label htmlFor={`${id}-${name}`} className={labelClass}>
				{label}
			</label>
			<select id={`${id}-${name}`} name={name} defaultValue={String(settings[name])} className={`${field} min-h-11`}>
				{options.map(([v, l]) => (
					<option key={v} value={v}>
						{l}
					</option>
				))}
			</select>
			{hint && <p className={hintClass}>{hint}</p>}
		</div>
	);

	const days = (name: 'noResponseDays' | 'followUpDays' | 'secondFollowUpDays', label: string, min: number, max: number, hint: string) => (
		<div>
			<label htmlFor={`${id}-${name}`} className={labelClass}>
				{label}
			</label>
			<input
				id={`${id}-${name}`}
				name={name}
				type="number"
				inputMode="numeric"
				min={min}
				max={max}
				defaultValue={settings[name]}
				className={`${field} min-h-11 max-w-40 tabular-nums`}
			/>
			<p className={hintClass}>{hint}</p>
		</div>
	);

	return (
		<form onSubmit={submit} className="flex flex-col gap-6">
			<fieldset className={box}>
				<legend className="sr-only">Cover letters</legend>
				<h2 className="text-xl text-base-100">Cover letters</h2>
				<div className="grid gap-5 sm:grid-cols-2">
					{select('tone', 'Tone', TONES, paid ? undefined : 'Free letters always use Professional.')}
					{select('length', 'Length', LENGTHS, paid ? undefined : 'Free letters always use Standard.')}
					{select('template', 'Template', templates.map((t) => [t.id, t.label] as const))}
					{select('language', 'Language', languages.map((l) => [l.code, l.label] as const))}
				</div>
				{select(
					'defaultResumeId',
					'Default resume',
					[['', 'No default'] as const, ...resumes.map((r) => [r.id, r.title] as const)],
					'The letter form selects this resume first.',
				)}
			</fieldset>

			<fieldset className={box}>
				<legend className="sr-only">Reminders</legend>
				<h2 className="text-xl text-base-100">Reminders</h2>
				<div className="grid gap-5 sm:grid-cols-3">
					{days('followUpDays', 'First follow-up after', 1, 60, 'Days after you apply.')}
					{days('secondFollowUpDays', 'Second follow-up after', 2, 90, 'Days after you apply.')}
					{days('noResponseDays', '"No response" after', 7, 180, 'Days with no answer.')}
				</div>
			</fieldset>

			<fieldset className={box}>
				<legend className="sr-only">Tailored resumes</legend>
				<h2 className="text-xl text-base-100">Tailored resumes</h2>
				{paid ? (
					select(
						'resumeMode',
						'Start a new resume',
						[
							['manual', 'By hand (free)'],
							['ai', 'With AI (1 credit, includes a letter and a Job Fit Score)'],
						] as const,
					)
				) : (
					<>
						<input type="hidden" name="resumeMode" value="manual" />
						<p className="text-base-100/70">
							You build tailored resumes by hand. With credits or Pro, the AI can match your resume to the job post.
						</p>
					</>
				)}
			</fieldset>

			<div className="flex flex-wrap items-center gap-3">
				<button type="submit" disabled={pending} className="btn btn-secondary min-h-11">
					{pending ? 'Saving…' : 'Save settings'}
				</button>
				<p aria-live="polite" role={status?.kind === 'error' ? 'alert' : undefined} className={status?.kind === 'error' ? 'text-error' : 'text-base-100/70'}>
					{status?.text}
				</p>
			</div>
		</form>
	);
}
