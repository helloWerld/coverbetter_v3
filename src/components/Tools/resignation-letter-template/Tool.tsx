'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CopyButton, DownloadButton, OutputBox, Select, TextInput, ToolCard, useLocalState } from '../ui';
import { LETTER_TYPES, buildLetter, formatLongDate, openPlaceholders, withSubject, type LetterType, type ResignationInput } from './logic';

type Fields = Omit<ResignationInput, 'type'>;

const EMPTY: Fields = {
	name: '',
	manager: '',
	company: '',
	role: '',
	lastDay: '',
	appreciated: '',
	offerHandover: false,
};

export default function ResignationLetterTemplateTool() {
	const [fields, setFields] = useLocalState<Fields>('resignation-letter-template:fields', EMPTY);
	const [type, setType] = useLocalState<LetterType>('resignation-letter-template:type', 'standard');
	const set = <K extends keyof Fields>(key: K) => (value: Fields[K]) => setFields((prev) => ({ ...prev, [key]: value }));

	const letter = useMemo(() => buildLetter({ ...fields, type }), [fields, type]);
	const full = withSubject(letter);
	const open = openPlaceholders(full);
	const chosen = LETTER_TYPES.find((t) => t.id === type);
	const longDate = formatLongDate(fields.lastDay);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Select
						label="Letter type"
						value={type}
						onChange={setType}
						options={LETTER_TYPES.map((t) => ({ value: t.id, label: t.label }))}
						hint={chosen?.when}
					/>
				</div>
				<TextInput label="Your name" value={fields.name} onChange={set('name')} placeholder="Sam Lee" />
				<TextInput label="Manager name" value={fields.manager} onChange={set('manager')} placeholder="Ms. Ortiz" />
				<TextInput label="Company" value={fields.company} onChange={set('company')} placeholder="Northwind" />
				<TextInput label="Your role" value={fields.role} onChange={set('role')} placeholder="Data Analyst" />
				<div className="flex flex-col gap-1.5">
					<TextInput
						label="Last day"
						type="date"
						value={fields.lastDay}
						onChange={set('lastDay')}
						hint={type === 'immediate' ? 'This letter does not use a last day.' : undefined}
					/>
					{longDate && <p className="text-sm text-base-100/70">{longDate}</p>}
					<Link href="/tools/two-weeks-notice-calculator" className="link min-h-11 py-2 text-sm text-neutral">
						Find your last day
					</Link>
				</div>
				{type === 'grateful' && (
					<TextInput
						label="One thing you appreciated"
						value={fields.appreciated}
						onChange={set('appreciated')}
						placeholder="the time you spent coaching me"
						hint="It follows “thank you for”. Write it as a short phrase."
					/>
				)}
				<label className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2">
					<input
						type="checkbox"
						checked={fields.offerHandover}
						onChange={(e) => set('offerHandover')(e.target.checked)}
						className="checkbox checkbox-secondary"
					/>
					<span className="text-sm font-medium text-base-100">Offer to help with handover</span>
				</label>
			</form>

			<div className="mt-6 grid gap-4">
				{letter.note && (
					<p role="note" className="rounded-box border border-warning/50 bg-primary p-4 text-sm text-base-100">
						{letter.note}
					</p>
				)}
				<OutputBox label="Email subject line" text={letter.subject} />
				<OutputBox label="Your resignation letter" text={letter.body} />
				<p className="text-sm text-base-100/60">
					{open.length > 0
						? `Replace the ${open.length} parts in [brackets] before you send it.`
						: 'No [brackets] left. Read it once more before you send it.'}
				</p>
				<div className="flex flex-wrap gap-3">
					<CopyButton text={full} label="Copy subject and letter" />
					<DownloadButton filename="resignation-letter.txt" content={full} />
					<button
						type="button"
						onClick={() => setFields(EMPTY)}
						className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
					>
						Clear
					</button>
				</div>
			</div>
		</ToolCard>
	);
}
