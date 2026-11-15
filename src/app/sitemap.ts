import type { MetadataRoute } from 'next';
import { SITE_URL, publishTime, publishedPosts } from '@/lib/blog';
import { TOOLS } from '@/lib/tools/registry';

// Built per request, so each new post joins the sitemap on its publish day.
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
	const posts = publishedPosts();
	return [
		{ url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
		{ url: `${SITE_URL}/sample`, changeFrequency: 'monthly', priority: 0.7 },
		{
			url: `${SITE_URL}/blog`,
			lastModified: posts[0] ? publishTime(posts[0]) : undefined,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		...posts.map((p) => ({
			url: `${SITE_URL}/blog/${p.slug}`,
			lastModified: publishTime(p),
			changeFrequency: 'monthly' as const,
			priority: 0.6,
		})),
		{ url: `${SITE_URL}/tools`, changeFrequency: 'monthly', priority: 0.8 },
		...TOOLS.map((t) => ({
			url: `${SITE_URL}/tools/${t.slug}`,
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		})),
		{ url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
		{ url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
	];
}
