'use client';

import { Stat, TextInput, ToolCard, useLocalState } from '../ui';
import { EMPTY_OFFER, computeOffer, differencesFromHighest, formatMoney, type OfferInput } from './logic';

const DEFAULT_NAMES = ['Offer A', 'Offer B', 'Offer C'];

type OfferFormProps = Readonly<{
	index: number;
	offer: OfferInput;
	onChange: (key: keyof OfferInput, value: string) => void;
}>;

function OfferForm({ index, offer, onChange }: OfferFormProps) {
	const set = (key: keyof OfferInput) => (value: string) => onChange(key, value);
	return (
		<fieldset className="rounded-box border border-base-100/10 bg-primary p-4">
			<legend className="px-2 text-sm font-medium text-base-100">{offer.name.trim() || DEFAULT_NAMES[index]}</legend>
			<div className="grid gap-4">
				<TextInput label="Name" value={offer.name} onChange={set('name')} placeholder={DEFAULT_NAMES[index]} />
				<TextInput label="Base salary per year" value={offer.base} onChange={set('base')} inputMode="decimal" placeholder="90,000" />
				<TextInput label="Bonus per year" value={offer.bonus} onChange={set('bonus')} inputMode="decimal" hint="The amount you expect to get." />
				<TextInput
					label="Equity value per year"
					value={offer.equity}
					onChange={set('equity')}
					inputMode="decimal"
					hint="Your own estimate. Equity is uncertain. It can be worth much less, or nothing."
				/>
				<div className="grid grid-cols-2 gap-3">
					<TextInput label="401(k) match, % of salary" value={offer.matchPct} onChange={set('matchPct')} inputMode="decimal" placeholder="4" />
					<TextInput label="Match cap, % of salary" value={offer.matchCapPct} onChange={set('matchCapPct')} inputMode="decimal" placeholder="4" />
				</div>
				<TextInput
					label="Other benefits value per year"
					value={offer.benefits}
					onChange={set('benefits')}
					inputMode="decimal"
					hint="For example, the part of health insurance that the employer pays."
				/>
				<TextInput label="PTO days per year" value={offer.ptoDays} onChange={set('ptoDays')} inputMode="decimal" placeholder="15" />
				<div className="grid grid-cols-3 gap-3">
					<TextInput label="Office days per week" value={offer.daysInOffice} onChange={set('daysInOffice')} inputMode="decimal" placeholder="3" />
					<TextInput label="Cost per day" value={offer.commuteCostPerDay} onChange={set('commuteCostPerDay')} inputMode="decimal" placeholder="12" />
					<TextInput label="Weeks per year" value={offer.commuteWeeks} onChange={set('commuteWeeks')} inputMode="decimal" />
				</div>
			</div>
		</fieldset>
	);
}

export default function JobOfferComparisonTool() {
	const [offers, setOffers] = useLocalState<OfferInput[]>('job-offer-comparison:offers', [EMPTY_OFFER, EMPTY_OFFER]);

	const update = (i: number) => (key: keyof OfferInput, value: string) =>
		setOffers((prev) => prev.map((o, j) => (j === i ? { ...o, [key]: value } : o)));

	const results = offers.map(computeOffer);
	const diffs = differencesFromHighest(results);
	const names = offers.map((o, i) => o.name.trim() || DEFAULT_NAMES[i]);
	const anyData = results.some((r) => r.hasData);

	const rows: { label: string; cell: (i: number) => string; strong?: boolean }[] = [
		{ label: 'Base salary', cell: (i) => formatMoney(results[i].base) },
		{ label: 'Bonus', cell: (i) => formatMoney(results[i].bonus) },
		{ label: 'Equity (estimate)', cell: (i) => formatMoney(results[i].equity) },
		{ label: '401(k) match', cell: (i) => formatMoney(results[i].match) },
		{ label: 'Other benefits', cell: (i) => formatMoney(results[i].benefits) },
		{ label: 'Commute cost', cell: (i) => (results[i].commute > 0 ? `-${formatMoney(results[i].commute)}` : formatMoney(0)) },
		{ label: 'Total yearly value', cell: (i) => (results[i].hasData ? formatMoney(results[i].total) : '-'), strong: true },
		{
			label: 'Difference from highest',
			cell: (i) => (diffs[i] === null ? '-' : diffs[i] === 0 ? 'Highest' : `-${formatMoney(Math.abs(diffs[i]!))}`),
		},
		{ label: 'Working days per year', cell: (i) => String(results[i].workingDays) },
		{ label: 'Value per working day', cell: (i) => formatMoney(results[i].perDay) },
	];

	return (
		<ToolCard>
			<form onSubmit={(e) => e.preventDefault()}>
				<div className={`grid gap-4 ${offers.length === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
					{offers.map((o, i) => (
						<OfferForm key={i} index={i} offer={o} onChange={update(i)} />
					))}
				</div>
				<div className="mt-4 flex flex-wrap gap-3">
					{offers.length < 3 ? (
						<button type="button" onClick={() => setOffers((p) => [...p, EMPTY_OFFER])} className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100">
							Add a third offer
						</button>
					) : (
						<button type="button" onClick={() => setOffers((p) => p.slice(0, 2))} className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100">
							Remove the third offer
						</button>
					)}
					<button
						type="button"
						onClick={() => setOffers([EMPTY_OFFER, EMPTY_OFFER])}
						className="btn btn-ghost min-h-11 text-base-100/70 hover:bg-primary hover:text-base-100"
					>
						Clear
					</button>
				</div>
			</form>

			<div className="mt-6" aria-live="polite">
				{anyData ? (
					<>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{results.map((r, i) => (
								<Stat
									key={i}
									label={`${names[i]}: total yearly value`}
									value={r.hasData ? formatMoney(r.total) : '-'}
									note={r.perDay === null ? undefined : `${formatMoney(r.perDay)} per working day`}
								/>
							))}
						</div>
						<div className="mt-4 overflow-x-auto rounded-box border border-base-100/10">
							<table className="w-full min-w-[32rem] text-left text-sm tabular-nums">
								<caption className="sr-only">Offer comparison</caption>
								<thead>
									<tr className="border-b border-base-100/10 bg-primary">
										<th scope="col" className="p-3 font-medium text-base-100/70">Per year</th>
										{names.map((n, i) => (
											<th key={i} scope="col" className="p-3 font-medium text-base-100">{n}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rows.map((row) => (
										<tr key={row.label} className="border-b border-base-100/10 last:border-0">
											<th scope="row" className={`p-3 font-normal ${row.strong ? 'text-base-100' : 'text-base-100/70'}`}>{row.label}</th>
											{names.map((_, i) => (
												<td key={i} className={`p-3 ${row.strong ? 'font-semibold text-base-100' : 'text-base-100'}`}>{row.cell(i)}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				) : (
					<p className="text-base-100/70">Enter a base salary for each offer to see the comparison.</p>
				)}
			</div>
			<p className="mt-4 text-sm text-base-100/60">
				Equity is your own estimate and can be worth less than you expect. Values are before tax. This is not tax advice. Your
				answers save in this browser only.
			</p>
		</ToolCard>
	);
}
