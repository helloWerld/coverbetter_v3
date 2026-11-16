import 'server-only';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import {
	applicationEvents,
	applications,
	interviews,
	letters,
	messages,
	prepAnswers,
	prepPacks,
	resumes,
	userSettings,
	type Application,
	type ApplicationEvent,
	type Interview,
	type Message,
} from '@/db/schema';
import { getDb } from '@/lib/cf';
import type { ApplicationInput, InterviewInput } from './input';
import { parseSettings, parseSettingsJson } from './settings';
import type { AppSnapshot, EventType, InterviewRound, Source, Status, UserSettings } from './types';

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

export async function listApplications(userId: string): Promise<Application[]> {
	return getDb()
		.select()
		.from(applications)
		.where(eq(applications.userId, userId))
		.orderBy(desc(applications.updatedAt), desc(applications.id));
}

export async function getApplication(userId: string, id: string): Promise<Application | null> {
	const row = await getDb().query.applications.findFirst({
		where: and(eq(applications.id, id.slice(0, 100)), eq(applications.userId, userId)),
	});
	return row ?? null;
}

export type ApplicationDetail = {
	app: Application;
	events: ApplicationEvent[];
	interviews: Interview[];
	messages: Message[];
};

export async function getApplicationDetail(userId: string, id: string): Promise<ApplicationDetail | null> {
	const app = await getApplication(userId, id);
	if (!app) return null;
	const db = getDb();
	const [ev, iv, msg] = await Promise.all([
		db.select().from(applicationEvents).where(eq(applicationEvents.applicationId, app.id)).orderBy(asc(applicationEvents.at)),
		db.select().from(interviews).where(eq(interviews.applicationId, app.id)).orderBy(asc(interviews.at)),
		db.select().from(messages).where(eq(messages.applicationId, app.id)).orderBy(desc(messages.createdAt)),
	]);
	return { app, events: ev, interviews: iv, messages: msg };
}

export async function createApplication(
	userId: string,
	input: ApplicationInput,
	extra: { status?: Status; letterId?: string | null; resumeId?: string | null; fitScore?: number | null; fitJson?: string | null } = {},
): Promise<Application> {
	const db = getDb();
	const now = new Date();
	const status = extra.status ?? 'saved';
	const row = {
		id: newId('app'),
		userId,
		...input,
		status,
		appliedAt: status === 'saved' ? null : now,
		letterId: extra.letterId ?? null,
		resumeId: extra.resumeId ?? null,
		fitScore: extra.fitScore ?? null,
		fitJson: extra.fitJson ?? null,
		createdAt: now,
		updatedAt: now,
	};
	await db.batch([
		db.insert(applications).values(row),
		db.insert(applicationEvents).values({ id: newId('evt'), applicationId: row.id, userId, type: 'status', status, at: now }),
	]);
	return row as Application;
}

export async function updateApplication(userId: string, id: string, input: ApplicationInput): Promise<boolean> {
	const rows = await getDb()
		.update(applications)
		.set({ ...input, updatedAt: new Date() })
		.where(and(eq(applications.id, id), eq(applications.userId, userId)))
		.returning({ id: applications.id });
	return rows.length > 0;
}

