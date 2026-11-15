import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'interview-question-practice',
	name: 'Interview question practice',
	title: 'Common Interview Questions: Free Practice Tool with Timer',
	description:
		'Practice 100+ common interview questions by type. Get a tip for each one, use a 1 to 3 minute timer, and keep notes for each answer on this device.',
	keyword: 'common interview questions',
	intro:
		'Practice more than 100 common interview questions, sorted by type. Each question has a tip on what a good answer covers, a practice timer, and a notes box that saves on this device.',
	group: 'Interviews',
	storage: 'local',
	guide: [
		{
			heading: 'How to practice with this tool',
			paragraphs: [
				'Pick a type, or keep All types. Press Random question to get one, or Next to go through the list in order. Read the tip, then choose a timer length and press Start.',
				'Answer out loud, as if the interviewer is in the room. When the time is up, the tool tells you. Write what worked and what to improve in the notes box. The notes save in your browser for each question.',
				'The list view shows every question in your filter. Use it to find a question and practice it.',
			],
		},
		{
			heading: 'What interviewers want to hear',
			paragraphs: [
				'Most questions ask the same few things: can you do the work, will you fit the team, and do you want this job. Link each answer to one of these.',
				'Use a real example when you can. For behavioral questions, the STAR method gives your story a clear shape: Situation, Task, Action, Result.',
			],
			list: [
				'Keep most answers to 1 to 2 minutes.',
				'Use “I” for what you did and “we” for what the team did.',
				'Prepare 5 to 7 stories that you can adapt to many questions.',
				'Prepare two or three questions to ask the interviewer.',
			],
		},
		{
			heading: 'A note on salary questions',
			paragraphs: [
				'Rules about salary questions differ by place. In some US states and cities, an employer may not ask about your past pay. Check your local rules before you answer.',
				'Research the pay range for the role in your area before the interview, so you can give a range with confidence.',
			],
		},
	],
	faqs: [
		{
			q: 'What are the most common interview questions?',
			a: 'Tell me about yourself, why do you want this job, what are your strengths and weaknesses, and tell me about a time you faced a challenge. This tool has more than 100 questions, sorted by type.',
		},
		{
			q: 'How long should I practice each answer?',
			a: 'Aim for 1 to 2 minutes for most answers. Use the 1, 2, or 3 minute timer to check your pace.',
		},
		{
			q: 'Should I memorize my answers?',
			a: 'No. Memorized answers can sound stiff. Know your main points and your stories, and say them in your own words each time.',
		},
		{
			q: 'Are my notes saved online?',
			a: 'No. Notes save in your browser on this device only. Nothing goes to a server. Clearing your browser data removes them.',
		},
	],
	blogSlugs: ['common-interview-questions', 'behavioral-interview-questions', 'tell-me-about-yourself', 'questions-to-ask-in-an-interview'],
	relatedTools: ['star-method-answer-builder', 'thank-you-email', 'interview-time-zone-converter'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
