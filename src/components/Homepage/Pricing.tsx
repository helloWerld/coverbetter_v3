import React from "react";
import Link from "next/link";

const Pricing = () => {
  return (
    <div id="pricing" className="page-section bg-primary">
      <h2 className="homepage-title">
        Apply to more jobs in less time, with the help of Artificial
        Intelligence
      </h2>
      <p className="homepage-subtitle">
        Start free with 3 letters. Pay for a pack of letters, or subscribe for
        unlimited letters.
      </p>
      <div className="flex flex-col lg:flex-row gap-6 mt-12 z-20">
        <div className="w-80 h-fit rounded-lg border border-base-100/10 text-center bg-base-300">
          <div className="flex flex-col items-center justify-center p-6 border-b border-primary">
            <h3 className="text-5xl">$0</h3>
            <p className="text-sm text-base-100/70 mt-1">Free</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6">
            <ul className="list-image-checkmark">
              <li>3 AI cover letters</li>
              <li>Cover Letter Generator</li>
              <li>Custom tone and length</li>
              <li>Editor and 3 templates</li>
              <li>PDF and DOCX export</li>
            </ul>
            <Link href="/sign-up" className="btn btn-primary w-full mt-6">
              Try It Free
            </Link>
          </div>
        </div>
        <div className="w-80 h-fit scale-105 md:hover:scale-110 transition ease-in-out duration-500 rounded-lg border border-secondary text-center bg-base-300">
          <div className="flex flex-col items-center justify-center p-6 border-b border-primary">
            <h3 className="text-5xl">
              $19<span className="text-xl"> / mo </span>
            </h3>
            <p className="text-sm text-base-100/70 mt-1">Pro</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6">
            <ul className="list-image-checkmark">
              <li>Unlimited AI cover letters</li>
              <li>Fair use: up to 200 a month</li>
              <li>Everything in Free</li>
            </ul>
            <Link href="/sign-up" className="btn btn-secondary w-full mt-6">
              Get Pro
            </Link>
            <p className="text-xs text-base-100/70 mt-2 -mb-2">
              Cancel any time from Billing
            </p>
          </div>
        </div>
        <div className="w-80 h-fit rounded-lg border border-base-100/10 text-center bg-base-300">
          <div className="flex flex-col items-center justify-center p-6 border-b border-primary">
            <h3 className="text-3xl py-2">
              From $0.80<span className="text-xl"> / letter </span>
            </h3>
            <p className="text-sm text-base-100/70 mt-1">Credit packs</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6">
            <ul className="list-image-checkmark">
              <li>5 letters for $5</li>
              <li>15 letters for $12</li>
              <li>Credits never expire</li>
              <li>Everything in Free</li>
            </ul>
            <Link href="/sign-up" className="btn btn-primary w-full mt-6">
              Get Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
