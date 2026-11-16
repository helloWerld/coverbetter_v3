import { newItemId, type Bullet, type Profile } from '@/lib/profile/types';

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** Add items that are not yet in the list. A key function says when two items are the same. */
function union<T extends { id: string }>(
	base: T[],
	incoming: T[],
	key: (item: T) => string,
	prefix: string,
	max: number,
): T[] {
	const keys = new Set(base.map(key));
	const ids = new Set(base.map((b) => b.id));
	const out = [...base];
	for (const item of incoming) {
		const k = key(item);
		if (keys.has(k) || out.length >= max) continue;
		keys.add(k);
		const id = ids.has(item.id) ? newItemId(prefix) : item.id;
		ids.add(id);
		out.push({ ...item, id });
	}
	return out;
}

/** Merge an imported profile into the current one. Nothing the user typed is lost. */
export function mergeProfiles(current: Profile, incoming: Profile): Profile {
	const basics = { ...current.basics };
	for (const k of ['name', 'headline', 'email', 'phone', 'location'] as const) {
		if (!basics[k].trim()) basics[k] = incoming.basics[k];
	}
	const urls = new Set(basics.links.map((l) => norm(l.url)));
	const links = [...basics.links];
	for (const l of incoming.basics.links) {
		if (links.length >= 8 || urls.has(norm(l.url))) continue;
		urls.add(norm(l.url));
		links.push(l);
	}
	basics.links = links;

	return {
		...current,
		basics,
		summaries: union(current.summaries, incoming.summaries, (s) => norm(s.text), 'sum', 10),
		headlines: union(current.headlines, incoming.headlines, (h) => norm(h.text), 'hl', 10),
		positions: union(
			current.positions,
			incoming.positions,
			(p) => [norm(p.company), norm(p.title), p.start].join('|'),
			'pos',
			60,
		),
		education: union(
			current.education,
			incoming.education,
			(e) => [norm(e.school), norm(e.degree), e.start].join('|'),
			'edu',
			20,
		),
		certifications: union(
			current.certifications,
			incoming.certifications,
			(c) => [norm(c.name), norm(c.issuer)].join('|'),
			'cert',
			60,
		),
		skills: union(current.skills, incoming.skills, (s) => norm(s.name), 'skl', 200),
		projects: union(current.projects, incoming.projects, (p) => norm(p.name), 'prj', 40),
		other: union(
			current.other,
			incoming.other,
			(o) => [o.kind, norm(o.title), norm(o.organization)].join('|'),
			'oth',
			60,
		),
	};
}

/** Remove empty rows that the schema would reject. The editor keeps them until the user fills them. */
export function cleanProfile(p: Profile): Profile {
	const bullets = (list: Bullet[]) => list.filter((b) => b.text.trim());
	return {
		...p,
		summaries: p.summaries.filter((s) => s.text.trim()),
		headlines: p.headlines.filter((h) => h.text.trim()),
		positions: p.positions.map((x) => ({ ...x, bullets: bullets(x.bullets) })),
		projects: p.projects.map((x) => ({ ...x, bullets: bullets(x.bullets) })),
		skills: p.skills.filter((s) => s.name.trim()),
	};
}
