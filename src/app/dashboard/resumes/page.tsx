import PageShell, { Card } from '@/components/Dashboard/PageShell';

export default function ResumesPage() {
	return (
		<PageShell title="Resumes" intro="Save up to 5 resumes.">
			<Card title="Coming here">
				<ul className="list-disc space-y-1 pl-5">
					<li>Upload a PDF or DOCX file, up to 5 MB, or paste text.</li>
					<li>Check and correct the text that we read from your file.</li>
					<li>Rename and delete resumes.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
