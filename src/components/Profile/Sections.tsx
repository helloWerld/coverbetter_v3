'use client';

import { useState } from 'react';
import {
	newItemId,
	OTHER_KINDS,
	SKILL_GROUPS,
	type Profile,
	type SkillGroup,
} from '@/lib/profile/types';
import BulletList from './BulletList';
import { linksLens, listLens, type Link } from './lenses';
import { useProfileApi } from './store';
import {
	AddButton,
	AutoTextarea,
	DateField,
	fieldClass,
	ItemCard,
	labelClass,
	RowControls,
	Section,
	SelectField,
	TextField,
	dateRange,
	formatDate,
	btnClass,
} from './ui';

const summariesLens = listLens('summaries');
const headlinesLens = listLens('headlines');
const positionsLens = listLens('positions');
const educationLens = listLens('education');
const certsLens = listLens('certifications');
const skillsLens = listLens('skills');
const projectsLens = listLens('projects');
const otherLens = listLens('other');

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const join = (parts: string[], sep: string) => parts.filter(Boolean).join(sep);

export function BasicsSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	const b = profile.basics;
	return (
		<Section id="section-basics" title="Basics">
			<div className="grid gap-4 sm:grid-cols-2">
				<TextField label="Full name" value={b.name} autoComplete="name" onChange={(name) => api.patchBasics({ name })} />
				<TextField label="Main headline" value={b.headline} placeholder="For example: Data analyst" onChange={(headline) => api.patchBasics({ headline })} />
				<TextField label="Email" type="email" value={b.email} autoComplete="email" onChange={(email) => api.patchBasics({ email })} />
				<TextField label="Phone" type="tel" value={b.phone} autoComplete="tel" onChange={(phone) => api.patchBasics({ phone })} />
				<TextField label="Location" value={b.location} autoComplete="address-level2" onChange={(location) => api.patchBasics({ location })} />
			</div>
			<div>
				<h3 className="mb-1 text-base text-base-100">Other headlines</h3>
				<p className="mb-3">Add a headline for each type of role that you apply for. Each resume can use a different headline.</p>
				<ul className="flex flex-col gap-3">
					{profile.headlines.map((h, i) => (
						<li key={h.id} className="rounded-box border border-base-100/10 p-3">
							<TextField label={`Headline ${i + 2}`} value={h.text} maxLength={200} placeholder="For example: Business intelligence lead" onChange={(text) => api.patch(headlinesLens, i, { text })} />
							<div className="mt-3">
								<RowControls lens={headlinesLens} index={i} count={profile.headlines.length} label={`headline ${i + 2}`} />
							</div>
						</li>
					))}
				</ul>
				{profile.headlines.length < 10 && (
					<div className="mt-3">
						<AddButton
							onClick={() => {
								const id = newItemId('hl');
								api.add(headlinesLens, { id, text: '' }, id);
							}}
						>
							Add a headline
						</AddButton>
					</div>
				)}
			</div>
		</Section>
	);
}

/** Common links. A click adds the link with this name. "Other link" adds one with no name. */
const LINK_SUGGESTIONS = ['LinkedIn', 'Portfolio', 'Personal website', 'GitHub', 'X (Twitter)', 'Instagram', 'Behance', 'Dribbble', 'YouTube'];

export function LinksSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	const links = profile.basics.links;
	const used = new Set(links.map((l) => l.label.trim().toLowerCase()));
	const full = links.length >= 8;
	return (
		<Section id="section-links" title="Links">
			<p>Add the links that an employer can open, for example your LinkedIn profile or your portfolio. You can add up to 8.</p>
			{links.length > 0 && (
				<ul className="flex flex-col gap-3">
					{links.map((l: Link, i) => (
						<li key={i} className="rounded-box border border-base-100/10 p-3">
							<div className="grid gap-3 sm:grid-cols-2">
								<TextField label={`Link ${i + 1} name`} value={l.label} placeholder="For example: Portfolio" onChange={(label) => api.patch(linksLens, i, { label })} />
								<TextField label={`Link ${i + 1} address`} type="url" value={l.url} placeholder="https://" onChange={(url) => api.patch(linksLens, i, { url })} />
							</div>
							<div className="mt-3">
								<RowControls lens={linksLens} index={i} count={links.length} label={`link ${i + 1}`} />
							</div>
						</li>
					))}
				</ul>
			)}
			{full ? (
				<p>You have 8 links. Delete a link to add another one.</p>
			) : (
				<div>
					<h3 className="mb-2 text-base text-base-100">Add a link</h3>
					<ul className="flex flex-wrap gap-2">
						{LINK_SUGGESTIONS.filter((name) => !used.has(name.toLowerCase())).map((name) => (
							<li key={name}>
								<button
									type="button"
									onClick={() => api.add(linksLens, { label: name, url: '' })}
									className="btn btn-sm btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11"
								>
									<span aria-hidden="true">+</span> {name}
								</button>
							</li>
						))}
						<li>
							<button
								type="button"
								onClick={() => api.add(linksLens, { label: '', url: '' })}
								className="btn btn-sm btn-secondary min-h-11"
							>
								<span aria-hidden="true">+</span> Other link
							</button>
						</li>
					</ul>
				</div>
			)}
		</Section>
	);
}

