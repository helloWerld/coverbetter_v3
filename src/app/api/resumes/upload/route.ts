import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { extractResumeText } from '@/lib/resume-extract';
import { MAX_FILE_BYTES, MAX_RESUMES, MAX_TEXT_CHARS, MESSAGES } from '@/lib/resume-limit';
import { ResumeLimitError, createResume, listResumes } from '@/lib/resumes';
import { requireUser } from '@/lib/user';

const titleSchema = z.string().trim().min(1).max(100);

function fail(error: string, status: number) {
	return Response.json({ ok: false, error }, { status });
}

/** Multipart upload: fields `file` and optional `title`. Server actions cap bodies at 1 MB, so this is a route. */
export async function POST(req: Request) {
	const { userId } = await auth();
	if (!userId) return fail(MESSAGES.signedOut, 401);

	let form: FormData;
	try {
		form = await req.formData();
	} catch {
		return fail(MESSAGES.unsupported, 400);
	}
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) return fail(MESSAGES.unsupported, 400);
	if (file.size > MAX_FILE_BYTES) return fail(MESSAGES.unsupported, 413);

	// Makes sure the users row exists, then check the limit before any parsing work.
	await requireUser();
	if ((await listResumes(userId)).filter((r) => r.kind === 'uploaded').length >= MAX_RESUMES) return fail(MESSAGES.limit, 409);

	const bytes = new Uint8Array(await file.arrayBuffer());
	const result = await extractResumeText(bytes, file.type, file.name);
	if (!result.ok) {
		const message =
			result.error === 'scanned'
				? MESSAGES.scanned
				: result.error === 'parse_failed'
					? MESSAGES.parseFailed
					: MESSAGES.unsupported;
		return fail(message, 422);
	}

	const rawTitle = form.get('title');
	const fallback = file.name.replace(/\.(pdf|docx)$/i, '') || 'Resume';
	const title = titleSchema.safeParse(typeof rawTitle === 'string' ? rawTitle : '');
	try {
		const row = await createResume(userId, {
			title: title.success ? title.data : fallback.slice(0, 100),
			text: result.text.slice(0, MAX_TEXT_CHARS),
			file: { name: file.name, type: file.type, bytes },
		});
		revalidatePath('/dashboard/resumes');
		revalidatePath('/dashboard');
		return Response.json({ ok: true, id: row.id });
	} catch (err) {
		if (err instanceof ResumeLimitError) return fail(MESSAGES.limit, 409);
		return fail(MESSAGES.generic, 500);
	}
}
