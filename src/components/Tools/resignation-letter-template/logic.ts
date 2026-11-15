// Fixed resignation letter templates. The tool puts the user's answers into one template. No AI.

export type LetterType = 'standard' | 'short' | 'grateful' | 'new-opportunity' | 'personal' | 'immediate';

export const LETTER_TYPES: { id: LetterType; label: string; when: string }[] = [
	{ id: 'standard', label: 'Standard two weeks notice', when: 'Most jobs. A clear, polite letter with your last day.' },
	{ id: 'short', label: 'Short and simple', when: 'You want the shortest letter that does the job.' },
	{ id: 'grateful', label: 'Grateful', when: 'You liked the job and want to thank someone. Add one thing you appreciated.' },
	{ id: 'new-opportunity', label: 'New opportunity', when: 'You accepted another job and you are happy to say so.' },
	{ id: 'personal', label: 'Personal reasons (no details)', when: 'You do not want to give a reason.' },
	{ id: 'immediate', label: 'Immediate resignation', when: 'You must leave now. Read the note below the letter first.' },
];

export type ResignationInput = {
	name: string;
	manager: string;
	company: string;
	role: string;
	/** YYYY-MM-DD, or empty. */
	lastDay: string;
	type: LetterType;
	/** One thing you appreciated. Used by the grateful letter. */
	appreciated: string;
	offerHandover: boolean;
};

export type ResignationLetter = {
	subject: string;
	/** The full letter, from greeting to name. */
	body: string;
	/** A note for the writer. It is not part of the letter. */
	note: string;
};

/** "Friday, December 4, 2026" from YYYY-MM-DD. Empty or bad input gives "". */
export function formatLongDate(iso: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
	const d = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return '';
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(d);
}

/** An empty answer stays as a [placeholder], so the user can see what to fill in. */
function v(value: string, placeholder: string) {
	const t = value.trim();
	return t || `[${placeholder}]`;
}

/** Makes "[Thing]" safe to put after "for the" in a sentence. */
function lowerFirst(s: string) {
	return s.charAt(0).toLowerCase() + s.slice(1);
}

export const IMMEDIATE_NOTE =
	'An immediate resignation can affect your reference and your final pay or benefits. It may also break your contract. Check your contract and your employer’s policy before you send this letter.';

export function buildLetter(input: ResignationInput): ResignationLetter {
	const name = v(input.name, 'Your Name');
	const manager = v(input.manager, 'Manager Name');
	const company = v(input.company, 'Company');
	const role = v(input.role, 'Job Title');
	const lastDay = formatLongDate(input.lastDay) || '[Last Day]';
	const greeting = `Dear ${manager},`;
	const close = `Sincerely,\n${name}`;
	const handover = input.offerHandover
		? 'I am happy to help with the handover. I can write notes on my current work and train a colleague before I leave.'
		: '';
	const subject = input.type === 'immediate' ? `Resignation: ${name}` : `Resignation: ${name}, last day ${lastDay}`;

	let paragraphs: string[];
	let note = '';
	switch (input.type) {
		case 'short':
			paragraphs = [
				`Please accept this letter as my resignation from my position as ${role} at ${company}. My last day will be ${lastDay}.`,
				handover,
				'Thank you for the opportunity.',
			];
			break;
		case 'grateful': {
			const thing = input.appreciated.trim();
			paragraphs = [
				`I am writing to resign from my position as ${role} at ${company}. My last day will be ${lastDay}.`,
				thing
					? `I want to thank you for ${lowerFirst(thing)}. It meant a lot to me, and I will remember it.`
					: 'I want to thank you for [One Thing You Appreciated]. It meant a lot to me, and I will remember it.',
				handover,
				'Thank you again. I wish you and the team all the best.',
			];
			break;
		}
		case 'new-opportunity':
			paragraphs = [
				`I am writing to resign from my position as ${role} at ${company}. I have accepted a new opportunity. My last day will be ${lastDay}.`,
				`Thank you for what I learned here. I will do my best to finish my work before I leave.`,
				handover,
				'I wish you and the team all the best.',
			];
			break;
		case 'personal':
			paragraphs = [
				`I am writing to resign from my position as ${role} at ${company}. I am leaving for personal reasons. My last day will be ${lastDay}.`,
				'Thank you for your support during my time here.',
				handover,
				'I wish you and the team all the best.',
			];
			break;
		case 'immediate':
			paragraphs = [
				`I am writing to resign from my position as ${role} at ${company}, effective immediately.`,
				'I know this is short notice, and I am sorry for the trouble it may cause.',
				input.offerHandover
					? 'I can send handover notes on my current work to help the team.'
					: 'Please tell me how to return any company property and how to receive my final pay.',
				'Thank you for the opportunity to work here.',
			];
			note = IMMEDIATE_NOTE;
			break;
		default:
			paragraphs = [
				`Please accept this letter as formal notice that I am resigning from my position as ${role} at ${company}. My last day will be ${lastDay}.`,
				'Thank you for the opportunity to work here. I have learned a lot, and I appreciate your support.',
				handover || 'I will do my best to finish my work and make the change easy for the team.',
				'I wish you and the team all the best.',
			];
	}

	const body = [greeting, ...paragraphs.filter(Boolean), close].join('\n\n');
	return { subject, body, note };
}

/** Text between [square brackets] that the user has not filled in. */
export function openPlaceholders(text: string): string[] {
	return [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
}

/** The text to copy or download: subject line first, then the letter. */
export function withSubject(letter: ResignationLetter): string {
	return `Subject: ${letter.subject}\n\n${letter.body}`;
}
