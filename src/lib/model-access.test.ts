import { describe, expect, it } from 'vitest';
import { canPickModel, modelLabel, resolveModelKey } from './model-access';

describe('modelLabel', () => {
	it('names the Claude models', () => {
		expect(modelLabel('claude-sonnet-5-5')).toBe('Claude Sonnet 5.5');
		expect(modelLabel('claude-haiku-5-5')).toBe('Claude Haiku 5.5');
	});
	it('marks the OpenAI backup', () => {
		expect(modelLabel('gpt-6.1-sol')).toBe('gpt-6.1-sol (backup)');
	});
	it('handles an empty or unknown value', () => {
		expect(modelLabel('')).toBe('Unknown model');
		expect(modelLabel('some-model')).toBe('some-model');
	});
});

describe('canPickModel', () => {
	it('allows an email on the list, ignoring case and spaces', () => {
		expect(canPickModel('Owner@Example.com', ' owner@example.com , b@x.io')).toBe(true);
	});
	it('refuses an email that is not on the list', () => {
		expect(canPickModel('other@example.com', 'owner@example.com')).toBe(false);
	});
	it('refuses everyone when the list is empty or missing', () => {
		expect(canPickModel('owner@example.com', '')).toBe(false);
		expect(canPickModel('owner@example.com', undefined)).toBe(false);
	});
	it('refuses an empty email', () => {
		expect(canPickModel('', 'owner@example.com')).toBe(false);
	});
});

describe('resolveModelKey', () => {
	it('uses the requested model for an allowed user', () => {
		expect(resolveModelKey('haiku', true)).toBe('haiku');
		expect(resolveModelKey('sonnet', true)).toBe('sonnet');
	});
	it('always uses sonnet for other users', () => {
		expect(resolveModelKey('haiku', false)).toBe('sonnet');
	});
	it('uses sonnet for an unknown or missing value', () => {
		expect(resolveModelKey('gpt', true)).toBe('sonnet');
		expect(resolveModelKey(null, true)).toBe('sonnet');
	});
});
