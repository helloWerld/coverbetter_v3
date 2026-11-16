'use client';

import { useState } from 'react';
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from 'react-icons/fa6';

export const focusRing =
	'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';
export const fieldClass = `w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 ${focusRing} disabled:opacity-60`;
export const smallBtn = `btn btn-sm btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11 min-w-11 ${focusRing}`;

/** Move buttons. Each label names the item. */
export function MoveButtons({
	name,
	onMove,
	canBack,
	canForward,
	horizontal = false,
}: Readonly<{
	name: string;
	onMove: (delta: -1 | 1) => void;
	canBack: boolean;
	canForward: boolean;
	horizontal?: boolean;
}>) {
	const Back = horizontal ? FaArrowLeft : FaArrowUp;
	const Fwd = horizontal ? FaArrowRight : FaArrowDown;
	return (
		<span className="inline-flex shrink-0 gap-1">
			<button type="button" className={smallBtn} disabled={!canBack} onClick={() => onMove(-1)} aria-label={`Move ${name} ${horizontal ? 'left' : 'up'}`}>
				<Back aria-hidden />
			</button>
			<button type="button" className={smallBtn} disabled={!canForward} onClick={() => onMove(1)} aria-label={`Move ${name} ${horizontal ? 'right' : 'down'}`}>
				<Fwd aria-hidden />
			</button>
		</span>
	);
}

export function Check({
	checked,
	onChange,
	children,
	className = '',
}: Readonly<{ checked: boolean; onChange: () => void; children: React.ReactNode; className?: string }>) {
	return (
		<label className={`flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-3 py-2 ${className}`}>
			<input type="checkbox" className={`checkbox checkbox-secondary mt-0.5 shrink-0 ${focusRing}`} checked={checked} onChange={onChange} />
			<span className="min-w-0 break-words text-base-100">{children}</span>
		</label>
	);
}

/** One bullet: checkbox, move buttons, and an "Edit for this resume" control. */
export function BulletRow({
	id,
	original,
	rewrite,
	checked,
	index,
	count,
	onToggle,
	onMove,
	onRewrite,
}: Readonly<{
	id: string;
	original: string;
	rewrite: string | undefined;
	checked: boolean;
	index: number;
	count: number;
	onToggle: () => void;
	onMove: (delta: -1 | 1) => void;
	onRewrite: (text: string) => void;
}>) {
	const [open, setOpen] = useState(false);
	const shown = rewrite ?? original;
	const short = shown.length > 60 ? `${shown.slice(0, 60)}...` : shown;
	const fieldId = `rewrite-${id}`;
	return (
		<li className="rounded-box border border-base-100/10 px-3">
			<div className="flex flex-wrap items-start gap-x-2">
				<Check checked={checked} onChange={onToggle}>
					{shown}
					{rewrite !== undefined && <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Edited</span>}
				</Check>
				<span className="flex flex-wrap gap-1 py-1">
					{checked && <MoveButtons name={`bullet "${short}"`} onMove={onMove} canBack={index > 0} canForward={index < count - 1} />}
					<button type="button" className={smallBtn} aria-expanded={open} aria-controls={fieldId} onClick={() => setOpen((o) => !o)}>
						Edit for this resume
					</button>
				</span>
			</div>
			{open && (
				<div id={fieldId} className="pb-3">
					<label htmlFor={`${fieldId}-text`} className="mb-1 block text-sm text-base-100/70">
						Text for this resume only
					</label>
					<textarea
						id={`${fieldId}-text`}
						className={`${fieldClass} min-h-24`}
						maxLength={500}
						value={shown}
						onChange={(e) => onRewrite(e.target.value)}
					/>
					<button
						type="button"
						className={`${smallBtn} mt-2`}
						disabled={rewrite === undefined}
						onClick={() => onRewrite(original)}
					>
						Reset to profile text
					</button>
				</div>
			)}
		</li>
	);
}
