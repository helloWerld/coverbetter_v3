import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'job-description-red-flags',
	name: 'Job description red flags checker',
	title: 'Job Description Red Flags: Check a Job Post for Warning Signs',
	description:
		'Paste a job post and see phrases that can signal scams, unclear pay, heavy workload, or a vague role. Each one comes with a question to ask in the interview.',
	keyword: 'job description red flags',
	intro:
		'This tool checks a job post for job description red flags. Paste the post, and it marks about 45 common phrases, scam signs, and missing pay details, with a question to ask for each. It runs in your browser, and the text goes nowhere.',
	group: 'Job search planning',
	storage: 'none',
	guide: [
		{
			heading: 'How to use this checker',
			paragraphs: [
				'Paste the whole job post into the box. The tool marks each phrase it knows and groups the results into 4 types: scam signs, pay, workload and culture, and vague role.',
				'Scam signs come first, because they matter most. For each result you see what the phrase can mean, and a question you can ask in the interview.',
			],
		},
		{
			heading: 'A phrase is a reason to ask, not a verdict',
			paragraphs: [
				'Good employers also write “fast-paced” or “self-starter”. A phrase tells you what to ask, nothing more. Pick the two or three questions that matter most to you and ask them in a calm way.',
				'Listen to how the answer sounds. A clear answer with real examples is a good sign. A vague answer, or no answer, tells you something too.',
			],
			list: [
				'Ask for the pay range early, if the post does not give one.',
				'Ask what a normal week looks like, and who did the work before you.',
				'Ask how the team handles extra hours and time off.',
			],
		},
		{
			heading: 'How to protect yourself from job scams',
			paragraphs: [
				'A real employer does not ask you to pay a fee, buy equipment first, or deposit a check and send money back. A real employer asks for your bank details or Social Security number only after you accept an offer, on a secure form.',
				'Check the company on its own website, and check that the recruiter works there. If something feels wrong, stop and read the FTC guide to job scams at consumer.ftc.gov. This tool does not give legal advice.',
			],
		},
	],
	faqs: [
		{
			q: 'Does one red flag mean I should not apply?',
			a: 'No. One phrase alone is not proof of a bad job. Use it as a reason to ask a question, and look at the whole picture.',
		},
		{
			q: 'Why does the tool flag a missing pay range?',
			a: 'A post with no pay figure leaves you without a way to compare the job. Some places do not require a range, so ask for it early.',
		},
		{
			q: 'What are the most common job scam signs?',
			a: 'A fee, a check you must deposit, an interview only on a chat app, and a request for your bank details or SSN before an offer. Pressure to act today is also common.',
		},
		{
			q: 'Does the tool send my job post anywhere?',
			a: 'No. The check runs in your browser. The text is not sent or saved.',
		},
	],
	blogSlugs: ['job-scams', 'ghost-jobs', 'questions-to-ask-in-an-interview', 'how-to-negotiate-salary'],
	relatedTools: ['job-offer-comparison-calculator', 'salary-to-hourly-calculator', 'interview-question-practice'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
