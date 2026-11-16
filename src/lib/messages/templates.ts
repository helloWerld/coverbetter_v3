import type { MessageKind } from '@/lib/applications/types';

export type MessageInput = {
	kind: MessageKind;
	applicantName: string;
	company: string;
	jobTitle: string;
	appliedOn?: Date;
	contactName?: string;
	interviewDate?: Date;
	interviewerName?: string;
	/** A short noun phrase, for example "the move to a new billing system". */
	topic?: string;
	/** A short noun phrase the applicant is glad to explain more, for example "my gap in 2023". */
	clarify?: string;
	/** A short noun phrase, for example "experience leading data migrations". */
	strength?: string;
};

export type MessageVariant = {
	id: 'short' | 'warm' | 'formal';
	label: string;
	build: (input: MessageInput) => { subject: string; body: string };
};

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
const noDot = (s: string) => s.replace(/[.\s]+$/, '');

/** Dates use the local time zone of the runtime, for example "March 3". */
function day(d: Date): string {
	return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function weekday(d: Date): string {
	return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function join(parts: (string | false | undefined | '')[]): string {
	return parts
		.filter((p): p is string => typeof p === 'string' && p.trim() !== '')
		.map((p) => p.replace(/[ \t]+/g, ' ').trim())
		.join('\n\n');
}

function signOff(word: string, name: string): string {
	const n = clean(name);
	return n ? `${word}\n${n}` : word;
}

function greeting(style: 'short' | 'warm' | 'formal', name: string | undefined): string {
	const n = clean(name);
	if (style === 'formal') return n ? `Dear ${n},` : 'Dear Hiring Team,';
	return n ? `Hello ${n},` : 'Hello,';
}

function strengthLine(input: MessageInput): string {
	const s = noDot(clean(input.strength));
	return s ? `I believe my ${s} would help me contribute quickly.` : '';
}

function clarifyLine(input: MessageInput): string {
	const c = noDot(clean(input.clarify));
	return c ? `If it helps, I am glad to say more about ${c}.` : '';
}

function extras(input: MessageInput): string {
	return [strengthLine(input), clarifyLine(input)].filter(Boolean).join(' ');
}

const role = (i: MessageInput) => clean(i.jobTitle) || 'open';
const co = (i: MessageInput) => clean(i.company) || 'your company';
const appliedOn = (i: MessageInput) => (i.appliedOn ? ` on ${day(i.appliedOn)}` : '');
const roleWord = (i: MessageInput) => (clean(i.jobTitle) ? `${clean(i.jobTitle)} position` : 'open position');

// ---- follow-up after applying ----

const followUp: MessageVariant[] = [
	{
		id: 'short',
		label: 'Short',
		build: (i) => ({
			subject: `Following up: ${role(i)} application`,
			body: join([
				greeting('short', i.contactName),
				`I applied for the ${roleWord(i)} at ${co(i)}${appliedOn(i)}, and I am still very interested. I know hiring takes time, so I wanted to check where things stand and whether my application is still under review.`,
				extras(i),
				'If you need anything more from me, such as work samples, references, or a different format for my resume, I can send it the same day. Could you tell me whether the team has a timeline for next steps?',
				'Thank you for your time.',
				signOff('Best,', i.applicantName),
			]),
		}),
	},
	{
		id: 'warm',
		label: 'Warm',
		build: (i) => ({
			subject: `Checking in on my ${role(i)} application`,
			body: join([
				greeting('warm', i.contactName),
				`Thank you again for the chance to apply for the ${roleWord(i)} at ${co(i)}. I submitted my application${appliedOn(i)}, and the more I learn about the team, the more I want to be part of it.`,
				extras(i),
				'I understand that choosing candidates takes time, and I do not want to add pressure. If you have a rough idea of when you will decide on interviews, I would be grateful to hear it. If there is anything else I can send, such as a portfolio or answers to extra questions, please tell me.',
				'Thanks so much, and have a good week.',
				signOff('Warmly,', i.applicantName),
			]),
		}),
	},
	{
		id: 'formal',
		label: 'Formal',
		build: (i) => ({
			subject: `Application follow-up: ${role(i)}`,
			body: join([
				greeting('formal', i.contactName),
				`I am writing to follow up on my application for the ${roleWord(i)} at ${co(i)}, submitted${appliedOn(i) || ' recently'}. I remain very interested in the opportunity and in the work your team does, and I believe my background fits the position well.`,
				extras(i),
				'Please let me know if you need additional information from me, including references, work samples, or a revised resume. I would also appreciate an update on the expected timeline for the selection process.',
				'Thank you for your consideration.',
				signOff('Sincerely,', i.applicantName),
			]),
		}),
	},
];

// ---- second follow-up ----

const followUp2: MessageVariant[] = [
	{
		id: 'short',
		label: 'Short',
		build: (i) => ({
			subject: `Second follow-up: ${role(i)} application`,
			body: join([
				greeting('short', i.contactName),
				`I am following up once more on my application for the ${roleWord(i)} at ${co(i)}${appliedOn(i)}. I sent a note earlier, and I understand that you may be very busy.`,
				extras(i),
				'If you are still reviewing candidates, I would be glad to talk at any time that suits you, even for a short call. If the role has been filled or the search is on hold, a brief reply would help me plan. I would still value being considered for future openings.',
				'Thank you for your time.',
				signOff('Best,', i.applicantName),
			]),
		}),
	},
	{
		id: 'warm',
		label: 'Warm',
		build: (i) => ({
			subject: `One more note on the ${role(i)} role`,
			body: join([
				greeting('warm', i.contactName),
				`I am writing again about the ${roleWord(i)} at ${co(i)}${appliedOn(i)}, because I am still excited about it and I did not want my first note to get lost.`,
				extras(i),
				'If the team is still deciding, I am happy to answer questions or to send more detail. If the plans have changed, I understand, and I would appreciate a short word so that I can move forward. Either way, I am grateful for your time and for the way you have handled my application so far.',
				signOff('Warm regards,', i.applicantName),
			]),
		}),
	},
	{
		id: 'formal',
		label: 'Formal',
		build: (i) => ({
			subject: `Follow-up: ${role(i)} application at ${co(i)}`,
			body: join([
				greeting('formal', i.contactName),
				`I am writing for a second time about my application for the ${roleWord(i)} at ${co(i)}${appliedOn(i)}. I appreciate that your team has many demands on its time.`,
				extras(i),
				'I remain keen to contribute to your organization and would welcome a conversation at your convenience. If a decision has already been made, I would be grateful to learn of it, and I would like to stay in mind for future opportunities that suit my background.',
				'Thank you for your attention to this matter.',
				signOff('Sincerely,', i.applicantName),
			]),
		}),
	},
];

// ---- thank-you after an interview ----

function met(i: MessageInput): string {
	const when = i.interviewDate ? ` on ${weekday(i.interviewDate)}` : '';
	return `${when}`;
}

function topicLine(i: MessageInput): string {
	const t = noDot(clean(i.topic));
	return t
		? `I especially enjoyed our conversation about ${t}.`
		: 'I enjoyed learning more about the team and how this role fits into its work.';
}

const thankYou: MessageVariant[] = [
	{
		id: 'short',
		label: 'Short',
		build: (i) => ({
			subject: `Thank you: ${role(i)} interview`,
			body: join([
				greeting('short', i.interviewerName || i.contactName),
				`Thank you for meeting with me${met(i)} about the ${roleWord(i)} at ${co(i)}. ${topicLine(i)}`,
				`Our conversation made me more interested in the role, and it gave me a clearer picture of the work and the goals of the team. ${extras(i)}`,
				'Please let me know if I can send anything else to help with your decision. I would be glad to continue the conversation at any point.',
				signOff('Thank you again,', i.applicantName),
			]),
		}),
	},
	{
		id: 'warm',
		label: 'Warm',
		build: (i) => ({
			subject: `Thank you for your time, ${role(i)} role`,
			body: join([
				greeting('warm', i.interviewerName || i.contactName),
				`Thank you so much for the time you gave me${met(i)}. I left our conversation about the ${roleWord(i)} at ${co(i)} feeling even more positive about the team and the work. ${topicLine(i)}`,
				extras(i),
				'I would love the chance to join you, and I am happy to share anything that would help, such as references or examples of my work. Thank you again for your openness and for answering my questions so clearly.',
				signOff('Warmly,', i.applicantName),
			]),
		}),
	},
	{
		id: 'formal',
		label: 'Formal',
		build: (i) => ({
			subject: `Thank you for the ${role(i)} interview`,
			body: join([
				greeting('formal', i.interviewerName || i.contactName),
				`Thank you for taking the time to interview me${met(i)} for the ${roleWord(i)} at ${co(i)}. ${topicLine(i)}`,
				`The discussion confirmed my interest in the position and in your organization, and I appreciated your clear answers to my questions. ${extras(i)}`,
				'Should you need additional information to support your decision, I would be pleased to provide it. I look forward to the next steps in the process.',
				signOff('Sincerely,', i.applicantName),
			]),
		}),
	},
];

export const MESSAGE_TEMPLATES: Record<MessageKind, MessageVariant[]> = {
	follow_up: followUp,
	follow_up_2: followUp2,
	thank_you: thankYou,
};

/** Builds one message. An unknown variant id falls back to the first variant of the kind. */
export function fillTemplate(
	kind: MessageKind,
	variantId: string,
	input: MessageInput,
): { subject: string; body: string } {
	const list = MESSAGE_TEMPLATES[kind];
	const variant = list.find((v) => v.id === variantId) ?? list[0];
	const out = variant.build({ ...input, kind });
	return {
		subject: out.subject.replace(/\s+/g, ' ').trim(),
		// Keep line breaks, but remove double spaces and spaces at the end of a line.
		body: out.body
			.split('\n')
			.map((l) => l.replace(/ {2,}/g, ' ').trimEnd())
			.join('\n')
			.trim(),
	};
}

const MAILTO_LIMIT = 1800;

function buildMailto(to: string, subject: string, body: string): string {
	const addr = encodeURIComponent(to.trim()).replace(/%40/g, '@').replace(/%2C/gi, ',');
	// Mail apps expect CRLF line breaks.
	const crlf = body.replace(/\r?\n/g, '\r\n');
	return `mailto:${addr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

/** A mailto link. If the link is longer than 1800 characters, the body is cut and ends with "...". */
export function mailtoLink(to: string, subject: string, body: string): string {
	const subj = subject.length > 200 ? `${subject.slice(0, 197)}...` : subject;
	const full = buildMailto(to, subj, body);
	if (full.length <= MAILTO_LIMIT) return full;

	const fits = (n: number) => buildMailto(to, subj, `${safeSlice(body, n).trimEnd()}...`).length <= MAILTO_LIMIT;
	let lo = 0;
	let hi = body.length;
	while (lo < hi) {
		const mid = Math.ceil((lo + hi) / 2);
		if (fits(mid)) lo = mid;
		else hi = mid - 1;
	}
	return buildMailto(to, subj, `${safeSlice(body, lo).trimEnd()}...`);
}

// A cut between two halves of a surrogate pair would make encodeURIComponent throw.
function safeSlice(s: string, n: number): string {
	if (n > 0 && n < s.length) {
		const c = s.charCodeAt(n - 1);
		if (c >= 0xd800 && c <= 0xdbff) return s.slice(0, n - 1);
	}
	return s.slice(0, n);
}
