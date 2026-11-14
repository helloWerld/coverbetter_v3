import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import DeleteLetterButton from '@/components/Letters/DeleteLetterButton';
import { getEnv } from '@/lib/cf';
import { listLetters } from '@/lib/letters';
import { canPickModel, modelLabel } from '@/lib/model-access';
import { requireUser } from '@/lib/user';

const dateFmt = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
});

export default async function LettersPage() {
	const user = await requireUser();
	const rows = await listLetters(user.id);
	// Model names show only to the accounts that can pick the model (test only).
	const showModel = canPickModel(user.email, getEnv().MODEL_PICKER_EMAILS);

	return (
		<PageShell title="Letters" intro="Every letter you wrote.">
			{rows.length === 0 ? (
				<Card title="No letters yet">
					<p>Write your first letter and it will show up here.</p>
					<Link href="/dashboard" className="btn btn-secondary mt-4 min-h-11">
						Generate a letter
					</Link>
				</Card>
			) : (
				<ul className="flex flex-col gap-4">
					{rows.map((l) => {
						const title = l.jobTitle || 'Untitled letter';
						const label = [title, l.company].filter(Boolean).join(' at ');
						return (
							<li
								key={l.id}
								className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5"
							>
								<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
									<h2 className="min-w-0 break-words text-lg text-base-100">
										{label}
									</h2>
									<p className="text-sm text-base-100/60">
										<time dateTime={l.createdAt.toISOString()}>
											{dateFmt.format(l.createdAt)}
										</time>
										<span aria-hidden> · </span>
										<span className="capitalize">{l.tone}</span>
										{showModel && (
											<>
												<span aria-hidden> · </span>
												<span>{modelLabel(l.model)}</span>
											</>
										)}
									</p>
								</div>
								<p className="mt-2 line-clamp-2 whitespace-pre-line text-base-100/70">
									{l.body}
								</p>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<Link
										href={`/dashboard/letters/${l.id}`}
										className="btn btn-secondary min-h-11"
										aria-label={`Open ${label}`}
									>
										Open
									</Link>
									<DeleteLetterButton id={l.id} label={label} />
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</PageShell>
	);
}
