import { describe, expect, it } from 'vitest';
import { buildMessagePrompt } from './ai-prompt';

const base = {
	kind: 'follow_up' as const,
	applicantName: 'Sam Lee',
	applicantContact: '',
	company: 'Stripe',
	jobTitle: 'UX Lead',
	jobDescription: 'Lead the design team.',
	appliedOn: 'November 2, 2026',
	contactName: 'Ana Ruiz',
	letter: '',
	strengths: [],
};

describe('buildMessagePrompt', () => {
	it('puts the contact and the details inside the data tags', () => {
		const p = buildMessagePrompt({ ...base, details: 'We met at the Config conference.' });
		const data = p.user.slice(p.user.indexOf('<data>'), p.user.indexOf('</data>'));
		expect(data).toContain('Contact person: Ana Ruiz');
		expect(data).toContain('We met at the Config conference.');
	});
	it('leaves out empty details and cuts long ones', () => {
		expect(buildMessagePrompt({ ...base, details: '   ' }).user).not.toContain('Details from the applicant');
		const long = buildMessagePrompt({ ...base, details: 'x'.repeat(2000) }).user;
		expect(long).not.toContain('x'.repeat(601));
	});
});
