import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'cover-letter-template',
	name: 'Cover letter template builder',
	title: 'Free Cover Letter Template Builder',
	description:
		'Fill in a short form and get a cover letter template with your details in it. 6 templates: standard, career change, no experience, internship, and more.',
	keyword: 'cover letter template',
	intro:
		'Pick a cover letter template, fill in your name, the job, and two strengths, and the tool writes the letter with your details in place. Copy it or download it as a text file.',
	group: 'Cover letters and emails',
	storage: 'local',
	guide: [
		{
			heading: 'How to use this cover letter template',
			paragraphs: [
				'Pick the template that matches your situation. Then fill in the form. The letter changes as you type.',
				'Each part you leave empty stays in [brackets]. Replace every bracket before you send the letter. The tool counts the brackets that are left.',
			],
			list: [
				'Use the job title exactly as the job post writes it.',
				'Pick two strengths that the job post asks for, not your two favorite skills.',
				'Write your result as a full clause that starts with “I”, and add a number if you have one.',
				'Change at least one sentence so that it names something specific about the company.',
			],
		},
		{
			heading: 'Which template should you pick?',
			paragraphs: [
				'Use Standard for most jobs where you have related experience. Use Career change when you move into a new field. Use No experience for a first job or a big step up.',
				'Use Referral only when a real person at the company told you about the job and agreed that you can use their name. Use Short email when the application asks you to send the letter in an email.',
			],
		},
		{
			heading: 'A template is a start, not the final letter',
			paragraphs: [
				'Hiring managers read many letters that follow the same pattern. The parts that make your letter different are the specific result and the reason you want this company. Spend most of your time on those two sentences.',
				'Keep the letter to one page. Most strong letters have 3 or 4 short paragraphs and about 200 to 400 words.',
			],
		},
	],
	faqs: [
		{
			q: 'Is this cover letter template free?',
			a: 'Yes. The tool is free and needs no sign-up. Your answers save in your browser on this device only.',
		},
		{
			q: 'Can I use the same cover letter for every job?',
			a: 'You can use the same structure, but change the job title, the strengths, the result, and the reason you want the company for each job. A letter that fits one job reads better than a general one.',
		},
		{
			q: 'Should I put the cover letter in the email body or attach it?',
			a: 'Do what the job post asks. If it does not say, attach the letter as a PDF and write a short email with the Short email template.',
		},
		{
			q: 'What if I do not know the hiring manager’s name?',
			a: 'Leave the field empty. The tool writes “Dear [Company] Hiring Team,” which is polite and common.',
		},
	],
	blogSlugs: ['how-to-write-a-cover-letter', 'cover-letter-format', 'how-to-address-a-cover-letter', 'cover-letter-opening-lines'],
	relatedTools: ['how-to-address-a-cover-letter', 'cover-letter-length-checker', 'job-application-email-subject-line'],
	cta: {
		heading: 'Get a letter written for this exact job',
		text: 'Add your resume and paste the job post. CoverBetter writes a cover letter that uses the details of that job. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
