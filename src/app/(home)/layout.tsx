import Footer from '@/components/ui/Footer';
import HomePageNavbar from '@/components/ui/HomePageNavbar';

export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<HomePageNavbar />
			{children}
			<Footer />
		</>
	);
}
