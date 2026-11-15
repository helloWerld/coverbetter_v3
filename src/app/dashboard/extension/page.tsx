import PageShell, { Card } from '@/components/Dashboard/PageShell';
import ConnectExtension from './ConnectExtension';

export const metadata = { title: 'Chrome extension | CoverBetter' };

export default function ExtensionPage() {
	return (
		<PageShell
			title="Chrome extension"
			intro="Write a cover letter from the job post you are reading, without leaving the page."
		>
			<Card title="Connect the extension">
				<p>
					Install the CoverBetter extension in Chrome, then click the button below. The extension uses your
					saved resumes and the credits in this account.
				</p>
				<ConnectExtension />
			</Card>
		</PageShell>
	);
}
