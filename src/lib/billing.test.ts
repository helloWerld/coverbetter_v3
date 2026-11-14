import { describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import { applyStripeEvent, handleStripeEvent } from './billing';

const ev = (type: string, object: unknown, id = 'evt_1') =>
	({ id, type, data: { object } }) as unknown as Stripe.Event;

describe('applyStripeEvent', () => {
	const letters = (over: Record<string, unknown> = {}, credits = '5') =>
		ev('checkout.session.completed', {
			mode: 'payment',
			payment_status: 'paid',
			customer: 'cus_1',
			amount_total: 750,
			metadata: { userId: 'user_1', product: 'letters', credits },
			...over,
		});

	it('adds credits for a paid letters checkout with the right amount', () => {
		expect(applyStripeEvent(letters())).toEqual([
			{ kind: 'set_customer', userId: 'user_1', customerId: 'cus_1' },
			{ kind: 'add_credits', userId: 'user_1', credits: 5 },
		]);
	});

	it('adds nothing when the amount does not match', () => {
		expect(applyStripeEvent(letters({ amount_total: 500 }))).toEqual([]);
		expect(applyStripeEvent(letters({ amount_total: undefined }))).toEqual([]);
	});

	it('adds nothing for credits out of range or not an integer', () => {
		expect(applyStripeEvent(letters({ amount_total: 0 }, '0'))).toEqual([]);
		expect(applyStripeEvent(letters({ amount_total: 7650 }, '51'))).toEqual([]);
		expect(applyStripeEvent(letters({ amount_total: 375 }, '2.5'))).toEqual([]);
		expect(applyStripeEvent(letters({}, 'abc'))).toEqual([]);
	});

	it('adds nothing for an unpaid checkout', () => {
		expect(applyStripeEvent(letters({ payment_status: 'unpaid' }))).toEqual([]);
	});

	it('ignores a payment checkout with an unknown product', () => {
		const e = ev('checkout.session.completed', {
			mode: 'payment',
			payment_status: 'paid',
			customer: 'cus_1',
			amount_total: 750,
			metadata: { userId: 'user_1', product: 'pack5', credits: '5' },
		});
		expect(applyStripeEvent(e)).toEqual([]);
	});

	it('sets customer and Pro for a subscription checkout', () => {
		const e = ev('checkout.session.completed', {
			mode: 'subscription',
			payment_status: 'paid',
			customer: 'cus_1',
			subscription: 'sub_1',
			client_reference_id: 'user_1',
			metadata: { userId: 'user_1', product: 'pro' },
		});
		expect(applyStripeEvent(e)).toEqual([
			{ kind: 'set_customer', userId: 'user_1', customerId: 'cus_1' },
			{
				kind: 'set_pro',
				userId: 'user_1',
				customerId: 'cus_1',
				subscriptionId: 'sub_1',
				periodEnd: null,
				resetCount: true,
			},
		]);
	});

	it('sets Pro with a new period end on a renewal invoice', () => {
		const e = ev('invoice.paid', {
			billing_reason: 'subscription_cycle',
			customer: 'cus_1',
			parent: {
				type: 'subscription_details',
				subscription_details: { subscription: 'sub_1' },
			},
			lines: { data: [{ period: { start: 1000, end: 2000 } }] },
		});
		expect(applyStripeEvent(e)).toEqual([
			{
				kind: 'set_pro',
				customerId: 'cus_1',
				subscriptionId: 'sub_1',
				periodEnd: 2000,
				resetCount: true,
			},
		]);
	});

	it('ignores an invoice that is not a renewal', () => {
		const e = ev('invoice.paid', {
			billing_reason: 'subscription_update',
			customer: 'cus_1',
			lines: { data: [{ period: { start: 1, end: 2 } }] },
		});
		expect(applyStripeEvent(e)).toEqual([]);
	});

	it('keeps Pro for an active subscription and reads the item period end', () => {
		const e = ev('customer.subscription.updated', {
			id: 'sub_1',
			status: 'active',
			customer: 'cus_1',
			items: { data: [{ current_period_end: 3000 }] },
		});
		expect(applyStripeEvent(e)).toEqual([
			{
				kind: 'set_pro',
				customerId: 'cus_1',
				subscriptionId: 'sub_1',
				periodEnd: 3000,
				resetCount: false,
			},
		]);
	});

	it('falls back to the legacy subscription period end', () => {
		const e = ev('customer.subscription.updated', {
			id: 'sub_1',
			status: 'trialing',
			customer: 'cus_1',
			current_period_end: 4000,
			items: { data: [] },
		});
		expect(applyStripeEvent(e)).toEqual([
			expect.objectContaining({ kind: 'set_pro', periodEnd: 4000 }),
		]);
	});

	it.each(['canceled', 'unpaid', 'incomplete_expired'])(
		'ends Pro when the subscription is %s',
		(status) => {
			const e = ev('customer.subscription.updated', {
				id: 'sub_1',
				status,
				customer: 'cus_1',
			});
			expect(applyStripeEvent(e)).toEqual([
				{ kind: 'end_pro', customerId: 'cus_1' },
			]);
		},
	);

	it('does nothing for a past_due subscription', () => {
		const e = ev('customer.subscription.updated', {
			id: 'sub_1',
			status: 'past_due',
			customer: 'cus_1',
		});
		expect(applyStripeEvent(e)).toEqual([]);
	});

	it('ends Pro when the subscription is deleted', () => {
		const e = ev('customer.subscription.deleted', {
			id: 'sub_1',
			status: 'canceled',
			customer: 'cus_1',
		});
		expect(applyStripeEvent(e)).toEqual([
			{ kind: 'end_pro', customerId: 'cus_1' },
		]);
	});

	it('ignores other event types', () => {
		expect(applyStripeEvent(ev('charge.refunded', {}))).toEqual([]);
	});
});

describe('handleStripeEvent (idempotency)', () => {
	const paid = ev('checkout.session.completed', {
		mode: 'payment',
		payment_status: 'paid',
		customer: 'cus_1',
		amount_total: 750,
		metadata: { userId: 'user_1', product: 'letters', credits: '5' },
	});

	it('applies a new event once', async () => {
		const apply = vi.fn(async () => {});
		const claim = vi.fn(async () => true);
		const release = vi.fn(async () => {});
		const out = await handleStripeEvent(paid, { claim, apply, release });
		expect(out).toBe('applied');
		expect(apply).toHaveBeenCalledOnce();
	});

	it('skips an event id that was already claimed', async () => {
		const apply = vi.fn(async () => {});
		const out = await handleStripeEvent(paid, {
			claim: async () => false,
			apply,
			release: async () => {},
		});
		expect(out).toBe('duplicate');
		expect(apply).not.toHaveBeenCalled();
	});

	it('releases the claim and rethrows when apply fails', async () => {
		const release = vi.fn(async () => {});
		await expect(
			handleStripeEvent(paid, {
				claim: async () => true,
				apply: async () => {
					throw new Error('db down');
				},
				release,
			}),
		).rejects.toThrow('db down');
		expect(release).toHaveBeenCalledWith('evt_1');
	});
});
