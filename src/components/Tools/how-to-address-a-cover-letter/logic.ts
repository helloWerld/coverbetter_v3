export type KnownId = 'full' | 'title-last' | 'job-title' | 'team' | 'nothing';
export type Title = 'Mr.' | 'Ms.' | 'Mx.' | 'Dr.';

export const KNOWN: readonly { value: KnownId; label: string }[] = [
	{ value: 'full', label: 'The full name' },
	{ value: 'title-last', label: 'The last name and title' },
	{ value: 'job-title', label: 'Only their job title' },
	{ value: 'team', label: 'Only the team or department' },
	{ value: 'nothing', label: 'Nothing' },
];

export const TITLES: readonly { value: Title; label: string }[] = [
	{ value: 'Ms.', label: 'Ms.' },
	{ value: 'Mr.', label: 'Mr.' },
	{ value: 'Mx.', label: 'Mx.' },
	{ value: 'Dr.', label: 'Dr.' },
];

export type GreetingInput = {
	fullName: string;
	title: Title;
	lastName: string;
	jobTitle: string;
	team: string;
	company: string;
};

export type Greeting = { text: string; note: string };
export type Avoid = { text: string; reason: string };
export type Result = { recommended: Greeting; others: Greeting[]; avoid: Avoid[]; tips: string[] };

export const AVOID: readonly Avoid[] = [
	{ text: 'To Whom It May Concern,', reason: 'It sounds cold and old-fashioned, and it shows that you did not look for a name.' },
	{ text: 'Dear Sir or Madam,', reason: 'It sounds dated, and it assumes the reader is a man or a woman.' },
	{ text: 'Dear Mr. or Ms. (guessed from a name),', reason: 'A guess about a title or gender can be wrong. Use the full name instead.' },
];

export const PRONOUN_ADVICE =
	'If you do not know the person’s pronouns or title, use the full name, for example “Dear Jordan Smith,”. It is polite and it is never wrong.';

const fill = (value: string, placeholder: string) => value.trim() || `[${placeholder}]`;

export function greetings(known: KnownId, input: GreetingInput): Result {
	const company = fill(input.company, 'Company');
	const full = fill(input.fullName, 'Full Name');
	const first = input.fullName.trim().split(/\s+/)[0] || '[First Name]';
	const last = fill(input.lastName, 'Last Name');
	const job = fill(input.jobTitle, 'Job Title');
	const team = fill(input.team, 'Team');
	const formal = `${input.title} ${last}`;

	switch (known) {
		case 'full':
			return {
				recommended: { text: `Dear ${full},`, note: 'Best choice. It works for every reader and needs no guess about a title.' },
				others: [
					{ text: `Hello ${full},`, note: 'A little less formal. Good for most companies.' },
					{ text: `Hi ${first},`, note: 'Casual. Use it only for a startup or a company that writes in a casual style.' },
				],
				avoid: [...AVOID],
				tips: [PRONOUN_ADVICE, 'Copy the spelling of the name from the job post, the company site, or LinkedIn.'],
			};
		case 'title-last':
			return {
				recommended: { text: `Dear ${formal},`, note: 'Best choice when you are sure of the title and the last name.' },
				others: [
					{ text: `Hello ${formal},`, note: 'A little less formal.' },
					{ text: `Dear ${fill(input.fullName, 'Full Name')},`, note: 'Use this if you know the full name and are not sure of the title.' },
				],
				avoid: [...AVOID],
				tips: [
					PRONOUN_ADVICE,
					'Use “Dr.” only when you know the person has a doctorate. Use “Mx.” only when the person uses it.',
					'In the US, “Ms.” is the usual title for a woman. Do not use “Mrs.” or “Miss” unless the person uses it.',
				],
			};
		case 'job-title':
			return {
				recommended: { text: `Dear ${job},`, note: 'Use the exact job title of the hiring manager, for example “Dear Marketing Manager,”.' },
				others: [
					{ text: `Dear ${company} Hiring Team,`, note: 'A safe choice if you are not sure the title is right.' },
					{ text: 'Dear Hiring Manager,', note: 'Common and polite. It is generic, but it is not wrong.' },
				],
				avoid: [...AVOID],
				tips: [
					'Try to find the name first. Look at the job post, the company site, and LinkedIn. A name is better than a title.',
					'If you find the name but not the title or pronouns, use the full name.',
				],
			};
		case 'team':
			return {
				recommended: { text: `Dear ${team} Hiring Team,`, note: 'Best choice when you only know the team.' },
				others: [
					{ text: `Hello ${company} ${team} Team,`, note: 'A friendly option that names the company too.' },
					{ text: 'Dear Hiring Manager,', note: 'Common and polite. It is generic, but it is not wrong.' },
				],
				avoid: [...AVOID],
				tips: [
					'Try to find the name of the team lead. Look at the job post and at LinkedIn.',
					'If you find a name but not the title or pronouns, use the full name.',
				],
			};
		case 'nothing':
			return {
				recommended: { text: `Dear ${company} Hiring Team,`, note: 'Best choice when you know nothing else. It names the company and it is polite.' },
				others: [
					{ text: 'Dear Hiring Manager,', note: 'Common and polite. It is generic, but it is not wrong.' },
					{ text: `Hello ${company} Team,`, note: 'A friendly option for a casual company.' },
					{ text: 'Dear Hiring Team,', note: 'Use it only if you do not know the company name.' },
				],
				avoid: [...AVOID],
				tips: [
					'Spend 5 minutes looking for a name. Check the job post, the company site, and LinkedIn. A name helps your letter.',
					'If the name is not public, a team greeting is fine.',
				],
			};
	}
}
