'use client';

import { useState, useTransition } from 'react';
import { deleteResumeAction } from '@/app/dashboard/resumes/actions';
import Dialog from './Dialog';
import type { ResumeView } from './types';

export default function DeleteDialog({
	resume,
	onClose,
}: Readonly<{ resume: ResumeView | null; onClose: () => void }>) {
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function close() {
		setError(null);
		onClose();
	}

	function confirm() {
		if (!resume) return;
		startTransition(async () => {
			const res = await deleteResumeAction({ id: resume.id });
			if (res.ok) close();
			else setError(res.error);
		});
	}

	return (
		<Dialog open={resume !== null} onClose={close} labelledBy="delete-title">
			{resume && (
				<div className="flex flex-col gap-4">
					<h2 id="delete-title" className="text-xl text-base-100">
						Delete this resume?
					</h2>
					<p className="text-base-100/70">
						&ldquo;{resume.title}&rdquo; and its original file will be removed. You cannot undo this.
					</p>
					{error && (
						<p role="alert" className="text-sm text-error">
							{error}
						</p>
					)}
					<div className="flex flex-wrap justify-end gap-3">
						<button type="button" onClick={close} className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11">
							Keep it
						</button>
						<button type="button" onClick={confirm} disabled={pending} className="btn btn-error min-h-11">
							{pending ? 'Deleting...' : 'Delete resume'}
						</button>
					</div>
				</div>
			)}
		</Dialog>
	);
}
