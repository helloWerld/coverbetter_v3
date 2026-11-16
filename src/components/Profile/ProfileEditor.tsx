'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveProfileAction } from '@/app/dashboard/profile/actions';
import type { Profile } from '@/lib/profile/types';
import ImportPanel, { type ImportMode, type ImportResult } from './ImportPanel';
import { moveItem, type Lens } from './lenses';
import { cleanProfile, mergeProfiles } from './merge';
import { ProfileApiContext, type ProfileApi } from './store';
import StrengthMeter from './StrengthMeter';
import {
	BasicsSection,
	LinksSection,
	CertificationsSection,
	EducationSection,
	OtherSection,
	PositionsSection,
	ProjectsSection,
	SkillsSection,
	SummariesSection,
} from './Sections';

const AUTOSAVE_MS = 2000;
const UNDO_MS = 6000;

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface UndoState {
	label: string;
	restore: () => void;
}

function isEmpty(p: Profile): boolean {
	return (
		p.positions.length === 0 &&
		p.education.length === 0 &&
		p.skills.length === 0 &&
		p.certifications.length === 0 &&
		p.projects.length === 0 &&
		p.other.length === 0 &&
		p.summaries.length === 0 &&
		!p.basics.name &&
		!p.basics.email
	);
}

export default function ProfileEditor({ initial }: Readonly<{ initial: Profile }>) {
	const [profile, setProfile] = useState<Profile>(initial);
	const [savedJson, setSavedJson] = useState(() => JSON.stringify(cleanProfile(initial)));
	const [status, setStatus] = useState<Status>('idle');
	const [error, setError] = useState('');
	const [undo, setUndo] = useState<UndoState | null>(null);
	const [focusRequest, setFocusRequest] = useState<{ id: string; n: number } | null>(null);
	/** After an import the user checks the data first. Autosave stays off until the first manual save. */
	const [reviewing, setReviewing] = useState(false);
	const [beforeImport, setBeforeImport] = useState<Profile | null>(null);
	const [unsure, setUnsure] = useState<Set<string>>(new Set());

	const fresh = useRef(new Set<string>());
	const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const failedJson = useRef('');
	const focusN = useRef(0);
	const profileRef = useRef(profile);
	useEffect(() => {
		profileRef.current = profile;
	}, [profile]);

	const json = useMemo(() => JSON.stringify(cleanProfile(profile)), [profile]);
	const dirty = json !== savedJson;
	const empty = isEmpty(profile);

	const save = useCallback(async () => {
		setStatus('saving');
		setError('');
		const sent = json;
		let out;
		try {
			out = await saveProfileAction(sent);
		} catch {
			out = { ok: false as const, error: 'The profile did not save. Check your connection and try again.' };
		}
		if (out.ok) {
			setSavedJson(sent);
			setStatus('saved');
			setReviewing(false);
			failedJson.current = '';
		} else {
			failedJson.current = sent;
			setStatus('error');
			setError(out.error);
		}
	}, [json]);

	// Autosave 2 seconds after the last change.
	useEffect(() => {
		if (!dirty || reviewing || status === 'saving' || failedJson.current === json) return;
		const t = setTimeout(save, AUTOSAVE_MS);
		return () => clearTimeout(t);
	}, [dirty, reviewing, status, json, save]);

	// Warn before the user leaves with unsaved changes.
	useEffect(() => {
		if (!dirty && status !== 'saving') return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [dirty, status]);

	useEffect(() => () => clearTimeout(undoTimer.current), []);

	const showUndo = useCallback((u: UndoState) => {
		clearTimeout(undoTimer.current);
		setUndo(u);
		undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
	}, []);

	const api = useMemo<ProfileApi>(() => {
		const apply = <T,>(lens: Lens<T>, fn: (items: T[]) => T[]) =>
			setProfile((p) => lens.set(p, fn(lens.get(p))));
		return {
			add: (lens, item, freshId) => {
				if (freshId) fresh.current.add(freshId);
				apply(lens, (items) => [...items, item]);
			},
			remove: (lens, index, label) => {
				const item = lens.get(profileRef.current)[index];
				if (item === undefined) return;
				setProfile((p) => lens.set(p, lens.get(p).filter((_, i) => i !== index)));
				showUndo({
					label,
					restore: () =>
						setProfile((p) => {
							const items = [...lens.get(p)];
							items.splice(Math.min(index, items.length), 0, item);
							return lens.set(p, items);
						}),
				});
			},
			move: (lens, index, dir) => apply(lens, (items) => moveItem(items, index, dir)),
			patch: (lens, index, change) =>
				apply(lens, (items) => items.map((it, i) => (i === index ? { ...it, ...change } : it))),
			patchBasics: (change) => setProfile((p) => ({ ...p, basics: { ...p.basics, ...change } })),
			isFresh: (id) => fresh.current.has(id),
			isUnsure: (id) => unsure.has(id),
			focusRequest,
		};
	}, [focusRequest, unsure, showUndo]);

	// Open and focus the target of a tip.
	useEffect(() => {
		if (!focusRequest) return;
		const raf = requestAnimationFrame(() => {
			const el = document.getElementById(focusRequest.id);
			if (!el) return;
			el.scrollIntoView({ block: 'start', behavior: 'smooth' });
			el.querySelector<HTMLElement>('input:not([type=checkbox]), textarea, select')?.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(raf);
	}, [focusRequest]);

	const goTo = useCallback((id: string) => setFocusRequest({ id, n: ++focusN.current }), []);

	function applyImport(r: ImportResult, mode: ImportMode) {
		setBeforeImport(profile);
		setProfile(mode === 'replace' ? r.profile : mergeProfiles(profile, r.profile));
		setUnsure(new Set(r.unsure));
		setReviewing(true);
		setStatus('idle');
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function undoImport() {
		if (beforeImport) setProfile(beforeImport);
		setBeforeImport(null);
		setReviewing(false);
		setUnsure(new Set());
	}

	const statusText =
		status === 'saving'
			? 'Saving…'
			: status === 'error'
				? ''
				: dirty
					? reviewing
						? 'Not saved yet'
						: 'Unsaved changes'
					: status === 'saved'
						? 'Saved'
						: '';

	return (
		<ProfileApiContext.Provider value={api}>
			<div className="flex flex-col gap-6 pb-4">
				<StrengthMeter profile={profile} onGoTo={goTo} />
				{reviewing && (
					<div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-warning/50 bg-base-300 p-4 text-base-100">
						<p className="min-w-0">The import is not saved yet. Check the data. Then select Save profile.</p>
						<button type="button" className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11" onClick={undoImport}>
							Undo import
						</button>
					</div>
				)}

				<ImportPanel hasData={!empty} onApply={applyImport} />
				{empty && <p className="-my-2 text-base-100/70">No LinkedIn data? Fill in the sections below by hand.</p>}

				<BasicsSection profile={profile} />
				<LinksSection profile={profile} />
				<SummariesSection profile={profile} />
				<PositionsSection profile={profile} />
				<EducationSection profile={profile} />
				<CertificationsSection profile={profile} />
				<SkillsSection profile={profile} />
				<ProjectsSection profile={profile} />
				<OtherSection profile={profile} />

				<div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-box border border-base-100/10 bg-base-300/95 p-3 backdrop-blur">
					<button type="button" className="btn btn-secondary min-h-11" disabled={status === 'saving' || (!dirty && status !== 'error')} onClick={save}>
						Save profile
					</button>
					<div aria-live="polite" className="min-w-0 text-sm text-base-100/80">
						{statusText}
						{status === 'error' && (
							<span role="alert" className="text-error">
								{error}
							</span>
						)}
					</div>
				</div>

				{undo && (
					<div role="status" className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-md items-center justify-between gap-3 rounded-box border border-base-100/20 bg-base-300 p-3 text-base-100 shadow-lg">
						<span className="min-w-0 break-words">Deleted {undo.label}.</span>
						<button
							type="button"
							className="btn btn-secondary min-h-11"
							onClick={() => {
								undo.restore();
								clearTimeout(undoTimer.current);
								setUndo(null);
							}}
						>
							Undo
						</button>
					</div>
				)}
			</div>
		</ProfileApiContext.Provider>
	);
}
