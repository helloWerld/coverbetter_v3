'use client';

import { useId, useMemo, useState } from 'react';
import { JOB_FAMILIES, questionsFor } from '@/lib/prep/question-bank';
import { filterByType, hasContent, parseSavedAnswer, TYPE_FILTERS, type ProfileItem } from './helpers';
import PracticePanel from './PracticePanel';
import QuestionItem from './QuestionItem';
import { field, focus, labelClass } from './styles';

const TYPE_LABEL = Object.fromEntries(TYPE_FILTERS.map((t) => [t.id, t.label]));

export default function QuestionBank({
	applicationId,
	defaultFamily,
	answers,
	bullets,
	onSaved,
}: Readonly<{
	applicationId: string;
	defaultFamily: string;
	answers: Record<string, string>;
	bullets: ProfileItem[];
	onSaved: (questionId: string, json: string) => void;
}>) {
	const id = useId();
	const [family, setFamily] = useState(defaultFamily);
	const [type, setType] = useState('all');
	const [openId, setOpenId] = useState<string | null>(null);

	const list = useMemo(() => filterByType(questionsFor(family), type), [family, type]);

	return (
		<div className="flex flex-col gap-5">
			<div>
				<label htmlFor={`${id}-family`} className={labelClass}>
					Job family
				</label>
				<select id={`${id}-family`} value={family} onChange={(e) => setFamily(e.target.value)} className={`${field} min-h-11`}>
					{JOB_FAMILIES.map((f) => (
						<option key={f.id} value={f.id}>
							{f.label}
						</option>
					))}
				</select>
				<p className="mt-1 text-sm text-base-100/60">We chose a family from the job title. You can change it.</p>
			</div>

			<div role="group" aria-label="Filter by question type" className="flex flex-wrap gap-2">
				{TYPE_FILTERS.map((t) => (
					<button
						key={t.id}
						type="button"
						aria-pressed={type === t.id}
						onClick={() => setType(t.id)}
						className={`btn min-h-11 ${focus} ${type === t.id ? 'btn-secondary' : 'btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100'}`}
					>
						{t.label}
					</button>
				))}
			</div>

			<p aria-live="polite" className="text-sm text-base-100/70">
				{list.length} {list.length === 1 ? 'question' : 'questions'}
			</p>

			{list.length === 0 ? (
				<p className="text-base-100/70">No questions match this filter.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{list.map((q) => (
						<QuestionItem
							key={q.id}
							text={q.text}
							badge={TYPE_LABEL[q.type]}
							saved={hasContent(answers[q.id] ? parseSavedAnswer(answers[q.id]) : null)}
							open={openId === q.id}
							onToggle={() => setOpenId(openId === q.id ? null : q.id)}
						>
							<p className="break-words text-base-100/80">
								<span className="font-medium text-base-100">Tip: </span>
								{q.tip}
							</p>
							<PracticePanel
								applicationId={applicationId}
								questionId={q.id}
								question={q.text}
								star={q.star}
								savedJson={answers[q.id] ?? null}
								bullets={bullets}
								onSaved={onSaved}
							/>
						</QuestionItem>
					))}
				</ul>
			)}
		</div>
	);
}
