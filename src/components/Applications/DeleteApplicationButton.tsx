'use client';

import { useTransition } from 'react';
import { deleteApplicationAction } from '@/app/dashboard/applications/actions';

export default function DeleteApplicationButton({ applicationId, label }: Readonly<{ applicationId: string; label: string }>) {
	const [pending, startTransition] = useTransition();
	return (
		<div className="flex flex-col gap-2 border-t border-base-100/10 pt-6">
			<button
				type="button"
				disabled={pending}
				onClick={() => {
					if (!window.confirm(`Delete the application "${label}"? The interviews, notes, and follow-up letters go too. Your cover letter and resumes stay.`)) return;
					startTransition(async () => {
						await deleteApplicationAction(applicationId);
					});
				}}
				className="btn btn-ghost min-h-11 w-fit text-error"
			>
				{pending ? 'Deleting…' : 'Delete this application'}
			</button>
		</div>
	);
}
