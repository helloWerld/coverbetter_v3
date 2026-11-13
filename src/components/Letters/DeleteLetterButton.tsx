'use client';

import { useState, useTransition } from 'react';
import { removeLetter } from '@/app/dashboard/letters/actions';

/** Two-step delete. The first click asks, the second click deletes. */
export default function DeleteLetterButton({
	id,
	label,
}: Readonly<{ id: string; label: string }>) {
	const [asking, setAsking] = useState(false);
	const [error, setError] = useState('');
	const [pending, start] = useTransition();

	if (!asking)
		return (
			<button
				type="button"
				className="btn btn-ghost min-h-11 text-red-300 hover:bg-red-500/10"
				onClick={() => setAsking(true)}
				aria-label={`Delete ${label}`}
			>
				Delete
			</button>
		);

	return (
		<div role="group" aria-label={`Confirm delete ${label}`} className="flex flex-wrap items-center gap-2">
			<span className="text-sm text-base-100/80">Delete this letter?</span>
			<button
				type="button"
				className="btn min-h-11 border-red-500 bg-red-600 text-white hover:bg-red-500"
				disabled={pending}
				autoFocus
				onClick={() =>
					start(async () => {
						const res = await removeLetter(id);
						if (!res.ok) setError(res.error);
					})
				}
			>
				{pending ? 'Deleting...' : 'Yes, delete'}
			</button>
			<button
				type="button"
				className="btn btn-ghost min-h-11"
				onClick={() => setAsking(false)}
				disabled={pending}
			>
				Cancel
			</button>
			<span role="alert" className="text-sm text-red-300 empty:hidden">
				{error}
			</span>
		</div>
	);
}
