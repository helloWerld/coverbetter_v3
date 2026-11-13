"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFileExport,
  FaPaste,
  FaSliders,
  FaRegCirclePlay,
  FaUpload,
} from "react-icons/fa6";

const HowItWorks = () => {
  const [step, setStep] = useState(1);
  useEffect(() => {
    const stepsInterval = setInterval(() => {
      setStep((prev) => (prev !== 4 ? prev + 1 : 1));
    }, 2000);
    return () => clearInterval(stepsInterval);
  }, []);
  return (
    <div id="howitworks" className="page-section">
      <h2 className="homepage-title">
        Professional, Job-Specific Cover Letters... in 4 Easy Steps.
      </h2>
      <p className="homepage-subtitle">
        Add your resume, paste the job post, and get a letter that matches your
        experience to the role.
      </p>
      <div className="mt-20">
        <ul className="steps text-2xl">
          <li className={`step step-secondary`}>
            <div className="flex flex-col  gap-4 p-4 items-center font-extralight">
              <FaUpload
                className={`text-5xl ${step === 1 && "text-secondary"}`}
              />
              <p
                className={` ${
                  step === 1 ? "text-secondary" : "text-transparent"
                }`}
              >
                Upload or paste resume
              </p>
            </div>
          </li>
          <li className={`step ${step >= 2 && "step-secondary"}`}>
            <div className="flex flex-col  gap-4 p-4 items-center font-extralight">
              <FaPaste
                className={`text-5xl ${step === 2 && "text-secondary"}`}
              />
              <p
                className={`${
                  step === 2 ? "text-secondary" : "text-transparent"
                }`}
              >
                Paste the job post
              </p>
            </div>
          </li>
          <li className={`step  ${step >= 3 && "step-secondary"}`}>
            <div className="flex flex-col  gap-4 p-4 items-center font-extralight">
              <FaSliders
                className={`text-5xl ${step === 3 && "text-secondary"}`}
              />
              <p
                className={` ${
                  step === 3 ? "text-secondary" : "text-transparent"
                }`}
              >
                Pick tone and length
              </p>
            </div>
          </li>
          <li
            data-content={`${step === 4 ? "✓" : ""}`}
            className={`step  ${step == 4 && "step-success"}`}
          >
            <div className="flex flex-col  gap-4 p-4 items-center font-extralight">
              <FaFileExport
                className={`text-5xl ${step === 4 && "text-success"}`}
              />
              <p
                className={` ${
                  step === 4 ? "text-success" : "text-transparent"
                }`}
              >
                Generate, edit, export
              </p>
            </div>
          </li>
        </ul>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 mt-12 z-20">
        <Link href="/sign-up" className="btn btn-secondary md:btn-wide ">
          Try It For Free
        </Link>
        <Link
          href="/sample"
          className="btn btn-base-100 btn-outline border-base-100 hover:border-base-100 text-base-100 md:btn-wide"
        >
          <FaRegCirclePlay className="text-lg" aria-hidden="true" />
          Try a sample
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
