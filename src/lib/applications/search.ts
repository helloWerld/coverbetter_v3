import type { Status } from './types';

export type RoleOption = {
	id: string;
	company: string;
	jobTitle: string;
	status: Status;
	/** Extra text to search, for example notes and the start of the job post. */
	keywords?: string;
};

export const roleLabel = (r: Pick<RoleOption, 'company' | 'jobTitle'>) =>
	[r.jobTitle || 'Untitled job', r.company].filter(Boolean).join(' at ');

/** Roles that contain every word of the query, in the title, the company, or the keywords. */
export function searchRoles<T extends RoleOption>(roles: T[], query: string): T[] {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (words.length === 0) return roles;
	return roles.filter((r) => {
		const hay = `${r.jobTitle} ${r.company} ${r.keywords ?? ''}`.toLowerCase();
		return words.every((w) => hay.includes(w));
	});
}

/** Search text for a role: notes and the start of the job post, short enough to send to the browser. */
export function roleKeywords(a: { notes: string; jobDescription: string; contactName: string }): string {
	return `${a.contactName} ${a.notes} ${a.jobDescription.slice(0, 1500)}`.replace(/\s+/g, ' ').toLowerCase();
}
