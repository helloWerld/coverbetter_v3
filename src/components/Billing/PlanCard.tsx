import { Card } from '@/components/Dashboard/PageShell';
import { FREE_LETTERS, PRO_FAIR_USE_CAP } from '@/lib/billing-plans';
import type { User } from '@/db/schema';

const dateFormat = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC',
});

type PlanUser = Pick<
	User,
	| 'plan'
	| 'freeLettersUsed'
	| 'credits'
	| 'proLettersThisPeriod'
	| 'proPeriodEnd'
>;

/** Current plan, credits used, and paid credit balance. One credit is one cover letter. */
export default function PlanCard({ user }: Readonly<{ user: PlanUser }>) {
	if (user.plan === 'pro') {
		return (
			<Card title="Your plan">
				<p className="text-2xl text-base-100">
					Pro
					{user.proPeriodEnd && (
						<span className="text-base font-extralight text-base-100/70">
							{' '}
							&mdash; renews {dateFormat.format(user.proPeriodEnd)}
						</span>
					)}
				</p>
				<UsageMeter
					used={user.proLettersThisPeriod}
					total={PRO_FAIR_USE_CAP}
					label="credits used this month"
				/>
				{user.credits > 0 && (
					<p className="mt-2">
						Paid credits: <span className="text-base-100">{user.credits}</span>
					</p>
				)}
			</Card>
		);
	}

	const freeUsed = Math.min(FREE_LETTERS, user.freeLettersUsed);
	return (
		<Card title="Your plan">
			<p className="text-2xl text-base-100">Free</p>
			<UsageMeter used={freeUsed} total={FREE_LETTERS} label="free credits used" />
			<p className="mt-2">
				Paid credits: <span className="text-base-100">{user.credits}</span>
			</p>
		</Card>
	);
}

/** "X of Y credits used" with a bar. */
function UsageMeter({
	used,
	total,
	label,
}: Readonly<{ used: number; total: number; label: string }>) {
	const text = `${used} of ${total} ${label}`;
	return (
		<div className="mt-2 max-w-sm">
			<p>{text}</p>
			<progress
				className="progress progress-secondary mt-2 h-2 w-full bg-base-200"
				value={Math.min(used, total)}
				max={total}
				aria-label={text}
			/>
		</div>
	);
}
