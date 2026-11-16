import { desc, eq } from 'drizzle-orm';
import { resumes } from '@/db/schema';
import PageShell from '@/components/Dashboard/PageShell';
import GenerateForm from '@/components/Generate/GenerateForm';
import { letterStatus } from '@/components/Generate/status';
import { hasPaidFeatures } from '@/lib/access';
import { getApplication, getSettings } from '@/lib/applications/db';
import { getDb, getEnv } from '@/lib/cf';
import { isLanguageCode } from '@/lib/languages';
import { canPickModel } from '@/lib/model-access';
import { requireUser } from '@/lib/user';

export default async function GeneratePage({
	searchParams,
}: Readonly<{ searchParams: Promise<{ applicationId?: string | string[] }> }>) {
	const user = await requireUser();
	const sp = await searchParams;
	const applicationId = typeof sp.applicationId === 'string' ? sp.applicationId : '';
	const [rows, settings, app] = await Promise.all([
		getDb()
			.select({ id: resumes.id, title: resumes.title, text: resumes.text })
			.from(resumes)
			.where(eq(resumes.userId, user.id))
			.orderBy(desc(resumes.createdAt)),
		getSettings(user.id),
		applicationId ? getApplication(user.id, applicationId) : Promise.resolve(null),
	]);
	const { text, empty } = letterStatus(user);

	return (
		<PageShell
			title="Write a cover letter"
			intro="Pick a resume, paste the job post, choose a tone and a length."
		>
			<GenerateForm
				resumes={rows}
				status={text}
				empty={empty}
				showModelPicker={canPickModel(user.email, getEnv().MODEL_PICKER_EMAILS)}
				paid={hasPaidFeatures(user, new Date())}
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
		</PageShell>
	);
}
