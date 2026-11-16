import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { prepAnswers, prepPacks, type PrepAnswer, type User } from '@/db/schema';
import { getApplication } from '@/lib/applications/db';
import { getDb, getEnv } from '@/lib/cf';
import { deserializeFit } from '@/lib/fit';
import { generateLetter } from '@/lib/llm';
import { runPaidAi, type PaidAiResult } from '@/lib/paid-ai';
import { getProfile } from '@/lib/profile/db';
import { getResume } from '@/lib/resumes';
import { profileForPrompt } from '@/lib/tailor-prompt';
import { buildPrepPrompt, parsePrepOutput, type PrepPackData } from './ai-prompt';

export type StoredPack = { id: string; data: PrepPackData; createdAt: Date };

export async function latestPrepPack(userId: string, applicationId: string): Promise<StoredPack | null> {
	const row = await getDb().query.prepPacks.findFirst({
		where: and(eq(prepPacks.userId, userId), eq(prepPacks.applicationId, applicationId)),
		orderBy: desc(prepPacks.createdAt),
	});
	if (!row) return null;
	try {
		return { id: row.id, data: JSON.parse(row.json) as PrepPackData, createdAt: row.createdAt };
	} catch {
		return null;
	}
}

/** The AI prep pack for one application, 1 credit. Uses the job post, the profile, and the fit gaps. */
export async function makePrepPack(user: User, applicationId: string): Promise<PaidAiResult<StoredPack>> {
	const app = await getApplication(user.id, applicationId);
	if (!app) return { ok: false, error: 'We could not find that application.', code: 'failed' };
	if (app.jobDescription.trim().length < 50) {
		return { ok: false, error: 'Add the job post to this application first (at least 50 characters).', code: 'failed' };
	}
	const profile = await getProfile(user.id);
	const hasProfile = profile.positions.length > 0;
	let profileText = hasProfile ? profileForPrompt(profile) : '';
	if (!hasProfile && app.resumeId) profileText = (await getResume(user.id, app.resumeId))?.text ?? '';
	if (!profileText.trim()) {
		return { ok: false, error: 'Fill in your career profile or link a resume to this application first.', code: 'failed' };
	}
	const known = new Set<string>();
	for (const p of [...profile.positions, ...profile.projects]) {
		known.add(p.id);
		for (const b of p.bullets) known.add(b.id);
	}
	for (const x of [...profile.education, ...profile.certifications, ...profile.skills, ...profile.other]) known.add(x.id);

	return runPaidAi(user, 'prep', async () => {
		const prompt = buildPrepPrompt({
			jobTitle: app.jobTitle,
			company: app.company,
			jobDescription: app.jobDescription,
			profileText,
			fit: deserializeFit(app.fitScore, app.fitJson),
		});
		const result = await generateLetter(getEnv(), prompt, 'sonnet', 4000);
		const data = parsePrepOutput(result.text, known);
		if (data.questions.length < 3) return { ok: false, error: 'The AI did not return a valid prep pack. You were not charged. Try again.' };
		const row = { id: crypto.randomUUID(), applicationId: app.id, userId: user.id, json: JSON.stringify(data), model: result.model, createdAt: new Date() };
		await getDb().insert(prepPacks).values(row);
		return { ok: true, value: { id: row.id, data, createdAt: row.createdAt } };
	});
}

export async function listAnswers(userId: string, applicationId: string): Promise<PrepAnswer[]> {
	return getDb()
		.select()
		.from(prepAnswers)
		.where(and(eq(prepAnswers.userId, userId), eq(prepAnswers.applicationId, applicationId)));
}

export async function saveAnswer(
	userId: string,
	applicationId: string,
	input: { questionId: string; question: string; json: string },
): Promise<void> {
	const app = await getApplication(userId, applicationId);
	if (!app) throw new Error('Application not found');
	const now = new Date();
	await getDb()
		.insert(prepAnswers)
		.values({
			id: crypto.randomUUID(),
			applicationId: app.id,
			userId,
			questionId: input.questionId.slice(0, 80),
			question: input.question.slice(0, 500),
			json: input.json.slice(0, 20000),
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [prepAnswers.applicationId, prepAnswers.questionId],
			set: { question: input.question.slice(0, 500), json: input.json.slice(0, 20000), updatedAt: now },
		});
}
