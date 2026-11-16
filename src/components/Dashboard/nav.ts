/** The dashboard sidebar, in sections that follow the order of a job search. */
export const NAV_SECTIONS = [
	{
		title: 'Start here',
		items: [{ href: '/dashboard/how-it-works', label: 'How it works', icon: 'help' }],
	},
	{
		title: 'Track',
		items: [
			{ href: '/dashboard/applications', label: 'Applications', icon: 'applications' },
			{ href: '/dashboard/analytics', label: 'Analytics', icon: 'analytics' },
		],
	},
	{
		title: 'Your documents',
		items: [
			{ href: '/dashboard/profile', label: 'Career profile', icon: 'profile' },
			{ href: '/dashboard/resumes', label: 'Resumes', icon: 'resumes' },
			{ href: '/dashboard/letters', label: 'Letters', icon: 'letters' },
		],
	},
	{
		title: 'AI tools',
		items: [
			{ href: '/dashboard', label: 'Write a letter', icon: 'generate' },
			{ href: '/dashboard/fit-score', label: 'Job Fit Score', icon: 'fit' },
		],
	},
] as const;

/** Shown at the bottom of the sidebar, above the avatar. The avatar opens the Clerk account dialog. */
export const ACCOUNT_NAV = [
	{ href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
	{ href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
] as const;

export type NavIcon =
	| (typeof NAV_SECTIONS)[number]['items'][number]['icon']
	| (typeof ACCOUNT_NAV)[number]['icon'];
