'use client';

import { useId } from 'react';
import { newItemId, type Bullet } from '@/lib/profile/types';
import { bulletsLens } from './lenses';
import { useProfileApi } from './store';
import { AddButton, AutoTextarea, RowControls } from './ui';

/** The bullets of one position or project. */
export default function BulletList({
	kind,
	parentId,
	bullets,
}: Readonly<{ kind: 'positions' | 'projects'; parentId: string; bullets: Bullet[] }>) {
	const api = useProfileApi();
	const lens = bulletsLens(kind, parentId);
	const headingId = useId();
	return (
		<div>
			<h3 id={headingId} className="mb-2 text-base text-base-100">
				Bullets
			</h3>
			<ul aria-labelledby={headingId} className="flex flex-col gap-3">
				{bullets.map((b, i) => {
					const label = `bullet ${i + 1}`;
					return (
						<li key={b.id} className="rounded-box border border-base-100/10 p-3">
							<AutoTextarea
								label={`Bullet ${i + 1}`}
								value={b.text}
								maxLength={500}
								autoFocus={api.isFresh(b.id)}
								onChange={(text) => api.patch(lens, i, { text })}
							/>
							{b.text.trim() && !/[\d%$]/.test(b.text) && <p className="mt-1 text-sm text-accent">Add a number</p>}
							<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
								<label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-base-100">
									<input
										type="checkbox"
										className="checkbox checkbox-sm"
										checked={b.hidden}
										onChange={(e) => api.patch(lens, i, { hidden: e.target.checked })}
									/>
									Never use
								</label>
								<RowControls lens={lens} index={i} count={bullets.length} label={label} />
							</div>
						</li>
					);
				})}
			</ul>
			<div className="mt-3">
				<AddButton
					onClick={() => {
						const id = newItemId('bul');
						api.add(lens, { id, text: '', hidden: false }, id);
					}}
				>
					Add bullet
				</AddButton>
			</div>
		</div>
	);
}
