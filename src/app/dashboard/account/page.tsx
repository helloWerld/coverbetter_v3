import PageShell, { Card } from '@/components/Dashboard/PageShell';
import AccountActions from '@/components/Account/AccountActions';
import DeleteAccount from '@/components/Account/DeleteAccount';
import { requireUser } from '@/lib/user';

export default async function AccountPage() {
	const user = await requireUser();

	return (
		<PageShell title="Account" intro="Your sign-in details.">
			<Card title="Your details">
				<dl className="grid gap-1 sm:grid-cols-[8rem_1fr]">
					<dt>Email</dt>
					<dd className="break-all text-base-100">
						{user.email || 'Not available'}
					</dd>
					<dt>Plan</dt>
					<dd className="text-base-100">
						{user.plan === 'pro' ? 'Pro' : 'Free'}
					</dd>
				</dl>
				<div className="mt-6">
					<AccountActions />
				</div>
			</Card>
			<Card title="Delete account">
				<p className="mb-4">
					Delete your account and all of your data. This cancels any Pro plan
					and cannot be undone.
				</p>
				<DeleteAccount />
			</Card>
		</PageShell>
	);
}
