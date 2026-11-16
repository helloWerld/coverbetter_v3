import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'How it works | CoverBetter' };

const STEPS = [
	{
		title: 'Build your profile',
		text: 'Add all your jobs, bullets, education, and skills one time. To start fast, import your LinkedIn data or a resume file. The strength meter tells you what to add next.',
		href: '/dashboard/profile',
		action: 'Build your profile',
	},
	{
		title: 'Manage your resumes',
		text: 'Upload up to 5 resumes, for example one for each type of job. The tailored resume for each role is also kept here.',
		href: '/dashboard/resumes',
		action: 'Manage resumes',
	},
	{
		title: 'Find roles',
		text: 'Save each role that you want, with its full job post. Then check the Job Fit Score of up to 20 saved roles for 1 credit, and pick the best ones.',
		href: '/dashboard/applications',
		action: 'Find roles',
	},
	{
		title: 'Customize the application',
		text: 'Pick a role. With credits, one step writes a tailored resume and a cover letter, with the full Job Fit Score included, for 1 credit. Or build the resume by hand for free.',
		href: '/dashboard',
		action: 'Customize an application',
	},
	{
		title: 'Apply, then update the status',
		text: 'After you apply, set the status to "Applied" on the role. Change it when the company answers: Interview, Offer, Rejected, or Withdrawn. The date of each change is saved.',
		href: '/dashboard/applications',
		action: 'Update a status',
	},
	{
		title: 'Follow up and say thank you',
		text: 'Find the role, pick the type of letter, and add the recipient and any details. Start from a free template, or let the AI write it for 1 credit. Then send it from your own email.',
		href: '/dashboard/follow-ups',
		action: 'Open follow-ups',
	},
	{
		title: 'Prepare for the interview',
		text: 'Open the role profile, then the interview prep. Practice with the question bank and the STAR answer builder. With credits, the AI makes questions for this exact job.',
		href: '/dashboard/applications',
		action: 'Pick a role',
	},
	{
		title: 'Track your results',
		text: 'Analytics shows your numbers and how your roles move from saved to offer. Search for a role by title, company, or keywords, and select it to see everything about it.',
		href: '/dashboard/analytics',
		action: 'Open analytics',
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
		<PageShell title="How it works" intro="CoverBetter keeps your whole job search in one place. The sidebar groups the pages in the same order.">
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
