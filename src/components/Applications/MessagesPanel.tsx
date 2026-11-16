'use client';

import Link from 'next/link';
import { useId, useState, useTransition } from 'react';
import {
	deleteMessageAction,
	markMessageSentAction,
	saveTemplateMessageAction,
	updateMessageAction,
	writeMessageWithAiAction,
} from '@/app/dashboard/applications/actions';
import { ROUND_LABEL, type MessageKind } from '@/lib/applications/types';
import { MESSAGE_TEMPLATES, fillTemplate, mailtoLink } from '@/lib/messages/templates';
import { field, labelClass } from './ApplicationForm';
import type { InterviewView } from './InterviewsPanel';

export type MessageView = {
	id: string;
	kind: MessageKind;
	subject: string;
	body: string;
	mode: 'template' | 'ai';
	sentAt: string | null;
	createdAt: string;
};

const KIND_LABEL: Record<MessageKind, string> = {
	follow_up: 'Follow-up',
	follow_up_2: 'Second follow-up',
	thank_you: 'Thank-you letter',
};

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function Draft({ applicationId, m, contactEmail }: Readonly<{ applicationId: string; m: MessageView; contactEmail: string }>) {
	const id = useId();
	const [subject, setSubject] = useState(m.subject);
	const [body, setBody] = useState(m.body);
	const [note, setNote] = useState('');
	const [pending, startTransition] = useTransition();
	const dirty = subject !== m.subject || body !== m.body;

	const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
		startTransition(async () => {
			const out = await fn();
			setNote(out.ok ? done : (out.error ?? 'Something went wrong. Try again.'));
		});

	return (
		<li className="rounded-box border border-base-100/10 bg-base-300 p-4">
			<p className="mb-3 flex flex-wrap gap-x-3 text-sm text-base-100/60">
				<span className="text-base-100">{KIND_LABEL[m.kind]}</span>
				<span>{m.mode === 'ai' ? 'Written with AI' : 'From a template'}</span>
				<span>{m.sentAt ? `Sent ${dateFmt.format(new Date(m.sentAt))}` : 'Draft'}</span>
			</p>
			<label htmlFor={`${id}-s`} className={labelClass}>
				Subject
			</label>
			<input id={`${id}-s`} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} className={`${field} mb-3 min-h-11`} />
			<label htmlFor={`${id}-b`} className={labelClass}>
				Letter
			</label>
			<textarea id={`${id}-b`} value={body} onChange={(e) => setBody(e.target.value)} rows={10} maxLength={10000} className={field} />
			<div className="mt-3 flex flex-wrap gap-2">
				{dirty && (
					<button type="button" disabled={pending} onClick={() => run(() => updateMessageAction(applicationId, m.id, subject, body), 'Saved.')} className="btn btn-secondary btn-sm min-h-11">
						Save changes
					</button>
				)}
				<button
					type="button"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(`${subject}\n\n${body}`);
							setNote('Copied.');
						} catch {
							setNote('Select the text and copy it.');
						}
					}}
					className="btn btn-outline btn-sm min-h-11 border-base-100/30 text-base-100 hover:bg-base-200"
				>
					Copy
				</button>
				<a href={mailtoLink(contactEmail, subject, body)} className="btn btn-outline btn-sm min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
					Open in my email app
				</a>
				{!m.sentAt && (
					<button type="button" disabled={pending} onClick={() => run(() => markMessageSentAction(applicationId, m.id), 'Marked as sent.')} className="btn btn-outline btn-sm min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
						Mark as sent
					</button>
				)}
				<button
					type="button"
					disabled={pending}
					onClick={() => window.confirm('Delete this letter?') && run(() => deleteMessageAction(applicationId, m.id), 'Deleted.')}
					className="btn btn-ghost btn-sm min-h-11 text-base-100/70"
				>
					Delete
				</button>
			</div>
			<p aria-live="polite" className="mt-2 text-sm text-base-100/70">
				{note}
			</p>
		</li>
	);
}

