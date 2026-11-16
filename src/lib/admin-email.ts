/** Only this account can open the admin page. Clerk verifies the email address. */
const ADMIN_EMAILS = ['hello@russelltrzaska.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
	return Boolean(email) && ADMIN_EMAILS.includes(email!.trim().toLowerCase());
}
