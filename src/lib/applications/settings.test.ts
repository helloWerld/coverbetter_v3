import { describe, expect, it } from 'vitest';
import { parseSettings, parseSettingsJson } from './settings';
import { DEFAULT_SETTINGS } from './types';

describe('parseSettings', () => {
	it('gives the defaults for empty or bad input', () => {
		expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
		expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
		expect(parseSettingsJson('not json')).toEqual(DEFAULT_SETTINGS);
		expect(parseSettingsJson(null)).toEqual(DEFAULT_SETTINGS);
	});

	it('keeps valid values and replaces bad ones', () => {
		const s = parseSettings({ tone: 'friendly', length: 'huge', noResponseDays: '45', followUpDays: 0 });
		expect(s.tone).toBe('friendly');
		expect(s.length).toBe('standard');
		expect(s.noResponseDays).toBe(45);
		expect(s.followUpDays).toBe(7);
	});

	it('moves the second follow-up after the first one', () => {
		const s = parseSettings({ followUpDays: 20, secondFollowUpDays: 10 });
		expect(s.secondFollowUpDays).toBe(27);
	});
});
