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
