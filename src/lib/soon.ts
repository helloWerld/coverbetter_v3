export type SoonFeature = {
	slug: string;
	name: string;
	description: string;
};

export const SOON_FEATURES: SoonFeature[] = [
	{
		slug: 'job-fit-score',
		name: 'AI Job Fit Score',
		description:
			'See how well your resume matches a job post before you apply, with a list of gaps.',
	},
	{
		slug: 'follow-up-letters',
		name: 'Follow-up Letters',
		description:
			'Write a short follow-up note after you apply or after an interview.',
	},
	{
		slug: 'chrome-extension',
		name: 'Chrome Extension',
		description:
			'Write a cover letter from the job post you are reading, without a copy and paste.',
	},
	{
		slug: 'analytics',
		name: 'Analytics',
		description:
			'See how many letters you wrote, which tones you use, and where you apply.',
	},
];

export function getSoonFeature(slug: string): SoonFeature | undefined {
	return SOON_FEATURES.find((f) => f.slug === slug);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
	return value.length <= 254 && EMAIL_RE.test(value);
}
