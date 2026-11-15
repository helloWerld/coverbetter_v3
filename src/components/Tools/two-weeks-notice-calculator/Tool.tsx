'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { buildIcs } from '@/lib/tools/ics';
import { Choice, DownloadButton, Select, Stat, TextInput, ToolCard } from '../ui';
import { calculateNotice, formatLongDate, weeksToDays, type CountMode } from './logic';

const LENGTHS = [
	{ value: '1', label: '1 week' },
	{ value: '2', label: '2 weeks' },
	{ value: '3', label: '3 weeks' },
	{ value: '4', label: '4 weeks' },
	{ value: 'custom', label: 'Custom number of days' },
] as const;
type LengthId = (typeof LENGTHS)[number]['value'];

function todayIso() {
	const d = new Date();
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function TwoWeeksNoticeCalculatorTool() {
	const [startIso, setStartIso] = useState('');
	const [length, setLength] = useState<LengthId>('2');
	const [customDays, setCustomDays] = useState('10');
	const [mode, setMode] = useState<CountMode>('calendar');
	const [skipHolidays, setSkipHolidays] = useState(true);

	const days = length === 'custom' ? Number(customDays.trim() === '' ? NaN : customDays) : weeksToDays(Number(length), mode);
	const result = useMemo(
		() => calculateNotice({ startIso, days, mode, skipHolidays }),
		[startIso, days, mode, skipHolidays],
	);
	const ics = useMemo(
		() =>
			result
				? buildIcs([
						{
							title: 'My last day at work',
							day: result.lastDayIso,
							description: 'Planned last working day. My employer policy and contract decide the real last day.',
						},
					])
				: '',
		[result],
	);

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="flex flex-col gap-2">
					<TextInput label="Day you give notice" type="date" value={startIso} onChange={setStartIso} />
					<button
						type="button"
						onClick={() => setStartIso(todayIso())}
						className="btn btn-ghost btn-sm min-h-11 self-start text-neutral hover:bg-primary"
					>
						Use today
					</button>
				</div>
				<div className="flex flex-col gap-4">
					<Select label="Notice length" value={length} onChange={setLength} options={LENGTHS} />
					{length === 'custom' && (
						<TextInput
							label="Number of days"
							type="number"
							inputMode="numeric"
							min={0}
							max={365}
							value={customDays}
							onChange={setCustomDays}
							hint="Whole days, 0 to 365."
						/>
					)}
				</div>
				<div className="sm:col-span-2">
					<Choice
						legend="How to count"
						value={mode}
						onChange={setMode}
						options={[
							{ value: 'calendar', label: 'Count calendar days' },
							{ value: 'business', label: 'Count business days' },
						]}
					/>
					<p className="mt-2 text-sm text-base-100/60">
						{mode === 'calendar'
							? 'The count starts the day after you give notice. If the last day is a weekend or a skipped holiday, the tool moves it to the last working day before it.'
							: 'The count starts the day after you give notice. Weekends do not count. 1 week is 5 business days.'}
					</p>
				</div>
				<label className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2">
					<input
						type="checkbox"
						checked={skipHolidays}
						onChange={(e) => setSkipHolidays(e.target.checked)}
						className="checkbox checkbox-secondary"
					/>
					<span className="text-sm font-medium text-base-100">Skip US federal holidays</span>
				</label>
			</form>

			<div className="mt-6" aria-live="polite">
				{result ? (
					<div className="grid gap-4 sm:grid-cols-2">
						<Stat label="Your last working day" value={result.lastDayLabel} />
						<Stat
							label="Working days left"
							value={String(result.workingDaysLeft)}
							note={`After ${formatLongDate(startIso)}, up to and including your last day.`}
						/>
						<div className="rounded-box border border-base-100/10 bg-primary p-4 sm:col-span-2">
							<h3 className="text-sm font-medium text-base-100/70">US federal holidays in this period</h3>
							{result.holidays.length > 0 ? (
								<>
									<ul className="mt-2 grid gap-1 text-base-100">
										{result.holidays.map((h) => (
											<li key={h.name + h.observed}>
												{h.name}: {formatLongDate(h.observed)}
											</li>
										))}
									</ul>
									<p className="mt-2 text-sm text-base-100/60">
										{result.skipHolidays
											? 'These days do not count as working days.'
											: 'These days count as working days, because “Skip US federal holidays” is off.'}
									</p>
								</>
							) : (
								<p className="mt-2 text-base-100">None.</p>
							)}
						</div>
						<div className="sm:col-span-2">
							<DownloadButton
								filename="last-day.ics"
								content={ics}
								type="text/calendar;charset=utf-8"
								label="Add last day to calendar (.ics)"
							/>
						</div>
					</div>
				) : (
					<p className="text-base-100/70">Pick the day you give notice and a valid notice length to see your last day.</p>
				)}
			</div>

			<p className="mt-6 text-sm text-base-100/70">
				This tool gives an estimate. Your employer’s policy and your contract decide the real notice and the real last
				day. Holidays follow US federal rules. Your employer may use a different holiday list.
			</p>
			<p className="mt-3 text-sm">
				<Link href="/tools/resignation-letter-template" className="link text-neutral">
					Write your resignation letter with your last day in it
				</Link>
			</p>
		</ToolCard>
	);
}
