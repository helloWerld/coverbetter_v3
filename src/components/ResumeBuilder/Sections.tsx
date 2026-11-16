'use client';

import { moveEntryBullet, moveItem, setRewrite, splitSelected, toggleEntry, toggleEntryBullet, toggleId } from './helpers';
import { BulletRow, Check, MoveButtons, fieldClass, focusRing } from './parts';
import type { Profile, TailoredSelection } from '@/lib/profile/types';

type Update = (fn: (s: TailoredSelection) => TailoredSelection) => void;
type Props = Readonly<{ profile: Profile; sel: TailoredSelection; update: Update }>;

const box = 'rounded-box border border-base-100/10 bg-base-300 p-4 sm:p-5';

function Group({ title, hint, children }: Readonly<{ title: string; hint?: string; children: React.ReactNode }>) {
	return (
		<section className={box}>
			<h3 className="text-lg text-base-100">{title}</h3>
			{hint && <p className="mt-1 text-sm text-base-100/60">{hint}</p>}
			<div className="mt-3">{children}</div>
		</section>
	);
}

export function SummaryGroup({ profile, sel, update }: Props) {
	return (
		<Group title="Summary" hint="Pick a summary from your profile, or write one for this job. Leave it empty for no summary.">
			{profile.summaries.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-2">
					{profile.summaries.map((s, i) => (
						<button
							key={s.id}
							type="button"
							className={`btn btn-sm min-h-11 ${sel.summary === s.text ? 'btn-secondary' : 'btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100'} ${focusRing}`}
							aria-pressed={sel.summary === s.text}
							onClick={() => update((x) => ({ ...x, summary: s.text }))}
						>
							Use summary {i + 1}
						</button>
					))}
				</div>
			)}
			<label htmlFor="rb-summary" className="mb-1 block text-sm text-base-100/70">
				Summary text
			</label>
			<textarea
				id="rb-summary"
				className={`${fieldClass} min-h-28`}
				maxLength={1500}
				value={sel.summary}
				onChange={(e) => update((x) => ({ ...x, summary: e.target.value }))}
			/>
		</Group>
	);
}

type EntryKind = 'positions' | 'projects';

function EntryGroup({
	kind,
	title,
	profile,
	sel,
	update,
}: Props & Readonly<{ kind: EntryKind; title: string }>) {
	const items = kind === 'positions' ? profile.positions : profile.projects;
	const entries = sel[kind];
	const all = items.map((x) => x.id);
	const { selected, rest } = splitSelected(
		entries.map((e) => e.id),
		all,
	);
	const label = (id: string) => {
		const x = items.find((i) => i.id === id);
		if (!x) return '';
		if ('company' in x) return [x.title, x.company].filter(Boolean).join(' at ') || 'Untitled job';
		return x.name || 'Untitled project';
	};
	const set = (fn: (e: typeof entries) => typeof entries) => update((s) => ({ ...s, [kind]: fn(s[kind]) }));
	const visible = (id: string) => (items.find((i) => i.id === id)?.bullets ?? []).filter((b) => !b.hidden);

	if (items.length === 0) return null;
	return (
		<Group title={title}>
			<ul className="flex flex-col gap-3">
				{[...selected, ...rest].map((id) => {
					const on = selected.includes(id);
					const idx = selected.indexOf(id);
					const entry = entries.find((e) => e.id === id);
					const bullets = visible(id);
					const orderAll = bullets.map((b) => b.id);
					const { selected: chosen, rest: unchosen } = splitSelected(entry?.bullets ?? [], orderAll);
					return (
						<li key={id} className="rounded-box border border-base-100/10 p-3">
							<div className="flex flex-wrap items-center gap-x-2">
								<Check
									checked={on}
									onChange={() => set((e) => toggleEntry(e, id, all, orderAll) as typeof entries)}
									className="font-medium"
								>
									{label(id)}
								</Check>
								{on && (
									<MoveButtons
										name={label(id)}
										canBack={idx > 0}
										canForward={idx < selected.length - 1}
										onMove={(d) =>
											set((e) => {
												const ids = moveItem(
													e.map((x) => x.id),
													idx,
													d,
												);
												return ids.map((i) => e.find((x) => x.id === i)!);
											})
										}
									/>
								)}
							</div>
							{on && (
								<ul className="mt-2 flex flex-col gap-2 sm:ml-6">
									{bullets.length === 0 && <li className="text-sm text-base-100/60">No bullets in your profile for this item.</li>}
									{[...chosen, ...unchosen].map((bid) => {
										const b = bullets.find((x) => x.id === bid)!;
										const on2 = chosen.includes(bid);
										return (
											<BulletRow
												key={bid}
												id={bid}
												original={b.text}
												rewrite={sel.rewrites[bid]}
												checked={on2}
												index={chosen.indexOf(bid)}
												count={chosen.length}
												onToggle={() => set((e) => toggleEntryBullet(e, id, bid, orderAll) as typeof entries)}
												onMove={(d) => set((e) => moveEntryBullet(e, id, chosen.indexOf(bid), d) as typeof entries)}
												onRewrite={(t) => update((s) => ({ ...s, rewrites: setRewrite(s.rewrites, bid, t, b.text) }))}
											/>
										);
									})}
								</ul>
							)}
						</li>
					);
				})}
			</ul>
		</Group>
	);
}

