'use client';

import React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { FaRegStar, FaStar } from 'react-icons/fa6';
import { testimonials } from '../../lib/testimonials';

const TestimonialsCarousel = () => {
	const [emblaRef] = useEmblaCarousel({ axis: 'y', loop: true }, [
		Autoplay({ delay: 5000 }),
	]);

	return (
		<section className="embla">
			<div className="embla__viewport" ref={emblaRef}>
				<div className="embla__container">
					{testimonials.map((testimonial) => (
						<div
							className="embla__slide bg-primary py-12 flex flex-col justify-between shadow-lg shadow-primary/10"
							key={testimonial.id}
						>
							<div className="flex flex-row">
								{Array.from(Array(testimonial?.stars)).map((star, index) => (
									<FaStar key={index} className="text-4xl text-yellow-400" />
								))}
								{Array.from(Array(5 - testimonial?.stars)).map(
									(star, index) => (
										<FaRegStar key={index} className="text-4xl" />
									)
								)}
							</div>
							<h3 className="text-2xl line-clamp-5">{testimonial.text}</h3>
							<p className="ms-auto">{testimonial.name}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default TestimonialsCarousel;
