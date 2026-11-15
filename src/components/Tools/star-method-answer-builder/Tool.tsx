'use client';

import { useMemo, useState } from 'react';
import { CopyButton, OutputBox, Stat, TextArea, TextInput, ToolCard, useLocalState } from '../ui';
import {
	EMPTY_ANSWER,
	STAR_PARTS,
	actionHint,
	buildAnswer,
	countWords,
	formatAll,
	formatSaved,
	isEmptyAnswer,
	newId,
	speakingTimeText,
	totalWords,
	type SavedAnswer,
	type StarAnswer,
} from './logic';

const GHOST = 'btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100';

export default function StarMethodAnswerBuilderTool() {
	const [draft, setDraft] = useLocalState<StarAnswer>('star-method-answer-builder:draft', EMPTY_ANSWER);
	const [saved, setSaved] = useLocalState<SavedAnswer[]>('star-method-answer-builder:saved', []);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [note, setNote] = useState('');

	const answer = useMemo(() => buildAnswer(draft), [draft]);
	const words = totalWords(draft);
	const hint = actionHint(draft);
	const set = (key: keyof StarAnswer) => (value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

	const save = () => {
		if (isEmptyAnswer(draft)) return;
		if (editingId) {
			setSaved((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...draft, savedAt: Date.now() } : s)));
			setNote('Answer updated in your list.');
		} else {
			setSaved((prev) => [{ ...draft, id: newId(), savedAt: Date.now() }, ...prev]);
			setNote('Answer saved to your list.');
		}
		setEditingId(null);
		setDraft(EMPTY_ANSWER);
	};

	const load = (s: SavedAnswer) => {
		setDraft({ question: s.question, situation: s.situation, task: s.task, action: s.action, result: s.result });
		setEditingId(s.id);
		setNote('Answer loaded. Edit it, then press Update answer.');
	};

	const remove = (id: string) => {
		setSaved((prev) => prev.filter((s) => s.id !== id));
		if (editingId === id) setEditingId(null);
		setNote('Answer deleted.');
	};

	const clear = () => {
		setDraft(EMPTY_ANSWER);
		setEditingId(null);
		setNote('');
	};

	return (
		<ToolCard>
			<form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
				<TextInput
					label="The question this answer is for"
					value={draft.question}
					onChange={set('question')}
					placeholder="Tell me about a time you met a tight deadline."
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					{STAR_PARTS.map((p) => (
						<div key={p.key}>
							<TextArea
								label={p.label}
								value={draft[p.key]}
								onChange={set(p.key)}
								hint={p.tip}
								placeholder={p.placeholder}
								rows={5}
							/>
							<p className="mt-1 text-sm tabular-nums text-base-100/60">{countWords(draft[p.key])} words</p>
						</div>
					))}
				</div>
			</form>

			{hint && (
				<p role="status" className="mt-4 rounded-box border border-secondary/50 bg-secondary/10 p-3 text-sm text-base-100">
					{hint}
				</p>
			)}

			<div className="mt-6">
				<OutputBox label="Your full answer" text={answer || 'Your answer shows here as you type.'} />
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					<Stat label="Total words" value={String(words)} />
					<Stat
						label="Rough speaking time"
						value={speakingTimeText(words)}
						note="A rough guide, at about 130 to 150 words per minute."
					/>
				</div>
				<div className="mt-4 flex flex-wrap gap-3">
					<CopyButton text={formatSaved(draft)} label="Copy answer" />
					<button type="button" onClick={save} disabled={isEmptyAnswer(draft)} className="btn btn-secondary min-h-11">
						{editingId ? 'Update answer' : 'Save answer'}
					</button>
					<button type="button" onClick={clear} className={GHOST}>
						Clear
					</button>
				</div>
				<p role="status" className="mt-2 min-h-5 text-sm text-base-100/70">
					{note}
				</p>
			</div>

			<section aria-label="Saved answers" className="mt-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 className="text-lg font-semibold text-base-100">Saved answers ({saved.length})</h3>
					{saved.length > 0 && <CopyButton text={formatAll(saved)} label="Copy all answers" />}
				</div>
				{saved.length === 0 ? (
					<p className="mt-2 text-sm text-base-100/60">No saved answers yet. Press Save answer to add one.</p>
				) : (
					<ul className="mt-3 grid gap-3">
						{saved.map((s) => (
							<li key={s.id} className="rounded-box border border-base-100/10 bg-primary p-4">
								<p className="font-medium text-base-100">{s.question.trim() || 'No question'}</p>
								<p className="mt-1 text-sm tabular-nums text-base-100/60">{totalWords(s)} words</p>
								<p className="mt-2 line-clamp-3 break-words text-base-100/80">{buildAnswer(s)}</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<button type="button" onClick={() => load(s)} className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100">
										Load
									</button>
									<CopyButton text={formatSaved(s)} label="Copy" />
									<button type="button" onClick={() => remove(s.id)} className={GHOST}>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</ToolCard>
	);
}
