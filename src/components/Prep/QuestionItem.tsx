'use client';

import { useId } from 'react';
import { focus } from './styles';

/** One question row. The row opens and closes the practice panel (children). */
export default function QuestionItem({
	text,
	badge,
	saved,
	open,
	onToggle,
	children,
}: Readonly<{
	text: string;
	badge?: string;
	saved: boolean;
	open: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}>) {
	const id = useId();
	return (
		<li className="rounded-box border border-base-100/10 bg-base-300">
			<h3 className="m-0 text-base font-normal">
				<button
					type="button"
					aria-expanded={open}
					aria-controls={`${id}-panel`}
					onClick={onToggle}
					className={`flex min-h-11 w-full items-start justify-between gap-3 rounded-box px-4 py-3 text-left text-base-100 ${focus}`}
				>
					<span className="min-w-0 break-words">{text}</span>
					<span className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-sm">
						{badge && <span className="text-base-100/60">{badge}</span>}
						{saved && <span className="rounded-full border border-accent px-2 py-0.5 text-accent">Saved</span>}
						<span aria-hidden>{open ? '−' : '+'}</span>
					</span>
				</button>
			</h3>
			<div id={`${id}-panel`} hidden={!open} className="px-4 pb-4">
				{open && children}
			</div>
		</li>
	);
}
