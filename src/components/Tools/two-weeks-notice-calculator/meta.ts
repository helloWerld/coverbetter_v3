import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'two-weeks-notice-calculator',
	name: 'Two weeks notice calculator',
	title: 'Two Weeks Notice Calculator: Find Your Last Day',
	description:
		'Pick the day you give notice and see your last working day, the working days left, and US federal holidays. Count calendar or business days.',
	keyword: 'two weeks notice calculator',
	intro:
		'This two weeks notice calculator shows your last working day from the day you give notice. Choose 1 to 4 weeks or your own number of days, count calendar or business days, and skip US federal holidays if you want.',
	group: 'Pay, offers, and leaving a job',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the calculator',
			paragraphs: [
				'Pick the day you plan to give notice. Choose the notice length. Then choose how to count. The result changes as you change the form.',
				'The count starts the day after you give notice. If you give notice on a Monday and count 14 calendar days, your last day is the Monday two weeks later.',
			],
			list: [
				'Calendar days count every day. If the last day falls on a weekend, the tool moves it to the Friday before.',
				'Business days count Monday to Friday only. 1 week is 5 business days.',
				'Turn on “Skip US federal holidays” if your employer gives these days off. Turn it off if it does not.',
			],
		},
		{
			heading: 'Check these things before you pick a last day',
			paragraphs: [
				'Two weeks is a common custom in the US. It is not a law for most jobs. Your contract or your employer’s policy may ask for more, or for less.',
				'Some employers pay you only until your last day. Some ask you to leave on the day you give notice. Ask your manager or HR what happens to your pay, your benefits, and your unused time off.',
				'This tool does not give legal advice. If you are not sure what your contract says, read it or ask HR before you give notice.',
			],
		},
		{
			heading: 'Plan the last two weeks',
			paragraphs: [
				'Write a short list of the work you can finish and the work you must hand over. Share it with your manager early. A calm, clear handover helps your references later.',
				'When you know your last day, put it in your resignation letter. Use the .ics file to add the day to your calendar.',
			],
		},
	],
	faqs: [
		{
			q: 'Do I have to give two weeks notice?',
			a: 'In most US jobs the law does not require it, but many contracts and policies do. Check your contract and your employer’s policy. Two weeks is the usual custom.',
		},
		{
			q: 'Does the day I give notice count as day 1?',
			a: 'In this tool, no. The count starts the next day. Your employer may count in a different way, so confirm the last day with them in writing.',
		},
		{
			q: 'What if my last day is on a weekend or a holiday?',
			a: 'In calendar mode, the tool moves the last day back to the last working day before it. Many people also pick a last day that falls on a Friday.',
		},
		{
			q: 'Are all of these holidays days off at my job?',
			a: 'Not always. These are US federal holidays. Private employers choose their own list. Turn the holiday setting off if your job does not close on them.',
		},
	],
	blogSlugs: ['two-weeks-notice-letter', 'job-search-while-employed', 'how-to-compare-job-offers', 'how-to-decline-a-job-offer'],
	relatedTools: ['resignation-letter-template', 'job-offer-comparison-calculator', 'salary-to-hourly-calculator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
