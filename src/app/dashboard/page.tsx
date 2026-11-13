import { desc, eq } from 'drizzle-orm';
import { resumes } from '@/db/schema';
import PageShell from '@/components/Dashboard/PageShell';
import GenerateForm from '@/components/Generate/GenerateForm';
import { letterStatus } from '@/components/Generate/status';
import { getDb } from '@/lib/cf';
import { requireUser } from '@/lib/user';

export default async function GeneratePage() {
	const user = await requireUser();
	const rows = await getDb()
		.select({ id: resumes.id, title: resumes.title, text: resumes.text })
		.from(resumes)
		.where(eq(resumes.userId, user.id))
		.orderBy(desc(resumes.createdAt));
	const { text, empty } = letterStatus(user);

	return (
		<PageShell
			title="Generate a cover letter"
			intro="Pick a resume, paste the job post, choose a tone and a length."
		>
			<GenerateForm resumes={rows} status={text} empty={empty} />
		</PageShell>
	);
}
