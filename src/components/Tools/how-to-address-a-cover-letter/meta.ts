import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'how-to-address-a-cover-letter',
	name: 'Cover letter greeting finder',
	title: 'How to Address a Cover Letter: Greeting Finder',
	description:
		'Tell the tool what you know about the hiring manager and get the best cover letter greeting, other good options, and greetings to avoid. Copy each with a click.',
	keyword: 'how to address a cover letter',
	intro:
		'Pick what you know about the hiring manager, from a full name to nothing at all, and the tool shows the best greeting for your cover letter. It also shows other good options and greetings to avoid.',
	group: 'Cover letters and emails',
	storage: 'local',
	guide: [
		{
			heading: 'How to use the greeting finder',
			paragraphs: [
				'Pick what you know about the hiring manager. Fill in the fields that appear. The tool shows one recommended greeting and a few other good options. Copy the one you like and paste it at the top of your letter.',
				'Any part you leave empty stays in [brackets]. Replace it before you send the letter.',
			],
		},
		{
			heading: 'Find a name first',
			paragraphs: [
				'A letter that names a person reads as more personal than a letter to a team. Before you pick a team greeting, spend about 5 minutes on a search.',
			],
			list: [
				'Read the job post. Some posts name the hiring manager or the recruiter.',
				'Look at the team page on the company site.',
				'Search LinkedIn for the company and the job title, for example “Marketing Manager Northwind”.',
				'Do not guess. If you cannot find a name, a team greeting is fine.',
			],
		},
		{
			heading: 'Names and titles to check',
			paragraphs: [
				'Copy the spelling of the name from the job post or the person’s profile. A wrong spelling is a bad start. If the name has more than one common spelling, use the one the person uses.',
				'Do not add a title that the person did not give. If you are not sure, leave the title out and use the full name.',
			],
		},
		{
			heading: 'When you do not know the title or pronouns',
			paragraphs: [
				'Use the full name: “Dear Jordan Smith,”. This is polite, and it does not need a guess about a title or gender. It also works when a name could belong to any person.',
				'Use “Dr.” only when you know the person has a doctorate. Use “Mx.” only when you know the person uses it. In the US, a comma after the greeting is common in an email, and a colon is common in a printed letter. Rules can differ in other countries.',
			],
		},
		{
			heading: 'Greetings to skip',
			paragraphs: [
				'“To Whom It May Concern” and “Dear Sir or Madam” sound old and impersonal. They also tell the reader that you did not try to find a name. A team greeting such as “Dear Northwind Hiring Team,” does the same job and sounds more friendly.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I address a cover letter if I do not know the name?',
			a: 'Use a team greeting, for example “Dear Northwind Hiring Team,”. “Dear Hiring Manager,” is also common and polite. Try to find a name first.',
		},
		{
			q: 'Is “To Whom It May Concern” OK in a cover letter?',
			a: 'It is not wrong, but it sounds cold and old-fashioned. A team greeting or the name of a person is a better choice.',
		},
		{
			q: 'What if I do not know the hiring manager’s title or pronouns?',
			a: 'Use the full name, for example “Dear Jordan Smith,”. It is polite and needs no guess.',
		},
		{
			q: 'Should I use a comma or a colon after the greeting?',
			a: 'In the US, a comma is common in an email and a colon is common in a printed letter. Both are accepted.',
		},
	],
	blogSlugs: ['how-to-address-a-cover-letter', 'how-to-write-a-cover-letter', 'cover-letter-format', 'cover-letter-opening-lines'],
	relatedTools: ['cover-letter-template', 'cover-letter-length-checker', 'job-application-email-subject-line'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
