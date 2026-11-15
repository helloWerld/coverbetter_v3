'use client';

import { useMemo } from 'react';
import { Choice, CopyButton, DownloadButton, OutputBox, TextInput, ToolCard, useLocalState } from '../ui';
import {
	INTERVIEW_TYPES,
	TIMING_NOTE,
	TONES,
	buildEmail,
	openPlaceholders,
	type EmailInput,
	type InterviewType,
	type Tone,
} from './logic';

const EMPTY: EmailInput = { interviewer: '', role: '', company: '', topic: '', name: '' };

export default function ThankYouEmailTool() {
	const [input, setInput] = useLocalState<EmailInput>('thank-you-email:input', EMPTY);
	const [type, setType] = useLocalState<InterviewType>('thank-you-email:type', 'video');
	const [tone, setTone] = useLocalState<Tone>('thank-you-email:tone', 'formal');
	const set = (key: keyof EmailInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const email = useMemo(() => buildEmail(type, tone, input), [type, tone, input]);
	const open = openPlaceholders(email.text);
	const chosen = INTERVIEW_TYPES.find((t) => t.value === type);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Choice legend="Interview type" value={type} onChange={setType} options={INTERVIEW_TYPES} />
					{chosen && <p className="mt-2 text-sm text-base-100/60">{chosen.tip}</p>}
				</div>
				<div className="sm:col-span-2">
					<Choice legend="Tone" value={tone} onChange={setTone} options={TONES} />
				</div>
				<TextInput
					label={type === 'panel' ? 'Interviewer names' : 'Interviewer name'}
					value={input.interviewer}
					onChange={set('interviewer')}
					placeholder={type === 'panel' ? 'Ana, Ben, and Chris' : tone === 'formal' ? 'Ms. Ortiz' : 'Maria'}
				/>
				<TextInput label="Job title" value={input.role} onChange={set('role')} placeholder="Data Analyst" />
				<TextInput label="Company" value={input.company} onChange={set('company')} placeholder="Northwind" />
				<TextInput label="Your name" value={input.name} onChange={set('name')} placeholder="Sam Lee" />
				<div className="sm:col-span-2">
					<TextInput
						label="One topic from your talk"
						value={input.topic}
						onChange={set('topic')}
						placeholder="the new reporting system"
						hint="Write a short phrase. It fills the sentence “I enjoyed our talk about …”."
					/>
				</div>
			</form>

			<div className="mt-6 grid gap-4">
				<OutputBox label="Subject line" text={email.subject} />
				<OutputBox label="Email body" text={email.body} />
				<p className="text-sm text-base-100/60">
					{open.length > 0
						? `Replace the ${open.length} parts in [brackets] before you send it.`
						: 'No [brackets] left. Read it once more before you send it.'}
				</p>
				<p className="text-sm text-base-100/70">{TIMING_NOTE}</p>
				<div className="flex flex-wrap gap-3">
					<CopyButton text={email.text} label="Copy subject and email" />
					<CopyButton text={email.body} label="Copy body only" />
					<DownloadButton filename="thank-you-email.txt" content={email.text} />
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
