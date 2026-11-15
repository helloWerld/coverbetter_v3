'use client';

import { useState } from 'react';
import { Select, Stat, TextInput, ToolCard } from '../ui';
import { PERIODS, convertAll, formatMoney, parseNumber, type Period } from './logic';

export default function SalaryToHourlyTool() {
	const [amount, setAmount] = useState('');
	const [period, setPeriod] = useState<Period>('yearly');
	const [hours, setHours] = useState('40');
	const [weeks, setWeeks] = useState('52');

	const result = convertAll(parseNumber(amount), period, parseNumber(hours), parseNumber(weeks));

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<TextInput
					label="Pay amount"
					value={amount}
					onChange={setAmount}
					inputMode="decimal"
					placeholder="60,000"
					hint="Gross pay, before tax. You can type $ and commas."
				/>
				<Select label="Pay period" value={period} onChange={setPeriod} options={PERIODS} />
				<TextInput
					label="Hours per week"
					value={hours}
					onChange={setHours}
					inputMode="decimal"
					hint="Most full-time jobs use 40."
				/>
				<TextInput
					label="Weeks worked per year"
					value={weeks}
					onChange={setWeeks}
					inputMode="decimal"
					hint="Unpaid time off lowers this number. Paid time off still counts as worked."
				/>
			</form>

			<div className="mt-6" aria-live="polite">
				{result ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{PERIODS.map((p) => (
							<Stat key={p.value} label={p.label} value={formatMoney(result[p.value])} />
						))}
					</div>
				) : (
					<p className="text-base-100/70">
						Enter a pay amount, hours per week above 0, and weeks per year above 0 to see the result.
					</p>
				)}
			</div>
			<p className="mt-4 text-sm text-base-100/60">
				All amounts are gross pay before tax. This tool does not calculate tax. It counts a week as 5 working days.
			</p>
		</ToolCard>
	);
}
