import { PAID_FEATURES } from './features';

/** The features that both paid credits and Pro unlock, in a box beside the purchase cards. */
export default function FeaturesBox() {
	return (
		<section
			aria-labelledby="paid-features-heading"
			className="flex w-full flex-col rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6 lg:w-72"
		>
			<h3 id="paid-features-heading" className="text-xl text-base-100">
				Included with paid credits and Pro
			</h3>
			<ul className="list-image-checkmark mt-4 space-y-1 pl-5 text-base-100">
				{PAID_FEATURES.map((f) => (
					<li key={f}>{f}</li>
				))}
			</ul>
			<p className="mt-4 text-sm text-base-100/70">
				Letters from free credits use Professional tone and Standard length. You can read and copy them.
			</p>
		</section>
	);
}
