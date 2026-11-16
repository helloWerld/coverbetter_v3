import type { Metadata } from 'next';
import Link from 'next/link';
import SampleViewer from '@/components/Letters/SampleViewer';
import {
	SAMPLE_JOB,
	SAMPLE_LETTER,
	SAMPLE_RESUME,
} from '@/lib/sample';

export const metadata: Metadata = {
	title: 'Try a sample | CoverBetter',
	description:
		'See a finished cover letter from a sample resume and job post. Pick a template and download it as PDF or DOCX.',
	alternates: { canonical: 'https://coverbetter.io/sample' },
};

const box =
	'rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 text-left';

export default function SamplePage() {
	return (
		<main className="bg-primary px-4 pb-20 pt-28 md:pt-32">
			<div className="mx-auto max-w-screen-lg">
				<h1 className="gradient-text text-3xl font-extralight md:text-5xl">
					Try a sample
				</h1>
				<p className="mt-3 max-w-2xl text-base font-extralight text-base-100/70 md:text-xl">
					This is a letter from a made-up resume and a made-up job post. Pick
					a template. Then download the file.
				</p>

				<div className="mt-10 grid gap-6 md:grid-cols-2">
					<section className={box} aria-labelledby="sample-resume">
						<h2 id="sample-resume" className="mb-3 text-xl text-base-100">
							1. The resume
						</h2>
						<pre className="whitespace-pre-wrap break-words font-sans text-sm text-base-100/70">
							{SAMPLE_RESUME}
						</pre>
					</section>
					<section className={box} aria-labelledby="sample-job">
						<h2 id="sample-job" className="mb-1 text-xl text-base-100">
							2. The job post
						</h2>
						<p className="mb-3 text-sm text-neutral">
							{SAMPLE_JOB.title}, {SAMPLE_JOB.company}
						</p>
						<pre className="whitespace-pre-wrap break-words font-sans text-sm text-base-100/70">
							{SAMPLE_JOB.description}
						</pre>
					</section>
				</div>

				<h2 className="mb-4 mt-12 text-xl text-base-100">3. The letter</h2>
				<SampleViewer body={SAMPLE_LETTER} company={SAMPLE_JOB.company} />

				<div className="mt-14 flex flex-col items-center gap-3 text-center">
					<p className="text-base-100/70">
						Use your own resume and a real job post.
					</p>
					<Link href="/sign-up" className="btn btn-secondary min-h-11 md:btn-wide">
						Write your own — 3 free letters
					</Link>
				</div>
			</div>
		</main>
	);
}
