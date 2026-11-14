import { describe, expect, it } from 'vitest';
import {
	TEMPLATE_IDS,
	TEMPLATES,
	getTemplate,
	isTemplateId,
	toLetterDoc,
} from './templates';

const TODAY = new Date(2026, 10, 13);

describe('toLetterDoc', () => {
	it('splits paragraphs on blank lines', () => {
		const doc = toLetterDoc('One.\n\nTwo.\r\n\r\n\n\nThree.', TODAY);
		expect(doc.paragraphs).toEqual(['One.', 'Two.', 'Three.']);
	});

	it('formats the date', () => {
		expect(toLetterDoc('Hi.', TODAY).date).toBe('November 13, 2026');
	});

	it('reads name and contact line from the first lines', () => {
		const body =
			'Jane Doe\njane@example.com | 555-123-4567\n\nDear Hiring Manager,\n\nBody text.\n\nSincerely,\nJane Doe';
		const doc = toLetterDoc(body, TODAY);
		expect(doc.name).toBe('Jane Doe');
		expect(doc.contactLine).toBe('jane@example.com | 555-123-4567');
		expect(doc.paragraphs[0]).toBe('Dear Hiring Manager,');
		expect(doc.paragraphs.at(-1)).toBe('Sincerely,\nJane Doe');
	});

	it('reads the name from the closing and the contact line below it', () => {
		const body =
			'Dear Team,\n\nBody text here.\n\nSincerely,\nJohn Smith\njohn@example.com';
		const doc = toLetterDoc(body, TODAY);
		expect(doc.name).toBe('John Smith');
		expect(doc.contactLine).toBe('john@example.com');
		expect(doc.paragraphs.at(-1)).toBe('Sincerely,\nJohn Smith');
	});

	it('reads a closing split by a blank line with contact details on separate lines', () => {
		// Shape of real claude-sonnet-5-5 output.
		const body =
			'Dear Hiring Manager,\n\nBody text here.\n\nSincerely,\n\nMaya Lindqvist\nmaya@example.com\n555-014-2290\nPortland, OR';
		const doc = toLetterDoc(body, TODAY);
		expect(doc.name).toBe('Maya Lindqvist');
		expect(doc.contactLine).toBe('maya@example.com | 555-014-2290 | Portland, OR');
		expect(doc.paragraphs).toEqual([
			'Dear Hiring Manager,',
			'Body text here.',
			'Sincerely,\nMaya Lindqvist',
		]);
	});

	it('falls back to body only when nothing is found', () => {
		const doc = toLetterDoc('Dear Team,\n\nI like the job.', TODAY);
		expect(doc.name).toBe('');
		expect(doc.contactLine).toBe('');
		expect(doc.paragraphs).toEqual(['Dear Team,', 'I like the job.']);
	});

	it('handles an empty body', () => {
		const doc = toLetterDoc('  \n ', TODAY);
		expect(doc.paragraphs).toEqual([]);
	});
});

describe('template tokens', () => {
	it('defines the three templates', () => {
		expect(TEMPLATE_IDS).toEqual(['classic', 'modern', 'minimal']);
		expect(isTemplateId('modern')).toBe(true);
		expect(isTemplateId('fancy')).toBe(false);
	});

	it('classic uses Times, centered header, 1 inch margins', () => {
		const t = getTemplate('classic');
		expect(t.pdfFont).toBe('TimesRoman');
		expect(t.headerAlign).toBe('center');
		expect(t.marginIn).toBe(1);
		expect(t.accentRule).toBeNull();
	});

	it('modern uses Helvetica, left header and a purple rule', () => {
		const t = getTemplate('modern');
		expect(t.pdfFont).toBe('Helvetica');
		expect(t.headerAlign).toBe('left');
		expect(t.accentRule?.color).toBe('#9333ea');
	});

	it('minimal uses Helvetica, small grey header and 1.25 inch margins', () => {
		const t = getTemplate('minimal');
		expect(t.pdfFont).toBe('Helvetica');
		expect(t.marginIn).toBe(1.25);
		expect(t.namePt).toBeLessThan(TEMPLATES.modern.namePt);
		expect(t.contactColor).not.toBe(t.bodyColor);
	});

	it('falls back to classic for an unknown id', () => {
		expect(getTemplate('zzz').id).toBe('classic');
	});
});

describe('toLetterDoc languages', () => {
	it('defaults to English', () => {
		expect(toLetterDoc('Hi.', TODAY).language).toBe('en');
	});

	it('formats the date in the letter language', () => {
		expect(toLetterDoc('Hola.', TODAY, 'es').date).toBe('13 de noviembre de 2026');
		expect(toLetterDoc('こんにちは。', TODAY, 'ja').date).toBe('2026年11月13日');
	});

	it('finds the name and contact after a Spanish sign-off', () => {
		const body =
			'Estimado equipo:\n\nMe interesa el puesto.\n\nAtentamente,\nAna García\nana@example.com | +34 600 123 456';
		const doc = toLetterDoc(body, TODAY, 'es');
		expect(doc.name).toBe('Ana García');
		expect(doc.contactLine).toBe('ana@example.com | +34 600 123 456');
	});

	it('finds the name after a Chinese sign-off', () => {
		const body = '尊敬的招聘经理：\n\n我对这个职位很感兴趣。\n\n此致，\n王伟\nwang@example.com';
		const doc = toLetterDoc(body, TODAY, 'zh');
		expect(doc.name).toBe('王伟');
		expect(doc.contactLine).toBe('wang@example.com');
	});

	it('finds the name after the two-line Chinese sign-off', () => {
		const body =
			'尊敬的招聘负责人：\n\n我对这个职位很感兴趣。\n\n此致\n敬礼\n\nWang Wei\nwang.wei@example.com | +86 138 0000 1234';
		const doc = toLetterDoc(body, TODAY, 'zh');
		expect(doc.name).toBe('Wang Wei');
		expect(doc.contactLine).toBe('wang.wei@example.com | +86 138 0000 1234');
		expect(doc.paragraphs.at(-1)).toBe('此致\n敬礼\nWang Wei');
	});

	it('finds the name after an Arabic sign-off', () => {
		const body = 'السيد مدير التوظيف،\n\nأتقدم لهذه الوظيفة.\n\nمع خالص التحية،\nأحمد علي\nahmed@example.com';
		const doc = toLetterDoc(body, TODAY, 'ar');
		expect(doc.name).toBe('أحمد علي');
	});
});
