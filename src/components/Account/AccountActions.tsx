'use client';

import { SignOutButton, useClerk } from '@clerk/nextjs';

const focus =
	'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral';

/** Opens the Clerk profile dialog, and signs out. */
export default function AccountActions() {
	const { openUserProfile } = useClerk();
	return (
		<div className="flex flex-wrap gap-3">
			<button
				type="button"
				onClick={() => openUserProfile()}
				className={`btn btn-outline min-h-11 text-base-100 ${focus}`}
			>
				Manage profile
			</button>
			<SignOutButton redirectUrl="/">
				<button
					type="button"
					className={`btn btn-outline min-h-11 text-base-100 ${focus}`}
				>
					Sign out
				</button>
			</SignOutButton>
		</div>
	);
}
