import Footer from '@/components/ui/Footer';
import '../globals.css';
import Navbar from '@/components/ui/Navbar';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();
	if (!session) {
		redirect('/login');
	}
	return (
		<html lang="en" className="bg-primary">
			<body className="w-full bg-primary relative">
				<Navbar />
				{children}
				<Footer />
			</body>
		</html>
	);
}
