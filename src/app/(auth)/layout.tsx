import { FaHouse } from 'react-icons/fa6';
import '../globals.css';
import Link from 'next/link';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="bg-primary text-primary-content">
			<body className="w-full bg-primary relative">
				<Link href="/" className="hover:text-base-100">
					<FaHouse className="absolute top-6 left-6 text-xl" />
				</Link>

				{children}
			</body>
		</html>
	);
}
