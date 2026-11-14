import PageShell from '@/components/Dashboard/PageShell';
import AccountProfile from '@/components/Account/AccountProfile';
import { isProActive } from '@/lib/access';
import { requireUser } from '@/lib/user';

// The catch-all route lets Clerk show its own tabs (security, plan) under /dashboard/account.
export default async function AccountPage() {
	const user = await requireUser();
	const planLabel = isProActive(user, new Date())
		? 'Pro'
		: user.credits > 0
			? `Pay as you go (${user.credits} ${user.credits === 1 ? 'letter' : 'letters'} left)`
			: 'Free';

	return (
		<PageShell title="Account" intro="Your profile, sign-in, and plan.">
			<AccountProfile email={user.email ?? ''} planLabel={planLabel} />
		</PageShell>
	);
}
