'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import {
	FaBars,
	FaXmark,
	FaPenNib,
	FaFileLines,
	FaCreditCard,
	FaBriefcase,
	FaChartSimple,
	FaIdCard,
	FaGear,
	FaCircleQuestion,
	FaPaperPlane,
} from 'react-icons/fa6';
import { UserButton } from '@clerk/nextjs';
import { ACCOUNT_NAV, MAIN_NAV, type NavIcon } from './nav';
import { SOON_FEATURES } from '@/lib/soon';
import Logo from '@/components/ui/Logo';

// Each icon matches its page: briefcase for applications, chart for analytics, pen for writing,
// letter for letters, file for resumes, ID card for the profile, target for the Job Fit Score.
const ICONS: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
	help: FaCircleQuestion,
	applications: FaBriefcase,
	analytics: FaChartSimple,
	profile: FaIdCard,
	settings: FaGear,
	generate: FaPenNib,
	resumes: FaFileLines,
	followups: FaPaperPlane,
	billing: FaCreditCard,
};

const linkBase =
	'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral';

export default function DashboardNav() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	// Close the mobile menu after a navigation.
	useEffect(() => setOpen(false), [pathname]);

	// Close the mobile menu with Escape.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open]);

	const isActive = (href: string) =>
		href === '/dashboard' ? pathname === href : pathname.startsWith(href);

	return (
		<>
			{/* Top bar on mobile */}
			<header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-base-100/10 bg-base-300 px-2 md:hidden">
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					aria-controls="dashboard-menu"
					aria-label={open ? 'Close menu' : 'Open menu'}
					className="flex h-11 w-11 items-center justify-center rounded-lg text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
				>
					{open ? (
						<FaXmark className="text-xl" aria-hidden="true" />
					) : (
						<FaBars className="text-xl" aria-hidden="true" />
					)}
				</button>
				<Link
					href="/"
					className="flex min-h-11 items-center rounded-lg px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
				>
					<Logo className="h-11 w-auto" priority />
				</Link>
				<div className="flex h-11 w-11 items-center justify-center">
					<UserButton />
				</div>
			</header>

			<aside
				id="dashboard-menu"
				className={`${
					open ? 'flex' : 'hidden'
				} fixed inset-x-0 bottom-0 top-14 z-30 flex-col overflow-y-auto bg-base-300 p-4 md:sticky md:top-0 md:z-auto md:flex md:h-svh md:w-64 md:shrink-0 md:self-start md:border-r md:border-base-100/10`}
			>
				<Link
					href="/"
					className="mb-6 hidden rounded-lg px-3 md:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
				>
					<Logo className="h-16 w-auto" priority />
				</Link>
				<nav aria-label="Dashboard">
					<NavList items={MAIN_NAV} isActive={isActive} />
				</nav>

				<div className="divider my-4 opacity-10" />

				<nav aria-labelledby="soon-heading">
					<h2
						id="soon-heading"
						className="mb-2 px-3 text-xs font-semibold text-base-100/70"
					>
						Coming soon
					</h2>
					<ul className="flex flex-col gap-1">
						{SOON_FEATURES.map((f) => {
							const href = `/dashboard/soon/${f.slug}`;
							const active = pathname === href;
							return (
								<li key={f.slug}>
									<Link
										href={href}
										aria-current={active ? 'page' : undefined}
										className={`${linkBase} justify-between ${
											active
												? 'bg-base-200 text-base-100'
												: 'text-base-100/70 hover:bg-base-200 hover:text-base-100'
										}`}
									>
										<span>{f.name}</span>
										<span className="badge badge-accent badge-sm shrink-0 font-medium">
											Soon
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Settings and Billing sit at the bottom, just above the avatar. */}
				<div className="mt-auto pt-6">
					<nav aria-label="Account">
						<NavList items={ACCOUNT_NAV} isActive={isActive} />
					</nav>
					<div className="mt-3 hidden items-center gap-3 border-t border-base-100/10 px-3 pt-4 md:flex">
						<UserButton />
						<span className="text-xs text-base-100/70">Signed in</span>
					</div>
				</div>
			</aside>
		</>
	);
}

function NavList({
	items,
	isActive,
}: Readonly<{
	items: readonly { href: string; label: string; icon: NavIcon; divider?: boolean }[];
	isActive: (href: string) => boolean;
}>) {
	return (
		<ul className="flex flex-col gap-1">
			{items.map((item) => {
				const Icon = ICONS[item.icon];
				const active = isActive(item.href);
				return (
					<Fragment key={item.href}>
						<li>
							<Link
							href={item.href}
							aria-current={active ? 'page' : undefined}
							className={`${linkBase} ${
								active
									? 'bg-secondary text-base-100'
									: 'text-base-100/70 hover:bg-base-200 hover:text-base-100'
							}`}
						>
							<Icon className="text-base" aria-hidden="true" />
							{item.label}
						</Link>
						</li>
						{/* A line between the steps of the job search. */}
						{item.divider && (
							<li role="presentation" className="my-2 px-3">
								<hr className="border-base-100/15" />
							</li>
						)}
					</Fragment>
				);
			})}
		</ul>
	);
}
