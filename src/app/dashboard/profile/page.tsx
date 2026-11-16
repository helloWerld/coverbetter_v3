import PageShell from '@/components/Dashboard/PageShell';
import ProfileEditor from '@/components/Profile/ProfileEditor';
import { getProfile } from '@/lib/profile/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Career profile | CoverBetter' };

export default async function ProfilePage() {
	const user = await requireUser();
	const profile = await getProfile(user.id);

	return (
		<PageShell
			title="Career profile"
			intro="Add your full work history once. CoverBetter then builds a resume for each job from it."
		>
			<ProfileEditor initial={profile} />
		</PageShell>
	);
}
