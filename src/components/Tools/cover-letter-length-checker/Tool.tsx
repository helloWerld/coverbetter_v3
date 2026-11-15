'use client';

import { useMemo, useState } from 'react';
import { Stat, TextArea, ToolCard } from '../ui';
import { analyzeLetter, formatReadingTime } from './logic';

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export default function CoverLetterLengthCheckerTool() {
	const [text, setText] = useState('');
	const s = useMemo(() => analyzeLetter(text), [text]);
	const empty = s.words === 0;
	const dash = '-';

	return (
		<ToolCard>
			<form onSubmit={(e) => e.preventDefault()}>
				<TextArea
					label="Paste your cover letter"
					value={text}
					onChange={setText}
					rows={12}
					placeholder="Dear Ms. Ortiz, ..."
					hint="The text stays in your browser. The tool does not send it anywhere. Greeting, sign-off, and address lines are not counted as paragraphs or sentences."
				/>
				<div className="mt-3">
					<button
						type="button"
						onClick={() => setText('')}
						className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
					>
						Clear
					</button>
				</div>
			</form>

			<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
				<Stat label="Words" value={nf.format(s.words)} />
				<Stat
					label="Characters"
					value={nf.format(s.characters)}
					note={`${nf.format(s.charactersNoSpaces)} without spaces`}
				/>
				<Stat label="Paragraphs" value={nf.format(s.paragraphs)} />
				<Stat label="Sentences" value={nf.format(s.sentences)} />
				<Stat
					label="Average sentence"
					value={empty ? dash : `${nf.format(s.avgSentenceWords)} words`}
					note={empty ? undefined : `Longest: ${nf.format(s.longestSentenceWords)} words`}
				/>
				<Stat
					label="Reading grade level"
					value={s.sentences === 0 ? dash : nf.format(Math.max(s.grade, 0))}
					note="Flesch-Kincaid. A rough estimate."
				/>
				<Stat
					label="Reading time"
					value={empty ? dash : formatReadingTime(s.readingSeconds)}
					note="At 200 words per minute. This pace is an assumption."
				/>
			</div>

			<h2 className="mt-6 text-lg font-semibold text-base-100">Check against common guidelines</h2>
			<p className="mt-1 text-sm text-base-100/60">
				These are common tips from career coaches. They are not rules from data. A strong letter can miss one.
			</p>
			{empty ? (
				<p className="mt-3 text-base-100/70">Paste your letter to see the checks.</p>
			) : (
				<ul className="mt-3 grid gap-3">
					{s.checks.map((c) => (
						<li key={c.id} className="rounded-box border border-base-100/10 bg-primary p-4">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span
									className={`rounded border px-2 py-0.5 text-sm font-medium ${
										c.pass ? 'border-secondary bg-secondary/30 text-base-100' : 'border-base-100/40 text-base-100'
									}`}
								>
									{c.pass ? 'Pass' : 'Check'}
								</span>
								<h3 className="font-medium text-base-100">{c.label}</h3>
							</div>
							<p className="mt-1 text-sm text-base-100/70">Guideline: {c.guideline}</p>
							<p className="mt-1 text-base-100">{c.detail}</p>
						</li>
					))}
				</ul>
			)}

			{!empty && s.longestSentences.length > 0 && (
				<>
					<h2 className="mt-6 text-lg font-semibold text-base-100">Your longest sentences</h2>
					<p className="mt-1 text-sm text-base-100/60">Shorten the longest ones first.</p>
					<ol className="mt-3 grid gap-3">
						{s.longestSentences.map((x, i) => (
							<li key={`${i}-${x.text}`} className="rounded-box border border-base-100/10 bg-primary p-4">
								<p className="text-sm tabular-nums text-base-100/70">
									{x.words} words{x.words > 30 ? '. Over about 30 words.' : ''}
								</p>
								<p className="mt-1 break-words text-base-100">{x.text}</p>
							</li>
						))}
					</ol>
				</>
			)}
		</ToolCard>
	);
}