export function SummariesSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-summaries" title="Summaries">
			<p>Write one or more short summaries. CoverBetter picks the best one for each job.</p>
			<ul className="flex flex-col gap-3">
				{profile.summaries.map((s, i) => (
					<ItemCard
						key={s.id}
						id={s.id}
						title={s.text.trim().slice(0, 60) || `Summary ${i + 1}`}
						lens={summariesLens}
						index={i}
						count={profile.summaries.length}
					>
						<AutoTextarea label="Summary" value={s.text} maxLength={1500} minRows={3} onChange={(text) => api.patch(summariesLens, i, { text })} />
					</ItemCard>
				))}
			</ul>
			{profile.summaries.length < 10 && (
				<AddButton
					onClick={() => {
						const id = newItemId('sum');
						api.add(summariesLens, { id, text: '' }, id);
					}}
				>
					Add summary
				</AddButton>
			)}
		</Section>
	);
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Self-employed'];

export function PositionsSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-positions" title="Work history">
			<datalist id="employment-types">
				{EMPLOYMENT_TYPES.map((t) => (
					<option key={t} value={t} />
				))}
			</datalist>
			<ul className="flex flex-col gap-3">
				{profile.positions.map((p, i) => {
					const title = p.title && p.company ? `${p.title} at ${p.company}` : p.title || p.company || `Position ${i + 1}`;
					const meta = join([dateRange(p.start, p.end, p.current), plural(p.bullets.length, 'bullet')], ' · ');
					const patch = (change: Partial<typeof p>) => api.patch(positionsLens, i, change);
					return (
						<ItemCard key={p.id} id={p.id} title={title} meta={meta} lens={positionsLens} index={i} count={profile.positions.length}>
							<div className="grid gap-4 sm:grid-cols-2">
								<TextField label="Job title" value={p.title} onChange={(title) => patch({ title })} />
								<TextField label="Company" value={p.company} onChange={(company) => patch({ company })} />
								<TextField label="Location" value={p.location} onChange={(location) => patch({ location })} />
								<TextField label="Employment type" value={p.employmentType} list="employment-types" onChange={(employmentType) => patch({ employmentType })} />
								<DateField label="Start date" value={p.start} onChange={(start) => patch({ start })} />
								<DateField label="End date" value={p.current ? '' : p.end} onChange={(end) => patch({ end })} />
							</div>
							<label className="flex min-h-11 cursor-pointer items-center gap-2 text-base-100">
								<input
									type="checkbox"
									className="checkbox checkbox-sm"
									checked={p.current}
									onChange={(e) => patch(e.target.checked ? { current: true, end: '' } : { current: false })}
								/>
								I work here now
							</label>
							<BulletList kind="positions" parentId={p.id} bullets={p.bullets} />
						</ItemCard>
					);
				})}
			</ul>
			{profile.positions.length < 60 && (
				<AddButton
					onClick={() => {
						const id = newItemId('pos');
						api.add(
							positionsLens,
							{ id, company: '', title: '', location: '', start: '', end: '', current: false, employmentType: '', bullets: [] },
							id,
						);
					}}
				>
					Add position
				</AddButton>
			)}
		</Section>
	);
}

