import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
	// One address for search engines: send www to the bare domain, with the same path.
	if (req.headers.get('host')?.toLowerCase().startsWith('www.coverbetter.io')) {
		const { pathname, search } = req.nextUrl;
		return NextResponse.redirect(`https://coverbetter.io${pathname}${search}`, 301);
	}
	if (isProtected(req)) await auth.protect();
});

export const config = {
	matcher: [
		// Skip Next.js internals and static files.
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)',
	],
};
