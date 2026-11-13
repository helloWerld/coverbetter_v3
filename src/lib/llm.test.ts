import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	ANTHROPIC_MODEL,
	OPENAI_FALLBACK_MODEL,
	generateLetter,
} from './llm';

const prompt = { system: 'SYS', user: 'USR' };
const gatewayEnv = {
	ANTHROPIC_API_KEY: 'ak',
	OPENAI_API_KEY: 'ok',
	CF_AIG_ACCOUNT_ID: 'acct',
	CF_AIG_GATEWAY_ID: 'gw',
	CF_AIG_TOKEN: 'tok',
} as unknown as CloudflareEnv;
const directEnv = {
	...gatewayEnv,
	CF_AIG_ACCOUNT_ID: '',
	CF_AIG_TOKEN: '',
} as unknown as CloudflareEnv;

const anthropicOk = () =>
	new Response(JSON.stringify({ content: [{ type: 'text', text: 'Letter A' }] }), {
		status: 200,
	});
const openaiOk = () =>
	new Response(JSON.stringify({ choices: [{ message: { content: 'Letter O' } }] }), {
		status: 200,
	});

afterEach(() => vi.unstubAllGlobals());

describe('generateLetter', () => {
	it('uses Anthropic through the gateway', async () => {
		const f = vi.fn().mockResolvedValue(anthropicOk());
		vi.stubGlobal('fetch', f);
		const r = await generateLetter(gatewayEnv, prompt);
		expect(r).toEqual({ text: 'Letter A', model: ANTHROPIC_MODEL });
		expect(f).toHaveBeenCalledTimes(1);
		const [url, init] = f.mock.calls[0];
		expect(url).toBe(
			'https://gateway.ai.cloudflare.com/v1/acct/gw/anthropic/v1/messages',
		);
		expect(init.headers['x-api-key']).toBe('ak');
		expect(init.headers['anthropic-version']).toBe('2023-06-01');
		expect(init.headers['cf-aig-authorization']).toBe('Bearer tok');
		const body = JSON.parse(init.body);
		expect(body).toMatchObject({
			model: ANTHROPIC_MODEL,
			max_tokens: 1200,
			system: 'SYS',
			messages: [{ role: 'user', content: 'USR' }],
		});
	});

	it('calls providers directly without a gateway account', async () => {
		const f = vi.fn().mockResolvedValue(anthropicOk());
		vi.stubGlobal('fetch', f);
		await generateLetter(directEnv, prompt);
		const [url, init] = f.mock.calls[0];
		expect(url).toBe('https://api.anthropic.com/v1/messages');
		expect(init.headers['cf-aig-authorization']).toBeUndefined();
	});

	it('falls back to OpenAI on a 529', async () => {
		const f = vi
			.fn()
			.mockResolvedValueOnce(new Response('overloaded', { status: 529 }))
			.mockResolvedValueOnce(openaiOk());
		vi.stubGlobal('fetch', f);
		const r = await generateLetter(gatewayEnv, prompt);
		expect(r).toEqual({ text: 'Letter O', model: OPENAI_FALLBACK_MODEL });
		const [url, init] = f.mock.calls[1];
		expect(url).toBe(
			'https://gateway.ai.cloudflare.com/v1/acct/gw/openai/chat/completions',
		);
		expect(init.headers.Authorization).toBe('Bearer ok');
		const body = JSON.parse(init.body);
		expect(body.model).toBe(OPENAI_FALLBACK_MODEL);
		expect(body.messages).toEqual([
			{ role: 'system', content: 'SYS' },
			{ role: 'user', content: 'USR' },
		]);
	});

	it('uses the direct OpenAI URL without a gateway account', async () => {
		const f = vi
			.fn()
			.mockResolvedValueOnce(new Response('', { status: 429 }))
			.mockResolvedValueOnce(openaiOk());
		vi.stubGlobal('fetch', f);
		await generateLetter(directEnv, prompt);
		expect(f.mock.calls[1][0]).toBe('https://api.openai.com/v1/chat/completions');
	});

	it('falls back on a network error', async () => {
		const f = vi
			.fn()
			.mockRejectedValueOnce(new TypeError('network'))
			.mockResolvedValueOnce(openaiOk());
		vi.stubGlobal('fetch', f);
		expect((await generateLetter(gatewayEnv, prompt)).model).toBe(
			OPENAI_FALLBACK_MODEL,
		);
	});

	it('does not fall back on a 400', async () => {
		const f = vi.fn().mockResolvedValue(new Response('bad', { status: 400 }));
		vi.stubGlobal('fetch', f);
		await expect(generateLetter(gatewayEnv, prompt)).rejects.toThrow();
		expect(f).toHaveBeenCalledTimes(1);
	});

	it('throws when both providers fail', async () => {
		const f = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
		vi.stubGlobal('fetch', f);
		await expect(generateLetter(gatewayEnv, prompt)).rejects.toThrow();
		expect(f).toHaveBeenCalledTimes(2);
	});

	it('throws when the model returns empty text', async () => {
		const f = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ content: [] }), { status: 200 }),
			)
			.mockResolvedValueOnce(openaiOk());
		vi.stubGlobal('fetch', f);
		// An empty primary answer counts as a failure and triggers the fallback.
		expect((await generateLetter(gatewayEnv, prompt)).text).toBe('Letter O');
	});
});
