import { redirect } from 'next/navigation';

/** Each cover letter now lives on its role profile, in Find Roles. */
export default function LettersPage() {
	redirect('/dashboard/applications');
}
