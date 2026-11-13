import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';
import './globals.css';

export const metadata: Metadata = {
	title: 'CoverBetter',
	description: 'Cover letters written from your resume and the job post.',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider appearance={clerkAppearance}>
			<html
				lang="en"
				data-theme="dark"
				className="bg-primary text-primary-content"
			>
				<body className="w-full bg-primary relative">{children}</body>
			</html>
		</ClerkProvider>
	);
}
