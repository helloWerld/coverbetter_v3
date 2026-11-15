'use client';

import { useMemo } from 'react';
import { CopyButton, OutputBox, Select, TextInput, ToolCard, useLocalState } from '../ui';
import {
	CONNECTION_LIMIT,
	LIMITS,
	TEMPLATE_LIST,
	buildMessage,
	counter,
	openPlaceholders,
	type LimitId,
	type MessageInput,
	type TemplateId,
} from './logic';

const EMPTY: MessageInput = { recipient: '', name: '', role: '', company: '', background: '', reason: '' };

export default function RecruiterMessageTool() {
	const [input, setInput] = useLocalState<MessageInput>('recruiter-message-templates:input', EMPTY);
	const [template, setTemplate] = useLocalState<TemplateId>('recruiter-message-templates:template', 'cold');
	const [limit, setLimit] = useLocalState<LimitId>('recruiter-message-templates:limit', 'message');
	const set = (key: keyof MessageInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const chosen = TEMPLATE_LIST.find((t) => t.id === template);
	const text = useMemo(() => buildMessage(template, input), [template, input]);
	const count = counter(text, limit);
	const open = openPlaceholders(text);

	const pickTemplate = (id: TemplateId) => {
		setTemplate(id);
		const next = TEMPLATE_LIST.find((t) => t.id === id);
		if (next) setLimit(next.limit);
	};

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Select
						label="Template"
						value={template}
						onChange={pickTemplate}
						options={TEMPLATE_LIST.map((t) => ({ value: t.id, label: t.label }))}
						hint={chosen?.when}
					/>
				</div>
				<TextInput
					label="Their name"
					value={input.recipient}
					onChange={set('recipient')}
					placeholder="Maria Ortiz"
					hint="The message uses the first name."
				/>
				<TextInput label="Your name" value={input.name} onChange={set('name')} placeholder="Sam Lee" />
				<TextInput label="Job title" value={input.role} onChange={set('role')} placeholder="Data Analyst" />
				<TextInput label="Company" value={input.company} onChange={set('company')} placeholder="Northwind" />
				<div className="sm:col-span-2">
					<TextInput
						label="Who you are, in a short phrase"
						value={input.background}
						onChange={set('background')}
						placeholder="a data analyst with 4 years in retail"
					/>
				</div>
				<div className="sm:col-span-2">
					<TextInput
						label="Why this company"
						value={input.reason}
						onChange={set('reason')}
						placeholder="your team builds tools that stores use every day"
						hint="Finish the sentence “I am interested because …”."
					/>
				</div>
				<div className="sm:col-span-2">
					<Select label="Length limit" value={limit} onChange={setLimit} options={LIMITS} />
				</div>
			</form>

			<div className="mt-6">
				<OutputBox label="Your message" text={text} />
				<p
					aria-live="polite"
					className={`mt-2 text-sm tabular-nums ${count.status === 'over' ? 'font-medium text-neutral' : 'text-base-100/60'}`}
				>
					{count.limit === null
						? `${count.count} characters. There is no strict limit. Keep it short.`
						: count.status === 'over'
							? `${count.count} of ${CONNECTION_LIMIT} characters. You are over by ${count.over}. LinkedIn may not let you send a note this long, so cut some words.`
							: `${count.count} of ${CONNECTION_LIMIT} characters.`}
				</p>
				{limit === 'connection' && (
					<p className="mt-1 text-sm text-base-100/60">
						LinkedIn limits can change, so check the box on LinkedIn.
					</p>
				)}
				<p className="mt-1 text-sm text-base-100/60">
					{open.length > 0
						? `Replace the ${open.length} parts in [brackets] before you send it.`
						: 'No [brackets] left. Read it once more before you send it.'}
				</p>
				<div className="mt-4 flex flex-wrap gap-3">
					<CopyButton text={text} label="Copy message" />
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
