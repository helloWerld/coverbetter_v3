import { notFound } from 'next/navigation';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { SOON_FEATURES, getSoonFeature } from '@/lib/soon';
import { requireUser } from '@/lib/user';
import WaitlistForm from './WaitlistForm';

export const dynamicParams = false;

export function generateStaticParams() {
	return SOON_FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
	params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
	const feature = getSoonFeature((await params).slug);
	return { title: feature ? `${feature.name} | CoverBetter` : 'CoverBetter' };
}

export default async function SoonPage({
	params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
	const feature = getSoonFeature((await params).slug);
	if (!feature) notFound();
	const user = await requireUser();

	return (
		<PageShell title={feature.name} intro={feature.description}>
			<Card title="Get an email when it is ready">
				<WaitlistForm feature={feature.slug} defaultEmail={user.email} />
			</Card>
		</PageShell>
	);
}
