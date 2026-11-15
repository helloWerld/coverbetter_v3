import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'salary-to-hourly-calculator',
	name: 'Salary to hourly calculator',
	title: 'Salary to Hourly Calculator: Convert Any Pay Rate',
	description:
		'Enter a salary or an hourly rate and see the pay per hour, day, week, two weeks, month, and year. Free, gross pay before tax, and nothing leaves your browser.',
	keyword: 'salary to hourly calculator',
	intro:
		'Enter one pay amount and pick its period. The tool shows the same pay per hour, day, week, two weeks, month, and year. The amounts are gross pay before tax.',
	group: 'Pay, offers, and leaving a job',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the calculator',
			paragraphs: [
				'Type your pay and choose how it is paid: by the hour, day, week, two weeks, month, or year. All other periods update as you type.',
				'Change hours per week if your job is not 40 hours. Change weeks worked per year if you take unpaid time off. Use 52 when you get paid for every week of the year.',
				'The tool counts a week as 5 working days, so the daily rate is the weekly rate divided by 5.',
			],
		},
		{
			heading: 'What the numbers mean',
			paragraphs: [
				'The numbers are gross pay. Gross pay is the amount before tax and before other deductions. Your take-home pay is lower. This tool does not calculate tax. For tax questions, use your payslip or ask a tax professional.',
				'A salary of $52,000 a year at 40 hours a week for 52 weeks equals $25 an hour. If you work 50 weeks because you take two weeks of unpaid leave, the same $52,000 equals $26 an hour.',
			],
		},
		{
			heading: 'Compare jobs with the hourly rate',
			paragraphs: [
				'The hourly rate helps you compare a salaried job with an hourly job. It also shows what extra hours cost you. A salary of $60,000 that needs 50 hours a week pays less per hour than the same salary for 40 hours.',
				'Count the hours you really work, not only the hours in the job post. Include regular overtime that you do not get paid for. Then compare the hourly rates.',
				'Pay is one part of an offer. Benefits, bonus, paid time off, and commute cost also change what a job is worth. The job offer comparison calculator on this site adds these parts for you.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I convert salary to hourly pay?',
			a: 'Divide the yearly salary by the hours you work in a year. For 40 hours a week and 52 weeks, that is 2,080 hours. A salary of $62,400 divided by 2,080 equals $30 an hour.',
		},
		{
			q: 'Is this the pay before or after tax?',
			a: 'It is pay before tax, called gross pay. The tool does not calculate tax. Your take-home pay depends on where you live and on your own tax details.',
		},
		{
			q: 'Why does the hourly rate change when I change the weeks per year?',
			a: 'The same yearly pay is spread over fewer paid weeks, so each worked hour must cover more. Unpaid time off lowers weeks worked. Paid time off does not.',
		},
		{
			q: 'How many hours are in a work year?',
			a: 'A full-time year in the US is often counted as 2,080 hours: 40 hours for 52 weeks. Your own number can differ. Enter your real hours and weeks to get a result that fits your job.',
		},
	],
	blogSlugs: ['how-to-negotiate-salary', 'how-to-compare-job-offers', 'salary-expectations-interview-answer'],
	relatedTools: ['job-offer-comparison-calculator', 'job-search-runway-calculator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
