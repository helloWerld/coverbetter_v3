'use client';

import { createContext, useContext } from 'react';
import type { Basics } from '@/lib/profile/types';
import type { Lens } from './lenses';

/** What the section components can do to the profile. The editor owns the state. */
export interface ProfileApi {
	add<T>(lens: Lens<T>, item: T, freshId?: string): void;
	remove<T>(lens: Lens<T>, index: number, label: string): void;
	move<T>(lens: Lens<T>, index: number, dir: -1 | 1): void;
	patch<T>(lens: Lens<T>, index: number, change: Partial<T>): void;
	patchBasics(change: Partial<Omit<Basics, 'links'>>): void;
	/** True for an item that the user just added. Its card starts open. */
	isFresh(id: string): boolean;
	/** True for an item that the import marked "Check this". */
	isUnsure(id: string): boolean;
	/** Set when the user clicks a tip. The card with this id opens and takes focus. */
	focusRequest: { id: string; n: number } | null;
}

export const ProfileApiContext = createContext<ProfileApi | null>(null);

export function useProfileApi(): ProfileApi {
	const api = useContext(ProfileApiContext);
	if (!api) throw new Error('ProfileApiContext is missing');
	return api;
}
