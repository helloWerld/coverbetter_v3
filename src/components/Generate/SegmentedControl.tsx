'use client';

type Option<T extends string> = { value: T; label: string; hint?: string };

/** Radio inputs styled as a button group. Arrow keys work through the native radios. */
export default function SegmentedControl<T extends string>({
	legend,
	name,
	options,
	value,
	onChange,
}: Readonly<{
	legend: string;
	name: string;
	options: readonly Option<T>[];
	value: T;
	onChange: (v: T) => void;
}>) {
	return (
		<fieldset className="min-w-0">
			<legend className="mb-2 text-sm font-medium text-base-100">{legend}</legend>
			<div className="flex flex-wrap gap-2">
				{options.map((o) => (
					<label key={o.value} className="relative flex-1 basis-[calc(50%-0.25rem)] sm:basis-0">
						<input
							type="radio"
							name={name}
							value={o.value}
							checked={value === o.value}
							onChange={() => onChange(o.value)}
							className="peer sr-only"
						/>
						<span className="flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-box border border-base-100/10 bg-base-300 px-3 py-2 text-center text-sm text-base-100/80 transition-colors hover:border-base-100/30 peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-base-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-base-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
							{o.label}
							{o.hint && <span className="text-xs opacity-70">{o.hint}</span>}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
