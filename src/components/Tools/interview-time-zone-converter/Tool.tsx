'use client';

import { useEffect, useMemo, useState } from 'react';
import { CopyButton, Field, Select, TextInput, ToolCard, downloadFile } from '../ui';
import { allZones, browserZone, confirmationText, convert, filterZones, icsFile, isValidZone, todayIso, type Shown } from './logic';

const SEARCH =
	'input input-bordered min-h-11 w-full border-base-100/20 bg-primary text-base text-base-100 placeholder:text-base-100/40 focus:border-neutral focus:outline-secondary';

function ZonePicker({ label, value, onChange, zones }: Readonly<{ label: string; value: string; onChange: (v: string) => void; zones: ReturnType<typeof allZones> }>) {
	const [query, setQuery] = useState('');
	const shown = useMemo(() => {
		const f = filterZones(zones, query);
		const current = zones.find((z) => z.value === value) ?? { value, label: value.replace(/_/g, ' ') };
		return f.some((z) => z.value === value) ? f : [current, ...f];
	}, [zones, query, value]);
	return (
		<div className="grid gap-2">
			<Field label={`Search ${label.toLowerCase()}`} hint="Type a city or zone name, such as Chicago or Tokyo.">
				{(id, describedBy) => (
					<input id={id} aria-describedby={describedBy} type="search" value={query} onChange={(e) => setQuery(e.target.value)} className={SEARCH} />
				)}
			</Field>
			<Select label={label} value={value} onChange={onChange} options={shown} />
		</div>
	);
}

function Result({ title, s }: Readonly<{ title: string; s: Shown }>) {
	return (
		<div className="rounded-box border border-base-100/10 bg-primary p-4">
			<p className="text-sm text-base-100/70">{title}</p>
			<p className="mt-1 text-2xl font-semibold tabular-nums text-base-100">
				{s.time} <span className="text-base text-base-100/70">({s.zoneName})</span>
			</p>
			<p className="mt-1 text-base-100">
				{s.day}, {s.date}
			</p>
		</div>
	);
}

export default function InterviewTimeZoneConverterTool() {
	const [date, setDate] = useState('');
	const [time, setTime] = useState('09:00');
	const [minutes, setMinutes] = useState('30');
	const [interviewerZone, setInterviewerZone] = useState('America/New_York');
	const [yourZone, setYourZone] = useState('America/New_York');
	const [zones, setZones] = useState(() => allZones([]));

	// Read the browser zone and the full zone list after the first render, so the server and browser HTML match.
	useEffect(() => {
		setYourZone(browserZone());
		setZones(allZones());
		setDate(todayIso());
	}, []);

	const zoneOptions = useMemo(() => {
		const have = new Set(zones.map((z) => z.value));
		return isValidZone(yourZone) && !have.has(yourZone) ? [{ value: yourZone, label: yourZone.replace(/_/g, ' ') }, ...zones] : zones;
	}, [zones, yourZone]);

	const result = useMemo(
		() => convert({ date, time, interviewerZone, yourZone, minutes: Number(minutes) }),
		[date, time, interviewerZone, yourZone, minutes],
	);
	const text = result ? confirmationText(result) : '';

	return (
		<ToolCard>
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
				<TextInput label="Interview date" type="date" value={date} onChange={setDate} />
				<TextInput label="Interview time (interviewer’s time)" type="time" value={time} onChange={setTime} />
				<ZonePicker label="Interviewer’s time zone" value={interviewerZone} onChange={setInterviewerZone} zones={zoneOptions} />
				<ZonePicker label="Your time zone" value={yourZone} onChange={setYourZone} zones={zoneOptions} />
				<TextInput
					label="Length in minutes"
					type="number"
					inputMode="numeric"
					min={5}
					max={1440}
					value={minutes}
					onChange={setMinutes}
					hint="Used for the calendar file."
				/>
			</form>

			<div className="mt-6" aria-live="polite">
				{result ? (
					<>
						<div className="grid gap-4 sm:grid-cols-2">
							<Result title="In the interviewer’s zone" s={result.interviewer} />
							<Result title="In your zone" s={result.you} />
						</div>
						{result.dateDiffers && (
							<p role="status" className="mt-4 rounded-box border border-secondary/50 bg-secondary/10 p-3 text-sm text-base-100">
								Check the date. It is {result.interviewer.day} for the interviewer, and {result.you.day} for you.
							</p>
						)}
						<div className="mt-4 rounded-box border border-base-100/10 bg-primary p-4">
							<h3 className="text-sm font-medium text-base-100/70">Confirmation text</h3>
							<p className="mt-2 break-words text-base-100">{text}</p>
						</div>
						<div className="mt-4 flex flex-wrap gap-3">
							<CopyButton text={text} label="Copy confirmation" />
							<button
								type="button"
								className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-neutral hover:bg-primary hover:text-base-100"
								onClick={() => downloadFile('interview.ics', icsFile(result, interviewerZone, yourZone), 'text/calendar;charset=utf-8')}
							>
								Download calendar file (.ics)
							</button>
						</div>
					</>
				) : (
					<p className="text-base-100/70">Enter a date, a time, and two time zones to see the result.</p>
				)}
			</div>
		</ToolCard>
	);
}
