import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE_URL, getPublishedPost } from '@/lib/blog';
import { getToolMeta } from '@/lib/tools/registry';
import type { ToolMeta } from '@/lib/tools/types';

export function toolMetadata(meta: ToolMeta): Metadata {
	const url = `${SITE_URL}/tools/${meta.slug}`;
	return {
		title: `${meta.title} | CoverBetter`,
		description: meta.description,
		alternates: { canonical: url },
		openGraph: { title: meta.title, description: meta.description, url, type: 'website', siteName: 'CoverBetter' },
		twitter: { card: 'summary', title: meta.title, description: meta.description },
	};
}

/** Live posts only: a post with a later date stays hidden until its day. */
function livePosts(slugs: string[], limit = 2) {
	return slugs.map((s) => getPublishedPost(s)).filter((p) => p !== null).slice(0, limit);
}

/** The page around every free tool: H1, the tool, guide, FAQs, product link, and related links. */
export default function ToolShell({ meta, children }: Readonly<{ meta: ToolMeta; children: ReactNode }>) {
	const url = `${SITE_URL}/tools/${meta.slug}`;
	const posts = livePosts(meta.blogSlugs);
	const tools = meta.relatedTools.map(getToolMeta).filter((t) => t !== undefined).slice(0, 3);
	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: meta.title,
			description: meta.description,
			url,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Any (runs in the browser)',
			isAccessibleForFree: true,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
			publisher: { '@type': 'Organization', name: 'CoverBetter', url: SITE_URL },
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
				{ '@type': 'ListItem', position: 2, name: 'Free tools', item: `${SITE_URL}/tools` },
				{ '@type': 'ListItem', position: 3, name: meta.name, item: url },
			],
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: meta.faqs.map((f) => ({
				'@type': 'Question',
				name: f.q,
				acceptedAnswer: { '@type': 'Answer', text: f.a },
			})),
		},
	];

	return (
		<main className="mx-auto max-w-screen-md px-4 pb-16 pt-28 sm:px-6">
			<script
				type="application/ld+json"
				// Our own data. Escape "<" so no text can close the script tag.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
			/>
			<nav aria-label="Breadcrumb" className="text-sm text-base-100/70">
				<Link href="/tools" className="underline underline-offset-2 hover:text-base-100">
					Free tools
				</Link>{' '}
				/ {meta.name}
			</nav>

			<header className="mt-4">
				<h1 className="text-4xl font-semibold leading-tight text-base-100 sm:text-5xl">{meta.title}</h1>
				<p className="mt-4 text-lg text-base-100/80">{meta.intro}</p>
				<p className="mt-3 text-sm text-base-100/60">
					Free, with no sign-up.{' '}
					{meta.storage === 'local'
						? 'Your entries save in this browser on this device only. Nothing goes to our servers.'
						: 'It runs in your browser. Nothing you type goes to our servers.'}
				</p>
			</header>

			<div className="mt-8">{children}</div>

			<aside className="mt-10 rounded-box border border-secondary/60 bg-gradient-to-br from-secondary/30 to-primary p-6 sm:p-8">
				<h2 className="text-2xl text-base-100">{meta.cta.heading}</h2>
				<p className="mt-2 text-base-100/80">{meta.cta.text}</p>
				<Link href={meta.cta.href} className="btn btn-secondary mt-5 min-h-11">
					{meta.cta.label}
				</Link>
			</aside>

			<article className="blog-prose mt-12">
				{meta.guide.map((s) => (
					<section key={s.heading}>
						<h2>{s.heading}</h2>
						{s.paragraphs.map((p) => (
							<p key={p}>{p}</p>
						))}
						{s.list && (
							<ul>
								{s.list.map((li) => (
									<li key={li}>{li}</li>
								))}
							</ul>
						)}
					</section>
				))}
			</article>

			<section aria-labelledby="faq-heading" className="mt-12">
				<h2 id="faq-heading" className="text-2xl font-semibold text-base-100">
					Questions people ask
				</h2>
				<div className="mt-4 flex flex-col gap-3">
					{meta.faqs.map((f) => (
						<details key={f.q} className="rounded-box border border-base-100/10 bg-base-300 p-4">
							<summary className="cursor-pointer text-base-100 marker:text-neutral">{f.q}</summary>
							<p className="mt-3 text-base-100/80">{f.a}</p>
						</details>
					))}
				</div>
			</section>

			{(posts.length > 0 || tools.length > 0) && (
				<div className="mt-12 grid gap-10 sm:grid-cols-2">
					{posts.length > 0 && (
						<section aria-labelledby="read-heading">
							<h2 id="read-heading" className="text-xl font-semibold text-base-100">
								Read next
							</h2>
							<ul className="mt-4 flex flex-col gap-3">
								{posts.map((p) => (
									<li key={p.slug}>
										<Link href={`/blog/${p.slug}`} className="text-neutral underline underline-offset-2 hover:text-base-100">
											{p.title}
										</Link>
									</li>
								))}
							</ul>
						</section>
					)}
					{tools.length > 0 && (
						<section aria-labelledby="tools-heading">
							<h2 id="tools-heading" className="text-xl font-semibold text-base-100">
								More free tools
							</h2>
							<ul className="mt-4 flex flex-col gap-3">
								{tools.map((t) => (
									<li key={t.slug}>
										<Link href={`/tools/${t.slug}`} className="text-neutral underline underline-offset-2 hover:text-base-100">
											{t.name}
										</Link>
									</li>
								))}
								<li>
									<Link href="/tools" className="text-base-100/70 underline underline-offset-2 hover:text-base-100">
										All free tools
									</Link>
								</li>
							</ul>
						</section>
					)}
				</div>
			)}
		</main>
	);
}
