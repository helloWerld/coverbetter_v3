import Link from 'next/link';
import React from 'react';
import { Show, UserButton } from '@clerk/nextjs';
import Logo from './Logo';

const navLinks = [
	{
		id: 0,
		path: '/#features',
		title: 'Features',
	},
	{
		id: 1,
		path: '/#howitworks',
		title: 'How It Works',
	},
	{
		id: 2,
		path: '/#testimonials',
		title: 'Testimonials',
	},
	{
		id: 3,
		path: '/#pricing',
		title: 'Pricing',
	},
	{
		id: 4,
		path: '/#faqs',
		title: 'FAQ',
	},
	{
		id: 5,
		path: '/sample',
		title: 'Sample',
	},
	{
		id: 6,
		path: '/blog',
		title: 'Blog',
	},
];

const HomePageNavbar = () => {
	const pathname = '/';
	return (
		<div className="h-fit absolute top-0 w-full max-w-full z-[100]">
			<div className="navbar">
				<div className="navbar-start">
					<Link href="/" className="btn btn-ghost h-auto min-h-11 px-2">
						<Logo className="h-12 w-auto" priority />
					</Link>
				</div>
				<div className="navbar-center hidden lg:flex">
					<ul className="menu menu-horizontal px-1">
						{pathname === '/' &&
							navLinks.map((link) => (
								<li
									key={link.id}
									className="hover:text-base-100 transition duration-200"
								>
									<Link href={link.path}>{link.title}</Link>
								</li>
							))}
					</ul>
				</div>

				<div className="navbar-end ">
					<Show when="signed-out">
						<Link
							href="/sign-in"
							className="btn btn-ghost min-h-11 text-base-100 mr-1"
						>
							Sign in
						</Link>
						<Link href="/sign-up" className="btn btn-secondary min-h-11 mr-2">
							Try it free
						</Link>
					</Show>
					<Show when="signed-in">
						<Link
							href="/dashboard"
							className="btn btn-ghost min-h-11 text-base-100 mr-2"
						>
							Dashboard
						</Link>
						<div className="mr-3">
							<UserButton />
						</div>
					</Show>
				</div>
			</div>
			<div className="divider divider-primary opacity-10 w-11/12 mx-auto -mt-1"></div>
		</div>
	);
};

export default HomePageNavbar;
