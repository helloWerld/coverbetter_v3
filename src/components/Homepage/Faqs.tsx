import React from "react";

const Faqs = () => {
  return (
    <div id="faqs" className="page-section">
      <div className=" flex flex-col xl:!flex-row items-start gap-12 xl:gap-2 w-full px-6 md:px-24">
        <div className=" w-full xl:w-1/2 ">
          <h2 className="homepage-title !w-full">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-4 w-full xl:w-1/2">
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"What is CoverBetter, and how does it work?"}
              defaultChecked
            />
            <div className="collapse-title text-xl font-medium">
              What is CoverBetter, and how does it work?
            </div>
            <div className="collapse-content">
              <p>
                CoverBetter writes a cover letter for one job at a time. You add
                your resume, paste the job post, and pick a tone and a length.
                The AI writes a letter that uses facts from your resume. You can
                then edit the letter and export it.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Is my resume private?"}
            />
            <div className="collapse-title text-xl font-medium">
              Is my resume private?
            </div>
            <div className="collapse-content">
              <p>
                We store your resumes and letters on Cloudflare. We send your
                resume and the job text to the AI provider only to write your
                letter. We never sell your data. You can delete your resumes,
                your letters, or your whole account at any time from the Account
                page.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={
                "Is the generated cover letter guaranteed to land me an interview?"
              }
            />
            <div className="collapse-title text-xl font-medium">
              Is the generated cover letter guaranteed to land me an interview?
            </div>
            <div className="collapse-content">
              <p>
                No. A good letter helps, but the result depends on the job
                market, your resume, and how well you match the job. Read every
                letter and edit it before you send it.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Can I change the tone or length of the letter?"}
            />
            <div className="collapse-title text-xl font-medium">
              Can I change the tone or length of the letter?
            </div>
            <div className="collapse-content">
              <p>
                Yes. Choose Professional, Friendly, Confident, or Enthusiastic.
                Choose a short letter (about 200 words), a standard letter
                (about 300 words), or a detailed letter (about 400 words).
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Can I edit the letter before I download it?"}
            />
            <div className="collapse-title text-xl font-medium">
              Can I edit the letter before I download it?
            </div>
            <div className="collapse-content">
              <p>
                Yes. The editor shows a live preview in one of 3 templates:
                Classic, Modern, or Minimal. You can copy the text or export a
                PDF or a DOCX file.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"What resume files can I upload?"}
            />
            <div className="collapse-title text-xl font-medium">
              What resume files can I upload?
            </div>
            <div className="collapse-content">
              <p>
                You can upload a PDF or a DOCX file up to 5 MB. You can also
                paste the text of your resume. A scanned PDF that has no text
                does not work, so paste the text in that case.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"How much does CoverBetter cost?"}
            />
            <div className="collapse-title text-xl font-medium">
              How much does CoverBetter cost?
            </div>
            <div className="collapse-content">
              <p>
                You get 3 letters free. After that, pay as you go at $1.50 a
                credit, or go Pro at $19.97 a month for up to 200 credits a
                month. 1 credit writes 1 letter with its Job Fit Score. A Job
                Fit Score check without a letter also uses 1 credit.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Do credits expire?"}
            />
            <div className="collapse-title text-xl font-medium">
              Do credits expire?
            </div>
            <div className="collapse-content">
              <p>No. Credits that you buy stay on your account until you use them.</p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Can I cancel Pro?"}
            />
            <div className="collapse-title text-xl font-medium">
              Can I cancel Pro?
            </div>
            <div className="collapse-content">
              <p>
                Yes. Cancel at any time from the Billing page. You keep Pro
                access until the end of the period you paid for.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"Can I get a refund?"}
            />
            <div className="collapse-title text-xl font-medium">
              Can I get a refund?
            </div>
            <div className="collapse-content">
              <p>
                Credits that you used are not refundable. If something went
                wrong with a payment, write to support@coverbetter.io.
              </p>
            </div>
          </div>
          <div className="collapse border border-neutral-content/50 bg-base-300">
            <input
              type="radio"
              name="faq-accordion"
              aria-label={"How do I get help?"}
            />
            <div className="collapse-title text-xl font-medium">
              How do I get help?
            </div>
            <div className="collapse-content">
              <p>Write to support@coverbetter.io. We answer by email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
