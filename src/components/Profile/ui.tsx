'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { Lens } from './lenses';
import { useProfileApi } from './store';

export const fieldClass =
	'w-full min-h-11 rounded-box border border-base-100/10 bg-base-300 px-3 py-2 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
export const labelClass = 'mb-1 block text-sm font-medium text-base-100';
export const btnClass =
	'btn btn-outline btn-sm min-h-11 min-w-11 border-base-100/30 text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2020-03" becomes "Mar 2020". "2020" stays "2020". */
export function formatDate(ym: string): string {
	const m = /^(\d{4})-(\d{2})$/.exec(ym);
	return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ym;
}

export function dateRange(start: string, end: string, current: boolean): string {
	const to = current ? 'Present' : formatDate(end);
	if (!start && !to) return '';
	return `${formatDate(start) || '?'} – ${to || '?'}`;
}

export function TextField({
	label,
	value,
	onChange,
	type = 'text',
	placeholder,
	list,
	autoComplete,
	maxLength,
}: Readonly<{
	label: string;
	value: string;
	onChange: (v: string) => void;
	type?: string;
	placeholder?: string;
	list?: string;
	autoComplete?: string;
	maxLength?: number;
}>) {
	const id = useId();
	return (
		<div className="min-w-0">
			<label htmlFor={id} className={labelClass}>
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				list={list}
				autoComplete={autoComplete}
				maxLength={maxLength}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				className={fieldClass}
			/>
		</div>
	);
}

/** A month picker. The value is YYYY-MM. A stored year alone shows as a hint. */
export function DateField({ label, value, onChange }: Readonly<{ label: string; value: string; onChange: (v: string) => void }>) {
	const id = useId();
	const isMonth = /^\d{4}-\d{2}$/.test(value);
	const yearOnly = /^\d{4}$/.test(value);
	return (
		<div className="min-w-0">
			<label htmlFor={id} className={labelClass}>
				{label}
			</label>
			<input
				id={id}
				type="month"
				value={isMonth ? value : ''}
				placeholder="YYYY-MM"
				onChange={(e) => onChange(e.target.value)}
				className={fieldClass}
			/>
			{yearOnly && <p className="mt-1 text-xs text-base-100/60">Year only: {value}. Pick a month to be exact.</p>}
		</div>
	);
}

export function SelectField({
	label,
	value,
	onChange,
	options,
}: Readonly<{ label: string; value: string; onChange: (v: string) => void; options: readonly string[] }>) {
	const id = useId();
	return (
		<div className="min-w-0">
			<label htmlFor={id} className={labelClass}>
				{label}
			</label>
			<select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
				{options.map((o) => (
					<option key={o} value={o}>
						{o}
					</option>
				))}
			</select>
		</div>
	);
}

/** A textarea that grows with its text. */
export function AutoTextarea({
	label,
	value,
	onChange,
	autoFocus,
	maxLength,
	minRows = 2,
}: Readonly<{
	label: string;
	value: string;
	onChange: (v: string) => void;
	autoFocus?: boolean;
	maxLength?: number;
	minRows?: number;
}>) {
	const id = useId();
	const ref = useRef<HTMLTextAreaElement>(null);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight + 2}px`;
	}, [value]);
	return (
		<div className="min-w-0">
			<label htmlFor={id} className={labelClass}>
				{label}
			</label>
			<textarea
				id={id}
				ref={ref}
				rows={minRows}
				value={value}
				maxLength={maxLength}
				autoFocus={autoFocus}
				onChange={(e) => onChange(e.target.value)}
				className={`${fieldClass} resize-none overflow-hidden`}
			/>
		</div>
	);
}

/** Move up, move down and delete buttons for one list row. */
export function RowControls<T>({
	lens,
	index,
	count,
	label,
}: Readonly<{ lens: Lens<T>; index: number; count: number; label: string }>) {
	const api = useProfileApi();
	return (
		<div className="flex flex-wrap items-center gap-2">
			{count > 1 && (
				<>
					<button type="button" className={btnClass} disabled={index === 0} aria-label={`Move ${label} up`} onClick={() => api.move(lens, index, -1)}>
						<span aria-hidden>↑</span>
					</button>
					<button
						type="button"
						className={btnClass}
						disabled={index === count - 1}
						aria-label={`Move ${label} down`}
						onClick={() => api.move(lens, index, 1)}
					>
						<span aria-hidden>↓</span>
					</button>
				</>
			)}
			<button type="button" className={btnClass} aria-label={`Delete ${label}`} onClick={() => api.remove(lens, index, label)}>
				Delete
			</button>
		</div>
	);
}

/** A collapsible card for one item (position, school, and so on). */
export function ItemCard<T>({
	id,
	title,
	meta,
	lens,
	index,
	count,
	children,
}: Readonly<{
	id: string;
	title: string;
	meta?: string;
	lens: Lens<T>;
	index: number;
	count: number;
	children: React.ReactNode;
}>) {
	const api = useProfileApi();
	const [open, setOpen] = useState(() => api.isFresh(id));
	const bodyId = `${id}-body`;
	const req = api.focusRequest;
	useEffect(() => {
		if (req && req.id === id) setOpen(true);
	}, [req, id]);
	const unsure = api.isUnsure(id);
	return (
		<li id={id} className="scroll-mt-24 rounded-box border border-base-100/10 bg-base-300">
			<div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
				<button
					type="button"
					aria-expanded={open}
					aria-controls={bodyId}
					onClick={() => setOpen((o) => !o)}
					className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-box text-left text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100"
				>
					<span aria-hidden className="shrink-0">
						{open ? '▾' : '▸'}
					</span>
					<span className="min-w-0">
						<span className="block break-words">{title}</span>
						{meta && <span className="block break-words text-sm text-base-100/60">{meta}</span>}
					</span>
					{unsure && <span className="badge badge-warning shrink-0">Check this</span>}
				</button>
				<RowControls lens={lens} index={index} count={count} label={title} />
			</div>
			<div id={bodyId} hidden={!open} className="flex flex-col gap-4 border-t border-base-100/10 p-3 sm:p-4">
				{children}
			</div>
		</li>
	);
}

export function AddButton({ children, onClick }: Readonly<{ children: React.ReactNode; onClick: () => void }>) {
	return (
		<button type="button" onClick={onClick} className="btn btn-secondary min-h-11 self-start">
			{children}
		</button>
	);
}

export function Section({ id, title, children }: Readonly<{ id: string; title: string; children: React.ReactNode }>) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-h`}
			className="scroll-mt-24 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-4 sm:p-6"
		>
			<h2 id={`${id}-h`} className="mb-4 text-xl text-base-100">
				{title}
			</h2>
			<div className="flex flex-col gap-4 text-base-100/70">{children}</div>
		</section>
	);
}
