import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import UserDropdown from './UserDropdown';

const Navbar = async () => {
	const session = await auth();
	const { name, email, image } = session?.user;
	console.log(session);
	return (
		<nav className="flex flex-row items-center justify-between py-2 ps-6 pe-2 relative">
			<Link href="/" className="text-base-100/50 hover:text-base-100">
				<FaHouse className="text-xl" />
			</Link>
			<div className="btn btn-ghost text-base-100 text-xl">
				CoverBetter{' '}
				<span className="text-secondary text-sm mt-1 -ml-1 font-bold">v2</span>
			</div>
			<UserDropdown />
		</nav>
	);
};

export default Navbar;
