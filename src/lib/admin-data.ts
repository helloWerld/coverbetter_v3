import 'server-only';
import { desc, inArray, sql } from 'drizzle-orm';
import { supportRequests, users, type SupportRequest } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { getStripe } from '@/lib/billing';

const DAY = 24 * 60 * 60;

/** All AI calls: letters and single fit checks have their own tables. ai_calls has the rest. */
const AI_CALLS = sql`(
	SELECT 'letter' AS kind, user_id, created_at FROM letters
	UNION ALL SELECT 'fit_check', user_id, created_at FROM fit_checks
	UNION ALL SELECT kind, user_id, created_at FROM ai_calls
)`;

export type Overview = { users: number; pro: number; newUsers30: number; creditsHeld: number };
export type UsageRow = { kind: string; d1: number; d7: number; d30: number; total: number };
export type TopUser = { email: string; n: number };

export async function getOverview(now = Math.floor(Date.now() / 1000)): Promise<Overview> {
	const [row] = await getDb().all<Overview>(sql`
		SELECT COUNT(*) AS users,
			COALESCE(SUM(plan = 'pro'), 0) AS pro,
			COALESCE(SUM(created_at >= ${now - 30 * DAY}), 0) AS newUsers30,
			COALESCE(SUM(credits), 0) AS creditsHeld
		FROM users`);
	return row;
}

export async function getUsage(now = Math.floor(Date.now() / 1000)): Promise<{ rows: UsageRow[]; top: TopUser[] }> {
	const db = getDb();
	const [rows, top] = await Promise.all([
		db.all<UsageRow>(sql`
			SELECT kind,
				SUM(created_at >= ${now - DAY}) AS d1,
				SUM(created_at >= ${now - 7 * DAY}) AS d7,
				SUM(created_at >= ${now - 30 * DAY}) AS d30,
				COUNT(*) AS total
			FROM ${AI_CALLS} GROUP BY kind ORDER BY total DESC`),
		db.all<TopUser>(sql`
			SELECT COALESCE(NULLIF(u.email, ''), x.user_id) AS email, COUNT(*) AS n
			FROM ${AI_CALLS} x LEFT JOIN users u ON u.id = x.user_id
			WHERE x.created_at >= ${now - 30 * DAY}
			GROUP BY x.user_id ORDER BY n DESC LIMIT 10`),
	]);
	return { rows, top };
}

export type Charge = {
	id: string;
	created: number;
	email: string;
	description: string;
	amount: number;
	refunded: number;
	currency: string;
	status: 'paid' | 'refunded' | 'part refunded' | 'failed' | 'pending';
	receiptUrl: string | null;
};

/** The last 100 charges, read live from Stripe. Stripe keeps the full history, so no copy is kept in D1. */
export async function getCharges(): Promise<{ ok: true; charges: Charge[]; testMode: boolean } | { ok: false; error: string }> {
	const env = getEnv();
	if (!env.STRIPE_SECRET_KEY) return { ok: false, error: 'Stripe is not set up.' };
	try {
		const list = await getStripe(env).charges.list({ limit: 100 });
		const customerIds = [...new Set(list.data.map((c) => (typeof c.customer === 'string' ? c.customer : c.customer?.id)).filter((x): x is string => Boolean(x)))];
		const known = customerIds.length
			? await getDb().select({ id: users.stripeCustomerId, email: users.email }).from(users).where(inArray(users.stripeCustomerId, customerIds))
			: [];
		const emailOf = new Map(known.map((k) => [k.id, k.email]));
		const charges: Charge[] = list.data.map((c) => {
			const customer = typeof c.customer === 'string' ? c.customer : c.customer?.id;
			return {
				id: c.id,
				created: c.created,
				email: (customer && emailOf.get(customer)) || c.billing_details?.email || '',
				description: c.description ?? c.calculated_statement_descriptor ?? '',
				amount: c.amount,
				refunded: c.amount_refunded,
				currency: c.currency,
				status:
					c.status === 'failed'
						? 'failed'
						: c.status === 'pending'
							? 'pending'
							: c.refunded
								? 'refunded'
								: c.amount_refunded > 0
									? 'part refunded'
									: 'paid',
				receiptUrl: c.receipt_url ?? null,
			};
		});
		return { ok: true, charges, testMode: /^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY) };
	} catch (e) {
		console.error('admin: Stripe charges failed', e);
		return { ok: false, error: 'Stripe did not answer. Reload the page to try again.' };
	}
}

/** Open requests first, then the newest closed ones. */
export async function getSupportRequests(): Promise<SupportRequest[]> {
	return getDb()
		.select()
		.from(supportRequests)
		.orderBy(sql`${supportRequests.status} = 'closed'`, desc(supportRequests.createdAt))
		.limit(100);
}
