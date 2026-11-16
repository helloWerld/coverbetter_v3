import {
	startCheckoutAction,
	openPortalAction,
} from '@/app/dashboard/billing/actions';
import { PRO_FAIR_USE_CAP, PRO_PRICE_CENTS, formatUsd } from '@/lib/billing-plans';
import FeaturesBox from './FeaturesBox';
import LettersCard from './LettersCard';
import SubmitButton from './SubmitButton';

const card =
	'flex w-full flex-col rounded-lg border bg-base-300 text-center lg:w-80';
const head =
	'flex flex-col items-center justify-center border-b border-primary p-6';

/** Two purchase cards in the homepage Pricing style. */
export default function PurchaseCards({
	configured,
	hasCustomer,
	isPro = false,
}: Readonly<{ configured: boolean; hasCustomer: boolean; isPro?: boolean }>) {
	return (
		<div>
			{!configured && (
				<p role="alert" className="mb-4 text-accent">
					Payments are not set up yet.
				</p>
			)}
			<div className="flex flex-col gap-6 lg:flex-row">
				<FeaturesBox />
				<LettersCard configured={configured} />

				<form
					action={startCheckoutAction.bind(null, 'pro')}
					className={`${card} border-secondary`}
				>
					<div className={head}>
						<h3 className="text-5xl">
							{formatUsd(PRO_PRICE_CENTS)}
							<span className="text-xl"> / month</span>
						</h3>
						<p className="mt-1 text-sm text-base-100/70">Pro</p>
					</div>
					<div className="flex flex-1 flex-col items-center p-6">
						<p className="text-base-100">{PRO_FAIR_USE_CAP} credits / month</p>
						<p className="mb-6 mt-1 text-sm text-base-100/70">Cancel any time</p>
						{isPro ? (
							// An active Pro plan cannot start a second subscription.
							<p className="mt-auto w-full rounded-btn border border-secondary/60 py-3 text-base-100">
								You have Pro
							</p>
						) : (
							<SubmitButton
								disabled={!configured}
								className="btn btn-secondary mt-auto min-h-11 w-full"
							>
								Start Pro
							</SubmitButton>
						)}
					</div>
				</form>
			</div>

			{hasCustomer && configured && (
				<form action={openPortalAction} className="mt-6">
					<SubmitButton className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11">
						Manage subscription
					</SubmitButton>
				</form>
			)}
		</div>
	);
}
