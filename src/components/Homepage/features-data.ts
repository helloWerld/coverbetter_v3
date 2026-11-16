export interface FeatureData {
  id: number;
  title: string;
  description: string;
  badge: false | "Coming soon";
  /** Slug in src/lib/soon.ts. Only set on coming-soon features. */
  soonSlug?: string;
}

export const features: FeatureData[] = [
  {
    id: 0,
    title: "Cover Letter Generator",
    description:
      "Pick a resume, paste the job post, and get a letter that uses facts from your resume.",
    badge: false,
  },
  {
    id: 1,
    title: "Custom Tone and Length",
    description:
      "Choose Professional, Friendly, Confident, or Enthusiastic, and a short, standard, or detailed letter.",
    badge: false,
  },
  {
    id: 2,
    title: "Cover Letter Editor",
    description:
      "Edit the text and see it live in one of 3 templates: Classic, Modern, or Minimal.",
    badge: false,
  },
  {
    id: 3,
    title: "PDF & DOCX Exports",
    description:
      "Download the finished letter as a PDF or a Word file in the template you picked.",
    badge: false,
  },
  {
    id: 4,
    title: "Saved Resumes",
    description:
      "Upload up to 5 resumes, and keep a tailored resume for each job you apply to.",
    badge: false,
  },
  {
    id: 5,
    title: "AI Job Fit Score",
    description:
      "With credits or Pro, every letter comes with a score from 0 to 100 and the job requirements your resume meets and misses.",
    badge: false,
  },
  {
    id: 7,
    title: "Follow-up and Thank-you Letters",
    description:
      "Get a reminder when a follow-up is due. Start from a free template, or let the AI write it from your interview notes.",
    badge: false,
  },
  {
    id: 8,
    title: "Chrome Extension",
    description:
      "Write a cover letter from the job post you are reading, without a copy and paste.",
    badge: "Coming soon",
    soonSlug: "chrome-extension",
  },
  {
    id: 9,
    title: "Multi-language Letters",
    description:
      "Write your letter in 12 languages, including Spanish, French, German, Chinese, Japanese, and Arabic.",
    badge: false,
  },
  {
    id: 10,
    title: "Application Tracker and Analytics",
    description:
      "Track each job from saved to offer. A flow chart shows how many applications reach each stage. Free for everyone.",
    badge: false,
  },
  {
    id: 11,
    title: "Career Profile and Tailored Resumes",
    description:
      "Add your full work history once, or import it from LinkedIn or a resume file. Then pick the best experience for each job.",
    badge: false,
  },
  {
    id: 12,
    title: "Interview Prep",
    description:
      "Practice with a bank of more than 350 questions and a STAR answer builder. With credits, get questions made for the job post.",
    badge: false,
  },
];
