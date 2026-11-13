import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { getDb, getEnv } from '@/lib/cf';
import { resumes, type Resume } from '@/db/schema';
import { canAddResume } from '@/lib/resume-limit';

/** Thrown by createResume when the user already has the maximum. */
export class ResumeLimitError extends Error {
	constructor() {
		super('Resume limit reached');
		this.name = 'ResumeLimitError';
	}
}

export type ResumeFile = {
	name: string;
	type: string;
	bytes: Uint8Array;
};

function safeFileName(name: string): string {
	const cleaned = name
		.replace(/[^A-Za-z0-9._-]+/g, '_')
		.replace(/^[._]+/, '')
		.slice(-100);
	return cleaned || 'resume';
}

export async function listResumes(userId: string): Promise<Resume[]> {
	return getDb()
		.select()
		.from(resumes)
		.where(eq(resumes.userId, userId))
		.orderBy(desc(resumes.updatedAt));
}

export async function getResume(userId: string, id: string): Promise<Resume | null> {
	const row = await getDb().query.resumes.findFirst({
		where: and(eq(resumes.id, id), eq(resumes.userId, userId)),
	});
	return row ?? null;
}

export async function createResume(
	userId: string,
	input: { title: string; text: string; file?: ResumeFile },
): Promise<Resume> {
	const db = getDb();
	const existing = await db
		.select({ id: resumes.id })
		.from(resumes)
		.where(eq(resumes.userId, userId));
	if (!canAddResume(existing.length)) throw new ResumeLimitError();

	const id = crypto.randomUUID();
	let r2Key: string | null = null;
	let fileName: string | null = null;
	if (input.file) {
		fileName = input.file.name.slice(0, 200);
		r2Key = `resumes/${userId}/${id}/${safeFileName(input.file.name)}`;
		await getEnv().RESUMES.put(r2Key, input.file.bytes, {
			httpMetadata: { contentType: input.file.type || 'application/octet-stream' },
		});
	}

	try {
		const [row] = await db
			.insert(resumes)
			.values({ id, userId, title: input.title, text: input.text, r2Key, fileName })
			.returning();
		return row;
	} catch (err) {
		// Do not leave an orphan file when the row insert fails.
		if (r2Key) await getEnv().RESUMES.delete(r2Key).catch(() => {});
		throw err;
	}
}

export async function updateResume(
	userId: string,
	id: string,
	patch: { title?: string; text?: string },
): Promise<Resume | null> {
	const set: Partial<typeof resumes.$inferInsert> = { updatedAt: new Date() };
	if (patch.title !== undefined) set.title = patch.title;
	if (patch.text !== undefined) set.text = patch.text;
	const [row] = await getDb()
		.update(resumes)
		.set(set)
		.where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
		.returning();
	return row ?? null;
}

export async function deleteResume(userId: string, id: string): Promise<boolean> {
	const db = getDb();
	const row = await getResume(userId, id);
	if (!row) return false;
	await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
	if (row.r2Key) await getEnv().RESUMES.delete(row.r2Key).catch(() => {});
	return true;
}
