import type { Faq } from '@/lib/blog';

/** One section of the short guide below a tool. */
export type GuideSection = {
	heading: string;
	paragraphs: string[];
	/** Optional bullet list after the paragraphs. */
	list?: string[];
};

export const TOOL_GROUPS = [
	'Cover letters and emails',
	'Resumes and LinkedIn',
	'Interviews',
	'Pay, offers, and leaving a job',
	'Job search planning',
] as const;
export type ToolGroup = (typeof TOOL_GROUPS)[number];

/** Everything the page shell needs to show one free tool. No component here, so it is safe on the server. */
export type ToolMeta = {
	/** URL part: /tools/<slug>. */
	slug: string;
	/** Short name for cards and links, for example "Salary to hourly calculator". */
	name: string;
	/** Page H1 and <title> start. 70 characters or fewer. Put the search phrase near the start. */
	title: string;
	/** Meta description. 160 characters or fewer. */
	description: string;
	/** The one search phrase the page targets. */
	keyword: string;
	/** First paragraph under the H1. 1 to 3 sentences that say what the tool does. */
	intro: string;
	/** The group on the /tools hub page. */
	group: ToolGroup;
	/** 'local' when the tool saves to localStorage. 'none' when it saves nothing. */
	storage: 'none' | 'local';
	/** 2 to 4 sections, about 250 to 500 words in all. */
	guide: GuideSection[];
	/** 3 to 5 questions. */
	faqs: Faq[];
	/** Blog slugs in the order of preference. The page shows only posts that are live. */
	blogSlugs: string[];
	/** Other tool slugs to show in "More free tools". */
	relatedTools: string[];
	/** The link to the product at the end of the tool. */
	cta: { heading: string; text: string; label: string; href: string };
};
