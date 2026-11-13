import { SignUp } from '@clerk/nextjs';
import AuthShell from '@/components/ui/AuthShell';

export default function Page() {
	return (
		<AuthShell>
			<SignUp />
		</AuthShell>
	);
}
