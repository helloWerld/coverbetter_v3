import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'How it works | CoverBetter' };

const STEPS = [
	{
		title: 'Fill in your career profile',
		text: 'Add all your jobs, bullets, education, and skills one time. To start fast, import your LinkedIn data or a resume file. The strength meter tells you what to add next.',
		href: '/dashboard/profile',
		action: 'Open career profile',
	},
	{
		title: 'Add the jobs you want',
		text: 'Add an application for each job. Paste the job post, because the resume, the letter, and the interview prep use it. Each cover letter that you write also adds an application.',
		href: '/dashboard/applications/new',
		action: 'Add an application',
	},
	{
		title: 'Build a tailored resume',
		text: 'On the application, select "Build the resume". Pick the jobs and bullets that match this job post, and put them in order. Then download a PDF or a Word file.',
		href: '/dashboard/applications',
		action: 'See your applications',
	},
	{
		title: 'Write the cover letter',
		text: 'The AI writes a letter from your resume and the job post. Edit it, pick a template, and download it. Paid letters also show your Job Fit Score.',
		href: '/dashboard',
		action: 'Write a letter',
	},
	{
		title: 'Apply, then update the status',
		text: 'After you apply, set the status to "Applied". Change it when the company answers: Interview, Offer, Rejected, or Withdrawn. The date of each change is saved.',
		href: '/dashboard/applications',
		action: 'Update a status',
	},
	{
		title: 'Follow up and say thank you',
		text: 'The Applications page shows "Due now" when a follow-up or a thank-you letter is due. Start from a free template, or let the AI write it. Then send it from your own email.',
		href: '/dashboard/applications',
		action: 'See what is due',
	},
	{
		title: 'Prepare for the interview',
		text: 'Open the interview prep of an application. Practice with the question bank and the STAR answer builder. With credits, the AI makes questions for this exact job.',
		href: '/dashboard/applications',
		action: 'Pick an application',
	},
	{
		title: 'Learn from your results',
		text: 'Analytics shows how many applications reach each stage. Select a stage to see its jobs, and select a job to see all its details.',
		href: '/dashboard/analytics',
		action: 'Open analytics',
	},
] as const;

const FREE = [
	'3 cover letters',
	'Application tracker and analytics',
	'Career profile, with LinkedIn and resume import',
	'Tailored resumes that you build by hand',
	'Follow-up and thank-you letter templates',
	'Interview question bank and STAR answer builder',
];

const CREDIT = [
	'A cover letter, with the Job Fit Score for paid letters',
	'The AI package: tailored resume, cover letter, and Job Fit Score together',
	'A Job Fit Score check without a letter',
	'A follow-up or thank-you letter written by AI',
	'An AI interview prep pack for one job',
];

export default async function HowItWorksPage() {
	await requireUser();
	return (
		<PageShell title="How it works" intro="CoverBetter keeps your whole job search in one place. Do these steps for each job.">
			<ol className="grid gap-4 md:grid-cols-2">
				{STEPS.map((s, i) => (
					<li key={s.title} className="flex flex-col gap-3 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5">
						<h2 className="flex items-center gap-3 text-lg text-base-100">
							<span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm tabular-nums">
								{i + 1}
							</span>
							<span>
								<span className="sr-only">Step {i + 1}: </span>
								{s.title}
							</span>
						</h2>
						<p className="flex-1 text-base-100/75">{s.text}</p>
						<Link href={s.href} className="w-fit text-neutral underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral">
							{s.action}
						</Link>
					</li>
				))}
			</ol>

			<div className="grid gap-4 md:grid-cols-2">
				<Card title="Free for everyone">
					<ul className="list-inside list-disc space-y-1">
						{FREE.map((f) => (
							<li key={f}>{f}</li>
						))}
					</ul>
				</Card>
				<Card title="Uses 1 credit">
					<ul className="list-inside list-disc space-y-1">
						{CREDIT.map((f) => (
							<li key={f}>{f}</li>
						))}
					</ul>
					<p className="mt-3">
						AI tools other than the cover letter need credits or Pro. You pay only when the AI action works. Pro includes 200 credits each month.{' '}
						<Link href="/dashboard/billing" className="text-neutral underline underline-offset-2">
							See plans
						</Link>
					</p>
				</Card>
			</div>

			<Card title="Tips">
				<ul className="list-inside list-disc space-y-1">
					<li>Add numbers to your bullets, for example &quot;Cut costs by 12%&quot;. Strong bullets make strong resumes and letters.</li>
					<li>Paste the full job post. The AI and the fit score are only as good as the post.</li>
					<li>Set your default tone, length, and reminder days in Settings.</li>
					<li>Read every letter before you send it. The AI can make mistakes.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
