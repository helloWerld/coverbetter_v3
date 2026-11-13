import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, getEnv } from '@/lib/cf';
import {
	dbEventStore,
	executeChanges,
	getStripe,
	handleStripeEvent,
	subscriptionPeriodEnd,
	type DbChange,
} from '@/lib/billing';

// Public route: Stripe calls it. The signature check is the only gate.
// Middleware only protects /dashboard, so no auth change is needed.
export async function POST(request: Request) {
	const env = getEnv();
	if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json({ error: 'Stripe is not set up' }, { status: 503 });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
	}

	const rawBody = await request.text();
	const stripe = getStripe(env);

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			rawBody,
			signature,
			env.STRIPE_WEBHOOK_SECRET,
			undefined,
			Stripe.createSubtleCryptoProvider(),
		);
	} catch {
		return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
	}

	const db = getDb();
	try {
		await handleStripeEvent(event, {
			...dbEventStore(db),
			apply: async (changes) => {
				await executeChanges(db, await fillPeriodEnds(stripe, changes));
			},
		});
	} catch (err) {
		console.error('Stripe webhook failed', event.id, event.type, err);
		// A 500 makes Stripe retry. The event claim was released.
		return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
	}
	return NextResponse.json({ received: true });
}

/** A subscription checkout does not carry the period end. Read it from the subscription. */
async function fillPeriodEnds(
	stripe: Stripe,
	changes: DbChange[],
): Promise<DbChange[]> {
	return Promise.all(
		changes.map(async (c) => {
			if (c.kind !== 'set_pro' || c.periodEnd !== null || !c.subscriptionId) {
				return c;
			}
			const sub = await stripe.subscriptions.retrieve(c.subscriptionId);
			return {
				...c,
				periodEnd: subscriptionPeriodEnd(sub as unknown as Record<string, unknown>),
			};
		}),
	);
}
