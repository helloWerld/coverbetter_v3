import React from 'react';
import TestimonialsCarousel from './TestimonialsCarousel';

const Testimonials = () => {
	return (
		// Full-width purple gradient. It ends in black so it blends into the next section.
		<section className="relative w-full bg-gradient-to-br from-purple-950 via-secondary/70 to-primary">
			<div id="testimonials" className="page-section flex xl:!flex-row gap-2">
				<div className="w-full xl:w-1/3 ">
					<h2 className="homepage-title !w-full !text-start">
						See what users of CoverBetter are saying...
					</h2>
					<p className="homepage-subtitle !text-start !w-full">
						Real reviews from real users.
					</p>
				</div>
				<div className="w-full xl:w-1/2">
					<TestimonialsCarousel />
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
