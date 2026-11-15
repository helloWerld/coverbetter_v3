import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'recruiter-message-templates',
	name: 'Recruiter message templates',
	title: 'How to Message a Recruiter on LinkedIn: Free Templates',
	description:
		'Fill in the blanks for a recruiter message, LinkedIn connection note, referral request, informational interview request, or follow-up. Has a character counter.',
	keyword: 'how to message a recruiter on linkedin',
	intro:
		'Pick a template, fill in the blanks, and get a short message for a recruiter or a contact at a company. A counter shows the length against the limit you pick.',
	group: 'Cover letters and emails',
	storage: 'local',
	guide: [
		{
			heading: 'How to use these message templates',
			paragraphs: [
				'Pick the template that matches your goal. Fill in the form. The message changes as you type, and any part you leave empty stays in [brackets].',
				'Replace every bracket before you send. Then pick the length limit. The connection note has a limit, so the counter warns you when the note is too long. LinkedIn limits can change, so always check the box on LinkedIn.',
			],
		},
		{
			heading: 'What to write in each blank',
			paragraphs: ['Short, plain answers work best. A short message is easy to read and easy to answer.'],
			list: [
				'Who you are: one short phrase, such as “a data analyst with 4 years in retail”.',
				'Why this company: finish the sentence “I am interested because …” with something real, such as a product you use or a project you read about.',
				'The role: use the title exactly as the job post writes it.',
				'The name: use the first name of the person, as it shows on their profile.',
			],
		},
		{
			heading: 'Tips for a message that gets read',
			paragraphs: [
				'Make one clear request. Ask for one thing, such as the best way to send your resume, and make it easy to say no. Do not attach a long story, and do not ask a stranger for a job.',
				'Do not copy a message to many people without change. A reader can tell. Change the reason line for each person.',
				'Send one follow-up after about a week of silence. If you still hear nothing, move on. Some people do not check LinkedIn often, so a late reply does not mean no.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I message a recruiter on LinkedIn?',
			a: 'Open the recruiter’s profile and click Message, or send a connection request with a short note. Say who you are, which role you want, and one clear request.',
		},
		{
			q: 'How long can a LinkedIn connection note be?',
			a: 'The limit is 300 characters at the time of writing. LinkedIn limits can change, so check the box on LinkedIn. The tool warns you when a note goes over 300.',
		},
		{
			q: 'Should I send a follow-up if the recruiter does not reply?',
			a: 'Yes, once, after about a week. Keep it short and polite. If there is still no reply, move on.',
		},
		{
			q: 'Is it OK to ask an employee for a referral?',
			a: 'Yes, if you are polite and make it easy to say no. Tell them the role and why you fit, and offer to send your resume.',
		},
	],
	blogSlugs: ['how-to-message-a-recruiter', 'how-to-ask-for-a-referral', 'informational-interview', 'hidden-job-market'],
	relatedTools: ['job-application-email-subject-line', 'thank-you-email', 'linkedin-headline-generator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
