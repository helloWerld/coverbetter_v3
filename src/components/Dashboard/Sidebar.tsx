import { auth } from '@/auth';
import Link from 'next/link';
import React from 'react';
import { FaSliders } from 'react-icons/fa6';

const Sidebar = async () => {
	const session = await auth();
	const { name, email } = session?.user;
	return (
		<div className="drawer lg:drawer-open w-fit z-[100]">
			<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
			<div
				className="drawer-content absolute top-1 bg-primary rounded-r-full p-2 opacity-100 lg:hidden transition duration-200 ease-in-out"
				draggable="false"
			>
				{/* Page content here */}
				<label
					htmlFor="my-drawer-2"
					className="btn btn-circle btn-sm btn-secondary drawer-button lg:hidden"
				>
					<FaSliders className="text-primary" />
				</label>
			</div>
			<div className="drawer-side">
				<label
					htmlFor="my-drawer-2"
					aria-label="close sidebar"
					className="drawer-overlay"
				></label>
				<ul className="flex flex-col menu bg-primary text-primary-content min-h-full w-80 p-4">
					{/* Sidebar content here */}
					<div className="px-6 mb-2">
						<h2 className="text-xl font-semibold">{name}</h2>
						<p className="text-sm">{email}</p>
					</div>
					<div className="text-primary font-medium flex justify-center items-center text-center gradient-background rounded-lg mt-4 mb-2 h-6">
						Dashboard
					</div>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard">User Details</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/usage">Usage & Analytics</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/settings">Settings</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/billing">Billing</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/history">History</Link>
					</li>
					<div className="text-primary font-medium flex justify-center items-center text-center gradient-background rounded-lg mt-4 mb-2 h-6">
						Help Center
					</div>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/tutorials">Video Tutorials</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/dashboard/support">Support</Link>
					</li>
					<div className="text-primary font-medium flex justify-center items-center text-center gradient-background rounded-lg mt-4 mb-2 h-6">
						Quick Links
					</div>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/generate">Cover Letter Generator</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/editor">Cover Letter Editor</Link>
					</li>
					<li className="hover:bg-base-300 rounded-xl">
						<Link href="/ats-checker">ATS Compatability Checker</Link>
					</li>
					<button className="btn w-full btn-base-300 mt-24 sm:mt-auto text-primary-content">
						Log Out
					</button>
				</ul>
			</div>
		</div>
	);
};

export default Sidebar;
