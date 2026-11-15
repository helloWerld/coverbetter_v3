export type InterviewType = 'phone' | 'video' | 'in-person' | 'panel' | 'final';
export type Tone = 'formal' | 'warm';

export type EmailInput = {
	interviewer: string;
	role: string;
	company: string;
	topic: string;
	name: string;
};

export const INTERVIEW_TYPES: readonly { value: InterviewType; label: string; tip: string }[] = [
	{ value: 'phone', label: 'Phone screen', tip: 'A phone screen is short. Keep the email short too.' },
	{ value: 'video', label: 'Video interview', tip: 'Mention one thing from the conversation so the email does not read like a form.' },
	{ value: 'in-person', label: 'In-person interview', tip: 'If you met more than one person, send each person a separate email.' },
	{
		value: 'panel',
		label: 'Panel interview',
		tip: 'Send one email to each panel member, and change one detail in each. If you only have one email address, write all the names in the first field.',
	},
	{ value: 'final', label: 'Final round', tip: 'Say plainly that you want the job, and offer to send anything the team needs for a decision.' },
];

export const TONES: readonly { value: Tone; label: string }[] = [
	{ value: 'formal', label: 'Formal' },
	{ value: 'warm', label: 'Warm' },
];

export const TIMING_NOTE =
	'Send the email within about one business day after the interview. This is common advice, not a rule. A later email is still fine.';

type Filled = { i: string; role: string; company: string; topic: string; name: string };

const fill = (value: string, placeholder: string) => value.trim() || `[${placeholder}]`;

type Template = { subject: (f: Filled) => string; body: (f: Filled) => string };

const TEMPLATES: Record<InterviewType, Record<Tone, Template>> = {
	phone: {
		formal: {
			subject: (f) => `Thank you: ${f.role} phone screen`,
			body: (f) =>
				`Dear ${f.i},\n\nThank you for speaking with me about the ${f.role} role at ${f.company}. I enjoyed our conversation about ${f.topic}.\n\nOur talk made me more interested in the role. My experience fits what you described, and I would like to take the next step.\n\nPlease tell me if I can send you anything else. I look forward to hearing from you.\n\nSincerely,\n${f.name}`,
		},
		warm: {
			subject: (f) => `Thank you for the call: ${f.role}`,
			body: (f) =>
				`Hi ${f.i},\n\nThank you for the call about the ${f.role} role at ${f.company}. I enjoyed our talk about ${f.topic}.\n\nIt made me more excited about the work. I would be glad to talk about next steps, or to send anything else you need.\n\nThanks again,\n${f.name}`,
		},
	},
	video: {
		formal: {
			subject: (f) => `Thank you for the ${f.role} video interview`,
			body: (f) =>
				`Dear ${f.i},\n\nThank you for taking the time to meet with me by video about the ${f.role} role at ${f.company}. I enjoyed our discussion of ${f.topic}.\n\nThe conversation gave me a clearer picture of the work. I believe my background fits the role, and I would be glad to join the team.\n\nPlease let me know if you need anything else from me.\n\nSincerely,\n${f.name}`,
		},
		warm: {
			subject: (f) => `Thanks for the video chat: ${f.role}`,
			body: (f) =>
				`Hi ${f.i},\n\nThank you for the video interview for the ${f.role} role at ${f.company}. I enjoyed our talk about ${f.topic}.\n\nI left the call more excited about the role and the team. If I can send you anything else, tell me and I will do it right away.\n\nThanks again,\n${f.name}`,
		},
	},
	'in-person': {
		formal: {
			subject: (f) => `Thank you for meeting with me: ${f.role}`,
			body: (f) =>
				`Dear ${f.i},\n\nThank you for meeting with me in person about the ${f.role} role at ${f.company}. It was good to meet you, and I enjoyed our conversation about ${f.topic}.\n\nSeeing how the team works made me more interested in the role. I believe I can help, and I would like to continue the process.\n\nPlease contact me if you need any other information.\n\nSincerely,\n${f.name}`,
		},
		warm: {
			subject: (f) => `Great to meet you: ${f.role}`,
			body: (f) =>
				`Hi ${f.i},\n\nThank you for meeting with me about the ${f.role} role at ${f.company}. It was good to meet you in person, and I enjoyed our talk about ${f.topic}.\n\nI left feeling more excited about the job. I would be happy to answer any other questions.\n\nThanks again,\n${f.name}`,
		},
	},
	panel: {
		formal: {
			subject: (f) => `Thank you: ${f.role} panel interview`,
			body: (f) =>
				`Dear ${f.i},\n\nThank you for the time you gave me during the panel interview for the ${f.role} role at ${f.company}. I enjoyed our discussion of ${f.topic}.\n\nI learned a lot from each of your questions. They helped me see what the team needs, and I believe my experience fits those needs.\n\nPlease tell me if I can send you anything else. I look forward to the next step.\n\nSincerely,\n${f.name}`,
		},
		warm: {
			subject: (f) => `Thanks for the conversation: ${f.role}`,
			body: (f) =>
				`Hi ${f.i},\n\nThank you for meeting with me for the ${f.role} role at ${f.company}. I enjoyed our talk about ${f.topic}.\n\nYour questions helped me see how the team works, and they made me more excited about the job. If you need anything else from me, please ask.\n\nThanks again,\n${f.name}`,
		},
	},
	final: {
		formal: {
			subject: (f) => `Thank you: ${f.role} final interview`,
			body: (f) =>
				`Dear ${f.i},\n\nThank you for the chance to meet with you and the team about the ${f.role} role at ${f.company}. I enjoyed our discussion of ${f.topic}.\n\nAfter this conversation, I am very interested in joining ${f.company}. I believe I can do the work well, and I would be glad to accept the next step.\n\nIf you need references or any other information to make your decision, please tell me.\n\nSincerely,\n${f.name}`,
		},
		warm: {
			subject: (f) => `Thank you, and I want this job: ${f.role}`,
			body: (f) =>
				`Hi ${f.i},\n\nThank you for the time you and the team gave me for the ${f.role} role at ${f.company}. I enjoyed our talk about ${f.topic}.\n\nI want to say plainly that I would love to join ${f.company}. If I can send you references or anything else for your decision, tell me and I will send it.\n\nThanks again,\n${f.name}`,
		},
	},
};

function filled(input: EmailInput): Filled {
	return {
		i: fill(input.interviewer, 'Interviewer Name'),
		role: fill(input.role, 'Job Title'),
		company: fill(input.company, 'Company'),
		topic: fill(input.topic, 'a topic from your talk'),
		name: fill(input.name, 'Your Name'),
	};
}

export function buildEmail(type: InterviewType, tone: Tone, input: EmailInput): { subject: string; body: string; text: string } {
	const f = filled(input);
	const t = TEMPLATES[type][tone];
	const subject = t.subject(f);
	const body = t.body(f);
	return { subject, body, text: `Subject: ${subject}\n\n${body}` };
}

/** The names of the [bracket] parts that are still open, without duplicates. */
export function openPlaceholders(text: string): string[] {
	const found = text.match(/\[[^\]]+\]/g) ?? [];
	return [...new Set(found.map((s) => s.slice(1, -1)))];
}
