import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/blog';
import { TOOLS } from '@/lib/tools/registry';
import { TOOL_GROUPS } from '@/lib/tools/types';

export const metadata: Metadata = {
	title: 'Free Job Search Tools: Templates, Calculators, and Checkers | CoverBetter',
	description:
		'Free tools for people who apply for jobs: cover letter and email templates, interview practice, salary calculators, and more. No sign-up needed.',
	alternates: { canonical: `${SITE_URL}/tools` },
	openGraph: {
		title: 'Free job search tools',
		description: 'Templates, calculators, and checkers for people who apply for jobs. No sign-up needed.',
		url: `${SITE_URL}/tools`,
		type: 'website',
		siteName: 'CoverBetter',
	},
};

export default function ToolsHub() {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Free job search tools',
		itemListElement: TOOLS.map((t, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: t.name,
			url: `${SITE_URL}/tools/${t.slug}`,
		})),
	};

	return (
		<main className="mx-auto flex max-w-screen-lg flex-col gap-12 px-4 pb-16 pt-28 sm:px-6">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
			/>
			<header className="max-w-prose">
				<h1 className="text-4xl font-semibold text-base-100 sm:text-5xl">Free job search tools</h1>
				<p className="mt-4 text-lg text-base-100/80">
					Templates, calculators, and checkers for people who apply for jobs now. Every tool is free, needs no
					sign-up, and runs in your browser.
				</p>
			</header>

			{TOOL_GROUPS.map((group) => {
				const tools = TOOLS.filter((t) => t.group === group);
				if (!tools.length) return null;
				const id = `group-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
				return (
					<section key={group} aria-labelledby={id}>
						<h2 id={id} className="text-2xl font-semibold text-base-100">
							{group}
						</h2>
						<ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{tools.map((t) => (
								<li key={t.slug}>
									<article className="relative flex h-full flex-col rounded-box border border-base-100/10 bg-gradient-to-br from-base-300 to-primary p-5 transition duration-200 hover:border-secondary">
										<h3 className="text-lg text-base-100">
											<Link
												href={`/tools/${t.slug}`}
												className="after:absolute after:inset-0 after:rounded-box focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-neutral"
											>
												{t.name}
											</Link>
										</h3>
										<p className="mt-2 text-sm text-base-100/75">{t.intro.split('. ')[0].replace(/\.?$/, '.')}</p>
									</article>
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</main>
	);
}
