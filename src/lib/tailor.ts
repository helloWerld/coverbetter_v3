import 'server-only';
import { and, eq } from 'drizzle-orm';
import { letters, resumes, type Resume, type User } from '@/db/schema';
import { getApplication, linkToApplication } from '@/lib/applications/db';
import { getSettings } from '@/lib/applications/db';
import { getDb, getEnv } from '@/lib/cf';
import { serializeFit, type FitResult } from '@/lib/fit';
import { LANGUAGE_CODES, type LanguageCode } from '@/lib/languages';
import { generateLetter } from '@/lib/llm';
import { runPaidAi, type PaidAiResult } from '@/lib/paid-ai';
import { getProfile } from '@/lib/profile/db';
import { docToText, selectionToDoc } from '@/lib/profile/render';
import { tailoredSelectionSchema, type Profile, type TailoredSelection } from '@/lib/profile/types';
import { buildTailorPrompt, parseTailorOutput } from '@/lib/tailor-prompt';

const MAX_TAILORED = 300;

function profileHasContent(p: Profile): boolean {
	return p.positions.some((x) => x.bullets.some((b) => !b.hidden)) || p.skills.length > 0;
}

/** Saves a tailored resume version (a new row, or an update of an existing tailored row). */
export async function saveTailoredResume(
	userId: string,
	input: { resumeId?: string | null; applicationId?: string | null; title: string; selection: unknown },
	profile?: Profile,
): Promise<Resume> {
	const db = getDb();
	const p = profile ?? (await getProfile(userId));
	const selection = tailoredSelectionSchema.parse(input.selection);
	const text = docToText(selectionToDoc(p, selection)).slice(0, 30000);
	const title = input.title.trim().slice(0, 120) || 'Tailored resume';
	const now = new Date();

	if (input.resumeId) {
		const [row] = await db
			.update(resumes)
			.set({ title, text, docJson: JSON.stringify(selection), updatedAt: now })
			.where(and(eq(resumes.id, input.resumeId), eq(resumes.userId, userId), eq(resumes.kind, 'tailored')))
			.returning();
		if (row) return row;
	}

	const count = await db.select({ id: resumes.id }).from(resumes).where(and(eq(resumes.userId, userId), eq(resumes.kind, 'tailored')));
	if (count.length >= MAX_TAILORED) throw new Error('You have too many tailored resumes. Delete some old versions first.');

	const [row] = await db
		.insert(resumes)
		.values({
			id: crypto.randomUUID(),
			userId,
			title,
			text,
			kind: 'tailored',
			applicationId: input.applicationId ?? null,
			docJson: JSON.stringify(selection),
			createdAt: now,
			updatedAt: now,
		})
		.returning();
	if (input.applicationId) await linkToApplication(userId, input.applicationId, { resumeId: row.id });
	return row;
}

export function readSelection(row: Pick<Resume, 'docJson'>): TailoredSelection | null {
	if (!row.docJson) return null;
	try {
		const parsed = tailoredSelectionSchema.safeParse(JSON.parse(row.docJson));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

export type TailorPackage = {
	resumeId: string;
	letterId: string | null;
	fit: FitResult | null;
	selection: TailoredSelection;
};

/**
 * The paid AI package for one application: tailored resume + cover letter + Job Fit Score, 1 credit.
 * The credit is used only when the resume part works. A bad letter part still saves the resume.
 */
export async function tailorWithAi(user: User, applicationId: string): Promise<PaidAiResult<TailorPackage>> {
	const app = await getApplication(user.id, applicationId);
	if (!app) return { ok: false, error: 'We could not find that application.', code: 'failed' };
	if (app.jobDescription.trim().length < 50) {
		return { ok: false, error: 'Add the job post to this application first (at least 50 characters).', code: 'failed' };
	}
	const profile = await getProfile(user.id);
	if (!profileHasContent(profile)) {
		return { ok: false, error: 'Fill in your career profile first. Add your jobs and bullets.', code: 'failed' };
	}
	const settings = await getSettings(user.id);
	const language = (LANGUAGE_CODES as readonly string[]).includes(settings.language) ? (settings.language as LanguageCode) : 'en';

	return runPaidAi(user, 'tailor', async () => {
		const prompt = buildTailorPrompt({
			profile,
			jobDescription: app.jobDescription,
			tone: settings.tone,
			length: settings.length,
			language,
		});
		const result = await generateLetter(getEnv(), prompt, 'sonnet', 4500);
		const out = parseTailorOutput(result.text, profile);
		if (out.selection.positions.length === 0 && out.selection.skills.length === 0) {
			return { ok: false, error: 'The AI did not return a valid resume. You were not charged. Try again.' };
		}
		const selection = { ...out.selection, template: settings.template };
		const label = [out.jobTitle || app.jobTitle, out.company || app.company].filter(Boolean).join(' at ');
		const resume = await saveTailoredResume(
			user.id,
			{ applicationId: app.id, title: label ? `Resume for ${label}` : 'Tailored resume', selection },
			profile,
		);

		let letterId: string | null = null;
		if (out.body) {
			letterId = crypto.randomUUID();
			await getDb().insert(letters).values({
				id: letterId,
				userId: user.id,
				resumeId: resume.id,
				jobTitle: out.jobTitle || app.jobTitle,
				company: out.company || app.company,
				jobDescription: app.jobDescription,
				tone: settings.tone,
				length: settings.length,
				template: settings.template,
				language,
				body: out.body,
				model: result.model,
				fitScore: out.fit?.score ?? null,
				fitJson: out.fit ? serializeFit(out.fit) : null,
				applicationId: app.id,
			});
		}
		await linkToApplication(user.id, app.id, {
			resumeId: resume.id,
			...(letterId ? { letterId } : {}),
			...(out.fit ? { fitScore: out.fit.score, fitJson: serializeFit(out.fit) } : {}),
		});
		return { ok: true, value: { resumeId: resume.id, letterId, fit: out.fit, selection } };
	});
}
