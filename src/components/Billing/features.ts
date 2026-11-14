// Features listed on the Billing purchase cards. They match the homepage price cards.
export const PAID_FEATURES = [
	'Custom tone and length',
	'Editor and 3 templates',
	'PDF and DOCX export',
] as const;

export const LETTERS_FEATURES = ['Pay only for the letters you write', ...PAID_FEATURES] as const;

export const PRO_FEATURES = ['Up to 200 letters a month', ...PAID_FEATURES, 'Cancel any time'] as const;
