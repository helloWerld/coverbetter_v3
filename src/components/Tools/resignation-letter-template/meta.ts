import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'resignation-letter-template',
	name: 'Resignation letter template',
	title: 'Resignation Letter Template: Free, Ready to Copy and Send',
	description:
		'Fill in a short form and get a resignation letter and an email subject line. Pick standard, short, grateful, new job, personal, or immediate. Copy it.',
	keyword: 'resignation letter template',
	intro:
		'This resignation letter template writes a short, polite letter with your name, your manager, your company, and your last day in it. Pick one of 6 letter types, then copy the letter or download it as a text file.',
	group: 'Pay, offers, and leaving a job',
	storage: 'local',
	guide: [
		{
			heading: 'How to use this resignation letter template',
			paragraphs: [
				'Pick a letter type. Fill in your name, your manager, your company, your role, and your last day. The letter changes as you type.',
				'Each part you leave empty stays in [brackets]. Replace every bracket before you send the letter. Your answers save in your browser on this device only.',
			],
			list: [
				'Use the date field for your last day. The tool writes it as a full date, for example Friday, December 4, 2026.',
				'Not sure about your last day? Use the two weeks notice calculator first.',
				'Copy the subject line into your email, then paste the letter into the body.',
			],
		},
		{
			heading: 'Which letter type should you pick?',
			paragraphs: [
				'Use Standard for most jobs. Use Short and simple if you want fewer words. Use Grateful if one person or one thing helped you. Use New opportunity if you are happy to say that you have another job.',
				'Use Personal reasons if you do not want to explain. You do not have to give a reason. Use Immediate resignation only when you must leave now. It can affect your reference, and your contract may say more, so check it first.',
			],
		},
		{
			heading: 'Before you send the letter',
			paragraphs: [
				'Tell your manager in person or on a call first, if you can. Then send the letter so that there is a record. Keep the letter short and kind. You do not need to explain or list problems.',
				'Check your contract and your employer’s policy for the notice they ask for. Ask what happens to your pay, benefits, and unused time off. This tool does not give legal advice.',
			],
		},
	],
	faqs: [
		{
			q: 'How long should a resignation letter be?',
			a: 'Keep it short. Three or four sentences are enough. Say that you resign, give your last day, and thank them.',
		},
		{
			q: 'Do I have to say why I am leaving?',
			a: 'No. You can leave out the reason. The personal reasons letter says that you leave for personal reasons and gives no details.',
		},
		{
			q: 'Should I send the letter by email or on paper?',
			a: 'Email is fine in most workplaces, and it gives you a record. If your employer asks for a signed paper letter, print the letter and sign it.',
		},
		{
			q: 'Can I resign with no notice?',
			a: 'You can, but it may affect your reference, your final pay, or your contract. Check your contract and your employer’s policy before you do it.',
		},
	],
	blogSlugs: ['two-weeks-notice-letter', 'job-search-while-employed', 'how-to-decline-a-job-offer', 'how-to-compare-job-offers'],
	relatedTools: ['two-weeks-notice-calculator', 'thank-you-email', 'job-offer-comparison-calculator'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
