import PageShell from '@/components/Dashboard/PageShell';
import ProfileEditor from '@/components/Profile/ProfileEditor';
import { getProfile } from '@/lib/profile/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Build Your Profile | CoverBetter' };

export default async function ProfilePage() {
	const user = await requireUser();
	const profile = await getProfile(user.id);

	return (
		<PageShell
			title="Build Your Profile"
			intro="Add your full work history once. CoverBetter then builds a resume for each job from it."
		>
			<ProfileEditor initial={profile} />
		</PageShell>
	);
}
