'use client';

import { useRouter } from 'next/navigation';
import RolePicker, { type RoleOption } from './RolePicker';

/** A RolePicker that keeps the picked role in the URL (`?role=`), so the server page can load it. */
export default function RoutedRolePicker({
	roles,
	selectedId,
	path,
	label,
}: Readonly<{ roles: RoleOption[]; selectedId: string | null; path: string; label?: string }>) {
	const router = useRouter();
	return (
		<RolePicker
			roles={roles}
			selectedId={selectedId}
			label={label}
			onSelect={(id) => router.replace(id ? `${path}?role=${encodeURIComponent(id)}` : path, { scroll: false })}
		/>
	);
}
