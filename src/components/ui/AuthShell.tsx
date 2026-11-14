import Link from 'next/link';
import Logo from './Logo';

/** Centered page for the Clerk sign-in and sign-up forms. */
export default function AuthShell({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="min-h-screen flex items-center justify-center bg-primary px-4 py-16 relative">
			<Link
				href="/"
				aria-label="CoverBetter home"
				className="absolute top-3 left-3 flex min-h-11 items-center rounded-lg px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
			>
				<Logo className="h-11 w-auto" priority />
			</Link>
			{children}
		</main>
	);
}
