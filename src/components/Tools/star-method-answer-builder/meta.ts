import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'star-method-answer-builder',
	name: 'STAR method answer builder',
	title: 'STAR Method Examples and Free Answer Builder',
	description:
		'Write your interview answer in four parts: Situation, Task, Action, Result. See the word count and speaking time, and save your answers on this device.',
	keyword: 'STAR method examples',
	intro:
		'Write an interview answer in the STAR format: Situation, Task, Action, and Result. The tool joins the four parts into one answer and shows the word count and a rough speaking time. Save your answers in a list on this device.',
	group: 'Interviews',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the STAR answer builder',
			paragraphs: [
				'Type the interview question first. Then fill in the four parts. Each part has a tip and a word count. The full answer shows below the form as one block.',
				'Read the answer out loud. The speaking time is a rough guide, based on about 130 to 150 words per minute. Your own speed may differ.',
				'Press Save answer to add the answer to your list. Load it later to edit it, or delete it. Everything stays in your browser on this device.',
			],
		},
		{
			heading: 'STAR method examples',
			paragraphs: [
				'These two examples are invented to show the shape of an answer. Write yours from your own work.',
				'Question: Tell me about a time you met a tight deadline. Situation: Our team had to send a client report in two days, and one analyst was out sick. Task: I owned the final numbers. Action: I listed every open item, asked a coworker to take two of them, and checked each total against the source file. I sent the client a short note about the new timing. Result: We sent the report on time, and the client had no corrections.',
				'Question: Tell me about a time you handled a disagreement. Situation: A teammate and I wanted different layouts for a customer flyer. Task: I needed to settle it before the print deadline. Action: I asked what goal each layout served, and we agreed on one measure: how fast a reader finds the phone number. We made a quick test page for both layouts and asked three coworkers. Result: We used my teammate’s layout with my larger phone number, and we finished one day early.',
			],
		},
		{
			heading: 'Tips for a strong STAR answer',
			paragraphs: [
				'Pick a real story that fits the question. Use “I” for the steps you took, even when a team did the work. Keep Situation and Task short. Spend most of your words on Action.',
				'End with a result. A number helps, but only use a number that is true. If you have no number, say what changed and what you learned.',
			],
			list: [
				'Keep one story to about 1 to 2 minutes when you speak.',
				'Prepare 5 to 7 stories that you can adapt to different questions.',
				'Do not blame a person. Describe the problem and your part in it.',
			],
		},
	],
	faqs: [
		{
			q: 'What does STAR stand for in an interview?',
			a: 'STAR stands for Situation, Task, Action, and Result. It is a way to tell a short story about your past work.',
		},
		{
			q: 'How long should a STAR answer be?',
			a: 'Most STAR answers take 1 to 2 minutes to say out loud. The speaking time in this tool is a rough guide, so test it with your own voice.',
		},
		{
			q: 'Which part of STAR should be the longest?',
			a: 'The Action part. The interviewer wants to know what you did, so give the most detail there.',
		},
		{
			q: 'Are my answers saved online?',
			a: 'No. The tool saves your answers in your browser on this device only. Nothing goes to a server. Clearing your browser data removes them.',
		},
	],
	blogSlugs: ['star-method-interview', 'behavioral-interview-questions', 'common-interview-questions', 'tell-me-about-yourself'],
	relatedTools: ['interview-question-practice', 'thank-you-email', 'resume-bullet-point-builder'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
