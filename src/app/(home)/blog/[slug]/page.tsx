import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
	CLUSTER_LABELS,
	SITE_URL,
	formatPostDate,
	getPublishedPost,
	publishTime,
	relatedPosts,
} from '@/lib/blog';

// Each request checks the date. A post with a later date returns 404 until its day.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = getPublishedPost(slug);
	if (!post) return { title: 'Post not found | CoverBetter' };
	const url = `${SITE_URL}/blog/${post.slug}`;
	return {
		title: `${post.title} | CoverBetter`,
		description: post.description,
		alternates: { canonical: url },
		openGraph: {
			title: post.title,
			description: post.description,
			url,
			type: 'article',
			publishedTime: publishTime(post).toISOString(),
			siteName: 'CoverBetter',
		},
		twitter: { card: 'summary', title: post.title, description: post.description },
	};
}

export default async function BlogPost({ params }: Props) {
	const { slug } = await params;
	const post = getPublishedPost(slug);
	if (!post) notFound();

	const url = `${SITE_URL}/blog/${post.slug}`;
	const related = relatedPosts(post);
	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.title,
			description: post.description,
			datePublished: publishTime(post).toISOString(),
			dateModified: publishTime(post).toISOString(),
			mainEntityOfPage: url,
			url,
			wordCount: post.words,
			keywords: post.keyword,
			author: { '@type': 'Organization', name: 'CoverBetter', url: SITE_URL },
			publisher: {
				'@type': 'Organization',
				name: 'CoverBetter',
				url: SITE_URL,
				logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
			},
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
				{ '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
				{ '@type': 'ListItem', position: 3, name: post.title, item: url },
			],
		},
		...(post.faqs.length
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'FAQPage',
						mainEntity: post.faqs.map((f) => ({
							'@type': 'Question',
							name: f.q,
							acceptedAnswer: { '@type': 'Answer', text: f.a },
						})),
					},
				]
			: []),
	];

	return (
		<main className="mx-auto max-w-screen-md px-4 pb-16 pt-28 sm:px-6">
			<script
				type="application/ld+json"
				// The data comes from our own posts. Escape "<" so no text can close the script tag.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
			/>
			<nav aria-label="Breadcrumb" className="text-sm text-base-100/70">
				<Link href="/blog" className="underline underline-offset-2 hover:text-base-100">
					Blog
				</Link>{' '}
				/ {CLUSTER_LABELS[post.cluster] ?? 'Job search'}
			</nav>

			<article>
				<header className="mt-4">
					<h1 className="text-4xl font-semibold leading-tight text-base-100 sm:text-5xl">
						{post.title}
					</h1>
					<p className="mt-4 text-sm text-base-100/70">
						<time dateTime={post.publishDate}>{formatPostDate(post.publishDate)}</time> ·{' '}
						{post.readingMinutes} min read · By the CoverBetter team
					</p>
				</header>

				{post.headings.length > 2 && (
					<nav
						aria-labelledby="toc-heading"
						className="mt-8 rounded-box border border-base-100/10 bg-base-300 p-5"
					>
						<h2 id="toc-heading" className="text-sm font-semibold text-base-100">
							In this post
						</h2>
						<ol className="mt-3 list-decimal space-y-1 pl-5 text-base-100/80">
							{post.headings.map((h) => (
								<li key={h.id}>
									<a href={`#${h.id}`} className="underline-offset-2 hover:text-base-100 hover:underline">
										{h.text}
									</a>
								</li>
							))}
						</ol>
					</nav>
				)}

				{/* The HTML is built from our own Markdown files at build time. */}
				<div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />

				{post.faqs.length > 0 && (
					<section aria-labelledby="faq-heading" className="mt-12">
						<h2 id="faq-heading" className="text-2xl font-semibold text-base-100">
							Questions people ask
						</h2>
						<div className="mt-4 flex flex-col gap-3">
							{post.faqs.map((f) => (
								<details
									key={f.q}
									className="group rounded-box border border-base-100/10 bg-base-300 p-4"
								>
									<summary className="cursor-pointer text-base-100 marker:text-neutral">{f.q}</summary>
									<p className="mt-3 text-base-100/80">{f.a}</p>
								</details>
							))}
						</div>
					</section>
				)}
			</article>

			<aside className="mt-12 rounded-box border border-secondary/60 bg-gradient-to-br from-secondary/30 to-primary p-6 sm:p-8">
				<h2 className="text-2xl text-base-100">Write your next cover letter in under a minute</h2>
				<p className="mt-2 text-base-100/80">
					Add your resume, paste the job post, and CoverBetter writes a letter for that job. Your
					first 3 letters are free.
				</p>
				<Link href="/sign-up" className="btn btn-secondary mt-5 min-h-11">
					Write a free cover letter
				</Link>
			</aside>

			{related.length > 0 && (
				<section aria-labelledby="related-heading" className="mt-12">
					<h2 id="related-heading" className="text-xl font-semibold text-base-100">
						Read next
					</h2>
					<ul className="mt-4 flex flex-col gap-3">
						{related.map((p) => (
							<li key={p.slug}>
								<Link
									href={`/blog/${p.slug}`}
									className="text-neutral underline underline-offset-2 hover:text-base-100"
								>
									{p.title}
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
