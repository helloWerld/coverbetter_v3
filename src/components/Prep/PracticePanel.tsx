'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { starChecks, starToText, starWordCount, type StarAnswer } from '@/lib/prep/star';
import { saveAnswerAction } from '@/app/dashboard/applications/[id]/prep/actions';
import CopyButton from './CopyButton';
import {
	appendText,
	EMPTY_STAR,
	formatTimer,
	parseSavedAnswer,
	TARGET_SECONDS,
	wordCount,
	type ProfileItem,
} from './helpers';
import { btnGhost, field, labelClass } from './styles';

const PARTS = [
	['situation', 'Situation', 'Where and when? Give the short background.'],
	['task', 'Task', 'What was your goal or your duty?'],
	['action', 'Action', 'What did you do? Say "I" for your own steps.'],
	['result', 'Result', 'What changed? Add a number if you can.'],
] as const;

function Timer() {
	const [seconds, setSeconds] = useState(0);
	const [running, setRunning] = useState(false);
	const started = useRef(0);
	const base = useRef(0);

	useEffect(() => {
		if (!running) return;
		started.current = Date.now();
		const t = setInterval(() => setSeconds(base.current + Math.floor((Date.now() - started.current) / 1000)), 250);
		return () => clearInterval(t);
	}, [running]);

	function toggle() {
		if (running) base.current = seconds;
		setRunning(!running);
	}
	function reset() {
		setRunning(false);
		base.current = 0;
		setSeconds(0);
	}

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-box border border-base-100/10 bg-base-300 p-4">
			<span role="timer" aria-label="Practice timer" className="min-w-[4.5rem] text-2xl tabular-nums text-base-100">
				{formatTimer(seconds)}
			</span>
			<button type="button" onClick={toggle} className="btn btn-secondary min-h-11">
				{running ? 'Stop' : seconds > 0 ? 'Resume' : 'Start'}
			</button>
			<button type="button" onClick={reset} className={btnGhost}>
				Reset
			</button>
			<p className="w-full text-sm text-base-100/70">
				Aim for about 2 minutes.
				{seconds > TARGET_SECONDS && <span className="text-accent"> You are over 2 minutes. Cut the answer.</span>}
			</p>
		</div>
	);
}

