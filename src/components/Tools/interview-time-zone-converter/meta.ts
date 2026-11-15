import type { ToolMeta } from '@/lib/tools/types';

export const meta: ToolMeta = {
	slug: 'interview-time-zone-converter',
	name: 'Interview time zone converter',
	title: 'Interview Time Zone Converter with Calendar File',
	description:
		'Convert an interview time between the interviewer’s time zone and yours. Handles daylight saving time. Get a calendar file and a one-line confirmation text.',
	keyword: 'interview time zone converter',
	intro:
		'Enter the interview date, time, and the interviewer’s time zone. The tool shows the time in your zone, with the day name, and warns you when the date is different. Download a calendar file or copy a short confirmation text.',
	group: 'Interviews',
	storage: 'none',
	guide: [
		{
			heading: 'How to use the converter',
			paragraphs: [
				'Enter the date and the start time that the interviewer gave you. Pick the interviewer’s time zone. Your time zone starts as the zone your browser reports. Change it if that is wrong.',
				'The result shows the time in both zones. If the date is not the same in both zones, the tool says so. Check the day name before you add the interview to your calendar.',
				'Press Download calendar file to get an .ics file. Open it with your calendar app. Press Copy confirmation to get one line that you can paste into an email.',
			],
		},
		{
			heading: 'Time zone mistakes to avoid',
			paragraphs: [
				'Daylight saving time starts and ends on different dates in different places. In the US, it changes on the second Sunday in March and the first Sunday in November. Many other countries use other dates, and some do not use it at all. The tool uses the rules in your browser, so it handles these changes.',
				'Do not use an abbreviation like “CST” without care, because the same letters can mean different zones. When you write to the interviewer, give the time and the city or zone name.',
			],
			list: [
				'Ask the interviewer to confirm the time zone if the invitation does not name one.',
				'Check the date, not only the hour, when the zones are far apart.',
				'Set a reminder 15 minutes before the interview.',
				'For a video call, test your link and audio before the start time.',
			],
		},
		{
			heading: 'Confirm the time in writing',
			paragraphs: [
				'A short confirmation message prevents missed interviews. Paste the confirmation text into a reply and add your thanks. Show the time in both zones so each side can check it.',
			],
		},
	],
	faqs: [
		{
			q: 'How do I convert an interview time to my time zone?',
			a: 'Enter the date, the time, and the interviewer’s zone, and pick your own zone. The tool shows the time in both zones.',
		},
		{
			q: 'Does the converter handle daylight saving time?',
			a: 'Yes. It uses the time zone rules that your browser has for the date you enter. This works for US zones and for other regions.',
		},
		{
			q: 'What if the interview is on a different day in my zone?',
			a: 'The tool shows a warning and the day name for both zones. Check that day before you plan your schedule.',
		},
		{
			q: 'Is my interview information sent anywhere?',
			a: 'No. The conversion runs in your browser. Nothing goes to a server, and nothing is saved.',
		},
	],
	blogSlugs: ['video-interview-tips', 'phone-screen-interview', 'thank-you-email-after-interview', 'common-interview-questions'],
	relatedTools: ['thank-you-email', 'interview-question-practice', 'star-method-answer-builder'],
	cta: {
		heading: 'Applying to a new job next?',
		text: 'CoverBetter writes a cover letter from your resume and the job post. Your first 3 letters are free.',
		label: 'Write a free cover letter',
		href: '/sign-up',
	},
};
