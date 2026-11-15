'use client';

import { useId, useMemo } from 'react';
import { CopyButton, TextInput, ToolCard, useLocalState } from '../ui';
import { ALL_VERBS } from '../resume-action-verbs/logic';
import { buildBullets, charCount, looksPastTense, type BulletInput } from './logic';

const EMPTY: BulletInput = { verb: '', what: '', result: '', measure: '', how: '' };

export default function ResumeBulletPointBuilderTool() {
	const [input, setInput] = useLocalState<BulletInput>('resume-bullet-point-builder:input', EMPTY);
	const [saved, setSaved] = useLocalState<string[]>('resume-bullet-point-builder:saved', []);
	const listId = useId();
	const set = (key: keyof BulletInput) => (value: string) => setInput((prev) => ({ ...prev, [key]: value }));

	const versions = useMemo(() => buildBullets(input), [input]);
	const verbWord = input.verb.trim().split(/\s+/)[0] ?? '';
	const tenseHint = verbWord !== '' && !looksPastTense(verbWord);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div>
					<TextInput
						label="Action verb"
						value={input.verb}
						onChange={set('verb')}
						placeholder="Reduced"
						hint="Start with a verb. Use past tense for past jobs. Use present tense for your current job."
						{...{ list: listId }}
					/>
					<datalist id={listId}>
						{ALL_VERBS.map((v) => (
							<option key={v.verb} value={v.verb.charAt(0).toUpperCase() + v.verb.slice(1)} />
						))}
					</datalist>
					{tenseHint && (
						<p className="mt-1.5 text-sm text-base-100/70">
							“{verbWord}” may not be past tense. That is fine for a job you do now.
						</p>
					)}
				</div>
				<TextInput
					label="What you did"
					value={input.what}
					onChange={set('what')}
					placeholder="invoice errors"
					hint="The thing you worked on. Write a short noun phrase."
				/>
				<TextInput
					label="The result"
					value={input.result}
					onChange={set('result')}
					placeholder="less rework for the billing team"
					hint="What changed for your team, your customers, or the company."
				/>
				<TextInput
					label="The number or measure (optional)"
					value={input.measure}
					onChange={set('measure')}
					placeholder="40% fewer corrections each month"
					hint="Add a number only when you have a real one. Never invent one. The example is only an example."
				/>
				<div className="sm:col-span-2">
					<TextInput
						label="How you did it (optional)"
						value={input.how}
						onChange={set('how')}
						placeholder="adding a review checklist"
						hint="Start with a verb that ends in “ing”. The tool adds “by”."
					/>
				</div>
			</form>

			<ul className="mt-6 grid gap-3">
				{versions.map((v) => (
					<li key={v.id} className="rounded-box border border-base-100/10 bg-primary p-4">
						<h3 className="text-sm font-medium text-base-100/70">{v.label}</h3>
						<p className="mt-2 break-words leading-relaxed text-base-100">{v.text}</p>
						<p className="mt-2 text-sm tabular-nums text-base-100/60">{charCount(v.text)} characters</p>
						<div className="mt-3 flex flex-wrap gap-3">
							<CopyButton text={v.text} label="Copy" />
							<button
								type="button"
								className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100"
								onClick={() => setSaved((prev) => (prev.includes(v.text) ? prev : [...prev, v.text]))}
							>
								Save bullet
							</button>
						</div>
					</li>
				))}
			</ul>
			<p className="mt-3 text-sm text-base-100/60">
				Keep one or two lines on the page. Pick the version that reads best, then change the words until it sounds like you.
			</p>

			<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-lg font-semibold text-base-100">Saved bullets ({saved.length})</h2>
				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => setInput(EMPTY)}
						className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
					>
						Clear the form
					</button>
					{saved.length > 0 && (
						<button
							type="button"
							onClick={() => setSaved([])}
							className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
						>
							Clear saved bullets
						</button>
					)}
				</div>
			</div>
			{saved.length === 0 ? (
				<p className="mt-2 text-base-100/70">No saved bullets yet. They stay in this browser only.</p>
			) : (
				<>
					<ul className="mt-3 grid gap-3">
						{saved.map((text, i) => (
							<li key={`${i}-${text}`} className="rounded-box border border-base-100/10 bg-primary p-4">
								<p className="break-words text-base-100">{text}</p>
								<p className="mt-1 text-sm tabular-nums text-base-100/60">{charCount(text)} characters</p>
								<div className="mt-3 flex flex-wrap gap-3">
									<CopyButton text={text} />
									<button
										type="button"
										onClick={() => setSaved((prev) => prev.filter((_, j) => j !== i))}
										className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100"
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
					<div className="mt-3">
						<CopyButton text={saved.join('\n')} label="Copy all saved bullets" />
					</div>
				</>
			)}
		</ToolCard>
	);
}
