import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
	return (
		<footer className=" bg-primary text-primary-content p-10 border-t border-primary-content/10">
			<div className="footer max-w-screen-2xl mx-auto">
				<aside>
					<div className="flex flex-row gap-1 my-4 ">
						<FaFileAlt className="text-2xl rotate-12 mt-1" />
						<p className="text-3xl font-semibold text-base-100">
							CoverBetter
							<span className="text-secondary text-sm mt-2 ml-1 font-bold">
								v2
							</span>
						</p>
					</div>
				</aside>
				<nav>
					<h6 className="footer-title">Tools</h6>
					<Link href="/generate" className="link link-hover">
						Cover Letter Generator
					</Link>
					<Link href="/editor" className="link link-hover">
						Cover Letter Editor
					</Link>
					<Link href="/fit-score" className="link link-hover">
						AI Job Fit Score
					</Link>
					<Link href="/ats-checker" className="link link-hover">
						ATS Compatability Checker
					</Link>
				</nav>
				<nav>
					<h6 className="footer-title">Helpful Links</h6>
					<Link href="/premium" className="link link-hover">
						Upgrade to Premium
					</Link>
					<Link href="/dashboard" className="link link-hover">
						Account Dashboard
					</Link>
					<Link href="/tutorials" className="link link-hover">
						Video Tutorials
					</Link>
					<Link href="/support" className="link link-hover">
						Support
					</Link>
				</nav>
				<nav>
					<h6 className="footer-title">Legal</h6>
					<Link href="/terms" className="link link-hover">
						Terms of use
					</Link>
					<Link href="/privacy" className="link link-hover">
						Privacy policy
					</Link>
				</nav>
			</div>
		</footer>
	);
};

export default Footer;
