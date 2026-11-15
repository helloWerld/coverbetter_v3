export type TemplateId = 'cold' | 'connection' | 'referral' | 'informational' | 'follow-up';
export type LimitId = 'connection' | 'message';

export type MessageInput = {
	recipient: string;
	name: string;
	role: string;
	company: string;
	background: string;
	reason: string;
};

export const CONNECTION_LIMIT = 300;

export const LIMITS: readonly { value: LimitId; label: string }[] = [
	{ value: 'connection', label: `LinkedIn connection note (${CONNECTION_LIMIT} characters)` },
	{ value: 'message', label: 'LinkedIn message / InMail (no strict limit, keep it short)' },
];

export const TEMPLATE_LIST: readonly { id: TemplateId; label: string; when: string; limit: LimitId }[] = [
	{ id: 'cold', label: 'Cold message to a recruiter', when: 'Use it when you want to apply and have no contact at the company.', limit: 'message' },
	{ id: 'connection', label: 'LinkedIn connection note', when: 'Use it with the “Add a note” box when you send a connection request.', limit: 'connection' },
	{ id: 'referral', label: 'Referral request to an employee', when: 'Use it for a person who works at the company. Ask, and make it easy to say no.', limit: 'message' },
	{ id: 'informational', label: 'Informational interview request', when: 'Use it to ask for a short talk about the work, not to ask for a job.', limit: 'message' },
	{ id: 'follow-up', label: 'Follow-up after no reply', when: 'Use it once, after about a week of silence. Do not send more than one.', limit: 'message' },
];

const fill = (value: string, placeholder: string) => value.trim() || `[${placeholder}]`;

/** First word of the name the user types, so "Maria Ortiz" greets as "Maria". Titles stay as typed. */
export function greetingName(recipient: string): string {
	const t = recipient.trim();
	if (!t) return '[First Name]';
	return /^(mr|ms|mrs|mx|dr)\.?\s/i.test(t) ? t : t.split(/\s+/)[0];
}

type F = { to: string; name: string; role: string; company: string; me: string; why: string };

const BUILD: Record<TemplateId, (f: F) => string> = {
	cold: (f) =>
		`Hi ${f.to},\n\nI saw the ${f.role} role at ${f.company} and I would like to apply. I am ${f.me}. I am interested in ${f.company} because ${f.why}.\n\nCould you tell me the best way to get my resume to the right person? I can send it here.\n\nThank you,\n${f.name}`,
	connection: (f) =>
		`Hi ${f.to}, I am ${f.me}. I am interested in the ${f.role} role at ${f.company} and would like to connect. Thank you, ${f.name}`,
	referral: (f) =>
		`Hi ${f.to},\n\nI am ${f.me}. I plan to apply for the ${f.role} role at ${f.company}. I am interested in the work there because ${f.why}.\n\nWould you be open to referring me? I can send my resume and a short note on why I fit the role. I understand if now is not a good time.\n\nThank you,\n${f.name}`,
	informational: (f) =>
		`Hi ${f.to},\n\nI am ${f.me}, and I want to learn more about ${f.role} work. I like what ${f.company} does because ${f.why}.\n\nWould you have 15 to 20 minutes for a short call in the next few weeks? I would like to ask about your path and what the work is like day to day.\n\nThank you,\n${f.name}`,
	'follow-up': (f) =>
		`Hi ${f.to},\n\nI am writing again about the ${f.role} role at ${f.company}. I know you are busy. I am still interested, because ${f.why}.\n\nIf now is not the right time, that is fine. If someone else is the right contact, I would be glad to hear who.\n\nThank you,\n${f.name}`,
};

export function buildMessage(id: TemplateId, input: MessageInput): string {
	return BUILD[id]({
		to: greetingName(input.recipient),
		name: fill(input.name, 'Your Name'),
		role: fill(input.role, 'Job Title'),
		company: fill(input.company, 'Company'),
		me: fill(input.background, 'who you are, for example a data analyst with 4 years in retail'),
		why: fill(input.reason, 'the reason you want to work there'),
	});
}

/** Counts characters the way a person sees them, so an emoji counts once. Line breaks count. */
export function countChars(text: string): number {
	return Array.from(text).length;
}

export type CounterState = { count: number; limit: number | null; over: number; status: 'ok' | 'over' | 'info' };

export function counter(text: string, limit: LimitId): CounterState {
	const count = countChars(text);
	if (limit === 'message') return { count, limit: null, over: 0, status: 'info' };
	const over = Math.max(0, count - CONNECTION_LIMIT);
	return { count, limit: CONNECTION_LIMIT, over, status: over > 0 ? 'over' : 'ok' };
}

export function openPlaceholders(text: string): string[] {
	const found = text.match(/\[[^\]]+\]/g) ?? [];
	return [...new Set(found.map((s) => s.slice(1, -1)))];
}
