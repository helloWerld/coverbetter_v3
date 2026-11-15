'use server';

import { createExtensionToken } from '@/lib/extension-auth';
import { requireUser } from '@/lib/user';

/** Makes a new token for the Chrome extension. The page hands it to the extension. */
export async function connectExtensionAction(): Promise<{ token: string }> {
	const user = await requireUser();
	return { token: await createExtensionToken(user.id) };
}
