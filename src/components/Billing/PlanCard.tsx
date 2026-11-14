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

/** Current plan, letters left, and credit balance. */
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
				<p className="mt-2">
					{user.proLettersThisPeriod} of {PRO_FAIR_USE_CAP} letters this month
				</p>
				{user.credits > 0 && (
					<p className="mt-1">
						Paid letters: <span className="text-base-100">{user.credits}</span>
					</p>
				)}
			</Card>
		);
	}

	const freeLeft = Math.max(0, FREE_LETTERS - user.freeLettersUsed);
	return (
		<Card title="Your plan">
			<p className="text-2xl text-base-100">Free</p>
			<p className="mt-2">
				{freeLeft} of {FREE_LETTERS} free letters left
			</p>
			<p className="mt-1">
				Paid letters: <span className="text-base-100">{user.credits}</span>
			</p>
		</Card>
	);
}
