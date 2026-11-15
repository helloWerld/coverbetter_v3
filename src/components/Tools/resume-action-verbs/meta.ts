import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'resume-action-verbs',
	name: 'Resume action verbs',
	title: 'Resume Action Verbs: 300+ Strong Verbs and a Weak Phrase Finder',
	description:
		'Search 300+ resume action verbs by skill and copy them with one click. Paste your bullets and the tool flags weak phrases like "helped" and suggests new verbs.',
	keyword: 'resume action verbs',
	intro:
		'Find a strong resume action verb for any skill, from leadership to finance, and copy it with one click. Then paste your bullets and the tool flags weak phrases such as "helped" and "responsible for", with new verbs to try.',
	group: 'Resumes and LinkedIn',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the verb list',
			paragraphs: [
				'Pick a group, such as Leadership or Sales and growth, or type part of a word in the search box. Click a verb to copy it. Paste it at the start of a bullet.',
				'All verbs are in the past tense. Use them for jobs you have left. For your current job, change the verb to the present tense, for example “lead” instead of “led”.',
			],
		},
		{
			heading: 'How to use the weak phrase finder',
			paragraphs: [
				'Paste one bullet or many lines. Put each bullet on its own line. The tool looks for a fixed list of weak openers and phrases, such as “helped”, “worked on”, “responsible for”, “duties included”, “assisted with”, “was involved in”, and “tasked with”.',
				'For each flagged line, the tool suggests 3 to 5 verbs. It picks them from the groups that fit the words in your line. The list is not a rule. Sometimes “helped” is the true word. If it is, keep it.',
			],
		},
		{
			heading: 'What makes a bullet strong',
			paragraphs: [
				'A strong verb is a good start, but the rest of the bullet does the work. Say what you did, how you did it, and what changed because of it.',
			],
			list: [
				'Start each bullet with a different verb. Repeats make the list dull.',
				'Choose the verb that matches what you did. “Led” means you were in charge. Do not use it if you only took part.',
				'Add a number when you have a real one. Never make one up.',
				'Keep each bullet to one or two lines.',
				'Use words from the job post when they are true for you. This helps tracking systems and human readers.',
			],
		},
	],
	faqs: [
		{
			q: 'What are resume action verbs?',
			a: 'They are verbs that start a resume bullet and say what you did, such as “built”, “reduced”, or “trained”. They make each bullet short and direct.',
		},
		{
			q: 'Should I use past tense or present tense on a resume?',
			a: 'Use past tense for jobs you have left and present tense for your current job. Keep the same tense inside each job.',
		},
		{
			q: 'Is it wrong to write “responsible for”?',
			a: 'It is not wrong, but it says what the job asked of you, not what you did. A verb that shows an action and a result usually tells the reader more.',
		},
		{
			q: 'Can I use the same verb more than once?',
			a: 'Try not to repeat a verb in the same job. If you need a second word for the same action, pick one from the same group in the list.',
		},
	],
	blogSlugs: ['resume-action-verbs', 'tailor-resume-to-job-description', 'resume-keywords', 'how-long-should-a-resume-be'],
	relatedTools: ['resume-bullet-point-builder', 'star-method-answer-builder', 'linkedin-headline-generator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
