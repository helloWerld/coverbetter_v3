import { hasPaidFeatures, isProActive } from '@/lib/access';
import { lettersLeft } from '@/lib/entitlements';
import { UNAUTHORIZED, json, userFromRequest } from '@/lib/extension-auth';
import { listResumes } from '@/lib/resumes';

/** The signed-in user's plan, letters left, and saved resumes, for the extension popup. */
export async function GET(req: Request) {
	const auth = await userFromRequest(req);
	if (!auth) return UNAUTHORIZED();
	const { user } = auth;
	const now = new Date();
	const resumes = await listResumes(user.id);
	return json({
		email: user.email,
		pro: isProActive(user, now),
		lettersLeft: lettersLeft(user, now),
		// Free users always get Professional and Standard.
		canChooseStyle: hasPaidFeatures(user, now),
		resumes: resumes.map((r) => ({ id: r.id, title: r.title })),
	});
}
