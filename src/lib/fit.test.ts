import { describe, expect, it } from 'vitest';
import {
	MAX_REQUIREMENTS,
	deserializeFit,
	fitBand,
	fitScore,
	parseFitLines,
	parseReqLine,
	serializeFit,
	type FitRequirement,
} from './fit';

const req = (type: 'must' | 'nice', status: 'met' | 'partial' | 'missing'): FitRequirement => ({
	type,
	status,
	requirement: 'x',
	evidence: '',
});

describe('fitScore', () => {
	it('gives null for an empty list', () => {
		expect(fitScore([])).toBeNull();
	});

	it('gives 100 when all are met and 0 when all are missing', () => {
		expect(fitScore([req('must', 'met'), req('nice', 'met')])).toBe(100);
		expect(fitScore([req('must', 'missing'), req('nice', 'missing')])).toBe(0);
	});

	it('weights must 2 and nice 1, partial half', () => {
		// must met 2, must partial 1, nice missing 0 => 3 / 5
		expect(fitScore([req('must', 'met'), req('must', 'partial'), req('nice', 'missing')])).toBe(60);
		// nice met 1 of 3
		expect(fitScore([req('must', 'missing'), req('nice', 'met')])).toBe(33);
	});
});

describe('fitBand', () => {
	it('uses the band limits', () => {
		expect(fitBand(100)).toBe('strong');
		expect(fitBand(80)).toBe('strong');
		expect(fitBand(79)).toBe('good');
		expect(fitBand(60)).toBe('good');
		expect(fitBand(59)).toBe('partial');
		expect(fitBand(40)).toBe('partial');
		expect(fitBand(39)).toBe('low');
		expect(fitBand(0)).toBe('low');
	});
});

describe('parseReqLine', () => {
	it('reads a correct line', () => {
		expect(parseReqLine('REQ: must | met | SQL | 4 years of SQL')).toEqual({
			type: 'must',
			status: 'met',
			requirement: 'SQL',
			evidence: '4 years of SQL',
		});
	});

	it('accepts any case, bold marks, and extra spaces', () => {
		expect(parseReqLine('**req:  NICE |  Partial | Looker  |  some BI tools')).toMatchObject({
			type: 'nice',
			status: 'partial',
			requirement: 'Looker',
			evidence: 'some BI tools',
		});
	});

	it('keeps a pipe inside the evidence and clears evidence when missing', () => {
		expect(parseReqLine('REQ: must | met | A | b | c')?.evidence).toBe('b | c');
		expect(parseReqLine('REQ: must | missing | A | made up')?.evidence).toBe('');
	});

	it('rejects bad lines', () => {
		expect(parseReqLine('must | met | A | b')).toBeNull();
		expect(parseReqLine('REQ: maybe | met | A | b')).toBeNull();
		expect(parseReqLine('REQ: must | yes | A | b')).toBeNull();
		expect(parseReqLine('REQ: must | met |  | b')).toBeNull();
		expect(parseReqLine('REQ: must | met')).toBeNull();
	});

	it('cuts long text', () => {
		const r = parseReqLine(`REQ: must | met | ${'a'.repeat(500)} | ${'b'.repeat(500)}`);
		expect(r?.requirement.length).toBe(160);
		expect(r?.evidence.length).toBe(160);
	});
});

describe('parseFitLines', () => {
	it('reads the summary and keeps at most 12 requirements', () => {
		const lines = ['FIT SUMMARY: Good SQL.', ...Array.from({ length: 20 }, () => 'REQ: must | met | A | b')];
		const fit = parseFitLines(lines);
		expect(fit?.summary).toBe('Good SQL.');
		expect(fit?.requirements).toHaveLength(MAX_REQUIREMENTS);
		expect(fit?.score).toBe(100);
	});

	it('gives null with no valid requirement', () => {
		expect(parseFitLines(['FIT SUMMARY: hi', 'REQ: bad'])).toBeNull();
		expect(parseFitLines([])).toBeNull();
	});
});

describe('serialize and deserialize', () => {
	it('round-trips', () => {
		const fit = parseFitLines(['FIT SUMMARY: S', 'REQ: must | partial | A | b'])!;
		expect(deserializeFit(fit.score, serializeFit(fit))).toEqual(fit);
	});

	it('gives null for missing or bad data', () => {
		expect(deserializeFit(null, '{}')).toBeNull();
		expect(deserializeFit(50, null)).toBeNull();
		expect(deserializeFit(50, 'not json')).toBeNull();
	});

	it('drops bad requirement rows', () => {
		const json = JSON.stringify({ summary: 1, requirements: [{ type: 'x' }, req('must', 'met')] });
		expect(deserializeFit(50, json)).toEqual({ score: 50, summary: '', requirements: [req('must', 'met')] });
	});
});
