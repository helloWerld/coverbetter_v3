import React from 'react';

const Faqs = () => {
	return (
		<div id="faqs" className="page-section">
			<div className=" flex flex-col xl:!flex-row items-start gap-12 xl:gap-2 w-full px-24">
				<div className=" w-full xl:w-1/2 ">
					<h2 className="homepage-title !w-full">Frequently Asked Questions</h2>
				</div>
				<div className="flex flex-col gap-4 w-full xl:w-1/2">
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" defaultChecked />
						<div className="collapse-title text-xl font-medium">
							What is CoverBetter.io, and how does it work?
						</div>
						<div className="collapse-content">
							<p>
								CoverBetter.io is an AI-powered platform that creates
								personalized, professional cover letters tailored to your resume
								and the specific job description you provide. Simply upload your
								resume and paste the job description, and the app generates a
								cover letter in seconds.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							Is the generated cover letter guaranteed to land me an interview?
						</div>
						<div className="collapse-content">
							<p>
								While CoverBetter.io optimizes your cover letter for clarity,
								professionalism, and relevance to the job description, success
								ultimately depends on the job market, your resume, and how well
								you meet the job qualifications.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							How secure is my data?
						</div>
						<div className="collapse-content">
							<p>
								We prioritize your privacy and security. Uploaded resumes and
								job descriptions are not stored permanently, and we use
								industry-standard encryption to protect your data.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							Can I customize the tone or format of the generated cover letter?
						</div>
						<div className="collapse-content">
							<p>
								Yes, you can specify the tone, such as formal, enthusiastic, or
								neutral, and the platform ensures that the formatting aligns
								with professional standards.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							Does CoverBetter.io support all industries and job roles?
						</div>
						<div className="collapse-content">
							<p>
								Yes, CoverBetter.io is designed to handle a wide variety of
								industries and job roles. It analyzes the specific keywords and
								skills in the job description to create a relevant cover letter.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							Can I preview or edit the cover letter before downloading it?
						</div>
						<div className="collapse-content">
							<p>
								Absolutely. You can review the generated cover letter and make
								any changes using our built-in editor before downloading it.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							What file formats are supported for resume uploads?
						</div>
						<div className="collapse-content">
							<p>
								Currently, CoverBetter.io supports PDF and DOCX file formats for
								uploading resumes.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							Do I need a subscription to use CoverBetter.io?
						</div>
						<div className="collapse-content">
							<p>
								We offer both free and premium plans. The free plan provides
								basic functionality, while the premium plan unlocks advanced
								features, including unlimited revisions, enhanced customization,
								and priority support.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							How does CoverBetter.io ensure the cover letter matches the job
							description?
						</div>
						<div className="collapse-content">
							<p>
								Our AI analyzes the keywords, skills, and responsibilities
								outlined in the job description and matches them with relevant
								details from your resume to craft a tailored and compelling
								cover letter.
							</p>
						</div>
					</div>
					<div className="collapse border border-neutral-content/50 bg-base-300">
						<input type="radio" name="my-accordion-1" />
						<div className="collapse-title text-xl font-medium">
							What support options are available if I encounter an issue?
						</div>
						<div className="collapse-content">
							<p>
								Our customer support team is available to assist you via email.
								We also have a comprehensive FAQ and troubleshooting guide
								available on our website.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Faqs;
