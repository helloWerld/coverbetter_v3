import PageShell, { Card } from '@/components/Dashboard/PageShell';

export default function AccountPage() {
	return (
		<PageShell title="Account" intro="Your sign-in details.">
			<Card title="Coming here">
				<ul className="list-disc space-y-1 pl-5">
					<li>Your email address.</li>
					<li>Sign out.</li>
					<li>Delete your account and all of your data.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
