import PageShell from '@/components/Dashboard/PageShell';
import ResumesManager from '@/components/Resumes/ResumesManager';
import { listResumes } from '@/lib/resumes';
import { requireUser } from '@/lib/user';

export default async function ResumesPage() {
	const user = await requireUser();
	const rows = await listResumes(user.id);
	const resumes = rows.map((r) => ({
		id: r.id,
		title: r.title,
		fileName: r.fileName,
		text: r.text,
		updatedAt: r.updatedAt.toISOString(),
	}));

	return (
		<PageShell title="Resumes" intro="Save up to 5 resumes. Pick one when you write a letter.">
			<ResumesManager resumes={resumes} />
		</PageShell>
	);
}
