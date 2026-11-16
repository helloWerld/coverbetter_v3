import { describe, expect, it } from 'vitest';
import { roleKeywords, roleLabel, searchRoles } from './search';

const roles = [
	{ id: '1', company: 'Stripe', jobTitle: 'UX Lead', status: 'applied' as const, keywords: 'payments figma' },
	{ id: '2', company: 'Linear', jobTitle: 'Product Designer', status: 'saved' as const },
	{ id: '3', company: '', jobTitle: '', status: 'saved' as const },
];

describe('searchRoles', () => {
	it('returns all roles for an empty query', () => {
		expect(searchRoles(roles, '  ')).toHaveLength(3);
	});
	it('matches the company or the title, any case', () => {
		expect(searchRoles(roles, 'stripe').map((r) => r.id)).toEqual(['1']);
		expect(searchRoles(roles, 'DESIGNER').map((r) => r.id)).toEqual(['2']);
	});
	it('matches keywords, and needs every word', () => {
		expect(searchRoles(roles, 'figma lead').map((r) => r.id)).toEqual(['1']);
		expect(searchRoles(roles, 'figma linear')).toEqual([]);
	});
});

describe('roleLabel and roleKeywords', () => {
	it('labels a role, with a fallback title', () => {
		expect(roleLabel(roles[0])).toBe('UX Lead at Stripe');
		expect(roleLabel(roles[2])).toBe('Untitled job');
	});
	it('makes short lowercase keywords', () => {
		const k = roleKeywords({ contactName: 'Ana', notes: 'Met at  Expo', jobDescription: 'x'.repeat(5000) });
		expect(k.startsWith('ana met at expo')).toBe(true);
		expect(k.length).toBeLessThan(1600);
	});
});
