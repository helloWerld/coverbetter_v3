import { UNAUTHORIZED, json, userFromRequest } from '@/lib/extension-auth';
import { BAND_LABEL, fitBand } from '@/lib/fit';
import { generateForUser } from '@/lib/generate';

/** Writes a letter from a saved resume and the job post the extension read. */
export async function POST(req: Request) {
	const auth = await userFromRequest(req);
	if (!auth) return UNAUTHORIZED();

	let body: Record<string, unknown>;
	try {
		const parsed: unknown = await req.json();
		if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
		body = parsed as Record<string, unknown>;
	} catch {
		return json({ error: 'The request was not valid. Update the extension and try again.' }, 400);
	}

	if (typeof body.resumeId !== 'string' || !body.resumeId) {
		return json({ error: 'Pick a saved resume first.' }, 400);
	}

	const out = await generateForUser(auth.user, {
		resumeId: body.resumeId,
		jobDescription: body.jobDescription,
		tone: body.tone,
		length: body.length,
		language: body.language,
	});
	if (!out.ok) {
		const status = out.code === 'rate_limit' ? 429 : out.code ? 402 : 400;
		return json({ error: out.error, code: out.code }, status);
	}
	return json({
		letterId: out.letterId,
		jobTitle: out.jobTitle,
		company: out.company,
		body: out.body,
		// Null for free letters.
		fit: out.fit
			? {
					score: out.fit.score,
					label: BAND_LABEL[fitBand(out.fit.score)],
					summary: out.fit.summary,
					missing: out.fit.requirements.filter((r) => r.status === 'missing').map((r) => r.requirement),
					partial: out.fit.requirements.filter((r) => r.status === 'partial').map((r) => r.requirement),
				}
			: null,
		url: `${new URL(req.url).origin}/dashboard/letters/${out.letterId}`,
	});
}
