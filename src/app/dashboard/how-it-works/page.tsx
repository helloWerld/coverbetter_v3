import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'How it works | CoverBetter' };

/** Full class names, so Tailwind keeps them. */
const COLS: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'lg:grid-cols-3' };

// One step for each group of pages in the sidebar. The groups are between the lines.
const STEPS = [
	{
		title: 'Get your documents ready',
		summary: 'Do this one time. Everything after this step uses it.',
		pages: [
			{
				name: 'Build Your Profile',
				href: '/dashboard/profile',
				text: 'Add all your jobs, bullets, education, and skills. To start fast, import your LinkedIn data or a resume file. The strength meter tells you what to add next.',
			},
			{
				name: 'Manage Resumes',
				href: '/dashboard/resumes',
				text: 'Upload up to 5 resumes, for example one for each type of job. The tailored resume for each role is also kept here.',
			},
		],
	},
	{
		title: 'Apply for roles',
		summary: 'Do this for each job that you want.',
		pages: [
			{
				name: 'Find Roles',
				href: '/dashboard/applications',
				text: 'Save each role with its full job post. Check the Job Fit Score of up to 20 saved roles for 1 credit, and pick the best ones. After you apply, set the status to "Applied". Change it when the company answers.',
			},
			{
				name: 'Customize Application',
				href: '/dashboard',
				text: 'Pick a role. With credits, one step writes a tailored resume and a cover letter, with the full Job Fit Score, for 1 credit. Or build the resume by hand for free. Everything is saved on the role.',
			},
			{
				name: 'Follow-ups',
				href: '/dashboard/follow-ups',
				text: 'Find the role, pick a follow-up or a thank-you letter, and add the recipient and any details. Use a free template, or let the AI write it for 1 credit. Then send it from your own email.',
			},
		],
	},
	{
		title: 'Track your results',
		summary: 'See what works, and change your plan.',
		pages: [
			{
				name: 'Analytics',
				href: '/dashboard/analytics',
				text: 'See your numbers and how your roles move from saved to offer. Search for a role by title, company, or keywords. Select it to see the resume, the letter, the follow-ups, and the timeline.',
			},
		],
	},
] as const;

const FREE = [
	'3 cover letters',
	'Role tracking and analytics',
	'Career profile, with LinkedIn and resume import',
	'Tailored resumes that you build by hand',
	'Follow-up and thank-you letter templates',
	'Interview question bank and STAR answer builder',
];

const CREDIT = [
	'A customized application: tailored resume, cover letter, and Job Fit Score together',
	'A cover letter alone, with its Job Fit Score',
	'A Job Fit Score check of up to 20 saved roles',
	'A follow-up or thank-you letter written by AI',
	'An AI interview prep pack for one job',
];

export default async function HowItWorksPage() {
	await requireUser();
	return (
		<PageShell title="How it works" intro="CoverBetter keeps your whole job search in one place. There are 3 steps. The lines in the sidebar separate the pages of each step.">
			<ol className="flex flex-col gap-4">
				{STEPS.map((step, i) => (
					<li key={step.title} className="flex flex-col gap-4 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
						<div>
							<h2 className="flex items-center gap-3 text-xl text-base-100">
								<span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm tabular-nums">
									{i + 1}
								</span>
								<span>
									<span className="sr-only">Step {i + 1}: </span>
									{step.title}
								</span>
							</h2>
							<p className="mt-1 text-base-100/70 sm:pl-11">{step.summary}</p>
						</div>
						<ul className={`grid gap-3 ${COLS[step.pages.length] ?? ''}`}>
							{step.pages.map((page) => (
								<li key={page.href} className="flex flex-col gap-2 rounded-lg border border-base-100/10 bg-base-300 p-4">
									<h3>
										<Link href={page.href} className="text-lg text-neutral underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral">
											{page.name}
										</Link>
									</h3>
									<p className="text-base-100/75">{page.text}</p>
								</li>
							))}
						</ul>
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
					<li>Use the interview prep on each role profile. The question bank is free.</li>
					<li>Set your default tone, length, and reminder days in Settings.</li>
					<li>Read every letter before you send it. The AI can make mistakes.</li>
				</ul>
			</Card>
		</PageShell>
	);
}
