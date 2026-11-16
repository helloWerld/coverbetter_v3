'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_RESUMES } from '@/lib/resume-limit';
import AddResume from './AddResume';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { formatDate, type ResumeView } from './types';

/** One saved resume as a small white page. It shows the title and the date, not the text. */
function PaperCard({ r, onOpen }: Readonly<{ r: ResumeView; onOpen: () => void }>) {
	return (
		<button
			type="button"
			onClick={onOpen}
			className="group flex aspect-[8.5/11] w-full flex-col rounded-sm bg-white p-4 text-left text-black shadow-lg shadow-black/40 transition-transform duration-200 hover:shadow-secondary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral motion-safe:hover:scale-[1.04] motion-safe:focus-visible:scale-[1.04]"
		>
			<span className="sr-only">Open </span>
			<span className="line-clamp-4 break-words font-medium leading-snug">{r.title}</span>
			<span className="mt-1 text-xs text-black/60">
				{r.fileName ? 'Uploaded' : 'Added'} {formatDate(r.createdAt)}
			</span>
			{/* Lines that look like text. They are only a picture of a page. */}
			<span aria-hidden="true" className="mt-auto flex flex-col gap-1.5">
				{[100, 85, 92, 60, 88, 70].map((w, i) => (
					<span key={i} className="h-1 rounded-full bg-black/10" style={{ width: `${w}%` }} />
				))}
			</span>
		</button>
	);
}

export default function ResumesManager({ resumes }: Readonly<{ resumes: ResumeView[] }>) {
	const router = useRouter();
	const [editId, setEditId] = useState<string | null>(null);
	const [hint, setHint] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const editing = resumes.find((r) => r.id === editId) ?? null;
	const deleting = resumes.find((r) => r.id === deleteId) ?? null;
	const pct = Math.round((100 * resumes.length) / MAX_RESUMES);

	function created(id: string, fromFile: boolean) {
		router.refresh();
		setHint(fromFile);
		setEditId(id);
	}

	return (
		<>
			<AddResume count={resumes.length} onCreated={created} />

			<section aria-labelledby="saved-resumes" className="flex flex-col gap-4">
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<h2 id="saved-resumes" className="text-2xl font-extralight text-base-100">
						Saved resumes
					</h2>
					<p id="saved-count" className="tabular-nums text-base-100/70" aria-live="polite">
						{resumes.length} of {MAX_RESUMES}
					</p>
				</div>
				<div
					role="progressbar"
					aria-labelledby="saved-resumes"
					aria-describedby="saved-count"
					aria-valuemin={0}
					aria-valuemax={MAX_RESUMES}
					aria-valuenow={resumes.length}
					className="h-2 w-full overflow-hidden rounded-full bg-base-100/10"
				>
					<div className={`h-full rounded-full transition-[width] duration-300 ${resumes.length >= MAX_RESUMES ? 'bg-accent' : 'bg-secondary'}`} style={{ width: `${pct}%` }} />
				</div>

				{resumes.length === 0 ? (
					<p className="rounded-box border border-dashed border-base-100/20 p-8 text-center text-base-100/70">
						No resumes saved yet. Upload a PDF or DOCX file, or paste your text above.
					</p>
				) : (
					<ul className="grid grid-cols-2 gap-5 pt-2 sm:grid-cols-3 lg:grid-cols-5">
						{resumes.map((r) => (
							<li key={r.id}>
								<PaperCard
									r={r}
									onOpen={() => {
										setHint(false);
										setEditId(r.id);
									}}
								/>
							</li>
						))}
					</ul>
				)}
			</section>

			<EditDialog
				resume={editing}
				showHint={hint}
				onClose={() => setEditId(null)}
				onDelete={(id) => {
					setEditId(null);
					setDeleteId(id);
				}}
			/>
			<DeleteDialog resume={deleting} onClose={() => setDeleteId(null)} />
		</>
	);
}
