import Link from 'next/link';
import PageShell from '@/components/Dashboard/PageShell';
import ResumesManager from '@/components/Resumes/ResumesManager';
import TailoredList, { type TailoredView } from '@/components/Resumes/TailoredList';
import { listApplications } from '@/lib/applications/db';
import { getProfile } from '@/lib/profile/db';
import { selectionToDoc } from '@/lib/profile/render';
import { listResumes } from '@/lib/resumes';
import { readSelection } from '@/lib/tailor';
import { requireUser } from '@/lib/user';

export default async function ResumesPage() {
	const user = await requireUser();
	const rows = await listResumes(user.id);
	const uploaded = rows
		.filter((r) => r.kind === 'uploaded')
		.map((r) => ({
			id: r.id,
			title: r.title,
			fileName: r.fileName,
			text: r.text,
			updatedAt: r.updatedAt.toISOString(),
		}));

	const tailoredRows = rows.filter((r) => r.kind === 'tailored');
	let tailored: TailoredView[] = [];
	if (tailoredRows.length > 0) {
		const [profile, apps] = await Promise.all([getProfile(user.id), listApplications(user.id)]);
		const byId = new Map(apps.map((a) => [a.id, a]));
		tailored = tailoredRows.flatMap((r) => {
			const selection = readSelection(r);
			if (!selection) return [];
			const app = r.applicationId ? byId.get(r.applicationId) : undefined;
			return [
				{
					id: r.id,
					title: r.title,
					applicationId: app ? app.id : null,
					applicationLabel: app ? [app.jobTitle, app.company].filter(Boolean).join(' at ') : '',
					company: app?.company ?? '',
					updatedAt: r.updatedAt.toISOString(),
					template: selection.template,
					doc: selectionToDoc(profile, selection),
				},
			];
		});
	}

	return (
		<PageShell title="Manage Resumes" intro="Upload up to 5 resumes. The tailored resume for each role is listed below.">
			<Link href="/dashboard/profile" className="inline-flex min-h-11 w-fit items-center text-neutral underline underline-offset-2 hover:text-base-100">
				Edit your profile
			</Link>
			<section aria-labelledby="uploaded-resumes" className="flex flex-col gap-4">
				<h2 id="uploaded-resumes" className="text-2xl font-extralight text-base-100">
					Uploaded resumes
				</h2>
				<ResumesManager resumes={uploaded} />
			</section>
			<section aria-labelledby="tailored-resumes" className="flex flex-col gap-4">
				<h2 id="tailored-resumes" className="text-2xl font-extralight text-base-100">
					Tailored resumes
				</h2>
				<TailoredList items={tailored} />
			</section>
		</PageShell>
	);
}
