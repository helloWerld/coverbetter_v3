/** Title block and content area shared by every dashboard page. */
export default function PageShell({
	title,
	intro,
	children,
}: Readonly<{
	title: string;
	intro?: string;
	children?: React.ReactNode;
}>) {
	return (
		<div className="mx-auto w-full max-w-screen-lg">
			<h1 className="gradient-text text-3xl font-extralight md:text-5xl">
				{title}
			</h1>
			{intro && (
				<p className="mt-3 max-w-2xl text-base font-extralight text-base-100/70 md:text-xl">
					{intro}
				</p>
			)}
			<div className="mt-8 flex flex-col gap-6">{children}</div>
		</div>
	);
}

export function Card({
	title,
	children,
}: Readonly<{ title?: string; children: React.ReactNode }>) {
	return (
		<section className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-6">
			{title && <h2 className="mb-3 text-xl text-base-100">{title}</h2>}
			<div className="text-base-100/70">{children}</div>
		</section>
	);
}
