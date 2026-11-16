'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_RESUMES } from '@/lib/resume-limit';
import AddResume from './AddResume';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { formatDate, preview, type ResumeView } from './types';

export default function ResumesManager({ resumes }: Readonly<{ resumes: ResumeView[] }>) {
	const router = useRouter();
	const [editId, setEditId] = useState<string | null>(null);
	const [hint, setHint] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const editing = resumes.find((r) => r.id === editId) ?? null;
	const deleting = resumes.find((r) => r.id === deleteId) ?? null;

	function created(id: string, fromFile: boolean) {
		router.refresh();
		setHint(fromFile);
		setEditId(id);
	}

	return (
		<>
			<p className="text-base-100/80" aria-live="polite">
				{resumes.length} of {MAX_RESUMES} saved
			</p>

			{resumes.length === 0 ? (
				<section className="rounded-box border border-dashed border-base-100/20 p-8 text-center">
					<h2 className="text-xl text-base-100">No resumes saved yet</h2>
					<p className="mt-2 text-base-100/70">
						Upload a PDF or DOCX file, or paste your text below. You pick one when you write a letter.
					</p>
				</section>
			) : (
				<ul className="flex flex-col gap-4">
					{resumes.map((r) => (
						<li
							key={r.id}
							className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6"
						>
							<h2 className="break-words text-xl text-base-100">{r.title}</h2>
							<p className="mt-1 break-all text-sm text-base-100/70">
								{r.fileName ?? 'Pasted'} &middot; Updated {formatDate(r.updatedAt)}
							</p>
							<p className="mt-3 break-words text-base-100/70">{preview(r.text)}</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<button
									type="button"
									onClick={() => {
										setHint(false);
										setEditId(r.id);
									}}
									className="btn btn-secondary min-h-11"
								>
									Edit
									<span className="sr-only">, {r.title}</span>
								</button>
								<button
									type="button"
									onClick={() => setDeleteId(r.id)}
									className="btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11"
								>
									Delete
									<span className="sr-only">, {r.title}</span>
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

			<AddResume count={resumes.length} onCreated={created} />
			<EditDialog resume={editing} showHint={hint} onClose={() => setEditId(null)} />
			<DeleteDialog resume={deleting} onClose={() => setDeleteId(null)} />
		</>
	);
}
