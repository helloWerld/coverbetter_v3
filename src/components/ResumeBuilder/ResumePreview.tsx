import type { ResumeDoc } from '@/lib/profile/render';

type Look = { page: string; name: string; head: string; center: boolean };

const LOOKS: Record<string, Look> = {
	classic: {
		page: 'font-serif',
		name: 'text-2xl font-bold text-black',
		head: 'border-b border-black/40 text-xs font-bold uppercase tracking-wide text-black',
		center: true,
	},
	modern: {
		page: 'font-sans',
		name: 'text-2xl font-semibold text-slate-800',
		head: 'border-b-2 border-slate-700 text-xs font-bold uppercase tracking-wide text-slate-700',
		center: false,
	},
	minimal: {
		page: 'font-sans',
		name: 'text-xl font-medium text-neutral-900',
		head: 'border-b border-neutral-300 text-xs font-medium uppercase tracking-widest text-neutral-600',
		center: false,
	},
};

/** A white page that shows the resume. It reflows to the width of its box, so it reads well at 375px. */
export default function ResumePreview({ doc, template }: Readonly<{ doc: ResumeDoc; template: string }>) {
	const look = LOOKS[template] ?? LOOKS.classic;
	const align = look.center ? 'text-center' : 'text-left';
	return (
		<div
			className={`${look.page} w-full min-w-0 break-words rounded-box bg-white p-4 text-[13px] leading-snug text-neutral-800 shadow sm:p-8`}
			role="img"
			aria-label="Preview of your resume"
		>
			<div aria-hidden>
				<header className={`mb-3 ${align}`}>
					{doc.name && <p className={look.name}>{doc.name}</p>}
					{doc.headline && <p className="text-sm text-neutral-600">{doc.headline}</p>}
					{doc.contactLine && <p className="text-xs text-neutral-600">{doc.contactLine}</p>}
				</header>
				{doc.summary && (
					<section className="mb-3">
						<p className={`${look.head} mb-1 pb-0.5`}>Summary</p>
						<p>{doc.summary}</p>
					</section>
				)}
				{doc.sections.map((sec) => (
					<section key={sec.title} className="mb-3">
						<p className={`${look.head} mb-1.5 pb-0.5`}>{sec.title}</p>
						{sec.items.map((it, i) => (
							<div key={i} className="mb-2">
								{(it.heading || it.dates) && (
									<p className="flex flex-wrap justify-between gap-x-3 font-semibold text-neutral-900">
										<span className="min-w-0">{it.heading}</span>
										<span className="text-xs font-normal text-neutral-600">{it.dates}</span>
									</p>
								)}
								{it.subheading && <p className="text-neutral-600">{it.subheading}</p>}
								{it.text && <p>{it.text}</p>}
								{it.bullets.length > 0 && (
									<ul className="ml-4 list-disc">
										{it.bullets.map((b, j) => (
											<li key={j}>{b}</li>
										))}
									</ul>
								)}
							</div>
						))}
					</section>
				))}
				{!doc.name && !doc.summary && doc.sections.length === 0 && (
					<p className="text-neutral-500">Your resume is empty. Tick items on the left.</p>
				)}
			</div>
		</div>
	);
}
