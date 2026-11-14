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
      "Keep up to 5 resumes on your account and choose one each time you write a letter.",
    badge: false,
  },
  {
    id: 5,
    title: "AI Job Fit Score",
    description:
      "See how well your resume matches a job post before you apply, with a list of gaps.",
    badge: "Coming soon",
    soonSlug: "job-fit-score",
  },
  {
    id: 7,
    title: "Follow-up Letter Generator",
    description:
      "Write a short follow-up note after you apply or after an interview.",
    badge: "Coming soon",
    soonSlug: "follow-up-letters",
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
    title: "Analytics Dashboard",
    description:
      "See how many letters you wrote, which tones you use, and where you apply.",
    badge: "Coming soon",
    soonSlug: "analytics",
  },
];
