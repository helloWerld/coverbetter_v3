'use client';

import { useActionState, useRef, useState } from 'react';
import {
	deleteAccountAction,
	type DeleteState,
} from '@/app/dashboard/account/actions';

const focus =
	'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral';

/** "Delete account" button and a confirm dialog that needs the word DELETE. */
export default function DeleteAccount() {
	const dialog = useRef<HTMLDialogElement>(null);
	const [typed, setTyped] = useState('');
	const [state, action, pending] = useActionState<DeleteState, FormData>(
		deleteAccountAction,
		null,
	);

	return (
		<>
			<button
				type="button"
				onClick={() => dialog.current?.showModal()}
				className={`btn btn-error btn-outline min-h-11 ${focus}`}
			>
				Delete account
			</button>

			<dialog
				ref={dialog}
				aria-labelledby="delete-title"
				className="m-auto w-[calc(100%-2rem)] max-w-md rounded-box border border-base-100/20 bg-base-300 p-6 text-base-100 backdrop:bg-black/70"
				onClose={() => setTyped('')}
			>
				<form action={action}>
					<h2 id="delete-title" className="text-xl">
						Delete your account?
					</h2>
					<p className="mt-3 text-base-100/70">
						This deletes your resumes, your letters, and your sign-in. It
						cancels any Pro plan. Unused paid letters are lost. You cannot
						undo this.
					</p>
					<label htmlFor="delete-confirm" className="mt-4 block text-sm">
						Type DELETE to confirm
					</label>
					<input
						id="delete-confirm"
						name="confirm"
						type="text"
						autoComplete="off"
						value={typed}
						onChange={(e) => setTyped(e.target.value)}
						aria-describedby={state?.error ? 'delete-error' : undefined}
						className={`input input-bordered mt-1 min-h-11 w-full bg-primary ${focus}`}
					/>
					{state?.error && (
						<p id="delete-error" role="alert" className="mt-2 text-error">
							{state.error}
						</p>
					)}
					<div className="mt-6 flex flex-wrap justify-end gap-3">
						<button
							type="button"
							onClick={() => dialog.current?.close()}
							className={`btn btn-ghost min-h-11 ${focus}`}
						>
							Keep my account
						</button>
						<button
							type="submit"
							disabled={typed !== 'DELETE' || pending}
							className={`btn btn-error min-h-11 ${focus}`}
						>
							{pending ? 'Deleting...' : 'Delete everything'}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}
