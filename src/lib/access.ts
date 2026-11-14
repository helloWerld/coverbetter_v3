// Paid features: tone, length, editing, templates, and PDF/DOCX export.
// A user has them with an active Pro plan or at least 1 paid letter left
// (Russell's decision, 2026-11-13). Free users keep generate, read, and copy.

import type { Length, Tone } from './prompt';

export const UPGRADE_MESSAGE =
	'Tone, length, editing, templates, and PDF/DOCX export come with Pro or paid letters.';

type AccessUser = {
	plan: 'free' | 'pro';
	proPeriodEnd: Date | null;
	credits: number;
};

export function hasPaidFeatures(user: AccessUser, now: Date): boolean {
	const proActive =
		user.plan === 'pro' && user.proPeriodEnd !== null && user.proPeriodEnd > now;
	return proActive || user.credits > 0;
}

/** Free users always get Professional tone and Standard length. */
export function generateOptions(
	paid: boolean,
	tone: Tone,
	length: Length,
): { tone: Tone; length: Length } {
	return paid ? { tone, length } : { tone: 'professional', length: 'standard' };
}
