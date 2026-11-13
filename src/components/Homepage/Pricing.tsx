import React from 'react';

const Pricing = () => {
	return (
		<div id="pricing" className="page-section bg-primary">
			<h2 className="homepage-title">
				Apply to more jobs in less time, with the help of Artificial
				Intelligence
			</h2>
			<p className="homepage-subtitle">
				Harness the power of AI to generate custom, tailored, and professional
				cover letters for any job in under 30 seconds.
			</p>
			<div className="flex flex-col lg:flex-row gap-6 mt-12 z-20">
				<div className="w-80 h-fit rounded-lg border border-base-100/10 text-center bg-base-300">
					<div className="flex flex-col items-center justify-center p-6 border-b border-primary">
						<h3 className="text-5xl">$0</h3>
						<p className="text-sm text-base-100/50 mt-1">Free Trial</p>
					</div>
					<div className="flex flex-col items-center justify-center p-6">
						<ul className="list-image-checkmark">
							<li>One (1) AI Cover Letter</li>
						</ul>
						<ul className="list-image-ex">
							<li>Custom Tone & Style</li>
							<li>PDF & Docx Exports</li>
							<li>Cover Letter Editor</li>
							<li>Styled Templates</li>
							<li>Chrome Extension</li>
							<li>AI Job Fit Score</li>
						</ul>
						<button className="btn btn-primary w-full mt-6">Try It Free</button>
					</div>
				</div>
				<div className="w-80 h-fit scale-105 md:hover:scale-110 transition ease-in-out duration-500 rounded-lg border border-secondary text-center bg-base-300">
					<div className="flex flex-col items-center justify-center p-6 border-b border-primary">
						<h3 className="text-5xl">
							$27<span className="text-xl"> / mo </span>
						</h3>
						<p className="text-sm text-base-100/50 mt-1">Unlimited</p>
					</div>
					<div className="flex flex-col items-center justify-center p-6">
						<ul className="list-image-checkmark">
							<li>Unlimited AI Cover Letters</li>
							<li>Custom Tone & Style</li>
							<li>PDF & Docx Exports</li>
							<li>Cover Letter Editor</li>
							<li>Styled Templates</li>
							<li>Chrome Extension</li>
							<li>AI Job Fit Score</li>
						</ul>
						<button className="btn btn-secondary w-full mt-6">
							Subscribe Now
						</button>
						<p className="text-xs text-base-100/20 mt-2 -mb-2">
							No commitment, cancel anytime
						</p>
					</div>
				</div>
				<div className="w-80 h-fit rounded-lg border border-base-100/10 text-center bg-base-300">
					<div className="flex flex-col items-center justify-center p-6 border-b border-primary">
						<h3 className="text-5xl">
							$2.99<span className="text-xl"> / letter </span>
						</h3>
						<p className="text-sm text-base-100/50 mt-1">Pay As You Go</p>
					</div>
					<div className="flex flex-col items-center justify-center p-6">
						<ul className="list-image-checkmark">
							<li> AI Cover Letters</li>
							<li>Custom Tone & Style</li>
							<li>PDF & Docx Exports</li>
						</ul>
						<ul className="list-image-ex">
							<li>Cover Letter Editor</li>
							<li>Styled Templates</li>
							<li>Chrome Extension</li>
							<li>AI Job Fit Score</li>
						</ul>
						<button className="btn btn-primary w-full mt-6">
							Purchase Credits
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Pricing;
