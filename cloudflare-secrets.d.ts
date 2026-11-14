// Secret names. Set them with `wrangler secret put NAME` and in .dev.vars for local dev.
// `wrangler types` cannot know these, so they are declared here by hand.
interface CloudflareEnv {
	CLERK_SECRET_KEY: string;
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
	ANTHROPIC_API_KEY: string;
	OPENAI_API_KEY: string;
	CF_AIG_ACCOUNT_ID: string;
	CF_AIG_GATEWAY_ID: string;
	CF_AIG_TOKEN: string;
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	STRIPE_PRICE_LETTER: string;
	STRIPE_PRICE_PRO: string;
	APP_URL: string;
	/** Comma-separated emails that see the model dropdown on the Generate page. */
	MODEL_PICKER_EMAILS?: string;
}
