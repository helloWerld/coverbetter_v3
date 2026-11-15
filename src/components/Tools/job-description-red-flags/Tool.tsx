'use client';

import { Fragment, useMemo, useState } from 'react';
import { TextArea, ToolCard } from '../ui';
import { CATEGORIES, FLAGS_BY_ID, analyze, segments, type Category } from './logic';

const MARK: Record<Category, string> = {
	scam: 'bg-error/50',
	pay: 'bg-warning/40',
	workload: 'bg-info/40',
	role: 'bg-secondary/50',
};

export default function JobDescriptionRedFlagsTool() {
	const [text, setText] = useState('');
	const analysis = useMemo(() => analyze(text), [text]);
	const parts = useMemo(() => segments(text, analysis.matches), [text, analysis.matches]);
	const total = analysis.findings.length;

	return (
		<ToolCard>
			<form onSubmit={(e) => e.preventDefault()}>
				<TextArea
					label="Paste the job post"
					value={text}
					onChange={setText}
					rows={10}
					placeholder="Paste the full job post here. The text stays in your browser."
				/>
			</form>
			<div className="mt-3 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => setText('')}
					className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
				>
					Clear
				</button>
			</div>

			<p className="mt-4 rounded-box border border-base-100/10 bg-primary p-4 text-sm text-base-100/80">
				One phrase is not proof of a bad job. Many good employers use these words. Use the results as questions to ask,
				not as a verdict.
			</p>

			<div className="mt-6" aria-live="polite">
				{!analysis.hasText ? (
					<p className="text-base-100/70">Paste a job post to see which phrases the tool finds.</p>
				) : (
					<>
						<h3 className="text-lg font-semibold text-base-100">
							{total === 0 ? 'No phrases from the list found' : `${total} ${total === 1 ? 'item' : 'items'} found`}
						</h3>
						<ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
							{CATEGORIES.map((c) => (
								<li key={c.id} className="rounded-box border border-base-100/10 bg-primary p-3">
									<p className="text-sm text-base-100/70">{c.label}</p>
									<p className="mt-1 text-2xl font-semibold tabular-nums text-base-100">{analysis.counts[c.id]}</p>
								</li>
							))}
						</ul>
						{total === 0 && (
							<p className="mt-3 text-sm text-base-100/70">
								That does not mean the job is safe. Check the company, and ask about pay and the work in the interview.
							</p>
						)}
					</>
				)}

				{analysis.hasText && (
					<section aria-label="Your job post with matches marked" className="mt-6 rounded-box border border-base-100/10 bg-primary p-4">
						<h3 className="text-sm font-medium text-base-100/70">Your job post</h3>
						<p className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed text-base-100">
							{parts.map((p, i) => {
								const flag = p.flagId ? FLAGS_BY_ID[p.flagId] : undefined;
								return flag ? (
									<mark
										key={i}
										title={`${flag.label} (${CATEGORIES.find((c) => c.id === flag.category)?.label})`}
										className={`rounded px-0.5 text-base-100 underline decoration-base-100/60 underline-offset-2 ${MARK[flag.category]}`}
									>
										{p.text}
									</mark>
								) : (
									<Fragment key={i}>{p.text}</Fragment>
								);
							})}
						</p>
					</section>
				)}

				{CATEGORIES.map((c) => {
					const items = analysis.findings.filter((f) => f.flag.category === c.id);
					if (items.length === 0) return null;
					return (
						<section key={c.id} aria-label={c.label} className="mt-6">
							<h3 className="flex items-center gap-2 text-lg font-semibold text-base-100">
								<span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm ${MARK[c.id]}`} />
								{c.label}
							</h3>
							{c.id === 'scam' && (
								<p className="mt-2 rounded-box border border-error/50 bg-primary p-4 text-sm text-base-100">
									Check the company before you share any data or pay any money. Look for its own website, and search its
									name with the word “scam”. Read the{' '}
									<a
										href="https://consumer.ftc.gov/articles/job-scams"
										target="_blank"
										rel="noopener noreferrer"
										className="link text-neutral"
									>
										FTC guide to job scams
									</a>
									. A real employer never asks you to pay to get a job.
								</p>
							)}
							<ul className="mt-3 grid gap-3">
								{items.map(({ flag, count }) => (
									<li key={flag.id} className="rounded-box border border-base-100/10 bg-primary p-4">
										<p className="font-medium text-base-100">
											{flag.label}
											{count > 1 && <span className="ml-2 text-sm tabular-nums text-base-100/60">found {count} times</span>}
										</p>
										<p className="mt-2 text-sm text-base-100/80">
											<span className="font-medium text-base-100">It can mean:</span> {flag.canMean}
										</p>
										<p className="mt-2 text-sm text-base-100/80">
											<span className="font-medium text-base-100">Ask:</span> {flag.ask}
										</p>
									</li>
								))}
							</ul>
						</section>
					);
				})}
			</div>
		</ToolCard>
	);
}
