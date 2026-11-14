'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { requireUser } from '@/lib/user';
import { PRODUCTS, getStripe, paymentsOpenFor } from '@/lib/billing';
import { isProductKey, parseLetterQuantity } from '@/lib/billing-plans';
import { isProActive } from '@/lib/access';

export async function startCheckoutAction(
	product: string,
	formData?: FormData,
) {
	if (!isProductKey(product)) throw new Error('Unknown product');
	let quantity = 1;
	if (product === 'letters') {
		const n = parseLetterQuantity(formData?.get('quantity'));
		if (n === null) throw new Error('Choose 1 to 50 letters');
		quantity = n;
	}
	const env = getEnv();
	const user = await requireUser();
	if (!paymentsOpenFor(env, user.email)) {
		redirect('/dashboard/billing?status=unavailable');
	}
	// No second Pro subscription while one is active.
	if (product === 'pro' && isProActive(user, new Date())) {
		redirect('/dashboard/billing');
	}

	const stripe = getStripe(env);
	const def = PRODUCTS[product];

	let customerId = user.stripeCustomerId;
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: user.email || undefined,
			metadata: { userId: user.id },
		});
		customerId = customer.id;
		await getDb()
			.update(users)
			.set({ stripeCustomerId: customerId })
			.where(eq(users.id, user.id));
	}

	const metadata: Record<string, string> = { userId: user.id, product };
	if (product === 'letters') metadata.credits = String(quantity);
	const session = await stripe.checkout.sessions.create({
		mode: def.mode,
		customer: customerId,
		client_reference_id: user.id,
		line_items: [{ price: env[def.priceEnv], quantity }],
		metadata,
		...(def.mode === 'subscription'
			? { subscription_data: { metadata } }
			: {}),
		success_url: `${env.APP_URL}/dashboard/billing?status=success`,
		cancel_url: `${env.APP_URL}/dashboard/billing?status=cancel`,
	});

	if (!session.url) throw new Error('Stripe returned no checkout URL');
	redirect(session.url);
}

export async function openPortalAction() {
	const env = getEnv();
	const user = await requireUser();
	if (!paymentsOpenFor(env, user.email)) {
		redirect('/dashboard/billing?status=unavailable');
	}
	if (!user.stripeCustomerId) redirect('/dashboard/billing');

	const session = await getStripe(env).billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: `${env.APP_URL}/dashboard/billing`,
	});
	redirect(session.url);
}
