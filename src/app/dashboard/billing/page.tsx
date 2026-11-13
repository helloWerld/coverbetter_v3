import PageShell, { Card } from '@/components/Dashboard/PageShell';

export default function BillingPage() {
	return (
		<PageShell title="Billing" intro="Your plan and your letters.">
			<Card title="Coming here">
				<ul className="list-disc space-y-1 pl-5">
					<li>Your plan and the number of letters you have left.</li>
					<li>Buy a letter pack with Stripe Checkout.</li>
					<li>Start Pro, or manage it in the Stripe portal.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
