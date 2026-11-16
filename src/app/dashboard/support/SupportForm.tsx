'use client';

import { useRef, useState, useTransition } from 'react';
import { MESSAGE_MAX, SUBJECT_MAX, SUPPORT_TOPICS } from '@/lib/support/validate';
import { sendSupportAction } from './actions';

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const label = 'mb-2 block text-sm font-medium text-base-100';

export default function SupportForm({ email }: Readonly<{ email: string }>) {
	const form = useRef<HTMLFormElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);
	const [length, setLength] = useState(0);
	const [pending, startTransition] = useTransition();

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setError(null);
		setSent(false);
		startTransition(async () => {
			const out = await sendSupportAction(data);
			if (!out.ok) {
				setError(out.error);
				return;
			}
			form.current?.reset();
			setLength(0);
			setSent(true);
		});
	}

	return (
		<form ref={form} onSubmit={submit} className="flex flex-col gap-4">
			<div>
				<label htmlFor="support-topic" className={label}>
					Topic
				</label>
				<select id="support-topic" name="topic" required defaultValue="" disabled={pending} className={`${field} min-h-11`}>
					<option value="" disabled>
						Pick a topic
					</option>
					{SUPPORT_TOPICS.map((t) => (
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
			</div>
			<div>
				<label htmlFor="support-subject" className={label}>
					Subject
				</label>
				<input id="support-subject" name="subject" required maxLength={SUBJECT_MAX} disabled={pending} className={`${field} min-h-11`} />
			</div>
			<div>
				<label htmlFor="support-message" className={label}>
					Message
				</label>
				<textarea
					id="support-message"
					name="message"
					required
					minLength={10}
					maxLength={MESSAGE_MAX}
					rows={7}
					disabled={pending}
					onChange={(e) => setLength(e.target.value.length)}
					aria-describedby="support-help"
					className={`${field} resize-y`}
				/>
				<p id="support-help" className="mt-1 text-xs text-base-100/60">
					Tell us what you did and what happened. {length.toLocaleString('en-US')} of {MESSAGE_MAX.toLocaleString('en-US')} characters.
				</p>
			</div>
			<p className="text-sm text-base-100/70">
				We answer by email at <span className="break-all text-base-100">{email || 'the email of your account'}</span>.
			</p>
			{error && (
				<p role="alert" className="text-error">
					{error}
				</p>
			)}
			<div aria-live="polite">
				{sent && (
					<p className="rounded-box border border-secondary/50 bg-base-300 p-4 text-base-100">
						We got your request. We will answer by email.
					</p>
				)}
			</div>
			<button type="submit" disabled={pending} className="btn btn-secondary min-h-11 w-fit">
				{pending ? 'Sending…' : 'Send the request'}
			</button>
		</form>
	);
}
