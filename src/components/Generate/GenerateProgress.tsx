'use client';

import { useEffect, useState } from 'react';

const STEPS = [
	{ upTo: 25, label: 'Reading your resume' },
	{ upTo: 55, label: 'Matching the job' },
	{ upTo: 101, label: 'Writing your letter' },
];

const TIME_CONSTANT_MS = 7000;
const CEILING = 90;

/**
 * Eases toward 90 % (about 85 % after 20 s), then jumps to 100 % when `done` is true.
 * The bar tells the user the work is moving. It does not measure real progress.
 */
export default function GenerateProgress({ done }: Readonly<{ done: boolean }>) {
	const [pct, setPct] = useState(0);

	useEffect(() => {
		if (done) {
			setPct(100);
			return;
		}
		const start = Date.now();
		const id = setInterval(() => {
			const t = Date.now() - start;
			setPct(CEILING * (1 - Math.exp(-t / TIME_CONSTANT_MS)));
		}, 200);
		return () => clearInterval(id);
	}, [done]);

	const step = STEPS.find((s) => pct < s.upTo) ?? STEPS[STEPS.length - 1];

	return (
		<div className="flex flex-col gap-2">
			<div
				role="progressbar"
				aria-label="Writing your cover letter"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(pct)}
				className="h-2 w-full overflow-hidden rounded-full bg-base-100/10"
			>
				<div
					className="h-full rounded-full bg-secondary motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-linear"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<p role="status" className="text-sm text-base-100/70">
				{done ? 'Done' : `${step.label}...`}
			</p>
		</div>
	);
}
