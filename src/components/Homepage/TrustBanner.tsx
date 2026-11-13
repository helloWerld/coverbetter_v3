import React from 'react';
import { PiStarFourThin } from 'react-icons/pi';
import {
	careerbuilder,
	glassdoor,
	indeed,
	linkedin,
	monster,
	ziprecruiter,
} from '../../../public/job_board_logos';
import Image from 'next/image';

const trustImages = [
	careerbuilder,
	glassdoor,
	indeed,
	linkedin,
	monster,
	ziprecruiter,
];

const TrustBanner = () => {
	return (
		<div className=" flex flex-row gap-4 items-center mx-auto justify-around py-8 bg-primary overflow-x-clip max-w-full border-y border-neutral-content/10">
			{trustImages.map((image, index) => (
				<React.Fragment key={index}>
					<Image
						src={image}
						alt="careerbuilder"
						width={250}
						height={100}
						className="grayscale invert opacity-50 w-32"
					/>
					{index !== 5 && <PiStarFourThin className="text-lg opacity-50" />}
				</React.Fragment>
			))}
		</div>
	);
};

export default TrustBanner;
