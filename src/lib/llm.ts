import type { ModelKey } from './model-access';

export const ANTHROPIC_MODEL = 'claude-sonnet-5-5';

// Each model turns thinking off in its own way. With thinking on, the model
// spent the token budget thinking and returned a cut-off letter.
const ANTHROPIC_MODELS: Record<ModelKey, { id: string; thinking: { type: string } }> = {
	sonnet: { id: ANTHROPIC_MODEL, thinking: { type: 'between_tools' } },
	haiku: { id: 'claude-haiku-5-5', thinking: { type: 'disabled' } },
};
// TODO: verify the exact model ID in the OpenAI docs before launch.
export const OPENAI_FALLBACK_MODEL = 'gpt-6.1-sol';

// The letter is about 300 to 700 output tokens. The fit block adds about 300.
// 2600 leaves room for long letters.
const MAX_TOKENS = 2600;
const TIMEOUT_MS = 60_000;

type Env = Pick<
	CloudflareEnv,
	| 'ANTHROPIC_API_KEY'
	| 'OPENAI_API_KEY'
	| 'CF_AIG_ACCOUNT_ID'
	| 'CF_AIG_GATEWAY_ID'
	| 'CF_AIG_TOKEN'
>;

export type LlmResult = { text: string; model: string };

/** An error the fallback may recover from. */
class RetryableError extends Error {}

function base(env: Env, provider: 'anthropic' | 'openai') {
	if (env.CF_AIG_ACCOUNT_ID) {
		return `https://gateway.ai.cloudflare.com/v1/${env.CF_AIG_ACCOUNT_ID}/${env.CF_AIG_GATEWAY_ID}/${provider}`;
	}
	return provider === 'anthropic'
		? 'https://api.anthropic.com'
		: 'https://api.openai.com/v1';
}

function gatewayHeaders(env: Env): Record<string, string> {
	return env.CF_AIG_ACCOUNT_ID && env.CF_AIG_TOKEN
		? { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` }
		: {};
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
	let res: Response;
	try {
		res = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json', ...headers },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (e) {
		// Network error or timeout.
		throw new RetryableError(`Request failed: ${(e as Error).message}`);
	}
	if (res.status === 429 || res.status >= 500) {
		throw new RetryableError(`Provider returned ${res.status}`);
	}
	if (!res.ok) throw new Error(`Provider returned ${res.status}`);
	return res.json() as Promise<unknown>;
}

async function callAnthropic(
	env: Env,
	p: { system: string; user: string },
	model: (typeof ANTHROPIC_MODELS)[ModelKey],
	maxTokens: number,
) {
	const data = (await post(
		`${base(env, 'anthropic')}/v1/messages`,
		{
			'x-api-key': env.ANTHROPIC_API_KEY,
			'anthropic-version': '2023-06-01',
			...gatewayHeaders(env),
		},
		{
			model: model.id,
			max_tokens: maxTokens,
			thinking: model.thinking,
			system: p.system,
			messages: [{ role: 'user', content: p.user }],
		},
	)) as { stop_reason?: string; content?: { type: string; text?: string }[] };
	// A letter cut off at the token limit is never returned. The fallback runs instead.
	if (data.stop_reason === 'max_tokens') {
		throw new RetryableError('Anthropic answer was cut off at the token limit');
	}
	const text = (data.content ?? [])
		.filter((b) => b.type === 'text')
		.map((b) => b.text ?? '')
		.join('')
		.trim();
	// An empty answer is treated like an outage.
	if (!text) throw new RetryableError('Empty answer from Anthropic');
	return text;
}

async function callOpenAI(env: Env, p: { system: string; user: string }, maxTokens: number) {
	const data = (await post(
		`${base(env, 'openai')}/chat/completions`,
		{ Authorization: `Bearer ${env.OPENAI_API_KEY}`, ...gatewayHeaders(env) },
		{
			model: OPENAI_FALLBACK_MODEL,
			max_completion_tokens: maxTokens,
			messages: [
				{ role: 'system', content: p.system },
				{ role: 'user', content: p.user },
			],
		},
	)) as { choices?: { finish_reason?: string; message?: { content?: string } }[] };
	if (data.choices?.[0]?.finish_reason === 'length') {
		throw new Error('OpenAI answer was cut off at the token limit');
	}
	const text = data.choices?.[0]?.message?.content?.trim() ?? '';
	if (!text) throw new Error('Empty answer from OpenAI');
	return text;
}

/** Anthropic first. OpenAI on a network error, 429, 5xx, timeout, or empty answer. */
export async function generateLetter(
	env: Env,
	prompt: { system: string; user: string },
	modelKey: ModelKey = 'sonnet',
	/** Larger calls (resume + letter + fit score) need more room than a letter. */
	maxTokens: number = MAX_TOKENS,
): Promise<LlmResult> {
	const model = ANTHROPIC_MODELS[modelKey];
	try {
		return { text: await callAnthropic(env, prompt, model, maxTokens), model: model.id };
	} catch (e) {
		if (!(e instanceof RetryableError)) throw e;
	}
	return { text: await callOpenAI(env, prompt, maxTokens), model: OPENAI_FALLBACK_MODEL };
}
