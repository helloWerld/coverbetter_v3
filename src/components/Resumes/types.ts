export type ResumeView = {
	id: string;
	title: string;
	/** null for a pasted resume */
	fileName: string | null;
	text: string;
	/** ISO date string */
	createdAt: string;
	/** ISO date string */
	updatedAt: string;
};

export function formatDate(iso: string): string {
	// Fixed time zone so the server and the browser print the same text.
	return new Date(iso).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

export function preview(text: string, max = 200): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	return flat.length > max ? `${flat.slice(0, max).trimEnd()}...` : flat;
}
