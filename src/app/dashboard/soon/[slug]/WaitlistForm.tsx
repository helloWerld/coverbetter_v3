'use client';

import { useActionState } from 'react';
import { joinWaitlist, type WaitlistState } from './actions';

const initial: WaitlistState = { status: 'idle', message: '' };

export default function WaitlistForm({
	feature,
	defaultEmail,
}: Readonly<{ feature: string; defaultEmail: string }>) {
	const [state, action, pending] = useActionState(joinWaitlist, initial);

	return (
		<form action={action} className="flex max-w-md flex-col gap-3" noValidate>
			<input type="hidden" name="feature" value={feature} />
			<label htmlFor="waitlist-email" className="text-sm text-base-100">
				Email address
			</label>
			<input
				id="waitlist-email"
				name="email"
				type="email"
				autoComplete="email"
				required
				defaultValue={defaultEmail}
				aria-describedby="waitlist-status"
				className="input input-bordered min-h-11 w-full bg-primary text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
			/>
			<button
				type="submit"
				disabled={pending}
				className="btn btn-secondary min-h-11 w-full disabled:cursor-not-allowed sm:w-fit"
			>
				{pending ? 'Saving...' : 'Tell me when it is ready'}
			</button>
			<p
				id="waitlist-status"
				role="status"
				className={`min-h-6 text-sm ${
					state.status === 'error' ? 'text-error' : 'text-success'
				}`}
			>
				{state.message}
			</p>
		</form>
	);
}
