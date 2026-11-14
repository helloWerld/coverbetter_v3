import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className=" bg-primary text-primary-content p-10 border-t border-primary-content/10">
      <div className="footer max-w-screen-2xl mx-auto">
        <aside>
          <Link href="/" className="my-4 inline-block">
            <Logo className="h-14 w-auto" />
          </Link>
        </aside>
        <nav aria-label="Site">
          <h6 className="footer-title">Product</h6>
          <Link href="/#features" className="link link-hover">
            Features
          </Link>
          <Link href="/#pricing" className="link link-hover">
            Pricing
          </Link>
          <Link href="/#faqs" className="link link-hover">
            FAQ
          </Link>
          <Link href="/sample" className="link link-hover">
            Try a sample
          </Link>
          <Link href="/blog" className="link link-hover">
            Blog
          </Link>
          <Link href="/sign-in" className="link link-hover">
            Sign in
          </Link>
        </nav>
        <nav aria-label="Legal">
          <h6 className="footer-title">Legal</h6>
          <Link href="/terms" className="link link-hover">
            Terms of use
          </Link>
          <Link href="/privacy" className="link link-hover">
            Privacy policy
          </Link>
        </nav>
        <nav aria-label="Contact">
          <h6 className="footer-title">Support</h6>
          <a href="mailto:support@coverbetter.io" className="link link-hover">
            support@coverbetter.io
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
