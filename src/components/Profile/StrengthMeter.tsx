'use client';

import { useMemo, useState } from 'react';
import { profileStrength } from '@/lib/profile/strength';
import type { Profile } from '@/lib/profile/types';

const SECTION_FOR_TIP: Record<string, string> = {
	contact: 'section-basics',
	summary: 'section-summaries',
	positions: 'section-positions',
	education: 'section-education',
	skills: 'section-skills',
	extras: 'section-certifications',
};

export default function StrengthMeter({ profile, onGoTo }: Readonly<{ profile: Profile; onGoTo: (id: string) => void }>) {
	const { score, tips } = useMemo(() => profileStrength(profile, new Date()), [profile]);
	// Closed at first, so the editor stays near the top of the page. The score always shows.
	const [open, setOpen] = useState(false);
	return (
		<section aria-labelledby="strength-h" className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 id="strength-h" className="text-xl text-base-100">
					Profile strength <span className="ml-2 tabular-nums text-neutral">{score}/100</span>
				</h2>
				<button
					type="button"
					aria-expanded={open}
					aria-controls="strength-tips"
					onClick={() => setOpen((v) => !v)}
					className="btn btn-sm btn-ghost text-base-100/70 hover:bg-base-200 hover:text-base-100 min-h-11"
				>
					{open ? 'Hide the tips' : tips.length > 0 ? `Show ${tips.length} ${tips.length === 1 ? 'tip' : 'tips'}` : 'Show details'}
				</button>
			</div>
			<div
				role="progressbar"
				aria-labelledby="strength-h"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={score}
				className="mt-3 h-3 w-full overflow-hidden rounded-full bg-base-100/10"
			>
				<div className="h-full rounded-full bg-secondary transition-[width] duration-300" style={{ width: `${score}%` }} />
			</div>
			<div id="strength-tips" hidden={!open}>
			{tips.length > 0 ? (
				<>
					<p className="mt-4 text-sm text-base-100/70">Do these steps to raise your score.</p>
					<ul className="mt-2 flex flex-col gap-1">
						{tips.map((t) => (
							<li key={t.id}>
								<button
									type="button"
									onClick={() => onGoTo(t.target ?? SECTION_FOR_TIP[t.id] ?? 'section-basics')}
									className="min-h-11 w-full rounded-box px-3 py-2 text-left text-base-100 underline decoration-base-100/30 underline-offset-4 hover:bg-base-100/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100"
								>
									{t.text}
								</button>
							</li>
						))}
					</ul>
				</>
			) : (
				<p className="mt-4 text-sm text-base-100/70">Your profile is strong. Keep it current.</p>
			)}
			</div>
		</section>
	);
}
