'use client';

// Shared parts for the free tools. Every tool uses these, so all tools look and behave the same.
import { useEffect, useId, useState, type ReactNode } from 'react';

const INPUT =
	'input input-bordered min-h-11 w-full border-base-100/20 bg-primary text-base text-base-100 placeholder:text-base-100/40 focus:border-neutral focus:outline-secondary';
const TEXTAREA =
	'textarea textarea-bordered w-full border-base-100/20 bg-primary text-base leading-relaxed text-base-100 placeholder:text-base-100/40 focus:border-neutral focus:outline-secondary';
const SELECT =
	'select select-bordered min-h-11 w-full border-base-100/20 bg-primary text-base text-base-100 focus:border-neutral focus:outline-secondary';

/** The box that holds a tool. */
export function ToolCard({ children, className = '' }: Readonly<{ children: ReactNode; className?: string }>) {
	return (
		<div className={`rounded-box border border-base-100/10 bg-base-300 p-4 sm:p-6 ${className}`}>{children}</div>
	);
}

type FieldProps = Readonly<{
	label: string;
	hint?: string;
	children: (id: string, describedBy?: string) => ReactNode;
}>;

/** A label, an optional hint, and one control. The control gets the id and aria-describedby. */
export function Field({ label, hint, children }: FieldProps) {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-sm font-medium text-base-100">
				{label}
			</label>
			{children(id, hintId)}
			{hint && (
				<p id={hintId} className="text-sm text-base-100/60">
					{hint}
				</p>
			)}
		</div>
	);
}

type TextInputProps = Readonly<{
	label: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
	placeholder?: string;
	type?: 'text' | 'number' | 'date' | 'time' | 'email';
	inputMode?: 'text' | 'numeric' | 'decimal';
	min?: number;
	max?: number;
	step?: number | 'any';
	maxLength?: number;
}>;

export function TextInput({ label, value, onChange, hint, type = 'text', ...rest }: TextInputProps) {
	return (
		<Field label={label} hint={hint}>
			{(id, describedBy) => (
				<input
					id={id}
					aria-describedby={describedBy}
					type={type}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={INPUT}
					{...rest}
				/>
			)}
		</Field>
	);
}

type TextAreaProps = Readonly<{
	label: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
	placeholder?: string;
	rows?: number;
	maxLength?: number;
}>;

export function TextArea({ label, value, onChange, hint, rows = 6, ...rest }: TextAreaProps) {
	return (
		<Field label={label} hint={hint}>
			{(id, describedBy) => (
				<textarea
					id={id}
					aria-describedby={describedBy}
					rows={rows}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={TEXTAREA}
					{...rest}
				/>
			)}
		</Field>
	);
}

type SelectProps<T extends string> = Readonly<{
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: readonly { value: T; label: string }[];
	hint?: string;
}>;

export function Select<T extends string>({ label, value, onChange, options, hint }: SelectProps<T>) {
	return (
		<Field label={label} hint={hint}>
			{(id, describedBy) => (
				<select
					id={id}
					aria-describedby={describedBy}
					value={value}
					onChange={(e) => onChange(e.target.value as T)}
					className={SELECT}
				>
					{options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			)}
		</Field>
	);
}

/** A row of buttons where the user picks one. Use for 2 to 6 short choices. */
export function Choice<T extends string>({
	legend,
	value,
	onChange,
	options,
}: Readonly<{ legend: string; value: T; onChange: (v: T) => void; options: readonly { value: T; label: string }[] }>) {
	return (
		<fieldset className="flex flex-col gap-1.5">
			<legend className="mb-1.5 text-sm font-medium text-base-100">{legend}</legend>
			<div className="flex flex-wrap gap-2">
				{options.map((o) => (
					<button
						key={o.value}
						type="button"
						aria-pressed={value === o.value}
						onClick={() => onChange(o.value)}
						className={`btn btn-sm min-h-11 border px-4 normal-case ${
							value === o.value
								? 'border-secondary bg-secondary/30 text-base-100 hover:bg-secondary/40'
								: 'border-base-100/20 bg-primary text-base-100/80 hover:border-neutral hover:bg-primary'
						}`}
					>
						{o.label}
					</button>
				))}
			</div>
		</fieldset>
	);
}

/** Copies text to the clipboard and says so for 2 seconds. */
export function CopyButton({ text, label = 'Copy' }: Readonly<{ text: string; label?: string }>) {
	const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
	useEffect(() => {
		if (state === 'idle') return;
		const t = setTimeout(() => setState('idle'), 2000);
		return () => clearTimeout(t);
	}, [state]);
	return (
		<button
			type="button"
			disabled={!text}
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setState('copied');
				} catch {
					setState('failed');
				}
			}}
			className="btn btn-secondary min-h-11"
		>
			<span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}</span>
		</button>
	);
}

/** Makes a file in the browser and downloads it. Nothing goes to a server. */
export function downloadFile(filename: string, content: string, type = 'text/plain;charset=utf-8') {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DownloadButton({
	filename,
	content,
	type,
	label = 'Download .txt',
}: Readonly<{ filename: string; content: string; type?: string; label?: string }>) {
	return (
		<button
			type="button"
			disabled={!content}
			onClick={() => downloadFile(filename, content, type)}
			className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100"
		>
			{label}
		</button>
	);
}

/** Read-only text the tool made, kept as typed (line breaks stay). */
export function OutputBox({ label, text }: Readonly<{ label: string; text: string }>) {
	return (
		<section aria-label={label} className="rounded-box border border-base-100/10 bg-primary p-4">
			<h3 className="text-sm font-medium text-base-100/70">{label}</h3>
			<div aria-live="polite" className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-base-100">
				{text}
			</div>
		</section>
	);
}

/** A big number with a label, for calculators. */
export function Stat({ label, value, note }: Readonly<{ label: string; value: string; note?: string }>) {
	return (
		<div className="rounded-box border border-base-100/10 bg-primary p-4">
			<p className="text-sm text-base-100/70">{label}</p>
			<p className="mt-1 text-2xl font-semibold tabular-nums text-base-100">{value}</p>
			{note && <p className="mt-1 text-sm text-base-100/60">{note}</p>}
		</div>
	);
}

/**
 * useState that also saves to localStorage on this device. Reads after the first render,
 * so the server HTML and the first browser render match. A blocked storage never breaks the tool.
 */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
	const storageKey = `coverbetter-tools:${key}`;
	const [value, setValue] = useState<T>(initial);
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(storageKey);
			if (raw !== null) setValue(JSON.parse(raw) as T);
		} catch {
			// Storage blocked or bad JSON: keep the initial value.
		}
		setLoaded(true);
	}, [storageKey]);
	useEffect(() => {
		if (!loaded) return;
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(value));
		} catch {
			// Storage full or blocked: the tool still works for this visit.
		}
	}, [storageKey, value, loaded]);
	return [value, setValue];
}
