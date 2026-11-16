import Link from 'next/link';
import PageShell from '@/components/Dashboard/PageShell';
import ApplicationForm from '@/components/Applications/ApplicationForm';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Add a role | CoverBetter' };

export default async function NewApplicationPage() {
	await requireUser();
	return (
		<PageShell title="Add a role" intro="Add a role that you want to apply for. Paste the job post. You can change everything later.">
			<Link href="/dashboard/applications" className="w-fit text-neutral underline underline-offset-2">
				Back to Find Roles
			</Link>
			<ApplicationForm />
		</PageShell>
	);
}
