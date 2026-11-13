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
						</p>
					</div>
				</aside>
				<nav>
					<h6 className="footer-title">Product</h6>
					<Link href="/dashboard" className="link link-hover">
						Cover Letter Generator
					</Link>
					<Link href="/dashboard/letters" className="link link-hover">
						My Letters
					</Link>
					<Link href="/dashboard/resumes" className="link link-hover">
						My Resumes
					</Link>
					<Link href="/dashboard/billing" className="link link-hover">
						Billing
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
