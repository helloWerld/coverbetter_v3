import PageShell from '@/components/Dashboard/PageShell';
import PlanCard from '@/components/Billing/PlanCard';
import PurchaseCards from '@/components/Billing/PurchaseCards';
import StatusBanner from '@/components/Billing/StatusBanner';
import DeleteAccount from '@/components/Account/DeleteAccount';
import { getEnv } from '@/lib/cf';
import { requireUser } from '@/lib/user';
import { paymentsOpenFor } from '@/lib/billing';
import { isProActive } from '@/lib/access';

export default async function BillingPage({
	searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
	const [{ status }, user] = await Promise.all([searchParams, requireUser()]);
	// With Stripe test keys, only the test accounts see working buttons.
	const configured = paymentsOpenFor(getEnv(), user.email);

	return (
		<PageShell title="Billing" intro="Your plan and your credits.">
			{/* On wide screens this column is as wide as the row of three boxes,
			    so "Your plan" lines up with them. */}
			<div className="flex w-full flex-col gap-6 lg:w-fit">
				<StatusBanner status={status} />
				<PlanCard user={user} />
				<PurchaseCards
					configured={configured}
					hasCustomer={Boolean(user.stripeCustomerId)}
					isPro={isProActive(user, new Date())}
				/>
				<section
					aria-labelledby="delete-heading"
					className="mt-6 border-t border-base-100/10 pt-6"
				>
					<h2 id="delete-heading" className="text-lg font-semibold text-base-100">
						Delete account
					</h2>
					<p className="mb-4 mt-2 max-w-prose text-sm text-base-100/70">
						Delete your account and all of your data. This cancels any Pro plan and
						cannot be undone.
					</p>
					<DeleteAccount />
				</section>
			</div>
		</PageShell>
	);
}
