import React from "react";
import Link from "next/link";
import {
  FaFileAlt,
  FaCommentDots,
  FaPen,
  FaDownload,
  FaChrome,
  FaStar,
  FaRegFolderOpen,
} from "react-icons/fa";
import { FaChartPie, FaCheck, FaEnvelope, FaLanguage } from "react-icons/fa6";
import { features, type FeatureData } from "./features-data";

export { features };

const icons: Record<number, React.ReactNode> = {
  0: <FaFileAlt />,
  1: <FaCommentDots />,
  2: <FaPen />,
  3: <FaDownload />,
  4: <FaRegFolderOpen />,
  5: <FaStar />,
  6: <FaCheck />,
  7: <FaEnvelope />,
  8: <FaChrome />,
  9: <FaLanguage />,
  10: <FaChartPie />,
};

const Features = () => {
  return (
    <div id="features" className="page-section">
      <h2 className="homepage-title">
        Land More Job Interviews with the Power of Artificial Intelligence
      </h2>
      <p className="homepage-subtitle">
        Write a cover letter for each job from your resume and the job post,
        then edit it and export it.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-12 gap-4 list-none p-0">
        {features.map((feature) => (
          <li key={feature.id} className="flex">
            <FeatureCard feature={feature} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Features;

const FeatureCard = ({ feature }: { feature: FeatureData }) => {
  const body = (
    <>
      {feature.badge && (
        <div className="absolute right-3 top-3 badge badge-sm badge-accent">
          {feature.badge}
        </div>
      )}
      <div className="card-body">
        <div
          aria-hidden="true"
          className="size-8 text-lg gradient-background rounded-lg flex items-center justify-center text-primary"
        >
          {icons[feature.id]}
        </div>
        <h3 className="card-title text-base-100 mt-2">{feature.title}</h3>
        <p className="text-sm text-base-100/70 -mt-2">{feature.description}</p>
      </div>
    </>
  );
  const cls =
    "card relative bg-gradient-to-br from-primary to-base-300 w-full max-w-96 border border-base-100/10 shadow-lg shadow-secondary/10";
  if (feature.soonSlug) {
    return (
      <Link
        href={`/dashboard/soon/${feature.soonSlug}`}
        className={`${cls} hover:border-base-100/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary`}
      >
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
};
