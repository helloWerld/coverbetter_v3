import Image from "next/image";
import gradient from "../../../public/purple-gradient.png";
import React from "react";
import { FaRegCirclePlay, FaArrowRight } from "react-icons/fa6";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="hero bg-primary min-h-screen md:min-h-[1000px] flex flex-col items-center justify-center relative overflow-y-clip">
      <Image
        src={gradient}
        height={500}
        width={500}
        alt=""
        priority
        className="absolute -bottom-[200px] md:-bottom-[400px] xl:-bottom-[800px] w-3/4 animate-slow-pulse"
      />
      <div className="absolute bottom-4 w-full flex items-center justify-between">
        <div className="stat scale-75 md:scale-100">
          <div className="stat-value">18k+</div>
          <div className="stat-title text-primary-content/50">
            Satisfied customers
          </div>
        </div>
        <div className="stat scale-75 md:scale-100 text-right">
          <div className="stat-value">100k+</div>
          <div className="stat-title text-primary-content/50">
            Cover Letters Generated
          </div>
        </div>
      </div>

      <div className="hero-content text-center">
        <div className="flex flex-col justify-center items-center max-w-5xl -mt-20">
          <Link
            href="/#features"
            className=" border border-base-100/10 relative group flex flex-row items-center rounded-full bg-base-300 mb-4 gap-1 p-1"
          >
            <div className="transition duration-500 absolute left-1 group-hover:translate-x-[182px] badge badge-secondary p-2 bg-gradient-to-br from-secondary to-purple-900">
              New
            </div>
            <p className="transition duration-500 text-sm ml-14 group-hover:ml-2 group-hover:mr-14">
              Try out the latest features
            </p>
            <FaArrowRight />
          </Link>
          <h1 className="bg-gradient-to-br from-base-100 from-30% to-secondary bg-clip-text text-transparent text-3xl sm:text-5xl md:text-8xl font-semibold text-base-100">
            Create Job-Winning Cover Letters with AI.
          </h1>
          <p className="py-6 text-sm sm:text-lg md:text-xl max-w-4xl">
            Generate a custom cover letter in under 30 seconds with AI—tailored
            to match your skills and the job description using your resume as a
            guide.
          </p>
          <div className="flex flex-row gap-4">
            <Link href="/sign-up" className="btn btn-secondary md:btn-wide ">
              Try It For Free
            </Link>
            <Link
              href="/sample"
              className="btn btn-base-100 btn-outline border-base-100 hover:border-base-100 text-base-100 md:btn-wide "
            >
              <FaRegCirclePlay className="text-lg" aria-hidden="true" />
              Try a sample
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
