import Link from 'next/link';
import { FaHouse } from 'react-icons/fa6';

/** Centered page for the Clerk sign-in and sign-up forms. */
export default function AuthShell({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="min-h-screen flex items-center justify-center bg-primary px-4 py-16 relative">
			<Link
				href="/"
				aria-label="CoverBetter home"
				className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-lg text-base-100/70 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
			>
				<FaHouse className="text-xl" aria-hidden="true" />
			</Link>
			{children}
		</main>
	);
}
