'use server';

import { auth, signOut } from '@/auth';

export async function signOutCurrentUser() {
	await signOut();
}
