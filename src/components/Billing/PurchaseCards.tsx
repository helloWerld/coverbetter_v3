import {
	startCheckoutAction,
	openPortalAction,
} from '@/app/dashboard/billing/actions';
import {
	PACK_DISPLAY,
	PRO_FAIR_USE_CAP,
	PRO_PRICE_CENTS,
	formatUsd,
	perLetterLabel,
} from '@/lib/billing-plans';
import SubmitButton from './SubmitButton';

const card =
	'flex w-full flex-col rounded-lg border bg-base-300 text-center lg:w-80';
const head =
	'flex flex-col items-center justify-center border-b border-primary p-6';

/** Three purchase cards in the homepage Pricing style. */
export default function PurchaseCards({
	configured,
	hasCustomer,
}: Readonly<{ configured: boolean; hasCustomer: boolean }>) {
	const packs = [
		{ key: 'pack5', ...PACK_DISPLAY.pack5, note: 'One-time purchase' },
		{
			key: 'pack15',
			...PACK_DISPLAY.pack15,
			note: 'Lower price per letter',
		},
	] as const;

	return (
		<div>
			{!configured && (
				<p role="alert" className="mb-4 text-accent">
					Payments are not set up yet.
				</p>
			)}
			<div className="flex flex-col gap-6 lg:flex-row">
				{packs.map((p) => (
					<form
						key={p.key}
						action={startCheckoutAction.bind(null, p.key)}
						className={`${card} border-base-100/10`}
					>
						<div className={head}>
							<h3 className="text-5xl">{formatUsd(p.priceCents)}</h3>
							<p className="mt-1 text-sm text-base-100/70">
								{p.credits} letters
							</p>
						</div>
						<div className="flex flex-1 flex-col items-center p-6">
							<p className="text-base-100">
								{perLetterLabel(p.priceCents, p.credits)}
							</p>
							<p className="mt-1 text-sm text-base-100/70">{p.note}</p>
							<p className="text-sm text-base-100/70">Letters never expire</p>
							<SubmitButton
								disabled={!configured}
								className="btn btn-primary mt-auto w-full"
							>
								Buy {p.credits} letters
							</SubmitButton>
						</div>
					</form>
				))}

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
						<p className="text-base-100">Unlimited letters</p>
						<p className="mt-1 text-sm text-base-100/70">
							Fair-use cap of {PRO_FAIR_USE_CAP} letters a month
						</p>
						<p className="text-sm text-base-100/70">Cancel anytime</p>
						<SubmitButton
							disabled={!configured}
							className="btn btn-secondary mt-auto w-full"
						>
							Start Pro
						</SubmitButton>
					</div>
				</form>
			</div>

			{hasCustomer && configured && (
				<form action={openPortalAction} className="mt-6">
					<SubmitButton className="btn btn-outline text-base-100">
						Manage subscription
					</SubmitButton>
				</form>
			)}
		</div>
	);
}
