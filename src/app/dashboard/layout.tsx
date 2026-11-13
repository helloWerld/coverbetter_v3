import Image from 'next/image';
import DashboardNav from '@/components/Dashboard/DashboardNav';
import { requireUser } from '@/lib/user';

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	// Makes sure the users row exists before any page reads it.
	await requireUser();

	return (
		<div className="min-h-screen bg-primary md:flex">
			<DashboardNav />
			{/* The grid background is the same image the homepage sections use. */}
			<div className="relative min-w-0 flex-1 overflow-hidden">
				<Image
					src="/grid.png"
					alt=""
					width={1000}
					height={3000}
					className="pointer-events-none absolute inset-0 h-full w-full object-cover"
				/>
				<main className="relative px-4 py-8 md:px-10 md:py-12">{children}</main>
			</div>
		</div>
	);
}