export function EducationSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-education" title="Education">
			<ul className="flex flex-col gap-3">
				{profile.education.map((e, i) => {
					const title = join([e.degree, e.school], ' at ') || `School ${i + 1}`;
					const patch = (change: Partial<typeof e>) => api.patch(educationLens, i, change);
					return (
						<ItemCard key={e.id} id={e.id} title={title} meta={dateRange(e.start, e.end, false)} lens={educationLens} index={i} count={profile.education.length}>
							<div className="grid gap-4 sm:grid-cols-2">
								<TextField label="School" value={e.school} onChange={(school) => patch({ school })} />
								<TextField label="Degree" value={e.degree} onChange={(degree) => patch({ degree })} />
								<TextField label="Field of study" value={e.field} onChange={(field) => patch({ field })} />
								<TextField label="GPA" value={e.gpa} onChange={(gpa) => patch({ gpa })} />
								<DateField label="Start date" value={e.start} onChange={(start) => patch({ start })} />
								<DateField label="End date" value={e.end} onChange={(end) => patch({ end })} />
							</div>
							<TextField label="Honors" value={e.honors} onChange={(honors) => patch({ honors })} />
							<AutoTextarea label="Courses" value={e.courses} maxLength={500} onChange={(courses) => patch({ courses })} />
						</ItemCard>
					);
				})}
			</ul>
			{profile.education.length < 20 && (
				<AddButton
					onClick={() => {
						const id = newItemId('edu');
						api.add(educationLens, { id, school: '', degree: '', field: '', start: '', end: '', gpa: '', honors: '', courses: '' }, id);
					}}
				>
					Add education
				</AddButton>
			)}
		</Section>
	);
}

export function CertificationsSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-certifications" title="Certifications">
			<ul className="flex flex-col gap-3">
				{profile.certifications.map((c, i) => {
					const patch = (change: Partial<typeof c>) => api.patch(certsLens, i, change);
					return (
						<ItemCard
							key={c.id}
							id={c.id}
							title={c.name || `Certification ${i + 1}`}
							meta={join([c.issuer, formatDate(c.date)], ' · ')}
							lens={certsLens}
							index={i}
							count={profile.certifications.length}
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<TextField label="Name" value={c.name} onChange={(name) => patch({ name })} />
								<TextField label="Issuer" value={c.issuer} onChange={(issuer) => patch({ issuer })} />
								<DateField label="Date earned" value={c.date} onChange={(date) => patch({ date })} />
								<DateField label="Expires" value={c.expires} onChange={(expires) => patch({ expires })} />
								<TextField label="Credential ID" value={c.credentialId} onChange={(credentialId) => patch({ credentialId })} />
								<TextField label="Credential address" type="url" value={c.url} onChange={(url) => patch({ url })} />
							</div>
						</ItemCard>
					);
				})}
			</ul>
			{profile.certifications.length < 60 && (
				<AddButton
					onClick={() => {
						const id = newItemId('cert');
						api.add(certsLens, { id, name: '', issuer: '', date: '', expires: '', credentialId: '', url: '' }, id);
					}}
				>
					Add certification
				</AddButton>
			)}
		</Section>
	);
}


const GROUP_LABEL: Record<SkillGroup, string> = {
	technical: 'Technical',
	tool: 'Tools',
	soft: 'Soft skills',
	language: 'Languages',
	other: 'Other',
};

