import PageShell from '@/components/Dashboard/PageShell';
import PlanCard from '@/components/Billing/PlanCard';
import PurchaseCards from '@/components/Billing/PurchaseCards';
import StatusBanner from '@/components/Billing/StatusBanner';
import { getEnv } from '@/lib/cf';
import { requireUser } from '@/lib/user';
import { isStripeConfigured } from '@/lib/billing';

export default async function BillingPage({
	searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
	const [{ status }, user] = await Promise.all([searchParams, requireUser()]);
	const configured = isStripeConfigured(getEnv());

	return (
		<PageShell title="Billing" intro="Your plan and your letters.">
			<StatusBanner status={status} />
			<PlanCard user={user} />
			<PurchaseCards
				configured={configured}
				hasCustomer={Boolean(user.stripeCustomerId)}
			/>
		</PageShell>
	);
}
