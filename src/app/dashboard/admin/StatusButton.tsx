'use client';

import { useTransition } from 'react';
import { setSupportStatusAction } from './actions';

export default function StatusButton({ id, status, subject }: Readonly<{ id: string; status: 'open' | 'closed'; subject: string }>) {
	const [pending, startTransition] = useTransition();
	const next = status === 'open' ? 'closed' : 'open';
	return (
		<button
			type="button"
			disabled={pending}
			onClick={() => startTransition(async () => void (await setSupportStatusAction(id, next)))}
			aria-label={`${status === 'open' ? 'Close' : 'Open again'}: ${subject}`}
			className="btn btn-sm btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100"
		>
			{pending ? 'Saving…' : status === 'open' ? 'Close' : 'Open again'}
		</button>
	);
}
