/** Message for the `?status=` value that Stripe Checkout sends people back with. */
export default function StatusBanner({
	status,
}: Readonly<{ status?: string }>) {
	if (status === 'success') {
		return (
			<p
				role="status"
				className="rounded-box border border-secondary bg-base-300 p-4 text-base-100"
			>
				Payment received. Your credits can take a few seconds to show.
			</p>
		);
	}
	if (status === 'cancel') {
		return (
			<p
				role="status"
				className="rounded-box border border-base-100/20 bg-base-300 p-4 text-base-100/80"
			>
				Checkout canceled. You were not charged.
			</p>
		);
	}
	if (status === 'unavailable') {
		return (
			<p
				role="alert"
				className="rounded-box border border-accent bg-base-300 p-4 text-base-100"
			>
				Payments are not set up yet.
			</p>
		);
	}
	return null;
}
