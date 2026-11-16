import { redirect } from 'next/navigation';

/** The Job Fit Score is now part of Find Roles. */
export default function FitScorePage() {
	redirect('/dashboard/applications#fit');
}
