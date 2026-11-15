'use client';

import { useEffect, useMemo, useState } from 'react';
import { Select, ToolCard, useLocalState } from '../ui';
import {
	QUESTIONS,
	TIMER_MINUTES,
	TYPES,
	filterQuestions,
	formatClock,
	nextQuestion,
	randomQuestion,
	typeLabel,
	type Filter,
	type Question,
} from './logic';

const OUTLINE =
	'btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100';

export default function InterviewQuestionPracticeTool() {
	const [filter, setFilter] = useState<Filter>('all');
	const [currentId, setCurrentId] = useState<number | undefined>(undefined);
	const [notes, setNotes] = useLocalState<Record<string, string>>('interview-question-practice:notes', {});
	const [minutes, setMinutes] = useState<number>(2);
	const [left, setLeft] = useState(120);
	const [running, setRunning] = useState(false);
	const [done, setDone] = useState(false);

	const list = useMemo(() => filterQuestions(filter), [filter]);
	const current: Question | undefined = QUESTIONS.find((q) => q.id === currentId);

	useEffect(() => {
		if (!running) return;
		const t = setInterval(() => {
			setLeft((l) => {
				if (l <= 1) {
					setRunning(false);
					setDone(true);
					return 0;
				}
				return l - 1;
			});
		}, 1000);
		return () => clearInterval(t);
	}, [running]);

	const resetTimer = (m = minutes) => {
		setRunning(false);
		setDone(false);
		setLeft(m * 60);
	};
	const pick = (q: Question | undefined) => {
		if (!q) return;
		setCurrentId(q.id);
		resetTimer();
	};
	const chooseMinutes = (m: number) => {
		setMinutes(m);
		resetTimer(m);
	};

	const options = [
		{ value: 'all' as Filter, label: `All types (${QUESTIONS.length})` },
		...TYPES.map((t) => ({ value: t.value as Filter, label: `${t.label} (${filterQuestions(t.value).length})` })),
	];

	return (
		<ToolCard>
			<form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
				<Select label="Question type" value={filter} onChange={setFilter} options={options} />
			</form>

			<div className="mt-4 flex flex-wrap gap-3">
				<button type="button" className="btn btn-secondary min-h-11" onClick={() => pick(randomQuestion(list, currentId))}>
					Random question
				</button>
				<button type="button" className={OUTLINE} onClick={() => pick(nextQuestion(list, currentId))}>
					Next
				</button>
			</div>

			<section aria-label="Current question" className="mt-6 rounded-box border border-base-100/10 bg-primary p-4">
				{current ? (
					<>
						<p className="text-sm text-neutral">{typeLabel(current.type)}</p>
						<p className="mt-1 text-xl font-semibold text-base-100">{current.q}</p>
						<p className="mt-2 text-base-100/70">
							<span className="font-medium text-base-100">What a good answer covers: </span>
							{current.tip}
						</p>

						<div className="mt-5 border-t border-base-100/10 pt-4">
							<Choice minutes={minutes} onChange={chooseMinutes} />
							<p className="mt-4 text-4xl font-semibold tabular-nums text-base-100" aria-label="Time left">
								{formatClock(left)}
							</p>
							<p aria-live="polite" role="status" className="mt-1 min-h-6 font-medium text-neutral">
								{done ? 'Time is up.' : ''}
							</p>
							<div className="mt-2 flex flex-wrap gap-3">
								<button
									type="button"
									className="btn btn-secondary min-h-11"
									disabled={running || left === 0}
									onClick={() => {
										setDone(false);
										setRunning(true);
									}}
								>
									{left > 0 && left < minutes * 60 ? 'Resume' : 'Start'}
								</button>
								<button type="button" className={OUTLINE} disabled={!running} onClick={() => setRunning(false)}>
									Pause
								</button>
								<button type="button" className={OUTLINE} onClick={() => resetTimer()}>
									Reset
								</button>
							</div>
						</div>

						<div className="mt-5">
							<label htmlFor="iqp-notes" className="text-sm font-medium text-base-100">
								Your notes for this question
							</label>
							<textarea
								id="iqp-notes"
								rows={5}
								value={notes[String(current.id)] ?? ''}
								onChange={(e) => setNotes((prev) => ({ ...prev, [String(current.id)]: e.target.value }))}
								placeholder="Write your key points or a story to use."
								className="textarea textarea-bordered mt-1.5 w-full border-base-100/20 bg-base-300 text-base leading-relaxed text-base-100 placeholder:text-base-100/40 focus:border-neutral focus:outline-secondary"
							/>
							<p className="mt-1 text-sm text-base-100/60">Notes save in this browser only.</p>
						</div>
					</>
				) : (
					<p className="text-base-100/70">Press Random question or Next to start.</p>
				)}
			</section>

			<section aria-label="All questions in this filter" className="mt-6">
				<h3 className="text-lg font-semibold text-base-100">
					All questions in this filter <span className="tabular-nums text-base-100/60">({list.length})</span>
				</h3>
				<ul className="mt-3 grid gap-2">
					{list.map((q) => (
						<li key={q.id}>
							<button
								type="button"
								onClick={() => pick(q)}
								aria-current={q.id === currentId ? 'true' : undefined}
								className={`min-h-11 w-full rounded-box border p-3 text-left text-base-100 ${
									q.id === currentId ? 'border-secondary bg-secondary/20' : 'border-base-100/10 bg-primary hover:border-neutral'
								}`}
							>
								<span className="block">{q.q}</span>
								<span className="block text-sm text-base-100/60">
									{typeLabel(q.type)}
									{notes[String(q.id)] ? ' · has notes' : ''}
								</span>
							</button>
						</li>
					))}
				</ul>
			</section>
		</ToolCard>
	);
}

function Choice({ minutes, onChange }: Readonly<{ minutes: number; onChange: (m: number) => void }>) {
	return (
		<fieldset>
			<legend className="mb-1.5 text-sm font-medium text-base-100">Practice timer</legend>
			<div className="flex flex-wrap gap-2">
				{TIMER_MINUTES.map((m) => (
					<button
						key={m}
						type="button"
						aria-pressed={minutes === m}
						onClick={() => onChange(m)}
						className={`btn btn-sm min-h-11 border px-4 normal-case ${
							minutes === m
								? 'border-secondary bg-secondary/30 text-base-100 hover:bg-secondary/40'
								: 'border-base-100/20 bg-base-300 text-base-100/80 hover:border-neutral hover:bg-base-300'
						}`}
					>
						{m} {m === 1 ? 'minute' : 'minutes'}
					</button>
				))}
			</div>
		</fieldset>
	);
}
