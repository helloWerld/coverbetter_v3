'use client';

import { useState, useTransition } from 'react';
import { setStatusAction } from '@/app/dashboard/applications/actions';
import { STATUSES, STATUS_LABEL, type Status } from '@/lib/applications/types';

const field =
	'rounded-box border border-base-100/10 bg-base-300 px-4 py-2 text-base text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';

/** Changes the status at once. The server records the date of the change. */
export default function StatusSelect({
	applicationId,
	status,
	label,
	className = '',
	onChanged,
}: Readonly<{ applicationId: string; status: Status; label: string; className?: string; onChanged?: (s: Status) => void }>) {
	const [value, setValue] = useState<Status>(status);
	const [error, setError] = useState('');
	const [pending, startTransition] = useTransition();

	function change(next: Status) {
		const prev = value;
		setValue(next);
		setError('');
		startTransition(async () => {
			const out = await setStatusAction(applicationId, next);
			if (!out.ok) {
				setValue(prev);
				setError(out.error);
			} else onChanged?.(next);
		});
	}

	return (
		<span className="inline-flex flex-col">
			<select
				aria-label={label}
				value={value}
				disabled={pending}
				onChange={(e) => change(e.target.value as Status)}
				className={`${field} min-h-11 ${className}`}
			>
				{STATUSES.map((s) => (
					<option key={s} value={s}>
						{STATUS_LABEL[s]}
					</option>
				))}
			</select>
			{error && (
				<span role="alert" className="mt-1 text-sm text-error">
					{error}
				</span>
			)}
		</span>
	);
}
