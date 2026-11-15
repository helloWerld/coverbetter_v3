export const MAIN_NAV = [
	{ href: '/dashboard', label: 'Generate', icon: 'generate' },
	{ href: '/dashboard/letters', label: 'Letters', icon: 'letters' },
	{ href: '/dashboard/resumes', label: 'Resumes', icon: 'resumes' },
	{ href: '/dashboard/fit-score', label: 'Job Fit Score', icon: 'fit' },
] as const;

/** Shown at the bottom of the sidebar, above the avatar. The avatar opens the Clerk account dialog. */
export const ACCOUNT_NAV = [
	{ href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
] as const;

export type NavIcon =
	| (typeof MAIN_NAV)[number]['icon']
	| (typeof ACCOUNT_NAV)[number]['icon'];
