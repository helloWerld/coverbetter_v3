import React from "react";

export type LegalSection = { heading: string; body: string[] };

const LegalPage = ({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) => (
  <main className="flex flex-col mx-auto gap-4 px-6 pt-28 pb-12 max-w-screen-md">
    <h1 className="text-4xl font-semibold">{title}</h1>
    <p className="text-sm text-base-100/70">Last updated {updated}</p>
    <p>{intro}</p>
    {sections.map((s) => (
      <section key={s.heading} className="flex flex-col gap-2 mt-2">
        <h2 className="text-xl font-semibold">{s.heading}</h2>
        {s.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
    ))}
  </main>
);

export default LegalPage;
