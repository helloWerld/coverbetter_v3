'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { supportRequests } from '@/db/schema';
import { requireAdmin } from '@/lib/admin';
import { getDb } from '@/lib/cf';

export async function setSupportStatusAction(id: string, status: 'open' | 'closed'): Promise<{ ok: boolean }> {
	await requireAdmin();
	if (typeof id !== 'string' || (status !== 'open' && status !== 'closed')) return { ok: false };
	await getDb().update(supportRequests).set({ status }).where(eq(supportRequests.id, id.slice(0, 100)));
	revalidatePath('/dashboard/admin');
	return { ok: true };
}
