import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
	// Clerk reads these at build time. They are not secrets.
	env: {
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
		NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
		NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/dashboard',
		NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: '/dashboard',
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'lh3.googleusercontent.com' },
			{ protocol: 'https', hostname: 'media.licdn.com' },
			{ protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
		],
	},
};

initOpenNextCloudflareForDev();

export default nextConfig;