export const ExperienceGroup = (p: Props) => <EntryGroup {...p} kind="positions" title="Experience" />;
export const ProjectsGroup = (p: Props) => <EntryGroup {...p} kind="projects" title="Projects" />;

type IdKind = 'education' | 'certifications' | 'other';

function IdGroup({ kind, title, labels, sel, update }: Readonly<{ kind: IdKind; title: string; labels: { id: string; label: string }[]; sel: TailoredSelection; update: Update }>) {
	if (labels.length === 0) return null;
	const all = labels.map((l) => l.id);
	const { selected, rest } = splitSelected(sel[kind], all);
	const name = (id: string) => labels.find((l) => l.id === id)?.label ?? '';
	return (
		<Group title={title}>
			<ul className="flex flex-col gap-2">
				{[...selected, ...rest].map((id) => {
					const idx = selected.indexOf(id);
					return (
						<li key={id} className="flex flex-wrap items-center gap-x-2 rounded-box border border-base-100/10 px-3">
							<Check checked={idx !== -1} onChange={() => update((s) => ({ ...s, [kind]: toggleId(s[kind], id, all) }))}>
								{name(id)}
							</Check>
							{idx !== -1 && (
								<MoveButtons
									name={name(id)}
									canBack={idx > 0}
									canForward={idx < selected.length - 1}
									onMove={(d) => update((s) => ({ ...s, [kind]: moveItem(selected, idx, d) }))}
								/>
							)}
						</li>
					);
				})}
			</ul>
		</Group>
	);
}

export function ListGroups({ profile, sel, update }: Props) {
	return (
		<>
			<IdGroup
				kind="education"
				title="Education"
				sel={sel}
				update={update}
				labels={profile.education.map((e) => ({ id: e.id, label: [e.degree, e.field, e.school].filter(Boolean).join(', ') || 'Education' }))}
			/>
			<IdGroup
				kind="certifications"
				title="Certifications"
				sel={sel}
				update={update}
				labels={profile.certifications.map((c) => ({ id: c.id, label: [c.name, c.issuer].filter(Boolean).join(', ') || 'Certification' }))}
			/>
			<IdGroup
				kind="other"
				title="Other"
				sel={sel}
				update={update}
				labels={profile.other.map((o) => ({ id: o.id, label: [o.title, o.organization].filter(Boolean).join(', ') || 'Other item' }))}
			/>
		</>
	);
}

export function SkillsGroup({ profile, sel, update }: Props) {
	if (profile.skills.length === 0) return null;
	const all = profile.skills.map((s) => s.id);
	const { selected, rest } = splitSelected(sel.skills, all);
	const name = (id: string) => profile.skills.find((s) => s.id === id)?.name ?? '';
	const chip = 'inline-flex items-center gap-1 rounded-full border px-1 py-1';
	return (
		<Group title="Skills" hint="Tick a skill to add it. Use the arrows to move a chosen skill.">
			<ul className="flex flex-wrap gap-2" aria-label="Chosen skills">
				{selected.map((id, i) => (
					<li key={id} className={`${chip} border-secondary bg-secondary/10`}>
						<button
							type="button"
							className={`min-h-11 rounded-full px-3 text-base-100 ${focusRing}`}
							aria-pressed
							aria-label={`Remove skill ${name(id)}`}
							onClick={() => update((s) => ({ ...s, skills: toggleId(s.skills, id, all) }))}
						>
							{name(id)}
						</button>
						<MoveButtons
							horizontal
							name={`skill ${name(id)}`}
							canBack={i > 0}
							canForward={i < selected.length - 1}
							onMove={(d) => update((s) => ({ ...s, skills: moveItem(selected, i, d) }))}
						/>
					</li>
				))}
			</ul>
			{rest.length > 0 && (
				<>
					<p className="mb-2 mt-4 text-sm text-base-100/60">Not on this resume</p>
					<ul className="flex flex-wrap gap-2">
						{rest.map((id) => (
							<li key={id}>
								<button
									type="button"
									className={`min-h-11 rounded-full border border-base-100/20 px-4 text-base-100 ${focusRing}`}
									aria-pressed={false}
									aria-label={`Add skill ${name(id)}`}
									onClick={() => update((s) => ({ ...s, skills: toggleId(s.skills, id, all) }))}
								>
									{name(id)}
								</button>
							</li>
						))}
					</ul>
				</>
			)}
		</Group>
	);
}
