'use client';

import { useMemo } from 'react';
import { CopyButton, Select, TextInput, ToolCard, useLocalState } from '../ui';
import { EMAIL_TYPES, LENGTH_GUIDELINE, buildSubjects, type EmailType, type SubjectInput } from './logic';

const EMPTY: SubjectInput = { role: '', name: '', jobId: '', referrer: '' };

export default function SubjectLineTool() {
	const [input, setInput] = useLocalState<SubjectInput>('job-application-email-subject-line:input', EMPTY);
	const [type, setType] = useLocalState<EmailType>('job-application-email-subject-line:type', 'application');
	const set = (key: keyof SubjectInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const lines = useMemo(() => buildSubjects(type, input), [type, input]);
	const chosen = EMAIL_TYPES.find((t) => t.value === type);
	const showJobId = type === 'application' || type === 'referral' || type === 'follow-up';
	const showReferrer = type === 'referral' || type === 'informational';

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Select label="Email type" value={type} onChange={setType} options={EMAIL_TYPES} />
				</div>
				<TextInput
					label={chosen?.roleLabel ?? 'Job title'}
					value={input.role}
					onChange={set('role')}
					placeholder={type === 'informational' ? 'data analytics' : 'Data Analyst'}
				/>
				<TextInput label="Your name" value={input.name} onChange={set('name')} placeholder="Sam Lee" />
				{showJobId && (
					<TextInput
						label="Job ID (optional)"
						value={input.jobId}
						onChange={set('jobId')}
						placeholder="R-1042"
						hint="Add it only if the job post lists one."
					/>
				)}
				{showReferrer && (
					<TextInput
						label={type === 'referral' ? 'Who referred you' : 'Who referred you (optional)'}
						value={input.referrer}
						onChange={set('referrer')}
						placeholder="Ana Ruiz"
					/>
				)}
			</form>

			<div className="mt-6">
				<h3 className="text-sm font-medium text-base-100/70">Subject lines</h3>
				<ul className="mt-2 grid gap-3" aria-live="polite">
					{lines.map((line) => (
						<li
							key={line.text}
							className="flex flex-col gap-3 rounded-box border border-base-100/10 bg-primary p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0">
								<p className="break-words text-base-100">{line.text}</p>
								<p className={`mt-1 text-sm tabular-nums ${line.long ? 'text-neutral' : 'text-base-100/60'}`}>
									{line.length} characters
									{line.long &&
										`. Over about ${LENGTH_GUIDELINE}: some phone apps may cut it off. Check how it looks in your app.`}
								</p>
							</div>
							<div className="shrink-0">
								<CopyButton text={line.text} />
							</div>
						</li>
					))}
				</ul>
				<p className="mt-3 text-sm text-base-100/60">
					The {LENGTH_GUIDELINE} character mark is a guideline. Mail apps show different amounts. If the job post says what to
					write in the subject line, use that.
				</p>
				<div className="mt-4">
					<button
						type="button"
						onClick={() => setInput(EMPTY)}
						className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
					>
						Clear
					</button>
				</div>
			</div>
		</ToolCard>
	);
}
