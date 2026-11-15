'use client';

import { useMemo } from 'react';
import { Choice, CopyButton, Select, TextInput, ToolCard, useLocalState } from '../ui';
import { KNOWN, TITLES, greetings, type GreetingInput, type KnownId, type Title } from './logic';

const EMPTY: GreetingInput = { fullName: '', title: 'Ms.', lastName: '', jobTitle: '', team: '', company: '' };

export default function GreetingTool() {
	const [input, setInput] = useLocalState<GreetingInput>('how-to-address-a-cover-letter:input', EMPTY);
	const [known, setKnown] = useLocalState<KnownId>('how-to-address-a-cover-letter:known', 'full');
	const set = (key: keyof GreetingInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));
	const result = useMemo(() => greetings(known, input), [known, input]);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Choice legend="What do you know about the hiring manager?" value={known} onChange={setKnown} options={KNOWN} />
				</div>
				{known === 'full' && (
					<div className="sm:col-span-2">
						<TextInput label="Full name" value={input.fullName} onChange={set('fullName')} placeholder="Jordan Smith" />
					</div>
				)}
				{known === 'title-last' && (
					<>
						<Select
							label="Title"
							value={input.title}
							onChange={(v: Title) => setInput((prev) => ({ ...prev, title: v }))}
							options={TITLES}
							hint="Not sure? Use the full name instead."
						/>
						<TextInput label="Last name" value={input.lastName} onChange={set('lastName')} placeholder="Smith" />
						<div className="sm:col-span-2">
							<TextInput
								label="Full name (optional)"
								value={input.fullName}
								onChange={set('fullName')}
								placeholder="Jordan Smith"
								hint="Add it to see the full name option."
							/>
						</div>
					</>
				)}
				{known === 'job-title' && (
					<TextInput
						label="Hiring manager’s job title"
						value={input.jobTitle}
						onChange={set('jobTitle')}
						placeholder="Marketing Manager"
					/>
				)}
				{known === 'team' && (
					<TextInput label="Team or department" value={input.team} onChange={set('team')} placeholder="Marketing" />
				)}
				{known !== 'full' && known !== 'title-last' && (
					<TextInput label="Company" value={input.company} onChange={set('company')} placeholder="Northwind" />
				)}
			</form>

			<div className="mt-6 grid gap-6">
				<section aria-label="Recommended greeting" aria-live="polite">
					<h3 className="text-sm font-medium text-base-100/70">Recommended greeting</h3>
					<GreetingRow text={result.recommended.text} note={result.recommended.note} strong />
				</section>

				<section aria-label="Other good options" aria-live="polite">
					<h3 className="text-sm font-medium text-base-100/70">Other good options</h3>
					<ul className="mt-2 grid gap-3">
						{result.others.map((g) => (
							<li key={g.text}>
								<GreetingRow text={g.text} note={g.note} />
							</li>
						))}
					</ul>
				</section>

				<section aria-label="Greetings to avoid">
					<h3 className="text-sm font-medium text-base-100/70">Greetings to avoid</h3>
					<ul className="mt-2 grid gap-3">
						{result.avoid.map((a) => (
							<li key={a.text} className="rounded-box border border-base-100/10 bg-primary p-4">
								<p className="break-words text-base-100 line-through decoration-base-100/40">{a.text}</p>
								<p className="mt-1 text-sm text-base-100/70">{a.reason}</p>
							</li>
						))}
					</ul>
				</section>

				<section aria-label="Advice">
					<h3 className="text-sm font-medium text-base-100/70">Advice</h3>
					<ul className="mt-2 grid list-disc gap-2 pl-5 text-base-100/80">
						{result.tips.map((t) => (
							<li key={t}>{t}</li>
						))}
					</ul>
				</section>

				<div>
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

function GreetingRow({ text, note, strong = false }: Readonly<{ text: string; note: string; strong?: boolean }>) {
	return (
		<div
			className={`mt-2 flex flex-col gap-3 rounded-box border bg-primary p-4 sm:flex-row sm:items-center sm:justify-between ${
				strong ? 'border-secondary' : 'border-base-100/10'
			}`}
		>
			<div className="min-w-0">
				<p className={`break-words text-base-100 ${strong ? 'text-lg font-medium' : ''}`}>{text}</p>
				<p className="mt-1 text-sm text-base-100/70">{note}</p>
			</div>
			<div className="shrink-0">
				<CopyButton text={text} />
			</div>
		</div>
	);
}