export function SkillsSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	const [text, setText] = useState('');
	const [group, setGroup] = useState<SkillGroup>('technical');

	function commit(raw: string) {
		const names = raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const have = new Set(profile.skills.map((s) => s.name.toLowerCase()));
		for (const name of names) {
			if (have.has(name.toLowerCase()) || have.size >= 200) continue;
			have.add(name.toLowerCase());
			api.add(skillsLens, { id: newItemId('skl'), name: name.slice(0, 80), group });
		}
		setText('');
	}

	return (
		<Section id="section-skills" title="Skills">
			<div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
				<div>
					<label htmlFor="skill-add" className={labelClass}>
						Add a skill
					</label>
					<input
						id="skill-add"
						value={text}
						className={fieldClass}
						placeholder="Type a skill. Press Enter or comma."
						onChange={(e) => {
							const v = e.target.value;
							if (v.includes(',')) commit(v);
							else setText(v);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								commit(text);
							}
						}}
						onBlur={() => text.trim() && commit(text)}
					/>
				</div>
				<div>
					<label htmlFor="skill-group" className={labelClass}>
						Group for new skills
					</label>
					<select id="skill-group" value={group} onChange={(e) => setGroup(e.target.value as SkillGroup)} className={fieldClass}>
						{SKILL_GROUPS.map((g) => (
							<option key={g} value={g}>
								{GROUP_LABEL[g]}
							</option>
						))}
					</select>
				</div>
			</div>
			{SKILL_GROUPS.map((g) => {
				const rows = profile.skills.map((s, i) => ({ s, i })).filter((r) => r.s.group === g);
				if (rows.length === 0) return null;
				return (
					<div key={g}>
						<h3 className="mb-2 text-base text-base-100">{GROUP_LABEL[g]}</h3>
						<ul className="flex flex-wrap gap-2">
							{rows.map(({ s, i }) => (
								<li key={s.id} className="flex items-center gap-1 rounded-box border border-base-100/10 bg-base-300 pl-3">
									<span className="break-all text-base-100">{s.name}</span>
									<select
										aria-label={`Group for ${s.name}`}
										value={s.group}
										onChange={(e) => api.patch(skillsLens, i, { group: e.target.value as SkillGroup })}
										className="min-h-11 w-24 bg-transparent px-1 text-sm text-base-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-base-100"
									>
										{SKILL_GROUPS.map((o) => (
											<option key={o} value={o}>
												{GROUP_LABEL[o]}
											</option>
										))}
									</select>
									<button type="button" className={`${btnClass} border-0`} aria-label={`Remove ${s.name}`} onClick={() => api.remove(skillsLens, i, s.name)}>
										<span aria-hidden>×</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				);
			})}
		</Section>
	);
}

export function ProjectsSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-projects" title="Projects">
			<ul className="flex flex-col gap-3">
				{profile.projects.map((p, i) => {
					const patch = (change: Partial<typeof p>) => api.patch(projectsLens, i, change);
					const meta = join([p.role, dateRange(p.start, p.end, false), plural(p.bullets.length, 'bullet')], ' · ');
					return (
						<ItemCard key={p.id} id={p.id} title={p.name || `Project ${i + 1}`} meta={meta} lens={projectsLens} index={i} count={profile.projects.length}>
							<div className="grid gap-4 sm:grid-cols-2">
								<TextField label="Project name" value={p.name} onChange={(name) => patch({ name })} />
								<TextField label="Your role" value={p.role} onChange={(role) => patch({ role })} />
								<DateField label="Start date" value={p.start} onChange={(start) => patch({ start })} />
								<DateField label="End date" value={p.end} onChange={(end) => patch({ end })} />
							</div>
							<TextField label="Address" type="url" value={p.url} onChange={(url) => patch({ url })} />
							<BulletList kind="projects" parentId={p.id} bullets={p.bullets} />
						</ItemCard>
					);
				})}
			</ul>
			{profile.projects.length < 40 && (
				<AddButton
					onClick={() => {
						const id = newItemId('prj');
						api.add(projectsLens, { id, name: '', role: '', start: '', end: '', url: '', bullets: [] }, id);
					}}
				>
					Add project
				</AddButton>
			)}
		</Section>
	);
}

export function OtherSection({ profile }: Readonly<{ profile: Profile }>) {
	const api = useProfileApi();
	return (
		<Section id="section-other" title="Other">
			<p>Add volunteer work, awards, publications, and spoken languages.</p>
			<ul className="flex flex-col gap-3">
				{profile.other.map((o, i) => {
					const patch = (change: Partial<typeof o>) => api.patch(otherLens, i, change);
					return (
						<ItemCard
							key={o.id}
							id={o.id}
							title={o.title || `Item ${i + 1}`}
							meta={join([o.kind, o.organization, formatDate(o.date)], ' · ')}
							lens={otherLens}
							index={i}
							count={profile.other.length}
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<SelectField label="Kind" value={o.kind} options={OTHER_KINDS} onChange={(kind) => patch({ kind: kind as typeof o.kind })} />
								<TextField label="Title" value={o.title} onChange={(title) => patch({ title })} />
								<TextField label="Organization" value={o.organization} onChange={(organization) => patch({ organization })} />
								<DateField label="Date" value={o.date} onChange={(date) => patch({ date })} />
							</div>
							<AutoTextarea label="Description" value={o.description} maxLength={1000} onChange={(description) => patch({ description })} />
						</ItemCard>
					);
				})}
			</ul>
			{profile.other.length < 60 && (
				<AddButton
					onClick={() => {
						const id = newItemId('oth');
						api.add(otherLens, { id, kind: 'volunteer' as const, title: '', organization: '', date: '', description: '' }, id);
					}}
				>
					Add item
				</AddButton>
			)}
		</Section>
	);
}
