import 'server-only';
import type { User } from '@/db/schema';
import { getApplication, linkToApplication } from '@/lib/applications/db';
import { getEnv } from '@/lib/cf';
import { serializeFit } from '@/lib/fit';
import { MAX_BATCH_ROLES, buildBatchFitPrompt, parseBatchFitOutput } from '@/lib/fit-batch-prompt';
import { resolveResumeText } from '@/lib/fit-check';
import { generateLetter } from '@/lib/llm';
import { runPaidAi, type PaidAiResult } from '@/lib/paid-ai';

export type BatchFitRow = { id: string; score: number | null; summary: string };

/**
 * A quick Job Fit Score for up to 20 saved roles in one AI call, for 1 credit in total.
 * The credit is used only when at least one role gets a score. Each score is saved on its role.
 */
export async function runBatchFit(user: User, roleIds: string[], resumeId: string): Promise<PaidAiResult<BatchFitRow[]>> {
	const ids = [...new Set(roleIds.filter((x) => typeof x === 'string' && x))].slice(0, MAX_BATCH_ROLES);
	if (ids.length === 0) return { ok: false, error: 'Pick at least one role.', code: 'failed' };
	const apps = (await Promise.all(ids.map((id) => getApplication(user.id, id.slice(0, 100))))).filter(
		(a) => a !== null && a.jobDescription.trim().length >= 50,
	) as NonNullable<Awaited<ReturnType<typeof getApplication>>>[];
	if (apps.length === 0) return { ok: false, error: 'The roles that you picked have no full job post.', code: 'failed' };

	const source = await resolveResumeText(user.id, resumeId);
	if (!source.ok) return { ok: false, error: source.error, code: 'failed' };

	return runPaidAi(user, 'fit_batch', async () => {
		const prompt = buildBatchFitPrompt({ resumeText: source.text, posts: apps.map((a) => a.jobDescription) });
		const result = await generateLetter(getEnv(), prompt, 'sonnet', 7000);
		const fits = parseBatchFitOutput(result.text, apps.length);
		if (fits.every((f) => f === null)) {
			return { ok: false, error: 'The check did not return a valid result. You were not charged. Try again.' };
		}
		await Promise.all(
			apps.map((a, i) => {
				const f = fits[i];
				return f ? linkToApplication(user.id, a.id, { fitScore: f.score, fitJson: serializeFit(f) }) : null;
			}),
		);
		return { ok: true, value: apps.map((a, i) => ({ id: a.id, score: fits[i]?.score ?? null, summary: fits[i]?.summary ?? '' })) };
	});
}
