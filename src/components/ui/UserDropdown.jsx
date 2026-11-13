import { auth, signOut } from '@/auth';
import { signOutCurrentUser } from '../../actions/auth';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const links = [
	{ id: 0, title: 'Account', path: '/dashboard' },
	{ id: 1, title: 'Cover Letter Generator', path: '/generate' },
	{ id: 2, title: 'Get Premium', path: '/premium' },
];

const UserDropdown = async () => {
	const session = await auth();
	if (!session) {
		console.log('no session!');
		return (
			<Link href="/login" className="btn btn-secondary min-w-32 mr-2">
				Login
			</Link>
		);
	}
	const { name, email, image } = session.user;
	return (
		<details className="dropdown dropdown-end mr-2">
			<summary className="avatar mt-1 cursor-pointer">
				<div className="w-10 rounded">
					<Image
						src={image}
						alt={name}
						width={10}
						height={10}
						className="object-cover w-full h-full rounded-full"
					/>
				</div>
			</summary>
			<ul className="menu dropdown-content bg-base-300 text-primary-content border border-secondary rounded-box z-[1] w-64 shadow gap-1 p-3 mt-2">
				<div className="p-3">
					<p className="font-semibold">{name}</p>
					<p className="text-xs">{email}</p>
				</div>
				{links.map((link) => (
					<li key={link.id} className="hover:bg-primary rounded-lg">
						<Link href={link.path}>
							<p>{link.title}</p>
						</Link>
					</li>
				))}
				<div className="divider divider-secondary opacity-50 my-0"></div>
				<li className="">
					<form
						className="btn btn-sm btn-primary min-w-full mt-1"
						action={async () => {
							'use server';
							await signOut();
						}}
					>
						<button type="submit">Sign Out</button>
					</form>
				</li>
			</ul>
		</details>
	);
};

export default UserDropdown;
