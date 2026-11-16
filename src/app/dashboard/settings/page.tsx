import PageShell from '@/components/Dashboard/PageShell';
import { hasPaidFeatures } from '@/lib/access';
import { getSettings } from '@/lib/applications/db';
import { LANGUAGES } from '@/lib/languages';
import { listResumes } from '@/lib/resumes';
import { TEMPLATES, TEMPLATE_IDS } from '@/lib/templates';
import { requireUser } from '@/lib/user';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'Settings | CoverBetter' };

export default async function SettingsPage() {
	const user = await requireUser();
	const [settings, resumes] = await Promise.all([getSettings(user.id), listResumes(user.id)]);
	return (
		<PageShell title="Settings" intro="Set your defaults. CoverBetter uses them for new letters, resumes, and reminders.">
			<SettingsForm
				settings={settings}
				paid={hasPaidFeatures(user, new Date())}
				resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
				languages={LANGUAGES.map((l) => ({ code: l.code, label: l.label }))}
				templates={TEMPLATE_IDS.map((id) => ({ id, label: TEMPLATES[id].label }))}
			/>
		</PageShell>
	);
}
