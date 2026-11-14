import type { Metadata } from 'next';
import Link from 'next/link';
import { CLUSTER_LABELS, SITE_URL, formatPostDate, publishedPosts } from '@/lib/blog';

// Each request checks the date, so a new post shows on its publish day without a deploy.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Job Search Blog: Cover Letters, Resumes, and Interviews | CoverBetter',
	description:
		'Practical guides for people who are applying for jobs now: cover letters, resumes, interviews, follow-up emails, and offers.',
	alternates: { canonical: `${SITE_URL}/blog` },
	openGraph: {
		title: 'CoverBetter job search blog',
		description: 'Practical guides for people who are applying for jobs now.',
		url: `${SITE_URL}/blog`,
		type: 'website',
		siteName: 'CoverBetter',
	},
};

export default function BlogIndex() {
	const posts = publishedPosts();
	const [latest, ...rest] = posts;

	return (
		<main className="mx-auto flex max-w-screen-lg flex-col gap-10 px-4 pb-16 pt-28 sm:px-6">
			<header className="max-w-prose">
				<h1 className="text-4xl font-semibold text-base-100 sm:text-5xl">Job search blog</h1>
				<p className="mt-4 text-lg text-base-100/80">
					Guides for people who are applying for jobs now. A new post goes up every Monday.
				</p>
			</header>

			{latest ? (
				<>
					<PostCard post={latest} featured />
					{rest.length > 0 && (
						<ul className="grid gap-6 md:grid-cols-2">
							{rest.map((p) => (
								<li key={p.slug}>
									<PostCard post={p} />
								</li>
							))}
						</ul>
					)}
				</>
			) : (
				<p className="text-base-100/80">The first post goes up soon.</p>
			)}
		</main>
	);
}

function PostCard({
	post,
	featured = false,
}: Readonly<{ post: ReturnType<typeof publishedPosts>[number]; featured?: boolean }>) {
	return (
		<article
			className={`relative flex h-full flex-col rounded-box border border-base-100/10 bg-gradient-to-br from-base-300 to-primary p-6 transition duration-200 hover:border-secondary ${
				featured ? 'sm:p-8' : ''
			}`}
		>
			<p className="text-sm text-base-100/70">
				{CLUSTER_LABELS[post.cluster] ?? 'Job search'} · {formatPostDate(post.publishDate)} ·{' '}
				{post.readingMinutes} min read
			</p>
			<h2 className={`mt-2 text-base-100 ${featured ? 'text-3xl' : 'text-xl'}`}>
				<Link
					href={`/blog/${post.slug}`}
					className="after:absolute after:inset-0 after:rounded-box focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-neutral"
				>
					{post.title}
				</Link>
			</h2>
			<p className="mt-3 text-base-100/80">{post.description}</p>
		</article>
	);
}
