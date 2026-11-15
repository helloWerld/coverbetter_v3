import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'job-offer-comparison-calculator',
	name: 'Job offer comparison calculator',
	title: 'Compare Job Offers Calculator: Total Yearly Value Side by Side',
	description:
		'Compare 2 or 3 job offers side by side. Add base pay, bonus, equity, 401(k) match, benefits, PTO, and commute cost to see the total yearly value of each offer.',
	keyword: 'compare job offers calculator',
	intro:
		'Enter 2 or 3 job offers and the tool shows the total yearly value of each one side by side. It adds salary, bonus, equity, 401(k) match, and benefits, and it subtracts commute cost.',
	group: 'Pay, offers, and leaving a job',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the calculator',
			paragraphs: [
				'Fill in one column for each offer. Start with the base salary. Then add the other parts that you know. Leave a field empty when an offer does not have that part.',
				'The tool shows the total yearly value, the difference from the highest offer, and the value for each working day. Your answers save in this browser, so you can come back later.',
			],
			list: [
				'Bonus: enter the amount you expect to get, not the best case.',
				'Equity: enter your own yearly estimate. Equity can be worth much less than you think, or nothing. Use a low number if you are not sure.',
				'401(k) match: enter the percent of your salary that the employer adds, and the cap. The match never goes above the cap.',
				'Commute: enter the days per week in the office, the cost for each day, and the weeks per year.',
			],
		},
		{
			heading: 'What the total does not show',
			paragraphs: [
				'A higher total does not always mean a better job. The tool does not count the quality of the work, your manager, the team, or your chance to grow. It also does not count the risk that a company will not pay a bonus or that equity will lose value.',
				'The values are before tax. Tax rules differ by state and by person, and this is not tax advice. Ask a tax professional if the tax effect is important to your choice.',
			],
		},
		{
			heading: 'Questions to ask before you decide',
			paragraphs: [
				'Ask each employer to put the offer in writing. Check the bonus rules: is it a target or a promise? Check when equity vests and what happens if you leave.',
				'Ask about health insurance cost, because the part that you pay changes the value of the offer. Ask how many days you can work from home. Then enter the real numbers in the tool.',
				'If one offer is lower but you like it more, you can ask for a better one. Use the difference in the table to decide what to ask for.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I compare two job offers?',
			a: 'Put the same parts of each offer in one table: salary, bonus, equity, retirement match, benefits, time off, and commute cost. Then compare the total yearly value and the parts that are not money, such as the work and the team.',
		},
		{
			q: 'How should I value equity?',
			a: 'Use your own low estimate for each year and treat it as uncertain. Private company equity may be worth nothing. If you cannot guess a value, enter 0 and compare the offers again.',
		},
		{
			q: 'What does value per working day mean?',
			a: 'It is the total yearly value divided by your working days. The tool counts 260 days in a year and subtracts your PTO days. An offer with more PTO gets a higher value for each day worked.',
		},
		{
			q: 'Is this tax advice?',
			a: 'No. The tool uses amounts before tax and does not calculate tax. Check with a tax professional for your own case.',
		},
	],
	blogSlugs: ['how-to-compare-job-offers', 'how-to-negotiate-salary', 'how-to-decline-a-job-offer'],
	relatedTools: ['salary-to-hourly-calculator', 'two-weeks-notice-calculator', 'job-description-red-flags'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
