import { describe, expect, it } from 'vitest';
import {
	IMMEDIATE_NOTE,
	LETTER_TYPES,
	buildLetter,
	formatLongDate,
	openPlaceholders,
	withSubject,
	type ResignationInput,
} from './logic';

const empty: ResignationInput = {
	name: '',
	manager: '',
	company: '',
	role: '',
	lastDay: '',
	type: 'standard',
	appreciated: '',
	offerHandover: false,
};

const full: ResignationInput = {
	name: 'Sam Lee',
	manager: 'Ms. Ortiz',
	company: 'Northwind',
	role: 'Data Analyst',
	lastDay: '2026-12-04',
	type: 'standard',
	appreciated: 'the time you spent coaching me',
	offerHandover: true,
};

describe('formatLongDate', () => {
	it('writes the date in long form', () => {
		expect(formatLongDate('2026-12-04')).toBe('Friday, December 4, 2026');
		expect(formatLongDate('')).toBe('');
		expect(formatLongDate('2026-13-40')).toBe('');
	});
});

describe('resignation letters', () => {
	it('keeps empty answers as placeholders', () => {
		const { body, subject } = buildLetter(empty);
		expect(body).toContain('[Manager Name]');
		expect(body).toContain('[Company]');
		expect(body).toContain('[Last Day]');
		expect(subject).toContain('[Your Name]');
		expect(openPlaceholders(body)).toContain('Job Title');
	});

	it('fills every type with the answers, with no dash characters', () => {
		for (const t of LETTER_TYPES) {
			const { body, subject, note } = buildLetter({ ...full, type: t.id });
			expect(body, t.id).toContain('Northwind');
			expect(body, t.id).toContain('Sam Lee');
			expect(body, t.id).toContain('Dear Ms. Ortiz,');
			expect(`${body}${subject}${note}${t.label}${t.when}`, t.id).not.toMatch(/[—–]/);
			if (t.id !== 'immediate') expect(body, t.id).toContain('Friday, December 4, 2026');
			expect(body, t.id).not.toMatch(/\[[^\]]+\]/);
		}
	});

	it('puts the appreciated thing in the grateful letter', () => {
		const { body } = buildLetter({ ...full, type: 'grateful' });
		expect(body).toContain('thank you for the time you spent coaching me');
		expect(buildLetter({ ...empty, type: 'grateful' }).body).toContain('[One Thing You Appreciated]');
	});

	it('adds the handover offer only when asked', () => {
		expect(buildLetter({ ...full, offerHandover: true }).body).toContain('handover');
		expect(buildLetter({ ...full, offerHandover: false }).body).not.toContain('handover');
	});

	it('gives a note about references for an immediate resignation, and no note for others', () => {
		const imm = buildLetter({ ...full, type: 'immediate' });
		expect(imm.note).toBe(IMMEDIATE_NOTE);
		expect(imm.note).toContain('reference');
		expect(imm.note).toContain('contract');
		expect(imm.body).toContain('effective immediately');
		expect(buildLetter(full).note).toBe('');
	});

	it('puts the subject line first in the copy text', () => {
		const text = withSubject(buildLetter(full));
		expect(text.startsWith('Subject: Resignation: Sam Lee, last day Friday, December 4, 2026\n\nDear Ms. Ortiz,')).toBe(true);
	});
});
