'use client';

export default function DashboardError({
	reset,
}: Readonly<{ error: Error; reset: () => void }>) {
	return (
		<div className="mx-auto flex w-full max-w-screen-lg flex-col items-start gap-4">
			<h1 className="gradient-text text-3xl font-extralight">
				This page did not load
			</h1>
			<button
				type="button"
				onClick={reset}
				className="btn btn-secondary min-h-11"
			>
				Try again
			</button>
		</div>
	);
}
