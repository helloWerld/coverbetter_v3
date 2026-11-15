import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'thank-you-email',
	name: 'Thank you email builder',
	title: 'Thank You Email After Interview: Free Template Builder',
	description:
		'Pick your interview type, fill in 5 details, and get a thank you email with a subject line. Templates for phone, video, in-person, panel, and final rounds.',
	keyword: 'thank you email after interview',
	intro:
		'Pick the type of interview, add the interviewer, the job, and one topic from your talk, and the tool writes a thank you email with a subject line. Choose a formal or a warm tone, then copy the result.',
	group: 'Cover letters and emails',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the thank you email builder',
			paragraphs: [
				'Pick the interview type and the tone. Then fill in the form. The email changes as you type, and any part you leave empty stays in [brackets].',
				'Replace every bracket before you send the email. Read the whole email once more, out loud if you can.',
			],
			list: [
				'Write the interviewer’s name as you would say it to them. Use “Ms. Ortiz” for the formal tone and “Maria” for the warm tone.',
				'Write the topic as a short phrase, for example “the new reporting system” or “how the team plans each quarter”.',
				'Pick one topic that you really talked about. A real detail shows that you listened.',
			],
		},
		{
			heading: 'When to send it',
			paragraphs: [
				'Send the email within about one business day after the interview. This is common advice, not a rule, and a later email is still fine. If the interviewer told you the hiring date, send your email before that date.',
				'Check the spelling of every name before you send. Use the email address from the interview invite or from the person’s signature.',
			],
		},
		{
			heading: 'Which tone should you pick?',
			paragraphs: [
				'Use the formal tone for large companies, law, finance, government, and any case where the interviewer was formal with you. Use the warm tone when the talk was relaxed, or when the company writes in a casual style.',
				'If you are not sure, pick formal. You can make the email warmer by changing one or two words.',
				'After a panel, send each person a separate email and change one detail in each. After a final round, say plainly that you want the job.',
			],
		},
		{
			heading: 'What a thank you email should not do',
			paragraphs: [
				'Keep the email short. Do not ask about salary, and do not repeat your whole resume. If you forgot to say something important in the interview, add one short sentence for it.',
			],
		},
	],
	faqs: [
		{
			q: 'How soon should I send a thank you email after an interview?',
			a: 'Send it within about one business day. This is common advice, not a rule. If you miss that time, send it anyway.',
		},
		{
			q: 'Should I send a thank you email after a phone screen?',
			a: 'Yes, a short one is fine. It takes a few minutes and keeps your name in front of the recruiter.',
		},
		{
			q: 'Do I need to email every person on a panel?',
			a: 'It is best to send each person a separate email, with one detail that is different in each. If you only have one address, write all the names in the greeting.',
		},
		{
			q: 'What should the subject line say?',
			a: 'Keep it plain, for example “Thank you: Data Analyst interview”. The tool writes one for you.',
		},
		{
			q: 'Is this tool free?',
			a: 'Yes. It runs in your browser, needs no sign-up, and sends nothing to a server.',
		},
	],
	blogSlugs: ['thank-you-email-after-interview', 'follow-up-email-after-interview', 'how-long-to-hear-back-after-an-interview', 'phone-screen-interview'],
	relatedTools: ['job-application-email-subject-line', 'recruiter-message-templates', 'interview-question-practice'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
