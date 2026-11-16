import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/components/Dashboard/PageShell';
import { profileItems } from '@/components/Prep/helpers';
import PrepWorkspace from '@/components/Prep/PrepWorkspace';
import { hasPaidFeatures } from '@/lib/access';
import { getApplication } from '@/lib/applications/db';
import { latestPrepPack, listAnswers } from '@/lib/prep/db';
import { detectFamily } from '@/lib/prep/question-bank';
import { getProfile } from '@/lib/profile/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Interview prep | CoverBetter' };

export default async function PrepPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	const user = await requireUser();
	const app = await getApplication(user.id, id);
	if (!app) notFound();

	const [pack, answers, profile] = await Promise.all([
		latestPrepPack(user.id, app.id),
		listAnswers(user.id, app.id),
		getProfile(user.id),
	]);
	const paid = hasPaidFeatures(user, new Date());
	const label = [app.jobTitle || 'Untitled job', app.company].filter(Boolean).join(' at ');

	return (
		<PageShell title="Interview prep" intro={label}>
			<Link
				href={`/dashboard/applications/${app.id}`}
				className="inline-flex min-h-11 items-center self-start text-neutral underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100"
			>
				Back to the role profile
			</Link>
			<PrepWorkspace
				applicationId={app.id}
				defaultFamily={detectFamily(app.jobTitle, app.jobDescription)}
				paid={paid}
				initialPack={pack?.data ?? null}
				initialAnswers={Object.fromEntries(answers.map((a) => [a.questionId, a.json]))}
				items={profileItems(profile)}
			/>
		</PageShell>
	);
}
