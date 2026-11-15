import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'job-application-goal-calculator',
	name: 'Job application goal calculator',
	title: 'How Many Jobs Should I Apply To? Application Goal Calculator',
	description:
		'Enter your goal and your own rates to see how many job applications you need in total, per week, and per weekday. Your numbers only. No made-up averages.',
	keyword: 'how many jobs should I apply to',
	intro:
		'Enter your goal, the weeks you have, and your own rates. The tool shows how many job applications you need in total, per week, and per weekday. It uses no average rates, only your numbers.',
	group: 'Job search planning',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the calculator',
			paragraphs: [
				'Choose your goal: a number of interviews or a number of job offers. Enter how many weeks you want to take. Then enter your own rates.',
				'Your first rate is how many applications you send for each interview. Your second rate is how many interviews you have for each offer. You can enter each rate as a number (1 in 20) or as a percent (5%).',
				'The tool rounds up. It shows the total applications, the applications for each week, and the applications for each weekday. It counts 5 weekdays in a week.',
			],
		},
		{
			heading: 'Why you must use your own rates',
			paragraphs: [
				'No average is right for you. Your rates depend on your field, your level, your resume, the place you live, and how well each job fits you. A number from the internet can lead you to apply too little or to burn out.',
				'This tool has no default rates for that reason. The grey examples in the fields are examples only. Replace them with your numbers after 2 to 3 weeks of applying.',
			],
		},
		{
			heading: 'How to track your own numbers',
			paragraphs: [
				'Keep a simple list in a spreadsheet or a notebook. For each application, write the date, the company, the job title, and what happened next. Update it once a week.',
				'After 2 to 3 weeks, count your applications and your interviews. Divide applications by interviews. If you sent 30 applications and had 2 interviews, you have 15 applications for each interview.',
				'You may have no interview yet. Then the sample is too small. Keep applying and count again later. Be careful with small numbers, because 1 interview can change your rate a lot.',
			],
			list: [
				'Quality counts more than volume. A cover letter and a resume that match the job can raise your rate.',
				'If your rate is low, change something: the jobs you pick, your resume, or your cover letter. Then count again.',
			],
		},
	],
	faqs: [
		{
			q: 'How many jobs should I apply to each week?',
			a: 'It depends on your own rates and your goal. Enter them in the calculator to get a number for your search. Count your own results for 2 to 3 weeks first, so that the number is real.',
		},
		{
			q: 'What are applications per interview?',
			a: 'It is the number of applications you send for each interview you get. If you sent 40 applications and got 2 interviews, you have 20 applications for each interview.',
		},
		{
			q: 'I have no numbers yet. What should I do?',
			a: 'Apply to jobs for 2 to 3 weeks and write down every result. Then enter your own numbers. Until then, the grey example values in the fields are for practice only.',
		},
		{
			q: 'Should I send as many applications as I can?',
			a: 'Not always. A tailored application to a good match often works better than many quick ones. Use the calculator for a plan, then check your results each week and change what is not working.',
		},
	],
	blogSlugs: ['how-many-jobs-should-i-apply-to', 'job-search-plan', 'job-application-tracker', 'job-search-burnout'],
	relatedTools: ['job-search-runway-calculator', 'cover-letter-template', 'job-application-email-subject-line'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
