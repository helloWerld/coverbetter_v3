export const SUPPORT_TOPICS = [
	{ value: 'billing', label: 'Billing and credits' },
	{ value: 'account', label: 'My account' },
	{ value: 'bug', label: 'Something does not work' },
	{ value: 'idea', label: 'An idea or a request' },
	{ value: 'other', label: 'Other' },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]['value'];

export const SUBJECT_MAX = 120;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;
/** Requests that one user can send in 24 hours. */
export const DAILY_LIMIT = 5;

export type SupportInput = { topic: SupportTopic; subject: string; message: string };

const TOPIC_VALUES = new Set<string>(SUPPORT_TOPICS.map((t) => t.value));

/** Checks the form fields. Pure: no I/O. */
export function validateSupport(raw: Record<string, unknown>): { ok: true; value: SupportInput } | { ok: false; error: string } {
	const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
	const topic = str(raw.topic);
	const subject = str(raw.subject).replace(/\s+/g, ' ');
	const message = str(raw.message);

	if (!TOPIC_VALUES.has(topic)) return { ok: false, error: 'Pick a topic.' };
	if (!subject) return { ok: false, error: 'Add a subject.' };
	if (subject.length > SUBJECT_MAX) return { ok: false, error: `Make the subject ${SUBJECT_MAX} characters or fewer.` };
	if (message.length < MESSAGE_MIN) return { ok: false, error: `Tell us more. Use ${MESSAGE_MIN} characters or more.` };
	if (message.length > MESSAGE_MAX) return { ok: false, error: `Make the message ${MESSAGE_MAX.toLocaleString('en-US')} characters or fewer.` };
	return { ok: true, value: { topic: topic as SupportTopic, subject, message } };
}

export const topicLabel = (v: string) => SUPPORT_TOPICS.find((t) => t.value === v)?.label ?? v;
