import Image from 'next/image';
import {
	Hero,
	TrustBanner,
	Features,
	ComingSoon,
	HowItWorks,
	Testimonials,
	Pricing,
	Faqs,
} from '../../components/Homepage';

// The www host redirects here. Tell search engines the one address to index.
export const metadata = { alternates: { canonical: 'https://coverbetter.io/' } };

const Home = () => {
	return (
		<div className="relative">
			<Hero />
			<TrustBanner />
			<div className="relative">
				<Image
					src="/grid.png"
					alt="background"
					width={1000}
					height={3000}
					className="absolute inset-0 h-full object-cover overflow-clip max-w-screen-2xl mx-auto w-full"
				/>
				<Features />
				<ComingSoon />
				<HowItWorks />
				<Testimonials />
				<Pricing />
				<Faqs />
			</div>
		</div>
	);
};

export default Home;
