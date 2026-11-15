import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'linkedin-headline-generator',
	name: 'LinkedIn headline generator',
	title: 'LinkedIn Headline Generator: 5 to 8 Headlines With a Length Counter',
	description:
		'Enter your role, skills, and who you help, and get 5 to 8 LinkedIn headline ideas in plain words. Each headline has a copy button and a character counter.',
	keyword: 'linkedin headline generator',
	intro:
		'Enter your role, 2 to 4 skills, and who you help, and the tool writes 5 to 8 LinkedIn headlines from fixed patterns. Each headline has a copy button and a count of characters against the 220 character limit.',
	group: 'Resumes and LinkedIn',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the headline generator',
			paragraphs: [
				'Write your current or target role first. Add 2 to 4 skills, separated by commas. Then say who you help or which industry you work in. The headlines change as you type.',
				'Add a result or a credential if you have a real one. Do not invent one. If you want to show that you are looking for work, pick “Open to [role] roles” or “Seeking”. Then copy the headline you like.',
			],
		},
		{
			heading: 'The headline limit',
			paragraphs: [
				'LinkedIn limits a headline to 220 characters today. LinkedIn can change this limit, so check your profile when you edit it. The tool flags any headline that is over the limit and tells you how many characters to cut.',
				'Short is fine. Some places on LinkedIn show only the start of a headline, so put your role and your best skill first.',
			],
		},
		{
			heading: 'What a good headline does',
			paragraphs: ['Your headline shows next to your name in search results and in messages. Use it to say what you do in plain words.'],
			list: [
				'Use the job title that people search for. A recruiter types “data analyst”, not a made-up title.',
				'Name real skills, such as SQL or payroll. Skip words like “passionate”. They say nothing a reader can check.',
				'Say who you help or which field you work in. This tells the reader if you fit.',
				'Keep it true. Your headline must match your profile and your resume.',
				'Read it out loud. If it sounds odd, change the words that you do not use in real life.',
			],
		},
	],
	faqs: [
		{
			q: 'How long can a LinkedIn headline be?',
			a: 'LinkedIn allows 220 characters today. The limit can change, so check your profile when you edit your headline.',
		},
		{
			q: 'What should I put in my LinkedIn headline?',
			a: 'Put your role, two or three skills, and who you help or your industry. Add a real result or credential if you have one.',
		},
		{
			q: 'Should I write “Open to work” in my headline?',
			a: 'You can. Some people use it and some prefer the Open to Work setting in their profile. Pick what feels right for your situation and your current employer.',
		},
		{
			q: 'Do I need to use all 220 characters?',
			a: 'No. A short, clear headline is better than a long one that repeats itself.',
		},
	],
	blogSlugs: ['linkedin-headline-examples', 'resume-summary-examples', 'how-to-message-a-recruiter', 'resume-keywords'],
	relatedTools: ['resume-bullet-point-builder', 'recruiter-message-templates', 'resume-action-verbs'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
