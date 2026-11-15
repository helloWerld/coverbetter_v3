import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'cover-letter-length-checker',
	name: 'Cover letter length checker',
	title: 'How Long Should a Cover Letter Be? Free Length and Grade Checker',
	description:
		'Paste your cover letter to see its word count, paragraphs, sentence length, reading grade level, and reading time, checked against common length guidelines.',
	keyword: 'how long should a cover letter be',
	intro:
		'Paste your cover letter and see its word count, paragraph count, sentence length, reading grade level, and reading time. The tool checks each number against common guidelines and lists your longest sentences.',
	group: 'Cover letters and emails',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the length checker',
			paragraphs: [
				'Paste your whole letter into the box. The numbers update as you type. Your text stays in your browser and goes nowhere else.',
				'The tool does not count your greeting, sign-off, or address lines as paragraphs or sentences. It does count their words in the word total.',
			],
		},
		{
			heading: 'The common guidelines',
			paragraphs: [
				'The tool checks five common tips. They come from general career advice, not from a study. Treat them as a way to spot problems, not as rules.',
			],
			list: [
				'About 250 to 400 words.',
				'3 to 5 paragraphs.',
				'Fits on one page in 11 or 12 point type.',
				'No sentence over about 30 words.',
				'A reading grade level of about 8 to 12.',
			],
		},
		{
			heading: 'What the grade level means',
			paragraphs: [
				'The grade level comes from the Flesch-Kincaid formula. It uses the length of your sentences and the number of syllables in your words. A lower grade means shorter sentences and shorter words.',
				'The tool counts syllables with a simple rule set, so the result is an estimate. A few words come out wrong. Use the grade to compare two drafts, not as a final score.',
			],
		},
		{
			heading: 'How to shorten a long letter',
			paragraphs: ['If a check says “Check”, edit the letter, then paste it again.'],
			list: [
				'Cut any sentence that repeats your resume without adding a fact.',
				'Cut a paragraph that does not support the job you want.',
				'Split a long sentence at “and” or “which”.',
				'Keep one strong example, not three weak ones.',
				'Remove openers such as “I am writing to apply for”. Start with why you fit.',
			],
		},
	],
	faqs: [
		{
			q: 'How long should a cover letter be?',
			a: 'Many career coaches suggest about 250 to 400 words, which fits on one page. This is a common tip, not a rule. Follow the job post if it gives a length.',
		},
		{
			q: 'How many paragraphs should a cover letter have?',
			a: 'Three to five short paragraphs is a common range. Use one for your opening, one or two for your best examples, and one to close.',
		},
		{
			q: 'Is a one page cover letter required?',
			a: 'No, but one page is the usual length. A longer letter may not get read in full, so cut anything that does not help the reader.',
		},
		{
			q: 'What reading grade level should a cover letter have?',
			a: 'A grade of about 8 to 12 is a common target. It means the letter is easy to read without sounding childish. The score is an estimate.',
		},
	],
	blogSlugs: ['how-long-should-a-cover-letter-be', 'cover-letter-format', 'how-to-write-a-cover-letter', 'cover-letter-mistakes'],
	relatedTools: ['cover-letter-template', 'how-to-address-a-cover-letter', 'job-application-email-subject-line'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
