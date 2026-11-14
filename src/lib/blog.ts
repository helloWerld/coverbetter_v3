import posts from '@/content/blog-posts.json';

export const SITE_URL = 'https://coverbetter.io';

export type Faq = { q: string; a: string };
export type Post = {
	slug: string;
	title: string;
	description: string;
	/** YYYY-MM-DD. The post goes live at PUBLISH_HOUR_UTC on this date. */
	publishDate: string;
	keyword: string;
	cluster: string;
	faqs: Faq[];
	words: number;
	readingMinutes: number;
	headings: { id: string; text: string }[];
	html: string;
};

/** 13:00 UTC is 8 a.m. in New York (EST), so a post is live on its date across the US. */
export const PUBLISH_HOUR_UTC = 13;

const ALL = posts as Post[];

export function publishTime(post: Pick<Post, 'publishDate'>): Date {
	return new Date(`${post.publishDate}T${String(PUBLISH_HOUR_UTC).padStart(2, '0')}:00:00Z`);
}

export function isPublished(post: Pick<Post, 'publishDate'>, now: Date = new Date()): boolean {
	return publishTime(post) <= now;
}

/** Live posts, newest first. Posts with a later date stay hidden until their date. */
export function publishedPosts(now: Date = new Date(), all: Post[] = ALL): Post[] {
	return all
		.filter((p) => isPublished(p, now))
		.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

/** A live post, or null when the slug is unknown or the post is not live yet. */
export function getPublishedPost(slug: string, now: Date = new Date(), all: Post[] = ALL): Post | null {
	const post = all.find((p) => p.slug === slug);
	return post && isPublished(post, now) ? post : null;
}

/** Up to `limit` live posts from the same topic first, then the newest others. */
export function relatedPosts(post: Post, now: Date = new Date(), limit = 3, all: Post[] = ALL): Post[] {
	const others = publishedPosts(now, all).filter((p) => p.slug !== post.slug);
	const same = others.filter((p) => p.cluster === post.cluster);
	const rest = others.filter((p) => p.cluster !== post.cluster);
	return [...same, ...rest].slice(0, limit);
}

export function formatPostDate(publishDate: string): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(`${publishDate}T12:00:00Z`));
}

export const CLUSTER_LABELS: Record<string, string> = {
	'cover-letters': 'Cover letters',
	resumes: 'Resumes',
	interviews: 'Interviews',
	'job-search': 'Job search',
	'follow-up': 'Follow-up',
	networking: 'Networking',
	linkedin: 'LinkedIn',
	offers: 'Offers and salary',
};
