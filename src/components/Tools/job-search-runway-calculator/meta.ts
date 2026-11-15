import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'job-search-runway-calculator',
	name: 'Job search runway calculator',
	title: 'How Long Will My Savings Last? Job Search Runway Calculator',
	description:
		'See how many months your savings will last during a job search. Enter savings, costs, and income to get your runway, the end date, and a month table.',
	keyword: 'how long will my savings last',
	intro:
		'Enter your savings, your monthly costs, and any income during the search. The tool shows how many months your savings will last and the date they run out. It also shows your balance for each month.',
	group: 'Job search planning',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the calculator',
			paragraphs: [
				'Enter the savings that you can use during the search. Then enter your monthly costs. Add income that you expect each month, such as severance, unemployment benefits, or part-time work.',
				'Use the one-time costs field for money that you pay once, such as a move, a course, or a laptop. The tool takes this money from your savings at the start.',
				'The tool divides your savings by the money you lose each month. This is your monthly costs minus your monthly income. The result is your runway in months.',
			],
		},
		{
			heading: 'Make the estimate more useful',
			paragraphs: [
				'Look at your bank statements for the last 3 months to find your real monthly costs. People often forget costs that come once a year or once a quarter. Health insurance may also cost more after a job ends.',
				'Use income that you are sure about. If you are not sure that a payment will come, leave it out and see the result. Then try a second number and compare.',
				'Unemployment rules, severance terms, and tax differ by state and by employer. Check the rules where you live and read your own agreement. This tool does not know them.',
			],
		},
		{
			heading: 'What to do with the result',
			paragraphs: [
				'A short runway does not mean that you must stop. It tells you how much time you have. Use it to set a plan: how many applications you send each week, and when you will accept a part-time job or a different role.',
				'If your income covers your costs, the tool says that your savings do not go down. Check the month table anyway. It shows how your savings grow.',
				'The job application goal calculator on this site can turn a goal into a number of applications each week. Remember that this tool is a simple estimate. It is not financial advice.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I find out how long my savings will last?',
			a: 'Divide your savings by the money you lose each month. The money you lose is your monthly costs minus your monthly income. The calculator does this for you and shows the end date.',
		},
		{
			q: 'How many months of savings should I have for a job search?',
			a: 'There is no one right number. It depends on your costs, your field, and how fast you can find work. Use the calculator to see your own number and plan from that.',
		},
		{
			q: 'What counts as income during a job search?',
			a: 'Count money that comes in each month: severance paid in parts, unemployment benefits, part-time or contract work, or money from a partner. Check the rules and dates for each source.',
		},
		{
			q: 'Why does the tool say my savings do not go down?',
			a: 'Your monthly income is equal to or higher than your monthly costs. Your balance stays the same or grows each month, so there is no run-out date.',
		},
	],
	blogSlugs: ['what-to-do-after-a-layoff', 'job-search-plan', 'job-search-burnout'],
	relatedTools: ['job-application-goal-calculator', 'salary-to-hourly-calculator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