export default function PracticePanel({
	applicationId,
	questionId,
	question,
	star,
	savedJson,
	bullets,
	onSaved,
}: Readonly<{
	applicationId: string;
	questionId: string;
	question: string;
	star: boolean;
	savedJson: string | null;
	bullets: ProfileItem[];
	onSaved: (questionId: string, json: string) => void;
}>) {
	const id = useId();
	const saved = savedJson ? parseSavedAnswer(savedJson) : null;
	const [mode, setMode] = useState<'star' | 'text'>(saved?.mode ?? (star ? 'star' : 'text'));
	const [starAnswer, setStarAnswer] = useState<StarAnswer>(saved?.star ?? EMPTY_STAR);
	const [text, setText] = useState(saved?.text ?? '');
	const [bulletId, setBulletId] = useState('');
	const [status, setStatus] = useState('');
	const [failed, setFailed] = useState(false);
	const [pending, setPending] = useState(false);

	const preview = starToText(starAnswer);
	const hints = starChecks(starAnswer);
	const words = mode === 'star' ? starWordCount(starAnswer) : wordCount(text);
	const bullet = bullets.find((b) => b.id === bulletId);

	function setPart(key: keyof StarAnswer, value: string) {
		setStarAnswer((a) => ({ ...a, [key]: value }));
		setStatus('');
	}

	function insert(key: 'action' | 'result') {
		if (!bullet) return;
		setStarAnswer((a) => ({ ...a, [key]: appendText(a[key], bullet.text) }));
		setStatus('');
	}

	async function save() {
		setPending(true);
		setFailed(false);
		setStatus('Saving…');
		const json = JSON.stringify(mode === 'star' ? { mode, star: starAnswer } : { mode, text });
		const out = await saveAnswerAction(applicationId, questionId, question, json).catch(() => ({ ok: false as const, error: 'We could not save the answer. Try again.' }));
		setPending(false);
		if (out.ok) {
			setStatus('Saved.');
			onSaved(questionId, json);
		} else {
			setFailed(true);
			setStatus(out.error);
		}
	}

	return (
		<div className="mt-4 flex flex-col gap-5 border-t border-base-100/10 pt-5">
			{star && (
				<div role="group" aria-label="Answer format" className="flex flex-wrap gap-2">
					{(['star', 'text'] as const).map((m) => (
						<button
							key={m}
							type="button"
							aria-pressed={mode === m}
							onClick={() => setMode(m)}
							className={`btn min-h-11 ${mode === m ? 'btn-secondary' : 'btn-outline border-base-100/30 text-base-100'}`}
						>
							{m === 'star' ? 'STAR builder' : 'Free text'}
						</button>
					))}
				</div>
			)}

			{mode === 'star' ? (
				<>
					{bullets.length > 0 && (
						<div className="rounded-box border border-base-100/10 bg-base-300 p-4">
							<label htmlFor={`${id}-bullet`} className={labelClass}>
								Use a bullet from my profile
							</label>
							<select id={`${id}-bullet`} value={bulletId} onChange={(e) => setBulletId(e.target.value)} className={`${field} min-h-11`}>
								<option value="">Choose a bullet</option>
								{bullets.map((b) => (
									<option key={b.id} value={b.id}>
										{b.text.length > 90 ? `${b.text.slice(0, 90)}…` : b.text}
									</option>
								))}
							</select>
							{bullet && <p className="mt-2 break-words text-sm text-base-100/70">{bullet.label}: {bullet.text}</p>}
							<div className="mt-3 flex flex-wrap gap-2">
								<button type="button" disabled={!bullet} onClick={() => insert('action')} className={btnGhost}>
									Add to Action
								</button>
								<button type="button" disabled={!bullet} onClick={() => insert('result')} className={btnGhost}>
									Add to Result
								</button>
							</div>
						</div>
					)}
					{PARTS.map(([key, label, hint]) => (
						<div key={key}>
							<label htmlFor={`${id}-${key}`} className={labelClass}>
								{label}
							</label>
							<textarea
								id={`${id}-${key}`}
								rows={3}
								maxLength={3000}
								value={starAnswer[key]}
								onChange={(e) => setPart(key, e.target.value)}
								aria-describedby={`${id}-${key}-hint`}
								className={field}
							/>
							<p id={`${id}-${key}-hint`} className="mt-1 text-sm text-base-100/60">
								{hint}
							</p>
						</div>
					))}
					{hints.length > 0 && (
						<ul className="list-disc pl-5 text-sm text-accent" aria-label="Hints for your answer">
							{hints.map((h) => (
								<li key={h}>{h}</li>
							))}
						</ul>
					)}
					<div className="rounded-box border border-base-100/10 bg-base-300 p-4">
						<h4 className="text-base text-base-100">Preview</h4>
						{preview ? (
							<p className="mt-2 whitespace-pre-wrap break-words text-base-100/80">{preview}</p>
						) : (
							<p className="mt-2 text-base-100/60">Write in the fields. Your answer shows here.</p>
						)}
						<div className="mt-3 flex flex-wrap items-center gap-3">
							<CopyButton text={preview} what="the preview" />
						</div>
					</div>
				</>
			) : (
				<div>
					<label htmlFor={`${id}-text`} className={labelClass}>
						Your answer
					</label>
					<textarea
						id={`${id}-text`}
						rows={7}
						maxLength={6000}
						value={text}
						onChange={(e) => {
							setText(e.target.value);
							setStatus('');
						}}
						className={field}
					/>
				</div>
			)}

			<p className="text-sm text-base-100/70">
				{words} {words === 1 ? 'word' : 'words'}
			</p>

			<Timer />

			<div className="flex flex-wrap items-center gap-3">
				<button type="button" onClick={save} disabled={pending} className="btn btn-secondary min-h-11">
					Save answer
				</button>
				<p aria-live="polite" className={failed ? 'text-error' : 'text-base-100/70'}>
					{status}
				</p>
			</div>
		</div>
	);
}
