export const MAIN_NAV = [
	{ href: '/dashboard', label: 'Generate', icon: 'generate' },
	{ href: '/dashboard/letters', label: 'Letters', icon: 'letters' },
	{ href: '/dashboard/resumes', label: 'Resumes', icon: 'resumes' },
	{ href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
	{ href: '/dashboard/account', label: 'Account', icon: 'account' },
] as const;

export type NavIcon = (typeof MAIN_NAV)[number]['icon'];
