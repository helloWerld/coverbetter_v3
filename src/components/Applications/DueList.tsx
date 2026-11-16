import Link from 'next/link';
import type { Reminder } from '@/lib/applications/analytics';

const KIND_LABEL = {
	follow_up: 'Send a follow-up',
	follow_up_2: 'Send a second follow-up',
	thank_you: 'Send a thank-you letter',
} as const;

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** The follow-ups and thank-you letters that are due. Each row opens the letters of its application. */
export default function DueList({
	due,
	titles,
	limit = 8,
}: Readonly<{ due: Reminder[]; titles: Map<string, string>; limit?: number }>) {
	return (
		<ul className="mt-3 flex flex-col gap-2">
			{due.slice(0, limit).map((r) => {
				const label = titles.get(r.appId);
				if (!label) return null;
				return (
					<li key={`${r.appId}-${r.kind}`}>
						<Link
							href={`/dashboard/applications/${r.appId}#letters`}
							className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
						>
							<span className="min-w-0 break-words">
								<span className="font-medium">{KIND_LABEL[r.kind]}</span>
								<span className="text-base-100/70"> · {label}</span>
							</span>
							<span className="text-sm text-base-100/60">Due since {dateFmt.format(r.dueSince)}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

/** "Job title at Company" for each application id. */
export function appTitles(apps: { id: string; jobTitle: string; company: string }[]): Map<string, string> {
	return new Map(apps.map((a) => [a.id, [a.jobTitle || 'Untitled job', a.company].filter(Boolean).join(' at ')]));
}
