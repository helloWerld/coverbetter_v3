import { z } from 'zod';
import { DEFAULT_SETTINGS, type UserSettings } from './types';

const days = (min: number, max: number, fallback: number) => z.coerce.number().int().min(min).max(max).catch(fallback);

/** Reads stored or posted settings. Bad or missing values fall back to the defaults. */
export const settingsSchema = z.object({
	tone: z.enum(['professional', 'friendly', 'confident', 'enthusiastic']).catch(DEFAULT_SETTINGS.tone),
	length: z.enum(['short', 'standard', 'detailed']).catch(DEFAULT_SETTINGS.length),
	template: z.enum(['classic', 'modern', 'minimal']).catch(DEFAULT_SETTINGS.template),
	language: z.string().trim().min(2).max(10).catch(DEFAULT_SETTINGS.language),
	defaultResumeId: z.string().trim().max(100).catch(''),
	noResponseDays: days(7, 180, DEFAULT_SETTINGS.noResponseDays),
	followUpDays: days(1, 60, DEFAULT_SETTINGS.followUpDays),
	secondFollowUpDays: days(2, 90, DEFAULT_SETTINGS.secondFollowUpDays),
	resumeMode: z.enum(['manual', 'ai']).catch(DEFAULT_SETTINGS.resumeMode),
});

export function parseSettings(raw: unknown): UserSettings {
	const s = settingsSchema.parse({ ...DEFAULT_SETTINGS, ...(raw && typeof raw === 'object' ? raw : {}) });
	// The second follow-up must come after the first one.
	if (s.secondFollowUpDays <= s.followUpDays) s.secondFollowUpDays = s.followUpDays + 7;
	return s;
}

export function parseSettingsJson(json: string | null | undefined): UserSettings {
	try {
		return parseSettings(json ? JSON.parse(json) : {});
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}