/** Follow-up and thank-you letters: free templates, or AI for 1 credit. CoverBetter never sends email. */
export default function MessagesPanel({
	applicationId,
	messages,
	interviews,
	paid,
	suggestedKind,
	template,
}: Readonly<{
	applicationId: string;
	messages: MessageView[];
	interviews: InterviewView[];
	paid: boolean;
	suggestedKind: MessageKind;
	template: { applicantName: string; company: string; jobTitle: string; appliedOn: string | null; contactName: string; contactEmail: string; strength: string };
}>) {
	const id = useId();
	const [kind, setKind] = useState<MessageKind>(suggestedKind);
	const [interviewId, setInterviewId] = useState(interviews.at(-1)?.id ?? '');
	const [variant, setVariant] = useState(MESSAGE_TEMPLATES[suggestedKind][0]?.id ?? 'short');
	const [recipientName, setRecipientName] = useState(template.contactName);
	const [recipientEmail, setRecipientEmail] = useState(template.contactEmail);
	const [details, setDetails] = useState('');
	const [error, setError] = useState('');
	const [showBuy, setShowBuy] = useState(false);
	const recipient = { name: recipientName, email: recipientEmail };
	const [pending, startTransition] = useTransition();

	const interview = interviews.find((i) => i.id === interviewId);
	const needsInterview = kind === 'thank_you';
	const blocked = needsInterview && !interview;

	function fromTemplate() {
		setError('');
		const filled = fillTemplate(kind, variant, {
			kind,
			applicantName: template.applicantName,
			company: template.company,
			jobTitle: template.jobTitle,
			appliedOn: template.appliedOn ? new Date(template.appliedOn) : undefined,
			contactName: recipientName.trim() || undefined,
			interviewDate: interview ? new Date(interview.at) : undefined,
			interviewerName: interview?.interviewers.split(/[,(]/)[0]?.trim() || undefined,
			topic: interview?.topics.split(/[\n,.;]/)[0]?.trim() || undefined,
			clarify: interview?.clarify.split(/[\n.;]/)[0]?.trim() || undefined,
			strength: template.strength || undefined,
		});
		startTransition(async () => {
			const out = await saveTemplateMessageAction(applicationId, kind, needsInterview ? interviewId : null, filled.subject, filled.body, recipient);
			if (!out.ok) setError(out.error);
		});
	}

	function withAi() {
		setError('');
		setShowBuy(false);
		startTransition(async () => {
			const out = await writeMessageWithAiAction(applicationId, kind, needsInterview ? interviewId : null, recipient, details);
			if (!out.ok) {
				setError(out.error);
				setShowBuy(out.code === 'no_credits' || out.code === 'pro_cap' || out.code === 'premium');
			}
		});
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 rounded-box border border-base-100/10 bg-base-300 p-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor={`${id}-kind`} className={labelClass}>
							Letter type
						</label>
						<select
							id={`${id}-kind`}
							value={kind}
							onChange={(e) => {
								const k = e.target.value as MessageKind;
								setKind(k);
								setVariant(MESSAGE_TEMPLATES[k][0]?.id ?? 'short');
							}}
							className={`${field} min-h-11`}
						>
							{(Object.keys(KIND_LABEL) as MessageKind[]).map((k) => (
								<option key={k} value={k}>
									{KIND_LABEL[k]}
								</option>
							))}
						</select>
					</div>
					{needsInterview && interviews.length > 0 && (
						<div>
							<label htmlFor={`${id}-iv`} className={labelClass}>
								Interview
							</label>
							<select id={`${id}-iv`} value={interviewId} onChange={(e) => setInterviewId(e.target.value)} className={`${field} min-h-11`}>
								{interviews.map((i) => (
									<option key={i.id} value={i.id}>
										{ROUND_LABEL[i.round]}, {dateFmt.format(new Date(i.at))}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor={`${id}-rn`} className={labelClass}>
							Recipient name
						</label>
						<input id={`${id}-rn`} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} maxLength={200} autoComplete="off" placeholder="For example, the recruiter" className={`${field} min-h-11`} />
					</div>
					<div>
						<label htmlFor={`${id}-re`} className={labelClass}>
							Recipient email
						</label>
						<input id={`${id}-re`} type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} maxLength={200} autoComplete="off" className={`${field} min-h-11`} />
					</div>
					<div className="sm:col-span-2">
						<label htmlFor={`${id}-det`} className={labelClass}>
							Details to include (optional)
						</label>
						<textarea
							id={`${id}-det`}
							value={details}
							onChange={(e) => setDetails(e.target.value)}
							maxLength={600}
							rows={3}
							aria-describedby={`${id}-det-help`}
							placeholder="For example: we met at the job fair, or I finished the portfolio project since I applied."
							className={field}
						/>
						<p id={`${id}-det-help`} className="mt-1 text-sm text-base-100/60">
							The AI uses these details. A template uses only the recipient name. The name and email are saved on the role.
						</p>
					</div>
				</div>
				{blocked ? (
					<p className="text-base-100/70">Add the interview first. The thank-you letter uses your notes about it.</p>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						<div className="flex flex-col gap-3 rounded-lg bg-primary p-4">
							<p className="text-base-100">Free: start from a template</p>
							<label htmlFor={`${id}-var`} className="sr-only">
								Template style
							</label>
							<select id={`${id}-var`} value={variant} onChange={(e) => setVariant(e.target.value as typeof variant)} className={`${field} min-h-11`}>
								{MESSAGE_TEMPLATES[kind].map((v) => (
									<option key={v.id} value={v.id}>
										{v.label}
									</option>
								))}
							</select>
							<button type="button" disabled={pending} onClick={fromTemplate} className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
								Use this template
							</button>
						</div>
						<div className="flex flex-col gap-3 rounded-lg bg-primary p-4">
							<p className="text-base-100">With AI: 1 credit</p>
							<p className="text-sm text-base-100/70">
								{kind === 'thank_you'
									? 'The AI uses your interview notes, the job post, and your letter.'
									: 'The AI uses the job post, your letter, and your strongest matches.'}{' '}
								You pay only when it works.
							</p>
							{paid ? (
								<button type="button" disabled={pending} onClick={withAi} className="btn btn-secondary min-h-11">
									{pending ? 'Writing…' : 'Write with AI'}
								</button>
							) : (
								<Link href="/dashboard/billing" className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
									See plans
								</Link>
							)}
						</div>
					</div>
				)}
				{error && (
					<p role="alert" className="text-error">
						{error}{' '}
						{showBuy && (
							<Link href="/dashboard/billing" className="underline underline-offset-2">
								Go to Billing
							</Link>
						)}
					</p>
				)}
				<p className="text-sm text-base-100/60">CoverBetter does not send email. Copy the letter or open it in your email app, then mark it as sent.</p>
			</div>
			{messages.length > 0 && (
				<ul className="flex flex-col gap-3">
					{messages.map((m) => (
						<Draft key={`${m.id}-${m.subject.length}-${m.body.length}`} applicationId={applicationId} m={m} contactEmail={template.contactEmail} />
					))}
				</ul>
			)}
		</div>
	);
}
