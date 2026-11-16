'use client';

import { useId, useState, useTransition } from 'react';
import { deleteInterviewAction, saveInterviewAction } from '@/app/dashboard/applications/actions';
import { INTERVIEW_FORMATS, INTERVIEW_ROUNDS, ROUND_LABEL, type InterviewFormat, type InterviewRound } from '@/lib/applications/types';
import { field, labelClass } from './ApplicationForm';

export type InterviewView = {
	id: string;
	at: string;
	round: InterviewRound;
	format: InterviewFormat;
	interviewers: string;
	topics: string;
	wentWell: string;
	clarify: string;
	rating: number;
};

const FORMAT_LABEL: Record<InterviewFormat, string> = { phone: 'Phone', video: 'Video', onsite: 'On site' };
const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** "YYYY-MM-DDTHH:mm" in local time, for a datetime-local input. */
function localInput(iso: string): string {
	const d = new Date(iso);
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function InterviewForm({
	applicationId,
	interview,
	onDone,
}: Readonly<{ applicationId: string; interview?: InterviewView; onDone: () => void }>) {
	const id = useId();
	const [error, setError] = useState('');
	const [pending, startTransition] = useTransition();

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		const data = new FormData(e.currentTarget);
		startTransition(async () => {
			const out = await saveInterviewAction(applicationId, interview?.id ?? null, data);
			if (!out.ok) setError(out.error);
			else onDone();
		});
	}

	const area = (name: keyof InterviewView, label: string, hint?: string) => (
		<div>
			<label htmlFor={`${id}-${name}`} className={labelClass}>
				{label}
			</label>
			<textarea id={`${id}-${name}`} name={name} rows={2} maxLength={3000} defaultValue={String(interview?.[name] ?? '')} className={field} />
			{hint && <p className="mt-1 text-sm text-base-100/60">{hint}</p>}
		</div>
	);

	return (
		<form onSubmit={submit} className="flex flex-col gap-4 rounded-box border border-base-100/10 bg-base-300 p-4">
			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<label htmlFor={`${id}-at`} className={labelClass}>
						Date and time
					</label>
					<input id={`${id}-at`} name="at" type="datetime-local" required defaultValue={interview ? localInput(interview.at) : ''} className={`${field} min-h-11`} />
				</div>
				<div>
					<label htmlFor={`${id}-round`} className={labelClass}>
						Round
					</label>
					<select id={`${id}-round`} name="round" defaultValue={interview?.round ?? 'first'} className={`${field} min-h-11`}>
						{INTERVIEW_ROUNDS.map((r) => (
							<option key={r} value={r}>
								{ROUND_LABEL[r]}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor={`${id}-format`} className={labelClass}>
						Format
					</label>
					<select id={`${id}-format`} name="format" defaultValue={interview?.format ?? 'video'} className={`${field} min-h-11`}>
						{INTERVIEW_FORMATS.map((f) => (
							<option key={f} value={f}>
								{FORMAT_LABEL[f]}
							</option>
						))}
					</select>
				</div>
			</div>
			<div>
				<label htmlFor={`${id}-interviewers`} className={labelClass}>
					Interviewers
				</label>
				<input id={`${id}-interviewers`} name="interviewers" maxLength={500} defaultValue={interview?.interviewers ?? ''} placeholder="Name and role" className={`${field} min-h-11`} />
			</div>
			{area('topics', 'Topics you discussed', 'The thank-you letter uses these.')}
			{area('wentWell', 'What went well')}
			{area('clarify', 'A point to clarify', 'Something you want to explain better in the thank-you letter.')}
			<fieldset>
				<legend className={labelClass}>How did it go?</legend>
				<div className="flex flex-wrap gap-2">
					{[0, 1, 2, 3, 4, 5].map((n) => (
						<label key={n} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-base-100 has-[:checked]:bg-secondary">
							<input type="radio" name="rating" value={n} defaultChecked={(interview?.rating ?? 0) === n} className="radio radio-sm" />
							{n === 0 ? 'Not set' : `${n} of 5`}
						</label>
					))}
				</div>
			</fieldset>
			{error && (
				<p role="alert" className="text-error">
					{error}
				</p>
			)}
			<div className="flex flex-wrap gap-3">
				<button type="submit" disabled={pending} className="btn btn-secondary min-h-11">
					{pending ? 'Saving…' : interview ? 'Save interview' : 'Add interview'}
				</button>
				<button type="button" onClick={onDone} className="btn btn-ghost text-base-100/70 hover:bg-base-200 hover:text-base-100 min-h-11">
					Cancel
				</button>
			</div>
		</form>
	);
}

export default function InterviewsPanel({ applicationId, interviews }: Readonly<{ applicationId: string; interviews: InterviewView[] }>) {
	const [editing, setEditing] = useState<string | 'new' | null>(null);
	const [pending, startTransition] = useTransition();

	return (
		<div className="flex flex-col gap-3">
			{interviews.length === 0 && editing !== 'new' && <p className="text-base-100/70">No interviews yet. Add one when the company invites you.</p>}
			<ul className="flex flex-col gap-3">
				{interviews.map((iv) =>
					editing === iv.id ? (
						<li key={iv.id}>
							<InterviewForm applicationId={applicationId} interview={iv} onDone={() => setEditing(null)} />
						</li>
					) : (
						<li key={iv.id} className="rounded-box border border-base-100/10 bg-base-300 p-4">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<p className="text-base-100">
										{ROUND_LABEL[iv.round]} · {FORMAT_LABEL[iv.format]}
									</p>
									<p className="text-sm text-base-100/60">
										<time dateTime={iv.at}>{dateFmt.format(new Date(iv.at))}</time>
										{iv.rating > 0 && <span> · Went {iv.rating} of 5</span>}
									</p>
									{iv.interviewers && <p className="mt-1 text-sm text-base-100/70">With {iv.interviewers}</p>}
									{iv.topics && <p className="mt-1 whitespace-pre-line text-sm text-base-100/70">Topics: {iv.topics}</p>}
								</div>
								<div className="flex gap-2">
									<button type="button" onClick={() => setEditing(iv.id)} className="btn btn-sm btn-ghost text-base-100/70 hover:bg-base-200 hover:text-base-100 min-h-11">
										Edit
									</button>
									<button
										type="button"
										disabled={pending}
										onClick={() => {
											if (!window.confirm('Delete this interview?')) return;
											startTransition(async () => {
												await deleteInterviewAction(applicationId, iv.id);
											});
										}}
										className="btn btn-sm btn-ghost text-base-100/70 hover:bg-base-200 hover:text-base-100 min-h-11"
									>
										Delete
									</button>
								</div>
							</div>
						</li>
					),
				)}
			</ul>
			{editing === 'new' ? (
				<InterviewForm applicationId={applicationId} onDone={() => setEditing(null)} />
			) : (
				<button type="button" onClick={() => setEditing('new')} className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11 w-fit">
					Add an interview
				</button>
			)}
		</div>
	);
}
