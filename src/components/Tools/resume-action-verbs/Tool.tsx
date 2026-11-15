'use client';

import { useMemo, useState } from 'react';
import { CopyButton, Select, TextArea, TextInput, ToolCard } from '../ui';
import { GROUPS, filterVerbs, findWeakPhrases, type VerbGroupId } from './logic';

const CHIP =
	'btn btn-sm min-h-11 border border-base-100/20 bg-primary px-4 normal-case text-base-100 hover:border-neutral hover:bg-primary';

/** A verb that copies itself when the user clicks it. */
function VerbChip({ verb, onCopy }: Readonly<{ verb: string; onCopy: (v: string) => void }>) {
	return (
		<button type="button" className={CHIP} onClick={() => onCopy(verb)}>
			{verb}
		</button>
	);
}

export default function ResumeActionVerbsTool() {
	const [query, setQuery] = useState('');
	const [group, setGroup] = useState<VerbGroupId | 'all'>('all');
	const [text, setText] = useState('');
	const [message, setMessage] = useState('');

	const shown = useMemo(() => filterVerbs(query, group), [query, group]);
	const weak = useMemo(() => findWeakPhrases(text), [text]);

	const copy = async (verb: string) => {
		try {
			await navigator.clipboard.writeText(verb);
			setMessage(`Copied “${verb}”.`);
		} catch {
			setMessage('Copy failed. Select the word and copy it by hand.');
		}
	};

	return (
		<ToolCard>
			<h2 className="text-lg font-semibold text-base-100">Find a verb</h2>
			<form className="mt-3 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<TextInput label="Search verbs" value={query} onChange={setQuery} placeholder="For example: lead" />
				<Select
					label="Group"
					value={group}
					onChange={setGroup}
					options={[{ value: 'all', label: 'All groups' }, ...GROUPS.map((g) => ({ value: g.id, label: g.label }))]}
				/>
			</form>
			<p className="mt-3 text-sm text-base-100/70" aria-live="polite">
				{shown.length} verbs. {message || 'Click a verb to copy it.'}
			</p>
			{shown.length === 0 ? (
				<p className="mt-3 text-base-100/70">No verb matches. Try a shorter search.</p>
			) : (
				<div className="mt-3 max-h-96 overflow-y-auto rounded-box border border-base-100/10 bg-primary/40 p-3">
					<ul className="flex flex-wrap gap-2">
						{shown.map((v) => (
							<li key={v.verb}>
								<VerbChip verb={v.verb} onCopy={copy} />
							</li>
						))}
					</ul>
				</div>
			)}
			<div className="mt-3">
				<CopyButton text={shown.map((v) => v.verb).join(', ')} label="Copy the verbs shown" />
			</div>

			<hr className="my-6 border-base-100/10" />

			<h2 className="text-lg font-semibold text-base-100">Check your bullets for weak phrases</h2>
			<form className="mt-3" onSubmit={(e) => e.preventDefault()}>
				<TextArea
					label="Paste one bullet or many lines"
					value={text}
					onChange={setText}
					rows={6}
					placeholder={'Helped the sales team close more deals\nResponsible for the weekly report'}
					hint="Put each bullet on its own line. The text stays in your browser."
				/>
			</form>
			<div className="mt-4" aria-live="polite">
				{weak.lineCount === 0 ? (
					<p className="text-base-100/70">Paste a bullet to check it.</p>
				) : weak.lines.length === 0 ? (
					<p className="text-base-100">
						No weak phrases from our list in {weak.lineCount} {weak.lineCount === 1 ? 'line' : 'lines'}. Check that each
						bullet also shows a result.
					</p>
				) : (
					<>
						<p className="text-base-100">
							{weak.lines.length} of {weak.lineCount} {weak.lineCount === 1 ? 'line has' : 'lines have'} a weak phrase.
						</p>
						<ul className="mt-3 grid gap-3">
							{weak.lines.map((r, i) => (
								<li key={`${i}-${r.line}`} className="rounded-box border border-base-100/10 bg-primary p-4">
									<p className="break-words text-base-100">{r.line}</p>
									{r.findings.map((f, j) => (
										<div key={`${f.phrase}-${j}`} className="mt-3">
											<p className="text-sm text-base-100/70">
												{f.atStart ? 'Weak opener' : 'Weak phrase'}: “{f.phrase}”. Try one of these verbs:
											</p>
											<ul className="mt-2 flex flex-wrap gap-2">
												{f.suggestions.map((s) => (
													<li key={s}>
														<VerbChip verb={s} onCopy={copy} />
													</li>
												))}
											</ul>
										</div>
									))}
								</li>
							))}
						</ul>
						<p className="mt-3 text-sm text-base-100/60">
							The tool picks verbs that fit the words in each line. A verb does not fix a bullet by itself. Add what you did
							and what changed.
						</p>
					</>
				)}
			</div>
		</ToolCard>
	);
}
