'use client';

import { useMemo } from 'react';
import { CopyButton, DownloadButton, OutputBox, Select, TextInput, ToolCard, useLocalState } from '../ui';
import { TEMPLATES, countWords, fillTemplate, openPlaceholders, type LetterInput, type TemplateId } from './logic';

const EMPTY: LetterInput = {
	name: '',
	role: '',
	company: '',
	hiringManager: '',
	strength1: '',
	strength2: '',
	achievement: '',
	referrer: '',
};

export default function CoverLetterTemplateTool() {
	const [input, setInput] = useLocalState<LetterInput>('cover-letter-template:input', EMPTY);
	const [template, setTemplate] = useLocalState<TemplateId>('cover-letter-template:template', 'standard');
	const set = (key: keyof LetterInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const letter = useMemo(() => fillTemplate(template, input), [template, input]);
	const open = openPlaceholders(letter);
	const chosen = TEMPLATES.find((t) => t.id === template);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Select
						label="Template"
						value={template}
						onChange={setTemplate}
						options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
						hint={chosen?.when}
					/>
				</div>
				<TextInput label="Your name" value={input.name} onChange={set('name')} placeholder="Sam Lee" />
				<TextInput label="Job title" value={input.role} onChange={set('role')} placeholder="Data Analyst" />
				<TextInput label="Company" value={input.company} onChange={set('company')} placeholder="Northwind" />
				<TextInput
					label="Hiring manager (optional)"
					value={input.hiringManager}
					onChange={set('hiringManager')}
					placeholder="Ms. Ortiz"
					hint="Leave it empty if you do not know the name."
				/>
				<TextInput label="Strength 1" value={input.strength1} onChange={set('strength1')} placeholder="SQL" />
				<TextInput label="Strength 2" value={input.strength2} onChange={set('strength2')} placeholder="clear reporting" />
				<div className="sm:col-span-2">
					<TextInput
						label="One result you are proud of"
						value={input.achievement}
						onChange={set('achievement')}
						placeholder="I cut the monthly report time from 3 days to 1 day"
						hint="Write it as a full clause that starts with “I”. A number makes it stronger."
					/>
				</div>
				{template === 'referral' && (
					<div className="sm:col-span-2">
						<TextInput label="Who referred you" value={input.referrer} onChange={set('referrer')} placeholder="Ana Ruiz" />
					</div>
				)}
			</form>

			<div className="mt-6">
				<OutputBox label="Your cover letter" text={letter} />
				<p className="mt-2 text-sm text-base-100/60">
					{countWords(letter)} words.{' '}
					{open.length > 0
						? `Replace the ${open.length} parts in [brackets] before you send it.`
						: 'No [brackets] left. Read it once more before you send it.'}
				</p>
				<div className="mt-4 flex flex-wrap gap-3">
					<CopyButton text={letter} label="Copy letter" />
					<DownloadButton filename="cover-letter.txt" content={letter} />
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
