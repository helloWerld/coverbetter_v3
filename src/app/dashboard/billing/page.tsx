import PageShell from '@/components/Dashboard/PageShell';
import PlanCard from '@/components/Billing/PlanCard';
import PurchaseCards from '@/components/Billing/PurchaseCards';
import StatusBanner from '@/components/Billing/StatusBanner';
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
		<PageShell title="Billing" intro="Your plan and your letters.">
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
			</div>
		</PageShell>
	);
}
