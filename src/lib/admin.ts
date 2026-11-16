import 'server-only';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/user';
import { isAdminEmail } from '@/lib/admin-email';

/** The admin page is for the admin account only. Other users get a 404, so the page does not show that it exists. */
export async function requireAdmin() {
	const user = await requireUser();
	if (!isAdminEmail(user.email)) notFound();
	return user;
}
