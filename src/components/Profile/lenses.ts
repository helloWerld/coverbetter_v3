import type { Basics, Bullet, Profile } from '@/lib/profile/types';

/** A way to read and write one list inside the profile. */
export type Lens<T> = { get: (p: Profile) => T[]; set: (p: Profile, items: T[]) => Profile };

export type Link = Basics['links'][number];
type ListKey = 'summaries' | 'headlines' | 'positions' | 'education' | 'certifications' | 'skills' | 'projects' | 'other';

export function listLens<K extends ListKey>(key: K): Lens<Profile[K][number]> {
	return {
		get: (p) => p[key] as unknown as Profile[K][number][],
		set: (p, items) => ({ ...p, [key]: items }) as Profile,
	};
}

export const linksLens: Lens<Link> = {
	get: (p) => p.basics.links,
	set: (p, links) => ({ ...p, basics: { ...p.basics, links } }),
};

/** The bullets of one position or project, found by the id of the parent. */
export function bulletsLens(kind: 'positions' | 'projects', parentId: string): Lens<Bullet> {
	type Parent = { id: string; bullets: Bullet[] };
	return {
		get: (p) => (p[kind] as Parent[]).find((x) => x.id === parentId)?.bullets ?? [],
		set: (p, bullets) => ({ ...p, [kind]: (p[kind] as Parent[]).map((x) => (x.id === parentId ? { ...x, bullets } : x)) }) as Profile,
	};
}

export function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
	const to = index + dir;
	if (to < 0 || to >= items.length) return items;
	const next = [...items];
	[next[index], next[to]] = [next[to], next[index]];
	return next;
}
