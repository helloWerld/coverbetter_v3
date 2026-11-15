'use client';

import { useState } from 'react';
import { Choice, Stat, TextInput, ToolCard } from '../ui';
import { computeGoal, formatCount, parsePositive, percentToRatio, type GoalType, type RateMode } from './logic';

const GOAL_OPTIONS = [
	{ value: 'offers', label: 'Job offers' },
	{ value: 'interviews', label: 'Interviews' },
] as const;
const MODE_OPTIONS = [
	{ value: 'counts', label: 'Numbers (1 in 20)' },
	{ value: 'percent', label: 'Percents (5%)' },
] as const;

export default function JobApplicationGoalTool() {
	const [goalType, setGoalType] = useState<GoalType>('offers');
	const [goal, setGoal] = useState('');
	const [weeks, setWeeks] = useState('');
	const [mode, setMode] = useState<RateMode>('counts');
	const [appRate, setAppRate] = useState('');
	const [intRate, setIntRate] = useState('');

	const toRatio = (text: string) => (mode === 'counts' ? parsePositive(text) : percentToRatio(parsePositive(text)));
	const result = computeGoal({
		goalType,
		goal: parsePositive(goal),
		weeks: parsePositive(weeks),
		applicationsPerInterview: toRatio(appRate),
		interviewsPerOffer: toRatio(intRate),
	});

	const goalLabel = goalType === 'offers' ? 'offers' : 'interviews';
	const exampleNote = 'Example only. Use your own numbers after 2 to 3 weeks of applying.';

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<div className="sm:col-span-2">
					<Choice legend="My goal is to get" value={goalType} onChange={setGoalType} options={GOAL_OPTIONS} />
				</div>
				<TextInput label={`How many ${goalLabel}?`} value={goal} onChange={setGoal} inputMode="numeric" placeholder="1" />
				<TextInput label="In how many weeks?" value={weeks} onChange={setWeeks} inputMode="decimal" placeholder="8" />
				<div className="sm:col-span-2">
					<Choice legend="I know my rates as" value={mode} onChange={setMode} options={MODE_OPTIONS} />
				</div>
				<TextInput
					label={mode === 'counts' ? 'Applications for each interview' : 'Applications that lead to an interview (%)'}
					value={appRate}
					onChange={setAppRate}
					inputMode="decimal"
					placeholder={mode === 'counts' ? 'Example: 20' : 'Example: 5'}
					hint={exampleNote}
				/>
				{goalType === 'offers' && (
					<TextInput
						label={mode === 'counts' ? 'Interviews for each offer' : 'Interviews that lead to an offer (%)'}
						value={intRate}
						onChange={setIntRate}
						inputMode="decimal"
						placeholder={mode === 'counts' ? 'Example: 4' : 'Example: 25'}
						hint={exampleNote}
					/>
				)}
			</form>

			<div className="mt-6" aria-live="polite">
				{result ? (
					<div className="grid gap-3 sm:grid-cols-3">
						<Stat
							label="Applications in total"
							value={formatCount(result.applications)}
							note={goalType === 'offers' ? `About ${formatCount(result.interviewsNeeded)} interviews on the way.` : undefined}
						/>
						<Stat label="Applications per week" value={formatCount(result.perWeek)} />
						<Stat label="Applications per weekday" value={formatCount(result.perWeekday)} note="Counts 5 weekdays a week." />
					</div>
				) : (
					<p className="text-base-100/70">
						Enter your goal, the number of weeks, and your own rates to see how many applications you need. The tool has no
						default rates, because your rates depend on your field, your resume, and the jobs you pick.
					</p>
				)}
			</div>

			<section className="mt-6 rounded-box border border-base-100/10 bg-primary p-4">
				<h3 className="text-sm font-medium text-base-100">How to find your own rates</h3>
				<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-base-100/80">
					<li>Write down every application: the date, the company, and the result.</li>
					<li>After 2 to 3 weeks, count your applications and how many led to an interview.</li>
					<li>Divide the applications by the interviews to get applications for each interview.</li>
					<li>Do the same for interviews and offers. You may have no offers yet. Then leave that rate for later or use a guess and mark it as a guess.</li>
					<li>Come back every few weeks and update your numbers. Your rates change when you change your resume or the jobs you pick.</li>
				</ul>
			</section>
			<p className="mt-4 text-sm text-base-100/60">
				Results round up. Nothing you enter leaves your browser.
			</p>
		</ToolCard>
	);
}
