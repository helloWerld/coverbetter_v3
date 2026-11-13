import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

/** Cloudflare bindings and secrets for the current request. */
export function getEnv(): CloudflareEnv {
	return getCloudflareContext().env;
}

/** Drizzle client on the D1 binding `DB`. */
export function getDb() {
	return drizzle(getEnv().DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
