import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'job-application-email-subject-line',
	name: 'Job application email subject line generator',
	title: 'Job Application Email Subject Line: Free Examples Generator',
	description:
		'Get 3 to 5 clear subject lines for a job application, referral, follow-up, thank you, offer reply, or informational interview email. Copy one with a click.',
	keyword: 'job application email subject line',
	intro:
		'Pick the type of email, add the job title and your name, and the tool gives you 3 to 5 clear subject lines. Each line has a copy button and a character count.',
	group: 'Cover letters and emails',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the subject line generator',
			paragraphs: [
				'Pick the type of email. Then add the job title and your name. Add the job ID if the job post lists one. For a referral, add the name of the person who referred you.',
				'The tool shows several lines. Pick the one that sounds most like you, copy it, and paste it into your email. Any part you leave empty stays in [brackets], so replace it before you send.',
			],
		},
		{
			heading: 'What makes a subject line work',
			paragraphs: [
				'A good subject line tells the reader what the email is and who it is from. The reader should know the job before they open the email.',
			],
			list: [
				'Use the job title exactly as the job post writes it.',
				'Add the job ID when the post gives one. It helps a busy recruiter sort the email.',
				'Put your name in the line when you can. It helps the reader find your email later.',
				'Use plain words. Skip all capital letters, extra punctuation, and words such as “urgent”.',
				'If the job post tells you what to write in the subject line, write exactly that.',
			],
		},
		{
			heading: 'How long should a subject line be?',
			paragraphs: [
				'As a guideline, keep a subject line to about 60 characters or fewer. Phone mail apps often show only part of a long line. The exact amount depends on the app and the phone, so treat the number as a guide, not a rule.',
				'The tool marks a line that is over 60 characters. A long line is not wrong. If you pick one, put the most important words, the job title and your name, at the start.',
			],
		},
		{
			heading: 'Before you send',
			paragraphs: [
				'Check that the subject line matches the email. A line about a referral needs a referral in the first sentence of the email. Send a test copy to yourself if you want to see how the line looks in your own inbox.',
			],
		},
	],
	faqs: [
		{
			q: 'What should the subject line of a job application email say?',
			a: 'Say the job title and your name, for example “Application for Data Analyst: Sam Lee”. Add the job ID if the post lists one.',
		},
		{
			q: 'Should I put my name in the subject line?',
			a: 'Yes, in most cases. It helps the reader find your email later. If the job post gives an exact subject line, use that line instead.',
		},
		{
			q: 'How long should an email subject line be?',
			a: 'As a guideline, keep it to about 60 characters or fewer, because some phone apps cut long lines. The limit changes from app to app.',
		},
		{
			q: 'Should I write “Referral” in the subject line?',
			a: 'Yes, if a real person agreed that you can use their name. Put the name early in the line, for example “Referred by Ana Ruiz: Data Analyst application”.',
		},
	],
	blogSlugs: ['how-to-write-a-cover-letter', 'how-to-follow-up-on-a-job-application', 'follow-up-email-after-interview', 'how-to-ask-for-a-referral'],
	relatedTools: ['thank-you-email', 'recruiter-message-templates', 'cover-letter-template'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
