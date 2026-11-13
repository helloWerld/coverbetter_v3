// Who may choose the model on the Generate page, for side-by-side testing.
// The list comes from the MODEL_PICKER_EMAILS setting (comma-separated).

export const MODEL_KEYS = ['sonnet', 'haiku'] as const;
export type ModelKey = (typeof MODEL_KEYS)[number];

export const MODEL_LABELS: Record<ModelKey, string> = {
	sonnet: 'Claude Sonnet 5.5 (default)',
	haiku: 'Claude Haiku 5.5',
};

export function canPickModel(email: string, list: string | undefined): boolean {
	if (!email || !list) return false;
	const allowed = list
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	return allowed.includes(email.trim().toLowerCase());
}

/** The model to use. Users who may not pick always get Sonnet. */
export function resolveModelKey(requested: unknown, allowed: boolean): ModelKey {
	if (allowed && typeof requested === 'string' && (MODEL_KEYS as readonly string[]).includes(requested)) {
		return requested as ModelKey;
	}
	return 'sonnet';
}
