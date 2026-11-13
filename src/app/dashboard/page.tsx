import PageShell, { Card } from '@/components/Dashboard/PageShell';

export default function GeneratePage() {
	return (
		<PageShell
			title="Generate a cover letter"
			intro="Pick a resume, paste the job post, choose a tone and a length."
		>
			<Card title="Coming here">
				<ul className="list-disc space-y-1 pl-5">
					<li>Resume: pick a saved resume, upload a file, or paste text.</li>
					<li>Job description, tone, and length.</li>
					<li>A Generate button with a progress bar.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
