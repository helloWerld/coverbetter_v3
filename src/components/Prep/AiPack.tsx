'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Dashboard/PageShell';
import type { PrepPackData } from '@/lib/prep/ai-prompt';
import { makePrepPackAction } from '@/app/dashboard/applications/[id]/prep/actions';
import { aiQuestionIsStar, AI_TYPE_LABEL, groupAiQuestions, hasContent, parseSavedAnswer, resolveUse, type ProfileItem } from './helpers';
import PracticePanel from './PracticePanel';
import QuestionItem from './QuestionItem';
import { btnGhost } from './styles';

const STEPS = ['Reading the job post…', 'Matching your profile…', 'Writing questions…', 'Writing hints…'];

export default function AiPack({
	applicationId,
	paid,
	pack,
	onPack,
	answers,
	items,
	onSaved,
}: Readonly<{
	applicationId: string;
	paid: boolean;
	pack: PrepPackData | null;
	onPack: (data: PrepPackData) => void;
	answers: Record<string, string>;
	items: ProfileItem[];
	onSaved: (questionId: string, json: string) => void;
}>) {
	const [running, setRunning] = useState(false);
	const [step, setStep] = useState(0);
	const [error, setError] = useState('');
	const [showBilling, setShowBilling] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [openId, setOpenId] = useState<string | null>(null);

	useEffect(() => {
		if (!running) return;
		const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 6000);
		return () => clearInterval(t);
	}, [running]);

	async function make() {
		setConfirming(false);
		setError('');
		setShowBilling(false);
		setStep(0);
		setRunning(true);
		try {
			const out = await makePrepPackAction(applicationId);
			if (out.ok) {
				onPack(out.data);
				setOpenId(null);
			} else {
				setError(out.error);
				setShowBilling(out.code === 'no_credits' || out.code === 'pro_cap' || out.code === 'premium');
			}
		} catch {
			setError('Something went wrong. You were not charged. Try again.');
		} finally {
			setRunning(false);
		}
	}

	if (!paid) {
		return (
			<Card title="A paid feature">
				<p>The AI prep pack is for accounts with credits or Pro.</p>
				<Link href="/dashboard/billing" className="btn btn-secondary mt-4 min-h-11">
					See plans
				</Link>
			</Card>
		);
	}

	const status = (
		<div aria-live="polite">
			{running && <p className="text-base-100">{STEPS[step]}</p>}
			{error && (
				<p role="alert" className="text-error">
					{error}{' '}
					{showBilling && (
						<Link href="/dashboard/billing" className="underline underline-offset-2">
							Go to Billing
						</Link>
					)}
				</p>
			)}
		</div>
	);

	if (!pack) {
		return (
			<Card title="AI prep pack">
				<p>
					The AI writes 12 to 15 likely questions for this job, with hints and the profile items to use. Uses 1 credit. You
					pay only when it works.
				</p>
				<div className="mt-4 flex flex-col items-start gap-3">
					<button type="button" onClick={make} disabled={running} className="btn btn-secondary min-h-11">
						{running ? 'Making the pack…' : 'Make my prep pack'}
					</button>
					{status}
				</div>
			</Card>
		);
	}

	const groups = groupAiQuestions(pack.questions);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col items-start gap-3">
				{confirming ? (
					<div role="group" aria-label="Confirm a new pack" className="flex flex-col gap-3 rounded-box border border-accent/60 p-4">
						<p className="text-base-100">A new pack uses 1 credit. Your saved answers stay. Continue?</p>
						<div className="flex flex-wrap gap-2">
							<button type="button" onClick={make} className="btn btn-secondary min-h-11">
								Yes, use 1 credit
							</button>
							<button type="button" onClick={() => setConfirming(false)} className={btnGhost}>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<button type="button" onClick={() => setConfirming(true)} disabled={running} className={btnGhost}>
						{running ? 'Making a new pack…' : 'Make a new pack (1 credit)'}
					</button>
				)}
				{status}
			</div>

			{groups.map((g) => (
				<section key={g.type} aria-labelledby={`ai-${g.type}`}>
					<h2 id={`ai-${g.type}`} className="text-2xl font-extralight text-base-100">
						{AI_TYPE_LABEL[g.type]}
					</h2>
					{g.type === 'gap' && (
						<p className="mt-2 text-base-100/70">
							These questions touch a requirement you may not fully meet. Be honest. Show related work and say how you will learn
							the rest. Do not claim a skill you do not have.
						</p>
					)}
					<ul className="mt-4 flex flex-col gap-3">
						{g.items.map(({ q, index }) => {
							const qid = `ai:${index}`;
							const used = resolveUse(items, q.use);
							return (
								<QuestionItem
									key={qid}
									text={q.text}
									saved={hasContent(answers[qid] ? parseSavedAnswer(answers[qid]) : null)}
									open={openId === qid}
									onToggle={() => setOpenId(openId === qid ? null : qid)}
								>
									<dl className="flex flex-col gap-3 text-base-100/80">
										{q.why && (
											<div>
												<dt className="font-medium text-base-100">Why they ask</dt>
												<dd className="break-words">{q.why}</dd>
											</div>
										)}
										{q.cover && (
											<div>
												<dt className="font-medium text-base-100">What to cover</dt>
												<dd className="break-words">{q.cover}</dd>
											</div>
										)}
										{used.length > 0 && (
											<div>
												<dt className="font-medium text-base-100">Use these from your profile</dt>
												<dd>
													<ul className="mt-1 list-disc pl-5">
														{used.map((u) => (
															<li key={u.id} className="break-words">
																{u.kind === 'bullet' ? `${u.label}: ${u.text}` : u.text}
															</li>
														))}
													</ul>
												</dd>
											</div>
										)}
									</dl>
									<PracticePanel
										applicationId={applicationId}
										questionId={qid}
										question={q.text}
										star={aiQuestionIsStar(q)}
										savedJson={answers[qid] ?? null}
										bullets={items.filter((i) => i.kind === 'bullet')}
										onSaved={onSaved}
									/>
								</QuestionItem>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}
