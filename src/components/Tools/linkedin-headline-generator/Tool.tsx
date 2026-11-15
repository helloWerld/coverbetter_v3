'use client';

import { useMemo } from 'react';
import { Choice, CopyButton, TextArea, TextInput, ToolCard, useLocalState } from '../ui';
import { HEADLINE_LIMIT, buildHeadlines, type AudienceKind, type HeadlineInput, type OpenStyle } from './logic';

const EMPTY: HeadlineInput = { role: '', skills: '', audience: '', audienceKind: 'people', result: '' };

export default function LinkedinHeadlineGeneratorTool() {
	const [input, setInput] = useLocalState<HeadlineInput>('linkedin-headline-generator:input', EMPTY);
	const [style, setStyle] = useLocalState<OpenStyle>('linkedin-headline-generator:style', 'none');
	const set = (key: keyof HeadlineInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const headlines = useMemo(() => buildHeadlines(input, style), [input, style]);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<TextInput
					label="Your current or target role"
					value={input.role}
					onChange={set('role')}
					placeholder="Data Analyst"
					hint="Use the job title that recruiters search for."
				/>
				<TextArea
					label="2 to 4 skills or specialties"
					value={input.skills}
					onChange={set('skills')}
					rows={2}
					placeholder="SQL, Tableau, Python"
					hint="Separate them with commas."
				/>
				<TextInput
					label="Who you help, or your industry"
					value={input.audience}
					onChange={set('audience')}
					placeholder="healthcare teams"
				/>
				<Choice<AudienceKind>
					legend="The answer on the left is"
					value={input.audienceKind}
					onChange={(v) => setInput((prev) => ({ ...prev, audienceKind: v }))}
					options={[
						{ value: 'people', label: 'People I help' },
						{ value: 'industry', label: 'My industry' },
					]}
				/>
				<div className="sm:col-span-2">
					<TextInput
						label="A result or credential (optional)"
						value={input.result}
						onChange={set('result')}
						placeholder="Google Data Analytics Certificate"
						hint="Use a real result or a real credential. Never invent one."
					/>
				</div>
				<div className="sm:col-span-2">
					<Choice<OpenStyle>
						legend="Open to work style"
						value={style}
						onChange={setStyle}
						options={[
							{ value: 'none', label: 'None' },
							{ value: 'open', label: 'Open to [role] roles' },
							{ value: 'seeking', label: 'Seeking' },
						]}
					/>
				</div>
			</form>

			<h2 className="mt-6 text-lg font-semibold text-base-100">Your headlines ({headlines.length})</h2>
			<ul className="mt-3 grid gap-3">
				{headlines.map((h) => (
					<li key={h.pattern} className="rounded-box border border-base-100/10 bg-primary p-4">
						<p className="break-words leading-relaxed text-base-100">{h.text}</p>
						<p className={`mt-2 text-sm tabular-nums ${h.overLimit ? 'text-base-100' : 'text-base-100/60'}`}>
							{h.length} of {HEADLINE_LIMIT} characters
							{h.overLimit && (
								<span className="ml-2 rounded border border-base-100/40 px-1.5 py-0.5 font-medium">
									Too long: remove {h.length - HEADLINE_LIMIT} characters
								</span>
							)}
						</p>
						<div className="mt-3">
							<CopyButton text={h.text} label="Copy headline" />
						</div>
					</li>
				))}
			</ul>
			<p className="mt-3 text-sm text-base-100/60">
				LinkedIn’s headline limit is {HEADLINE_LIMIT} characters today. LinkedIn can change it, so check the limit in your
				profile. Only the first part of a headline shows in some places, so put the role first.
			</p>
			<div className="mt-4">
				<button
					type="button"
					onClick={() => {
						setInput(EMPTY);
						setStyle('none');
					}}
					className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
				>
					Clear
				</button>
			</div>
		</ToolCard>
	);
}
