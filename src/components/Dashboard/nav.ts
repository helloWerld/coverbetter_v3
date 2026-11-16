/** The dashboard sidebar. The sections follow the steps of a job search, in order. */
export const NAV_SECTIONS = [
	{
		title: 'Start here',
		items: [{ href: '/dashboard/how-it-works', label: 'How it works', icon: 'help' }],
	},
	{
		title: '1. Build your profile',
		items: [
			{ href: '/dashboard/profile', label: 'Career profile', icon: 'profile' },
			{ href: '/dashboard/resumes', label: 'Resumes', icon: 'resumes' },
		],
	},
	{
		title: '2. Find roles',
		items: [
			{ href: '/dashboard/applications', label: 'Applications', icon: 'applications' },
			{ href: '/dashboard/fit-score', label: 'Job Fit Score', icon: 'fit' },
		],
	},
	{
		title: '3. Apply',
		items: [
			{ href: '/dashboard', label: 'Write a letter', icon: 'generate' },
			{ href: '/dashboard/letters', label: 'Letters', icon: 'letters' },
		],
	},
	{
		title: '4. Follow up',
		items: [{ href: '/dashboard/follow-ups', label: 'Follow-ups', icon: 'followups' }],
	},
	{
		title: '5. Track results',
		items: [{ href: '/dashboard/analytics', label: 'Analytics', icon: 'analytics' }],
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
