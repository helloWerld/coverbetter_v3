import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";
import HomePageNavbar from "@/components/ui/HomePageNavbar";

export const metadata: Metadata = {
  title: "CoverBetter — AI cover letters tailored to every job",
  description:
    "Add your resume, paste a job post, and get a tailored cover letter in seconds. Edit it, then export it as a PDF or DOCX. Start free with 3 letters.",
  openGraph: {
    title: "CoverBetter — AI cover letters tailored to every job",
    description:
      "Add your resume, paste a job post, and get a tailored cover letter in seconds. Start free with 3 letters.",
    type: "website",
    siteName: "CoverBetter",
  },
  // Bing Webmaster Tools site verification. Keep it, or Bing drops the verification.
  verification: { other: { "msvalidate.01": "46FD25C69300EA86E9AC7E8672B77911" } },
  twitter: {
    card: "summary",
    title: "CoverBetter — AI cover letters tailored to every job",
    description:
      "Add your resume, paste a job post, and get a tailored cover letter in seconds.",
  },
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <HomePageNavbar />
      {children}
      <Footer />
    </>
  );
}
