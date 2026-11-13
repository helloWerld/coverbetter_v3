export default function Loading() {
	return (
		<div
			className="mx-auto flex w-full max-w-screen-lg items-center gap-3 text-base-100/70"
			role="status"
		>
			<span className="loading loading-spinner" aria-hidden="true" />
			Loading
		</div>
	);
}
