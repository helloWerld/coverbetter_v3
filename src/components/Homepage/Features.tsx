import React from 'react';
import {
	FaFileAlt,
	FaCommentDots,
	FaPen,
	FaDownload,
	FaChrome,
	FaStar,
} from 'react-icons/fa';
import {
	FaChartPie,
	FaCheck,
	FaEnvelope,
	FaGlobe,
	FaLanguage,
} from 'react-icons/fa6';

interface FeatureProps {
	id: number;
	title: string;
	description: string;
	icon: any;
	badge: boolean | string;
}

const features = [
	{
		id: 0,
		title: 'Cover Letter Generator',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaFileAlt />,
		badge: false,
	},
	{
		id: 1,
		title: 'Customizable Tone and Style',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaCommentDots />,
		badge: false,
	},
	{
		id: 2,
		title: 'Cover Letter Editor',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaPen />,
		badge: false,
	},
	{
		id: 3,
		title: 'PDF & Docx Exports',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaDownload />,
		badge: false,
	},
	{
		id: 4,
		title: 'Multi Language Support',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaGlobe />,
		badge: false,
	},
	{
		id: 5,
		title: 'AI Job Fit Score',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaStar />,
		badge: 'Coming Soon!',
	},
	{
		id: 6,
		title: 'ATS Compatability Checker',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaCheck />,
		badge: 'Coming Soon!',
	},
	{
		id: 7,
		title: 'Follow Up Letter Generator',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaEnvelope />,
		badge: 'Coming Soon!',
	},
	{
		id: 8,
		title: 'Analytics Dashboard',
		description:
			'Generate custome professional cover letters in under 30 seconds with only your resume and a job description.',
		icon: <FaChartPie />,
		badge: 'Coming Soon!',
	},
];

const Features = () => {
	return (
		<div id="features" className="page-section">
			<h2 className="homepage-title">
				Land More Job Interviews with the Power of Artificial Intelligence
			</h2>
			<p className="homepage-subtitle">
				Harness the power of AI to generate custom, tailored, and professional
				cover letters for any job in under 30 seconds.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-12 gap-4">
				{features.map((feature) => (
					<FeatureCard key={feature?.id} feature={feature} />
				))}
			</div>
		</div>
	);
};

export default Features;

const FeatureCard = ({ feature }: { feature: FeatureProps }) => {
	return (
		<div className="card relative bg-gradient-to-br from-primary to-base-300 w-full max-w-96 border border-base-100/10 shadow-lg shadow-secondary/10">
			{feature.badge && (
				<div className="absolute right-3 top-3 badge badge-sm badge-accent">
					{feature.badge}
				</div>
			)}

			<div className="card-body">
				<div className="size-8 text-lg gradient-background rounded-lg flex items-center justify-center text-primary">
					{feature?.icon}
				</div>
				<h2 className="card-title text-base-100 mt-2">{feature.title}</h2>
				<p className="text-xs text-base-100-content -mt-2">
					{feature.description}
				</p>
			</div>
		</div>
	);
};
