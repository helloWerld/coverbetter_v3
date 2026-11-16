import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import FitScoreCard, { FitScoreLocked } from '@/components/Fit/FitScoreCard';
import LetterEditor from '@/components/Letters/LetterEditor';
import { hasPaidFeatures } from '@/lib/access';
import { getEnv } from '@/lib/cf';
import { deserializeFit } from '@/lib/fit';
import { getLanguage } from '@/lib/languages';
import { getLetter } from '@/lib/letters';
import { canPickModel, modelLabel } from '@/lib/model-access';
import { getTemplate } from '@/lib/templates';
import { requireUser } from '@/lib/user';

export default async function LetterPage({
	params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	const user = await requireUser();
	const letter = await getLetter(user.id, id);
	if (!letter) notFound();
	const paid = hasPaidFeatures(user, new Date());
	const fit = deserializeFit(letter.fitScore, letter.fitJson);

	return (
		<div className="mx-auto w-full max-w-screen-xl">
			<Link
				href={letter.applicationId ? `/dashboard/applications/${letter.applicationId}` : '/dashboard/applications'}
				className="mb-4 inline-flex min-h-11 items-center gap-2 text-base-100/70 hover:text-base-100"
			>
				<FaArrowLeft aria-hidden /> {letter.applicationId ? 'Back to the role profile' : 'Find Roles'}
			</Link>
			<h1 className="gradient-text mb-6 text-3xl font-extralight md:text-5xl">
				{paid ? 'Edit letter' : 'Your letter'}
			</h1>
			{canPickModel(user.email, getEnv().MODEL_PICKER_EMAILS) && (
				<p className="-mt-4 mb-6 text-sm text-base-100/70">
					Written by {modelLabel(letter.model)}
				</p>
			)}
			{fit ? (
				<div className="mb-6">
					<FitScoreCard fit={fit} />
				</div>
			) : (
				!paid && (
					<div className="mb-6">
						<FitScoreLocked />
					</div>
				)
			)}
			<LetterEditor
				id={letter.id}
				initialBody={letter.body}
				initialTemplate={getTemplate(letter.template).id}
				initialJobTitle={letter.jobTitle}
				initialCompany={letter.company}
				language={getLanguage(letter.language).code}
				paid={paid}
			/>
		</div>
	);
}
