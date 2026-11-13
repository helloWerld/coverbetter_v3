import PageShell, { Card } from '@/components/Dashboard/PageShell';

export default function LettersPage() {
	return (
		<PageShell title="Letters" intro="Every letter you wrote.">
			<Card title="Coming here">
				<ul className="list-disc space-y-1 pl-5">
					<li>A list of your letters with job title, company, and date.</li>
					<li>Open, edit, export (PDF, DOCX), and delete.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
