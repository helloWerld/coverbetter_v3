import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'resume-bullet-point-builder',
	name: 'Resume bullet point builder',
	title: 'Resume Bullet Points Builder: Turn What You Did Into Strong Bullets',
	description:
		'Write resume bullet points in 3 formats, including the "accomplished X as measured by Y by doing Z" form. Copy each bullet and save your favorites.',
	keyword: 'resume bullet points',
	intro:
		'Enter a verb, what you did, and the result, and the tool writes your resume bullet point in 3 formats. Each bullet has a copy button and a character count, and you can save the ones you like.',
	group: 'Resumes and LinkedIn',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the bullet builder',
			paragraphs: [
				'Fill in the first three fields. Pick a verb, say what you did, and say what changed. The tool shows 3 bullets that update as you type.',
				'The number field is optional. The how field is optional too. If you leave them empty, the tool leaves them out and the bullet still reads well.',
			],
		},
		{
			heading: 'The “accomplished X as measured by Y by doing Z” form',
			paragraphs: [
				'This form is a popular way to write bullets. X is what you achieved. Y is how you know, which is often a number. Z is what you did to get there.',
				'The first bullet follows this order. The other two use the same facts in a different order. Read all three out loud. Pick the one that is easiest to understand on the first read.',
			],
		},
		{
			heading: 'Rules for a good bullet',
			paragraphs: ['A bullet should show what you did and why it mattered. Use these rules as you edit.'],
			list: [
				'Start with a verb. Use the past tense for past jobs and the present tense for your current job.',
				'Add a number when you have a real one. Never invent a number. If you do not know the exact figure, say what you know, such as “weekly” or “for 12 stores”.',
				'Show your own part. If the team did the work, say what you did in it.',
				'Keep each bullet to one or two lines. Cut words that do not add a fact.',
				'Do not repeat the same verb in every bullet. The verb list tool has more choices.',
				'Check that every claim is true. An interviewer may ask you about any bullet.',
			],
		},
		{
			heading: 'Where saved bullets go',
			paragraphs: [
				'Saved bullets stay in your browser on this device. Nothing goes to a server. Copy them into your resume when you are ready.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I write a resume bullet point?',
			a: 'Start with a verb, say what you did, and say what changed because of it. Add a real number if you have one.',
		},
		{
			q: 'How long should a resume bullet point be?',
			a: 'Keep it to one or two lines on the page. The character count on each bullet helps you see how long it is.',
		},
		{
			q: 'What if I have no numbers for a bullet?',
			a: 'Leave the number field empty. You can still show a result, such as a faster process, a happier customer, or a task you took over.',
		},
		{
			q: 'How many bullets should each job have?',
			a: 'There is no fixed number. Many resumes use 3 to 6 bullets for a recent job and fewer for older jobs. Put the most relevant bullets first.',
		},
	],
	blogSlugs: ['resume-action-verbs', 'tailor-resume-to-job-description', 'resume-keywords', 'resume-summary-examples'],
	relatedTools: ['resume-action-verbs', 'star-method-answer-builder', 'linkedin-headline-generator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
