/** The dashboard sidebar. The pages follow the steps of a job search, in order. */
export const MAIN_NAV = [
	{ href: '/dashboard/how-it-works', label: 'How it works', icon: 'help', divider: true },
	{ href: '/dashboard/profile', label: 'Build Your Profile', icon: 'profile' },
	{ href: '/dashboard/resumes', label: 'Manage Resumes', icon: 'resumes', divider: true },
	{ href: '/dashboard/applications', label: 'Find Roles', icon: 'applications' },
	{ href: '/dashboard', label: 'Customize Application', icon: 'generate' },
	{ href: '/dashboard/follow-ups', label: 'Follow-ups', icon: 'followups', divider: true },
	{ href: '/dashboard/analytics', label: 'Application Pipeline', icon: 'analytics' },
	{ href: '/dashboard/search', label: 'Search', icon: 'search' },
] as const;

/** Shown at the bottom of the sidebar, above the avatar. The avatar opens the Clerk account dialog. */
export const ACCOUNT_NAV = [
	{ href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
	{ href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
	{ href: '/dashboard/support', label: 'Support', icon: 'support' },
] as const;

/** Shown only to the admin account. The page also checks the account on the server. */
export const ADMIN_NAV = [{ href: '/dashboard/admin', label: 'Admin', icon: 'admin' }] as const;

export type NavIcon = (typeof MAIN_NAV)[number]['icon'] | (typeof ACCOUNT_NAV)[number]['icon'] | (typeof ADMIN_NAV)[number]['icon'];
