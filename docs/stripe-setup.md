# Stripe setup for CoverBetter

Do these steps in order. Use test mode first. Repeat them in live mode when you launch.

## 1. Create the two products

Open Dashboard > Product catalog > Add product.

1. Name: `CoverBetter letter`. Price: `$1.50`, one time. Copy the price ID (`price_...`).
2. Name: `CoverBetter Pro`. Price: `$19.00`, recurring, monthly. Copy the price ID.

## 2. Create the webhook endpoint

Open Developers > Webhooks > Add endpoint.

- Endpoint URL: `https://coverbetter.io/api/stripe/webhook`
- Select exactly these events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Save the endpoint. Copy the signing secret (`whsec_...`).

The code reads the API version `2026-10-28.endive`. Use the default version for the endpoint. The code also reads the older field names.

## 3. Set up the customer portal

Open Settings > Billing > Customer portal.

- Turn on "Customers can cancel subscriptions".
- Choose "Cancel at end of billing period".
- Turn on "Customers can update payment methods".
- Turn on "Invoice history".
- Save.

## 4. Set the secrets

Run these in the project folder. Each command asks for the value.

```
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_PRICE_LETTER
npx wrangler secret put STRIPE_PRICE_PRO
npx wrangler secret put APP_URL
```

- `STRIPE_SECRET_KEY`: the secret key (`sk_test_...` or `sk_live_...`).
- `APP_URL`: `https://coverbetter.io`. Do not add a trailing slash.
- For local development, put the same names in `.dev.vars`. Never commit that file.
- Until all five are set, the Billing page shows disabled buttons and the note "Payments are not set up yet".

## 5. Test locally

1. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Use its `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.dev.vars`.
2. Buy 3 letters with the test card `4242 4242 4242 4242`.
3. Check that the credit balance on the Billing page goes up.
4. Start Pro. Check that the plan shows "Pro" with a renewal date.
5. Cancel Pro in the portal. Check that the plan returns to Free after the period ends.
