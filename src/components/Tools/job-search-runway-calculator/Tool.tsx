'use client';

import { useState } from 'react';
import { Stat, TextInput, ToolCard } from '../ui';
import { computeRunway, formatDate, formatMoney, formatMonths, monthEndDate, parseMoney } from './logic';

export default function JobSearchRunwayTool() {
	const [savings, setSavings] = useState('');
	const [costs, setCosts] = useState('');
	const [income, setIncome] = useState('');
	const [oneTime, setOneTime] = useState('');

	const savingsN = parseMoney(savings);
	const costsN = parseMoney(costs);
	const ready = savingsN !== null && savingsN >= 0 && costsN !== null && costsN >= 0;
	const today = new Date();
	const runway = ready
		? computeRunway(
				{
					savings: savingsN,
					monthlyCosts: costsN,
					monthlyIncome: Math.max(0, parseMoney(income) ?? 0),
					oneTimeCosts: Math.max(0, parseMoney(oneTime) ?? 0),
				},
				today,
			)
		: null;

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<TextInput label="Savings" value={savings} onChange={setSavings} inputMode="decimal" placeholder="15,000" hint="The money you can use during the search." />
				<TextInput label="Monthly costs" value={costs} onChange={setCosts} inputMode="decimal" placeholder="3,000" hint="Rent, food, bills, insurance, and loan payments." />
				<TextInput
					label="Monthly income during the search (optional)"
					value={income}
					onChange={setIncome}
					inputMode="decimal"
					hint="For example severance, unemployment benefits, or part-time work."
				/>
				<TextInput
					label="One-time costs (optional)"
					value={oneTime}
					onChange={setOneTime}
					inputMode="decimal"
					hint="Costs you pay once, such as a move or a course. The tool takes them from savings at the start."
				/>
			</form>

			<div className="mt-6" aria-live="polite">
				{runway === null ? (
					<p className="text-base-100/70">Enter your savings and your monthly costs to see how long your savings will last.</p>
				) : runway.lasts ? (
					<div className="grid gap-3 sm:grid-cols-2">
						<Stat label="Runway" value="No end date" note="Your income covers your costs, so your savings do not go down." />
						<Stat label="Monthly change" value={`+${formatMoney(-runway.monthlyDrain)}`} note="Savings added each month." />
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						<Stat label="Months of runway" value={formatMonths(runway.months ?? 0)} note={`Your savings go down by ${formatMoney(runway.monthlyDrain)} each month.`} />
						<Stat label="Savings run out on about" value={formatDate(runway.runOutDate)} note="Counted from today." />
					</div>
				)}
			</div>

			{runway && (
				<div className="mt-4 overflow-x-auto rounded-box border border-base-100/10">
					<table className="w-full min-w-[20rem] text-left text-sm tabular-nums">
						<caption className="sr-only">Savings balance at the end of each month</caption>
						<thead>
							<tr className="border-b border-base-100/10 bg-primary">
								<th scope="col" className="p-3 font-medium text-base-100/70">Month</th>
								<th scope="col" className="p-3 font-medium text-base-100/70">About this date</th>
								<th scope="col" className="p-3 font-medium text-base-100/70">Balance</th>
							</tr>
						</thead>
						<tbody>
							{runway.rows.map((r) => (
								<tr key={r.month} className="border-b border-base-100/10 last:border-0">
									<td className="p-3 text-base-100">{r.month}</td>
									<td className="p-3 text-base-100/70">{formatDate(monthEndDate(today, r.month))}</td>
									<td className={`p-3 ${r.balance < 0 ? 'text-base-100/60' : 'text-base-100'}`}>
										{r.balance < 0 ? `${formatMoney(r.balance)} (short)` : formatMoney(r.balance)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			<p className="mt-4 text-sm text-base-100/60">
				This is a simple estimate. It assumes your costs and income stay the same each month. It is not financial advice. Nothing you
				enter leaves your browser.
			</p>
		</ToolCard>
	);
}
