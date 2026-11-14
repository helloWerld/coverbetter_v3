import Stripe from 'stripe';
import { eq, sql } from 'drizzle-orm';
import { stripeEvents, users } from '@/db/schema';
import type { Db } from '@/lib/cf';
import { LETTER_PRICE_CENTS, parseLetterQuantity } from '@/lib/billing-plans';

/*
 * Stripe API version: stripe-node 23.1.0 targets 2026-10-28.endive.
 * In this version the subscription period end lives on the subscription item
 * (`items.data[].current_period_end`), not on the subscription. On an invoice,
 * the subscription id is `parent.subscription_details.subscription` and the period
 * is on each line (`lines.data[].period.end`). A webhook endpoint sends objects in
 * the API version of the endpoint, so the readers below also accept the older shapes.
 */

export const PRODUCTS = {
	letters: {
		mode: 'payment',
		priceEnv: 'STRIPE_PRICE_LETTER',
		unitCents: LETTER_PRICE_CENTS,
	},
	pro: { mode: 'subscription', priceEnv: 'STRIPE_PRICE_PRO' },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

type StripeEnv = Partial<
	Pick<
		CloudflareEnv,
		| 'STRIPE_SECRET_KEY'
		| 'STRIPE_WEBHOOK_SECRET'
		| 'STRIPE_PRICE_LETTER'
		| 'STRIPE_PRICE_PRO'
		| 'APP_URL'
	>
>;

/** True when the secret key, the two price ids, and the site URL are all set. */
export function isStripeConfigured(env: StripeEnv): boolean {
	return Boolean(
		env.STRIPE_SECRET_KEY &&
			env.STRIPE_PRICE_LETTER &&
			env.STRIPE_PRICE_PRO &&
			env.APP_URL,
	);
}

/** Stripe client for Workers: uses fetch, not Node http. */
export function getStripe(env: StripeEnv): Stripe {
	if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
	return new Stripe(env.STRIPE_SECRET_KEY, {
		httpClient: Stripe.createFetchHttpClient(),
	});
}

export type DbChange =
	| { kind: 'add_credits'; userId: string; credits: number }
	| {
			kind: 'set_pro';
			userId?: string;
			customerId?: string;
			subscriptionId?: string;
			/** Unix seconds. null when the event does not carry it. */
			periodEnd: number | null;
			resetCount: boolean;
	  }
	| { kind: 'end_pro'; userId?: string; customerId?: string }
	| { kind: 'set_customer'; userId: string; customerId: string };

type Obj = Record<string, unknown>;

const asObj = (v: unknown): Obj =>
	v && typeof v === 'object' ? (v as Obj) : {};

/** Stripe fields that hold an id can be a string or an expanded object. */
function idOf(v: unknown): string | undefined {
	if (typeof v === 'string') return v;
	const id = asObj(v).id;
	return typeof id === 'string' ? id : undefined;
}

export function subscriptionPeriodEnd(sub: Obj): number | null {
	const items = asObj(sub.items).data;
	if (Array.isArray(items)) {
		const ends = items
			.map((i) => asObj(i).current_period_end)
			.filter((n): n is number => typeof n === 'number');
		if (ends.length) return Math.min(...ends);
	}
	return typeof sub.current_period_end === 'number'
		? sub.current_period_end
		: null;
}

function invoicePeriodEnd(invoice: Obj): number | null {
	const lines = asObj(invoice.lines).data;
	if (!Array.isArray(lines)) return null;
	const ends = lines
		.map((l) => asObj(asObj(l).period).end)
		.filter((n): n is number => typeof n === 'number');
	return ends.length ? Math.max(...ends) : null;
}

function invoiceSubscriptionId(invoice: Obj): string | undefined {
	const details = asObj(asObj(invoice.parent).subscription_details);
	return idOf(details.subscription) ?? idOf(invoice.subscription);
}

/** Turns one Stripe event into a list of database changes. Pure: no I/O. */
export function applyStripeEvent(event: Stripe.Event): DbChange[] {
	const obj = asObj(event.data.object);

	switch (event.type) {
		case 'checkout.session.completed': {
			const meta = asObj(obj.metadata);
			const userId =
				(typeof meta.userId === 'string' && meta.userId) ||
				(typeof obj.client_reference_id === 'string' &&
					obj.client_reference_id) ||
				undefined;
			if (!userId) return [];
			const customerId = idOf(obj.customer);
			const changes: DbChange[] = [];
			if (customerId) changes.push({ kind: 'set_customer', userId, customerId });

			if (obj.mode === 'payment') {
				if (obj.payment_status !== 'paid') return [];
				if (meta.product !== 'letters') return [];
				const credits = parseLetterQuantity(meta.credits);
				if (
					credits === null ||
					obj.amount_total !== credits * PRODUCTS.letters.unitCents
				) {
					return [];
				}
				changes.push({ kind: 'add_credits', userId, credits });
				return changes;
			}
			if (obj.mode === 'subscription') {
				changes.push({
					kind: 'set_pro',
					userId,
					customerId,
					subscriptionId: idOf(obj.subscription),
					periodEnd: null,
					resetCount: true,
				});
				return changes;
			}
			return [];
		}

		case 'invoice.paid': {
			// Only renewals. The first invoice is handled by the checkout event.
			if (obj.billing_reason !== 'subscription_cycle') return [];
			const customerId = idOf(obj.customer);
			if (!customerId) return [];
			return [
				{
					kind: 'set_pro',
					customerId,
					subscriptionId: invoiceSubscriptionId(obj),
					periodEnd: invoicePeriodEnd(obj),
					resetCount: true,
				},
			];
		}

		case 'customer.subscription.created':
		case 'customer.subscription.updated': {
			const customerId = idOf(obj.customer);
			if (!customerId) return [];
			const status = obj.status;
			if (status === 'active' || status === 'trialing') {
				return [
					{
						kind: 'set_pro',
						customerId,
						subscriptionId: idOf(obj),
						periodEnd: subscriptionPeriodEnd(obj),
						resetCount: false,
					},
				];
			}
			if (
				status === 'canceled' ||
				status === 'unpaid' ||
				status === 'incomplete_expired'
			) {
				return [{ kind: 'end_pro', customerId }];
			}
			return [];
		}

		case 'customer.subscription.deleted': {
			const customerId = idOf(obj.customer);
			return customerId ? [{ kind: 'end_pro', customerId }] : [];
		}

		default:
			return [];
	}
}

/** Runs the changes on D1. Finds the user by id, or by Stripe customer id. */
export async function executeChanges(db: Db, changes: DbChange[]) {
	for (const c of changes) {
		const where = (userId?: string, customerId?: string) =>
			userId
				? eq(users.id, userId)
				: customerId
					? eq(users.stripeCustomerId, customerId)
					: null;

		switch (c.kind) {
			case 'add_credits':
				await db
					.update(users)
					.set({ credits: sql`${users.credits} + ${c.credits}` })
					.where(eq(users.id, c.userId));
				break;
			case 'set_customer':
				await db
					.update(users)
					.set({ stripeCustomerId: c.customerId })
					.where(eq(users.id, c.userId));
				break;
			case 'set_pro': {
				const w = where(c.userId, c.customerId);
				if (!w) break;
				await db
					.update(users)
					.set({
						plan: 'pro',
						...(c.periodEnd !== null
							? { proPeriodEnd: new Date(c.periodEnd * 1000) }
							: {}),
						...(c.resetCount ? { proLettersThisPeriod: 0 } : {}),
					})
					.where(w);
				break;
			}
			case 'end_pro': {
				const w = where(c.userId, c.customerId);
				if (!w) break;
				await db
					.update(users)
					.set({ plan: 'free', proPeriodEnd: null, proLettersThisPeriod: 0 })
					.where(w);
				break;
			}
		}
	}
}

export type EventDeps = {
	/** Stores the event id. Returns false when it was stored before. */
	claim: (id: string, type: string) => Promise<boolean>;
	apply: (changes: DbChange[]) => Promise<void>;
	/** Removes the claim so Stripe can retry after a failure. */
	release: (id: string) => Promise<void>;
};

/** Applies a verified event once. Duplicate deliveries return 'duplicate'. */
export async function handleStripeEvent(
	event: Stripe.Event,
	deps: EventDeps,
): Promise<'applied' | 'duplicate'> {
	if (!(await deps.claim(event.id, event.type))) return 'duplicate';
	try {
		await deps.apply(applyStripeEvent(event));
	} catch (err) {
		await deps.release(event.id);
		throw err;
	}
	return 'applied';
}

/** Event claim and release on the `stripe_events` table. */
export function dbEventStore(db: Db): Pick<EventDeps, 'claim' | 'release'> {
	return {
		claim: async (id, type) => {
			const rows = await db
				.insert(stripeEvents)
				.values({ id, type })
				.onConflictDoNothing()
				.returning({ id: stripeEvents.id });
			return rows.length > 0;
		},
		release: async (id) => {
			await db.delete(stripeEvents).where(eq(stripeEvents.id, id));
		},
	};
}
