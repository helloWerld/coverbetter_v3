import Link from 'next/link';
import { FaCheck, FaMinus, FaXmark } from 'react-icons/fa6';
import {
	BAND_LABEL,
	FIT_DISCLAIMER,
	STATUS_LABEL,
	fitBand,
	type FitResult,
	type ReqStatus,
} from '@/lib/fit';

const STATUS_ICON: Record<ReqStatus, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
	met: FaCheck,
	partial: FaMinus,
	missing: FaXmark,
};

const STATUS_CLASS: Record<ReqStatus, string> = {
	met: 'text-success',
	partial: 'text-accent',
	missing: 'text-base-100/60',
};

/** The Job Fit Score with its requirement list. Works in server and client components. */
export default function FitScoreCard({
	fit,
	heading = 'Job Fit Score',
	headingLevel = 2,
}: Readonly<{ fit: FitResult; heading?: string; headingLevel?: 2 | 3 }>) {
	const band = fitBand(fit.score);
	const H = headingLevel === 2 ? 'h2' : 'h3';
	const must = fit.requirements.filter((r) => r.type === 'must');
	const nice = fit.requirements.filter((r) => r.type === 'nice');

	return (
		<section className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<p className="flex items-baseline gap-1 tabular-nums" aria-label={`Score ${fit.score} out of 100`}>
					<span className="text-5xl font-light text-base-100">{fit.score}</span>
					<span className="text-base-100/60">/100</span>
				</p>
				<div className="min-w-0">
					<H className="text-xl text-base-100">{heading}</H>
					<p className="text-neutral">{BAND_LABEL[band]}</p>
				</div>
			</div>
			<div
				className="mt-4 h-2 w-full overflow-hidden rounded-full bg-base-100/10"
				role="img"
				aria-label={`${fit.score} out of 100`}
			>
				<div className="h-full rounded-full bg-secondary" style={{ width: `${fit.score}%` }} />
			</div>
			{fit.summary && <p className="mt-4 text-base-100/80">{fit.summary}</p>}

			{[
				{ label: 'Required', items: must },
				{ label: 'Nice to have', items: nice },
			].map(
				(group) =>
					group.items.length > 0 && (
						<div key={group.label} className="mt-5">
							<p className="mb-2 text-sm font-medium text-base-100/70">{group.label}</p>
							<ul className="flex flex-col gap-2">
								{group.items.map((r, i) => {
									const Icon = STATUS_ICON[r.status];
									return (
										<li key={i} className="flex gap-3">
											<Icon aria-hidden className={`mt-1 shrink-0 ${STATUS_CLASS[r.status]}`} />
											<div className="min-w-0">
												<p className="break-words text-base-100">
													{r.requirement}{' '}
													<span className={`text-sm ${STATUS_CLASS[r.status]}`}>
														({STATUS_LABEL[r.status]})
													</span>
												</p>
												{r.evidence && (
													<p className="break-words text-sm text-base-100/60">{r.evidence}</p>
												)}
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					),
			)}
			<p className="mt-5 text-xs text-base-100/60">{FIT_DISCLAIMER}</p>
		</section>
	);
}

/** Shown to free users where a paid user sees the score. */
export function FitScoreLocked() {
	return (
		<section className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
			<h2 className="text-xl text-base-100">Job Fit Score</h2>
			<p className="mt-2 text-base-100/70">
				With credits or Pro, every letter comes with a score from 0 to 100 and the job requirements your resume
				meets and misses. It uses no extra credit.
			</p>
			<Link href="/dashboard/billing" className="btn btn-secondary mt-4 min-h-11">
				See plans
			</Link>
		</section>
	);
}
