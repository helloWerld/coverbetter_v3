'use client';

import { useId } from 'react';
import { TEMPLATE_IDS, TEMPLATES, type TemplateId } from '@/lib/templates';

/** Radio group. Arrow keys move between the options. */
export default function TemplateSwitcher({
	value,
	onChange,
}: Readonly<{ value: TemplateId; onChange: (id: TemplateId) => void }>) {
	const name = useId();
	return (
		<fieldset className="min-w-0">
			<legend className="mb-2 text-sm text-base-100/70">Template</legend>
			<div className="flex flex-wrap gap-2">
				{TEMPLATE_IDS.map((id) => (
					<label
						key={id}
						className="relative flex min-h-11 cursor-pointer items-center rounded-btn border border-base-100/20 px-4 text-sm text-base-100/80 transition-colors hover:border-base-100/40 has-[:checked]:border-secondary has-[:checked]:bg-secondary/20 has-[:checked]:text-base-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral"
					>
						<input
							type="radio"
							name={name}
							value={id}
							checked={value === id}
							onChange={() => onChange(id)}
							className="sr-only"
						/>
						<span>{TEMPLATES[id].label}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
