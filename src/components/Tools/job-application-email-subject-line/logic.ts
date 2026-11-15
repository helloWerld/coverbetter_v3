export type EmailType =
	| 'application'
	| 'referral'
	| 'follow-up'
	| 'thank-you'
	| 'accept'
	| 'decline'
	| 'informational';

export type SubjectInput = { role: string; name: string; jobId: string; referrer: string };

export const EMAIL_TYPES: readonly { value: EmailType; label: string; roleLabel: string }[] = [
	{ value: 'application', label: 'Job application', roleLabel: 'Job title' },
	{ value: 'referral', label: 'Referral application', roleLabel: 'Job title' },
	{ value: 'follow-up', label: 'Follow-up after applying', roleLabel: 'Job title' },
	{ value: 'thank-you', label: 'Thank you after interview', roleLabel: 'Job title' },
	{ value: 'accept', label: 'Accept offer', roleLabel: 'Job title' },
	{ value: 'decline', label: 'Decline offer', roleLabel: 'Job title' },
	{ value: 'informational', label: 'Informational interview request', roleLabel: 'Role or field you want to learn about' },
];

/** A guideline only. Phone mail apps show different amounts of a subject line. */
export const LENGTH_GUIDELINE = 60;

const fill = (value: string, placeholder: string) => value.trim() || `[${placeholder}]`;

export type SubjectLine = { text: string; length: number; long: boolean };

/** Counts characters the way a person sees them, so an emoji or accented letter counts once. */
export function countChars(text: string): number {
	return Array.from(text).length;
}

export function buildSubjects(type: EmailType, input: SubjectInput): SubjectLine[] {
	const r = fill(input.role, 'Job Title');
	const n = fill(input.name, 'Your Name');
	const f = fill(input.referrer, 'Referrer Name');
	const j = input.jobId.trim();
	const hasId = j.length > 0;

	let lines: string[];
	switch (type) {
		case 'application':
			lines = [`Application for ${r}: ${n}`, `${r} application: ${n}`, `${n}: application for ${r}`];
			if (hasId) lines.push(`Application for ${r} (Job ID ${j}): ${n}`, `${r}, Job ID ${j}: ${n}`);
			break;
		case 'referral':
			lines = [
				`Referred by ${f}: ${r} application`,
				`${r} application, referred by ${f}`,
				`${f} suggested I apply for ${r}`,
				`Application for ${r} (referred by ${f}): ${n}`,
			];
			if (hasId) lines.push(`${r}, Job ID ${j}, referred by ${f}`);
			break;
		case 'follow-up':
			lines = [
				`Following up on my ${r} application`,
				`Checking in: ${r} application, ${n}`,
				`${n}: update on my ${r} application`,
				`Question about my ${r} application`,
			];
			if (hasId) lines.push(`Following up: ${r} (Job ID ${j})`);
			break;
		case 'thank-you':
			lines = [
				`Thank you: ${r} interview`,
				`Thank you for your time, ${n}`,
				`Thank you for talking with me about the ${r} role`,
				`${n}: thank you for the ${r} interview`,
			];
			break;
		case 'accept':
			lines = [
				`Accepting the ${r} offer: ${n}`,
				`I accept the ${r} offer`,
				`Offer acceptance: ${r}, ${n}`,
				`Thank you for the ${r} offer`,
			];
			break;
		case 'decline':
			lines = [
				`Declining the ${r} offer: ${n}`,
				`Thank you for the ${r} offer`,
				`My decision about the ${r} offer`,
				`${r} offer: ${n}`,
			];
			break;
		case 'informational':
			lines = [
				`Informational interview request: ${n}`,
				`Could I ask you a few questions about ${r}?`,
				`${n}: request for a short chat about ${r}`,
				`A short question about your work in ${r}`,
			];
			if (input.referrer.trim()) lines.push(`Referred by ${input.referrer.trim()}: informational interview request`);
			break;
	}
	return lines.map((text) => {
		const length = countChars(text);
		return { text, length, long: length > LENGTH_GUIDELINE };
	});
}
