'use client';

import { useId, useState, useTransition } from 'react';
import { createApplicationAction, updateApplicationAction } from '@/app/dashboard/applications/actions';
import { SOURCES, SOURCE_LABEL, STATUSES, STATUS_LABEL } from '@/lib/applications/types';

export const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
export const labelClass = 'mb-2 block text-sm font-medium text-base-100';

export type AppFormValues = {
	company: string;
	jobTitle: string;
	jobUrl: string;
	source: string;
	jobDescription: string;
	notes: string;
	contactName: string;
	contactEmail: string;
};

const EMPTY: AppFormValues = {
	company: '',
	jobTitle: '',
	jobUrl: '',
	source: 'other',
	jobDescription: '',
	notes: '',
	contactName: '',
	contactEmail: '',
};

/** The form to add a new application, or to edit one (when `applicationId` is set). */
export default function ApplicationForm({
	applicationId,
	values = EMPTY,
	onSaved,
}: Readonly<{ applicationId?: string; values?: AppFormValues; onSaved?: () => void }>) {
	const id = useId();
	const [error, setError] = useState('');
	const [saved, setSaved] = useState(false);
	const [pending, startTransition] = useTransition();
	const editing = Boolean(applicationId);

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setSaved(false);
		const data = new FormData(e.currentTarget);
		startTransition(async () => {
			const out = applicationId ? await updateApplicationAction(applicationId, data) : await createApplicationAction(data);
			if (out && !out.ok) {
				setError(out.error);
				return;
			}
			setSaved(true);
			onSaved?.();
		});
	}

	const input = (name: keyof AppFormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
		<div>
			<label htmlFor={`${id}-${name}`} className={labelClass}>
				{label}
			</label>
			<input id={`${id}-${name}`} name={name} defaultValue={values[name]} className={`${field} min-h-11`} {...props} />
		</div>
	);

	return (
		<form onSubmit={submit} className="flex flex-col gap-5 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
			<div className="grid gap-5 sm:grid-cols-2">
				{input('jobTitle', 'Job title', { maxLength: 200, autoComplete: 'off' })}
				{input('company', 'Company', { maxLength: 200, autoComplete: 'organization' })}
				{input('jobUrl', 'Link to the job post', { type: 'url', maxLength: 1000, placeholder: 'https://' })}
				<div>
					<label htmlFor={`${id}-source`} className={labelClass}>
						Where you found the job
					</label>
					<select id={`${id}-source`} name="source" defaultValue={values.source} className={`${field} min-h-11`}>
						{SOURCES.map((s) => (
							<option key={s} value={s}>
								{SOURCE_LABEL[s]}
							</option>
						))}
					</select>
				</div>
				{!editing && (
					<div>
						<label htmlFor={`${id}-status`} className={labelClass}>
							Status
						</label>
						<select id={`${id}-status`} name="status" defaultValue="saved" className={`${field} min-h-11`}>
							{STATUSES.slice(0, 3).map((s) => (
								<option key={s} value={s}>
									{STATUS_LABEL[s]}
								</option>
							))}
						</select>
					</div>
				)}
			</div>
			<div>
				<label htmlFor={`${id}-jobDescription`} className={labelClass}>
					Job post
				</label>
				<textarea
					id={`${id}-jobDescription`}
					name="jobDescription"
					defaultValue={values.jobDescription}
					rows={editing ? 12 : 8}
					maxLength={20000}
					placeholder="Paste the full job post. The resume builder, the letter, and the interview prep use it."
					className={field}
				/>
			</div>
			<details className="group" open={editing && Boolean(values.contactName || values.contactEmail || values.notes)}>
				<summary className="flex min-h-11 cursor-pointer items-center text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
					Contact and notes
				</summary>
				<div className="mt-3 grid gap-5 sm:grid-cols-2">
					{input('contactName', 'Contact name', { maxLength: 200, autoComplete: 'off' })}
					{input('contactEmail', 'Contact email', { type: 'email', maxLength: 254, autoComplete: 'off' })}
					<div className="sm:col-span-2">
						<label htmlFor={`${id}-notes`} className={labelClass}>
							Notes
						</label>
						<textarea id={`${id}-notes`} name="notes" defaultValue={values.notes} rows={4} maxLength={5000} className={field} />
					</div>
				</div>
			</details>
			{error && (
				<p role="alert" className="text-error">
					{error}
				</p>
			)}
			<div className="flex flex-wrap items-center gap-3">
				<button type="submit" disabled={pending} className="btn btn-secondary min-h-11">
					{pending ? 'Saving…' : editing ? 'Save changes' : 'Add role'}
				</button>
				<p aria-live="polite" className="text-base-100/70">
					{saved && editing ? 'Saved.' : ''}
				</p>
			</div>
		</form>
	);
}