/** Links a letter, a resume version, or a fit score to the application. */
export async function linkToApplication(
	userId: string,
	id: string,
	link: { letterId?: string; resumeId?: string; fitScore?: number | null; fitJson?: string | null },
): Promise<void> {
	await getDb()
		.update(applications)
		.set({ ...link, updatedAt: new Date() })
		.where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

/** Changes the status and records the event. The first move out of "saved" sets the applied date. */
export async function setStatus(userId: string, id: string, status: Status, at: Date = new Date()): Promise<boolean> {
	const app = await getApplication(userId, id);
	if (!app) return false;
	if (app.status === status) return true;
	const db = getDb();
	const appliedAt = app.appliedAt ?? (status === 'saved' ? null : at);
	await db.batch([
		db.update(applications).set({ status, appliedAt, updatedAt: new Date() }).where(eq(applications.id, app.id)),
		db.insert(applicationEvents).values({ id: newId('evt'), applicationId: app.id, userId, type: 'status', status, at }),
	]);
	return true;
}

export async function addEvent(userId: string, applicationId: string, type: EventType, at: Date = new Date()): Promise<void> {
	await getDb().insert(applicationEvents).values({ id: newId('evt'), applicationId, userId, type, status: null, at });
}

/** Deletes the application and its events, interviews, messages, and prep. Letters and resumes stay. */
export async function deleteApplication(userId: string, id: string): Promise<boolean> {
	const app = await getApplication(userId, id);
	if (!app) return false;
	const db = getDb();
	await db.batch([
		db.delete(applicationEvents).where(eq(applicationEvents.applicationId, app.id)),
		db.delete(interviews).where(eq(interviews.applicationId, app.id)),
		db.delete(messages).where(eq(messages.applicationId, app.id)),
		db.delete(prepPacks).where(eq(prepPacks.applicationId, app.id)),
		db.delete(prepAnswers).where(eq(prepAnswers.applicationId, app.id)),
		db.update(letters).set({ applicationId: null }).where(eq(letters.applicationId, app.id)),
		db.update(resumes).set({ applicationId: null }).where(eq(resumes.applicationId, app.id)),
		db.delete(applications).where(eq(applications.id, app.id)),
	]);
	return true;
}

export async function addInterview(userId: string, applicationId: string, input: InterviewInput): Promise<Interview | null> {
	const app = await getApplication(userId, applicationId);
	if (!app) return null;
	const db = getDb();
	const row = { id: newId('int'), applicationId: app.id, userId, ...input, at: input.at ?? new Date(), createdAt: new Date() };
	await db.insert(interviews).values(row);
	await db.insert(applicationEvents).values({ id: newId('evt'), applicationId: app.id, userId, type: 'interview_added', status: null, at: row.at });
	// An interview means the application reached the interview stage.
	if (app.status === 'saved' || app.status === 'applied') await setStatus(userId, app.id, 'interview', row.at);
	return row as Interview;
}

export async function updateInterview(userId: string, interviewId: string, input: InterviewInput): Promise<boolean> {
	const rows = await getDb()
		.update(interviews)
		.set({ ...input, at: input.at ?? new Date() })
		.where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
		.returning({ id: interviews.id });
	return rows.length > 0;
}

export async function deleteInterview(userId: string, interviewId: string): Promise<boolean> {
	const rows = await getDb()
		.delete(interviews)
		.where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
		.returning({ id: interviews.id });
	return rows.length > 0;
}

export async function getInterview(userId: string, interviewId: string): Promise<Interview | null> {
	const row = await getDb().query.interviews.findFirst({
		where: and(eq(interviews.id, interviewId.slice(0, 100)), eq(interviews.userId, userId)),
	});
	return row ?? null;
}

/** All applications as plain snapshots, for the analytics and the reminders. */
export async function loadSnapshots(userId: string): Promise<AppSnapshot[]> {
	const db = getDb();
	const [apps, ev, iv] = await Promise.all([
		listApplications(userId),
		db.select().from(applicationEvents).where(eq(applicationEvents.userId, userId)).orderBy(asc(applicationEvents.at)),
		db.select().from(interviews).where(eq(interviews.userId, userId)).orderBy(asc(interviews.at)),
	]);
	const evBy = new Map<string, ApplicationEvent[]>();
	for (const e of ev) evBy.set(e.applicationId, [...(evBy.get(e.applicationId) ?? []), e]);
	const ivBy = new Map<string, Interview[]>();
	for (const i of iv) ivBy.set(i.applicationId, [...(ivBy.get(i.applicationId) ?? []), i]);
	return apps.map((a) => ({
		id: a.id,
		status: a.status as Status,
		source: a.source as Source,
		createdAt: a.createdAt,
		appliedAt: a.appliedAt,
		hasResume: Boolean(a.resumeId),
		hasLetter: Boolean(a.letterId),
		fitScore: a.fitScore,
		events: (evBy.get(a.id) ?? []).map((e) => ({ type: e.type as EventType, status: (e.status as Status | null) ?? null, at: e.at })),
		interviews: (ivBy.get(a.id) ?? []).map((i) => ({ round: i.round as InterviewRound, at: i.at })),
	}));
}

export async function getSettings(userId: string): Promise<UserSettings> {
	const row = await getDb().query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
	return parseSettingsJson(row?.json);
}

export async function saveSettings(userId: string, raw: unknown): Promise<UserSettings> {
	const s = parseSettings(raw);
	const json = JSON.stringify(s);
	await getDb()
		.insert(userSettings)
		.values({ userId, json, updatedAt: new Date() })
		.onConflictDoUpdate({ target: userSettings.userId, set: { json, updatedAt: new Date() } });
	return s;
}

/** Deletes all dashboard data of a user. Used when the account is deleted. */
export async function deleteDashboardData(userId: string): Promise<void> {
	const db = getDb();
	await db.batch([
		db.delete(applicationEvents).where(eq(applicationEvents.userId, userId)),
		db.delete(interviews).where(eq(interviews.userId, userId)),
		db.delete(messages).where(eq(messages.userId, userId)),
		db.delete(prepPacks).where(eq(prepPacks.userId, userId)),
		db.delete(prepAnswers).where(eq(prepAnswers.userId, userId)),
		db.delete(applications).where(eq(applications.userId, userId)),
		db.delete(userSettings).where(eq(userSettings.userId, userId)),
	]);
}

export async function getMessage(userId: string, id: string): Promise<Message | null> {
	const row = await getDb().query.messages.findFirst({ where: and(eq(messages.id, id.slice(0, 100)), eq(messages.userId, userId)) });
	return row ?? null;
}

export async function saveMessage(
	userId: string,
	applicationId: string,
	m: { kind: string; interviewId?: string | null; subject: string; body: string; mode: 'template' | 'ai'; model?: string },
): Promise<Message> {
	const row = {
		id: newId('msg'),
		applicationId,
		userId,
		kind: m.kind,
		interviewId: m.interviewId ?? null,
		subject: m.subject.slice(0, 300),
		body: m.body.slice(0, 10000),
		mode: m.mode,
		model: m.model ?? '',
		sentAt: null,
		createdAt: new Date(),
	};
	await getDb().insert(messages).values(row);
	return row as Message;
}

export async function updateMessage(userId: string, id: string, subject: string, body: string): Promise<boolean> {
	const rows = await getDb()
		.update(messages)
		.set({ subject: subject.slice(0, 300), body: body.slice(0, 10000) })
		.where(and(eq(messages.id, id), eq(messages.userId, userId)))
		.returning({ id: messages.id });
	return rows.length > 0;
}

/** Marks a message as sent and records the event, so the reminders and analytics see it. */
export async function markMessageSent(userId: string, id: string): Promise<boolean> {
	const msg = await getMessage(userId, id);
	if (!msg || msg.sentAt) return Boolean(msg);
	const now = new Date();
	const db = getDb();
	await db.batch([
		db.update(messages).set({ sentAt: now }).where(eq(messages.id, msg.id)),
		db.insert(applicationEvents).values({
			id: newId('evt'),
			applicationId: msg.applicationId,
			userId,
			type: msg.kind === 'thank_you' ? 'thank_you_sent' : 'follow_up_sent',
			status: null,
			at: now,
		}),
	]);
	return true;
}

export async function deleteMessage(userId: string, id: string): Promise<boolean> {
	const rows = await getDb()
		.delete(messages)
		.where(and(eq(messages.id, id), eq(messages.userId, userId)))
		.returning({ id: messages.id });
	return rows.length > 0;
}

/** Titles of the letters and resumes linked to the given applications, for the list page. */
export async function linkedTitles(userId: string, apps: Application[]) {
	const resumeIds = apps.map((a) => a.resumeId).filter((v): v is string => Boolean(v));
	if (resumeIds.length === 0) return new Map<string, string>();
	const rows = await getDb()
		.select({ id: resumes.id, title: resumes.title })
		.from(resumes)
		.where(and(eq(resumes.userId, userId), inArray(resumes.id, resumeIds.slice(0, 90))));
	return new Map(rows.map((r) => [r.id, r.title]));
}

/** The user's follow-up and thank-you letters, newest first. */
export async function listMessages(userId: string, limit = 50): Promise<Message[]> {
	return getDb().select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt), desc(messages.id)).limit(limit);
}

/** Saves the contact person of a role, for example the recipient of a follow-up. */
export async function setContact(userId: string, id: string, name: string, email: string): Promise<void> {
	await getDb()
		.update(applications)
		.set({ contactName: name.trim().slice(0, 200), contactEmail: email.trim().slice(0, 200), updatedAt: new Date() })
		.where(and(eq(applications.id, id), eq(applications.userId, userId)));
}
