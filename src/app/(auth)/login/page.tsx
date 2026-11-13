import { signIn, auth, signOut } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
	FaArrowRight,
	FaFacebook,
	FaGoogle,
	FaLinkedin,
} from 'react-icons/fa6';

const Login = async () => {
	const session = await auth();
	console.log(session);

	if (session) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-screen min-w-full">
				<div className="w-80 sm:w-96 h-fit bg-base-300 border border-primary-content/30 rounded-xl p-6">
					<div className="flex flex-row items-start gap-6">
						<Image
							src={session.user?.image || ''}
							width={100}
							height={100}
							alt="profile image"
							className="size-16 rounded-full"
						/>
						<div className="">
							<h2 className="text-lg font-semibold mt-2">
								{session?.user?.name}
							</h2>
							<p className="text-sm"> {session?.user?.email}</p>
						</div>
					</div>
					<h1 className="text-center text-xl font-semibold gradient-text mt-6">
						You're already signed in...
					</h1>
					<form
						action={async () => {
							'use server';
							await signOut();
						}}
					>
						<button type="submit" className="btn btn-primary w-full mt-4">
							Sign Out
						</button>
					</form>
				</div>
				<p className="flex text-primary-content/50 text-sm mt-2">
					Or...{' '}
					<Link
						href="/dashboard"
						className="hover:text-primary-content flex flex-row items-center gap-1"
					>
						go to your dashboard <FaArrowRight />
					</Link>
				</p>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center justify-center h-full min-h-screen min-w-full">
			<div className="w-80 sm:w-96 h-fit border border-primary-content/30 rounded-xl">
				<div className="text-center border-b border-primary-content/30 p-4 text-base-100">
					<h1 className="text-2xl font-semibold gradient-text">
						Login To Your Account
					</h1>
					<p className="text-xs text-base-100/50 mt-1">
						Sign in using OAuth provider
					</p>
				</div>
				<div className="flex flex-col gap-2 p-4">
					<form
						action={async () => {
							'use server';
							await signIn('linkedin');
						}}
					>
						<button
							type="submit"
							className="btn btn-secondary hover:scale-105 w-full relative"
						>
							<FaLinkedin className="absolute left-4 text-lg" />
							LinkedIn
						</button>
					</form>
					<form
						action={async () => {
							'use server';
							await signIn('facebook');
						}}
					>
						<button
							type="submit"
							className="btn btn-secondary hover:scale-105 w-full relative"
						>
							<FaFacebook className="absolute left-4 text-lg" />
							Facebook
						</button>
					</form>
					<form
						action={async () => {
							'use server';
							await signIn('google');
						}}
					>
						<button
							type="submit"
							className="btn btn-secondary hover:scale-105 w-full relative"
						>
							<FaGoogle className="absolute left-4 text-lg" />
							Google
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
