'use client';

import { UserProfile } from '@clerk/nextjs';
import { FaCreditCard } from 'react-icons/fa6';
import Link from 'next/link';
import DeleteAccount from './DeleteAccount';

/**
 * The one Account section: the Clerk profile shown in the page, plus a "Plan" tab.
 * Clerk's own delete button is hidden, because it deletes only the sign-in.
 * Our delete also removes letters, resumes, files, and the Stripe plan.
 */
export default function AccountProfile({
	email,
	planLabel,
}: Readonly<{ email: string; planLabel: string }>) {
	return (
		<UserProfile
			routing="path"
			path="/dashboard/account"
			appearance={{
				elements: {
					rootBox: 'w-full',
					cardBox: 'w-full max-w-none shadow-none',
					profileSection__danger: 'hidden',
				},
			}}
		>
			<UserProfile.Page label="account" />
			<UserProfile.Page label="security" />
			<UserProfile.Page label="Plan" url="plan" labelIcon={<FaCreditCard aria-hidden />}>
				<div className="flex flex-col gap-8 text-base-100">
					<section>
						<h2 className="text-lg font-semibold">Plan</h2>
						<dl className="mt-3 grid gap-1 text-sm sm:grid-cols-[8rem_1fr]">
							<dt className="text-base-100/70">Email</dt>
							<dd className="break-all">{email || 'Not available'}</dd>
							<dt className="text-base-100/70">Plan</dt>
							<dd>{planLabel}</dd>
						</dl>
						<Link
							href="/dashboard/billing"
							className="btn btn-secondary mt-4 min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
						>
							Go to Billing
						</Link>
					</section>
					<section>
						<h2 className="text-lg font-semibold">Delete account</h2>
						<p className="mb-4 mt-2 text-sm text-base-100/70">
							Delete your account and all of your data. This cancels any Pro plan and
							cannot be undone.
						</p>
						<DeleteAccount />
					</section>
				</div>
			</UserProfile.Page>
		</UserProfile>
	);
}
