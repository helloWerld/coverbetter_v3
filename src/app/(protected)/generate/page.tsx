'use client';

import { generateCoverLetter } from '@/actions/openai';
import React, { useState } from 'react';
import { FaArrowDown, FaFloppyDisk, FaListUl, FaUpload } from 'react-icons/fa6';
import Link from 'next/link';
import Results from '@/components/Generate/Results';
import History from '@/components/Generate/History';
import Settings from '@/components/Generate/Settings/Settings';

const Generate = () => {
	const [resume, setResume] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const [coverLetter, setCoverLetter] = useState('');
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className="min-h-screen">
			<div className="max-w-screen-2xl mx-auto p-4 lg:p-12 flex flex-col gap-6">
				<form className="flex flex-col gap-6">
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="relative w-full lg:w-1/2 min-h-96">
							<textarea
								value={resume || ''}
								onChange={(e) => setResume(e.target.value)}
								placeholder="Paste your resume here"
								className={`textarea w-full h-96 min-h-full border border-neutral-content/50 focus:border-primary rounded-xl ${
									resume && 'pt-14'
								} p-6 bg-transparent`}
							></textarea>
							<div className="flex flex-row items-center gap-2 absolute top-0 right-0 p-1 border rounded-xl border-transparent hover:border-neutral-content/50 hover:bg-base-300">
								<div className="tooltip" data-tip="Upload Resume">
									<button className="btn btn-ghost hover:border-neutral-content">
										<FaUpload className="text-lg" />
									</button>
								</div>
								<div className="tooltip" data-tip="Select from Saved">
									<button className="btn btn-ghost hover:border-neutral-content">
										<FaListUl className="text-lg" />
									</button>
								</div>
								{resume && (
									<div className="tooltip" data-tip="Save Resume">
										<button className="btn btn-ghost hover:border-neutral-content">
											<FaFloppyDisk className="text-lg" />
										</button>
									</div>
								)}
							</div>
						</div>

						<textarea
							value={jobDescription}
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the job description here "
							className="relative textarea w-full lg:w-1/2 min-h-96 border border-neutral-content/50 focus:border-primary rounded-xl p-6 bg-transparent"
						></textarea>
					</div>

					<div className="group w-full border border-neutral-content/50 rounded-xl">
						<div
							onClick={() => setShowSettings((prev) => !prev)}
							className="flex flex-row items-center w-full justify-between cursor-pointer p-6"
						>
							<p>Settings</p>
							<FaArrowDown className={`${showSettings && 'rotate-180'}`} />
						</div>
						{showSettings && (
							<Settings credits={100} activeSubscription={false} />
						)}
					</div>
					<div className="flex flex-row gap-4 justify-center my-2">
						<input
							type="checkbox"
							onChange={() => setAgreedToTerms((prev) => !prev)}
							checked={agreedToTerms}
							className="checkbox checkbox-primary"
						/>
						<p>
							By checking this box, you agree to have read and agree to the{' '}
							<Link href="/terms" className="link hover:link-primary">
								terms of service
							</Link>{' '}
							and{' '}
							<Link href="/privacy" className="link hover:link-primary">
								privacy policy
							</Link>
							.
						</p>
					</div>
					<button
						disabled={
							resume.length < 10 ||
							jobDescription.length < 10 ||
							!agreedToTerms ||
							isLoading
						}
						onClick={async (e) => {
							e.preventDefault();
							setIsLoading(true);
							setCoverLetter('');
							const result = await generateCoverLetter(resume, jobDescription);
							setCoverLetter(result?.chatCompletion?.text || 'null');
							console.log('button press', result);
							setIsLoading(false);
						}}
						className="btn btn-lg enabled:btn-secondary disabled:!btn-outline"
					>
						Generate Cover Letter
					</button>
				</form>

				<Results coverLetter={coverLetter} isLoading={isLoading} />
				<div className="divider divider-primary opacity-50"></div>
				<div className="group w-full border border-neutral-content/50 rounded-xl">
					<div
						onClick={() => setShowHistory((prev) => !prev)}
						className="flex flex-row items-center w-full justify-between cursor-pointer p-6"
					>
						<p>History</p>
						<FaArrowDown className={`${showHistory && 'rotate-180'}`} />
					</div>
					{showHistory && <History />}
				</div>
			</div>
		</div>
	);
};

export default Generate;
