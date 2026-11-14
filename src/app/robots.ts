import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/blog';

// All crawlers, AI search crawlers too, may read the public pages. The app pages are private.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/', '/sign-in', '/sign-up'] }],
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
