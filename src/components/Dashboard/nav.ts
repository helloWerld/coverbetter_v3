/** The dashboard sidebar. The pages follow the steps of a job search, in order. */
export const MAIN_NAV = [
	{ href: '/dashboard/how-it-works', label: 'How it works', icon: 'help' },
	{ href: '/dashboard/profile', label: 'Build Your Profile', icon: 'profile' },
	{ href: '/dashboard/resumes', label: 'Manage Resumes', icon: 'resumes' },
	{ href: '/dashboard/applications', label: 'Find Roles', icon: 'applications' },
	{ href: '/dashboard', label: 'Customize Application', icon: 'generate' },
	{ href: '/dashboard/follow-ups', label: 'Follow-ups', icon: 'followups' },
	{ href: '/dashboard/analytics', label: 'Analytics', icon: 'analytics' },
] as const;

/** Shown at the bottom of the sidebar, above the avatar. The avatar opens the Clerk account dialog. */
export const ACCOUNT_NAV = [
	{ href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
	{ href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
] as const;

export type NavIcon = (typeof MAIN_NAV)[number]['icon'] | (typeof ACCOUNT_NAV)[number]['icon'];
