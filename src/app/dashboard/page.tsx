import { desc, eq } from 'drizzle-orm';
import { resumes } from '@/db/schema';
import PageShell from '@/components/Dashboard/PageShell';
import GenerateForm from '@/components/Generate/GenerateForm';
import { letterStatus } from '@/components/Generate/status';
import { hasPaidFeatures } from '@/lib/access';
import CustomizeApplication, { type CustomizeRole } from '@/components/Roles/CustomizeApplication';
import { getSettings, listApplications } from '@/lib/applications/db';
import type { Status } from '@/lib/applications/types';
import { getProfile } from '@/lib/profile/db';
import { profileHasContent } from '@/lib/tailor';
import { getDb, getEnv } from '@/lib/cf';
import { isLanguageCode } from '@/lib/languages';
import { canPickModel } from '@/lib/model-access';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Customize Application | CoverBetter' };

export default async function GeneratePage({
	searchParams,
}: Readonly<{ searchParams: Promise<{ applicationId?: string | string[] }> }>) {
	const user = await requireUser();
	const sp = await searchParams;
	const applicationId = typeof sp.applicationId === 'string' ? sp.applicationId : '';
	const [rows, settings, apps, profile] = await Promise.all([
		getDb()
			.select({ id: resumes.id, title: resumes.title, text: resumes.text, kind: resumes.kind })
			.from(resumes)
			.where(eq(resumes.userId, user.id))
			.orderBy(desc(resumes.createdAt)),
		getSettings(user.id),
		listApplications(user.id),
		getProfile(user.id),
	]);
	const app = apps.find((a) => a.id === applicationId) ?? null;
	const { text, empty } = letterStatus(user);
	const paid = hasPaidFeatures(user, new Date());
	const resumeTitle = new Map(rows.map((r) => [r.id, r.title]));
	const resumeKind = new Map(rows.map((r) => [r.id, r.kind]));
	const roles: CustomizeRole[] = apps.map((a) => ({
		id: a.id,
		company: a.company,
		jobTitle: a.jobTitle,
		status: a.status as Status,
		hasPost: a.jobDescription.trim().length >= 50,
		resumeTitle: a.resumeId ? (resumeTitle.get(a.resumeId) ?? null) : null,
		hasTailoredResume: a.resumeId ? resumeKind.get(a.resumeId) === 'tailored' : false,
		letterId: a.letterId,
		fitScore: a.fitScore,
	}));
	const letterForm = (
		<GenerateForm
			resumes={rows.map(({ id, title, text }) => ({ id, title, text }))}
			status={text}
			empty={empty}
			showModelPicker={canPickModel(user.email, getEnv().MODEL_PICKER_EMAILS)}
			paid={paid}
			defaults={{
				tone: settings.tone,
				length: settings.length,
				language: isLanguageCode(settings.language) ? settings.language : 'en',
				resumeId: settings.defaultResumeId,
			}}
			application={
				app
					? {
							id: app.id,
							label: [app.jobTitle || 'Untitled job', app.company].filter(Boolean).join(' at '),
							jobDescription: app.jobDescription,
							resumeId: app.resumeId,
						}
					: undefined
			}
		/>
	);

	return (
		<PageShell
			title="Customize Application"
			intro="Pick a role. Then get a tailored resume and a cover letter for its job post, with the Job Fit Score included."
		>
			<CustomizeApplication roles={roles} selectedId={app?.id ?? null} paid={paid} hasProfile={profileHasContent(profile)} />

			{app ? (
				<section aria-labelledby="letter-only" className="flex flex-col gap-4">
					<div>
						<h2 id="letter-only" className="text-2xl font-extralight text-base-100">
							Write only the cover letter
						</h2>
						<p className="mt-1 text-base-100/70">Pick a resume, a tone, and a length. The letter is saved on the role.</p>
					</div>
					{letterForm}
				</section>
			) : (
				<details className="rounded-box border border-base-100/10 bg-base-300 p-5">
					<summary className="flex min-h-11 cursor-pointer items-center text-lg text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
						Write a letter for a job that you did not save
					</summary>
					<p className="mb-4 mt-2 text-base-100/70">Paste the job post. CoverBetter adds the job to Find Roles for you.</p>
					{letterForm}
				</details>
			)}
		</PageShell>
	);
}
