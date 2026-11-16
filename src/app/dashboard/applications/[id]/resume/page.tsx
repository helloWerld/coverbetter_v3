import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import ResumeBuilder from '@/components/ResumeBuilder/ResumeBuilder';
import { hasPaidFeatures } from '@/lib/access';
import { getApplication, getSettings } from '@/lib/applications/db';
import { getResume } from '@/lib/resumes';
import { getProfile } from '@/lib/profile/db';
import { readSelection } from '@/lib/tailor';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Tailored resume | CoverBetter' };

export default async function TailoredResumePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	const user = await requireUser();
	const app = await getApplication(user.id, id);
	if (!app) notFound();

	const [profile, settings] = await Promise.all([getProfile(user.id), getSettings(user.id)]);
	const intro = [app.jobTitle, app.company].filter(Boolean).join(' at ') || 'This application';
	const back = (
		<Link href={`/dashboard/applications/${app.id}`} className="inline-flex min-h-11 w-fit items-center text-neutral underline underline-offset-2 hover:text-base-100">
			Back to the role profile
		</Link>
	);

	if (profile.positions.length === 0) {
		return (
			<PageShell title="Tailored resume" intro={intro}>
				{back}
				<Card title="Fill in your career profile first">
					<p>Add your jobs and bullets to your career profile. Then you can build a resume for this job.</p>
					<Link href="/dashboard/profile" className="btn btn-secondary mt-4 min-h-11">
						Open your career profile
					</Link>
				</Card>
			</PageShell>
		);
	}

	let current: { id: string; title: string; selection: NonNullable<ReturnType<typeof readSelection>> } | null = null;
	if (app.resumeId) {
		const row = await getResume(user.id, app.resumeId);
		const selection = row && row.kind === 'tailored' ? readSelection(row) : null;
		if (row && selection) current = { id: row.id, title: row.title, selection };
	}

	return (
		<PageShell title="Tailored resume" intro={intro}>
			{back}
			<ResumeBuilder
				applicationId={app.id}
				jobTitle={app.jobTitle}
				company={app.company}
				jobDescription={app.jobDescription}
				profile={profile}
				paid={hasPaidFeatures(user, new Date())}
				initialResumeId={current?.id ?? null}
				initialTitle={current?.title ?? null}
				initialSelection={current?.selection ?? null}
				defaultTemplate={settings.template}
			/>
		</PageShell>
	);
}
