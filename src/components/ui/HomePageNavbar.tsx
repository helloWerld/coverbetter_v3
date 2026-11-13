import Link from 'next/link';
import React from 'react';
import UserDropdown from './UserDropdown';

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
		title: 'FAQs',
	},
];

const HomePageNavbar = () => {
	const pathname = '/';
	return (
		<div className="h-fit absolute top-0 w-full max-w-full z-[100]">
			<div className="navbar">
				<div className="navbar-start">
					<div className="btn btn-ghost text-xl text-base-100">
						CoverBetter{' '}
						<span className="text-secondary text-sm mt-1 -ml-1 font-bold">
							v2
						</span>
					</div>
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
					<UserDropdown />
				</div>
			</div>
			<div className="divider divider-primary opacity-10 w-11/12 mx-auto -mt-1"></div>
		</div>
	);
};

export default HomePageNavbar;
