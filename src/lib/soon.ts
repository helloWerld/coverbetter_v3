export type SoonFeature = {
	slug: string;
	name: string;
	description: string;
};

export const SOON_FEATURES: SoonFeature[] = [
	{
		slug: 'chrome-extension',
		name: 'Chrome Extension',
		description:
			'Write a cover letter from the job post you are reading, without a copy and paste.',
	},
];

export function getSoonFeature(slug: string): SoonFeature | undefined {
	return SOON_FEATURES.find((f) => f.slug === slug);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
	return value.length <= 254 && EMAIL_RE.test(value);
}
