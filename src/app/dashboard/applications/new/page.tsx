import Link from 'next/link';
import PageShell from '@/components/Dashboard/PageShell';
import ApplicationForm from '@/components/Applications/ApplicationForm';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Add an application | CoverBetter' };

export default async function NewApplicationPage() {
	await requireUser();
	return (
		<PageShell title="Add an application" intro="Add a job that you want to apply for. You can change everything later.">
			<Link href="/dashboard/applications" className="w-fit text-neutral underline underline-offset-2">
				Back to applications
			</Link>
			<ApplicationForm />
		</PageShell>
	);
}
