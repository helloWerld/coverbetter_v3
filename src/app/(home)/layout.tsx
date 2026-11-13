import type { Metadata } from 'next';

import '../globals.css';
import Footer from '@/components/ui/Footer';
import HomePageNavbar from '@/components/ui/HomePageNavbar';

export const metadata: Metadata = {
	title: 'CoverBetter v2',
	description: 'AI powered cover letter generator',
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-theme="dark"
			className="bg-primary text-primary-content"
		>
			<body className="w-full bg-primary relative">
				<HomePageNavbar />

				{children}

				<Footer />
			</body>
		</html>
	);
}
