import { ROUND_LABEL } from '@/lib/applications/types';
import { QUESTIONS_TO_ASK } from '@/lib/prep/question-bank';
import CopyButton from './CopyButton';

function Row({ text }: Readonly<{ text: string }>) {
	return (
		<li className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-100/10 bg-base-300 px-4 py-3">
			<span className="min-w-0 break-words text-base-100">{text}</span>
			<span className="flex items-center gap-2">
				<CopyButton text={text} what="this question" />
			</span>
		</li>
	);
}

export default function AskList({ aiAsk }: Readonly<{ aiAsk: string[] }>) {
	const rounds = Object.entries(QUESTIONS_TO_ASK) as [keyof typeof QUESTIONS_TO_ASK, string[]][];
	return (
		<div className="flex flex-col gap-8">
			<p className="text-base-100/70">Ask 2 or 3 of these at the end of an interview. Choose the ones that fit the round.</p>
			{aiAsk.length > 0 && (
				<section aria-labelledby="ask-ai">
					<h2 id="ask-ai" className="text-2xl font-extralight text-base-100">
						For this job
					</h2>
					<ul className="mt-4 flex flex-col gap-2">
						{aiAsk.map((t) => (
							<Row key={t} text={t} />
						))}
					</ul>
				</section>
			)}
			{rounds.map(([round, list]) => (
				<section key={round} aria-labelledby={`ask-${round}`}>
					<h2 id={`ask-${round}`} className="text-2xl font-extralight text-base-100">
						{ROUND_LABEL[round]}
					</h2>
					<ul className="mt-4 flex flex-col gap-2">
						{list.map((t) => (
							<Row key={t} text={t} />
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
