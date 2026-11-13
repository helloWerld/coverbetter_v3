import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/ui/LegalPage';

export const metadata: Metadata = {
	title: 'Privacy Policy — CoverBetter',
	description: 'How CoverBetter collects, uses, and protects your data.',
};

const sections: LegalSection[] = [
	{
		heading: 'What we collect',
		body: [
			'Account: your email address, and your name if you sign in with Google. We do not see your password.',
			'Your content: the resumes you upload or paste, the job posts you paste, and the letters we write for you.',
			'Payments: Stripe handles your card details. We store only your Stripe customer ID, your plan, and your credit balance. We never see your card number.',
			'Usage: basic technical data such as your IP address, browser type, and the pages you visit, so that we can run and protect the service.',
		],
	},
	{
		heading: 'How we use it',
		body: [
			'We use your data to write your letters, run your account, take payments, prevent abuse, and answer your questions.',
			'We do not sell your data. We do not use it for advertising.',
		],
	},
	{
		heading: 'Who handles your data',
		body: [
			'Cloudflare hosts the app and stores your database records and your uploaded resume files.',
			'Clerk handles sign-in. You sign in with Google or with an email code.',
			'Stripe handles payments.',
			'Anthropic and OpenAI write your letters. We send your resume text and the job text to one of them only when you ask for a letter. Claude by Anthropic is the main model, and OpenAI is the backup.',
			'We do not share your data with anyone else, unless the law requires it.',
		],
	},
	{
		heading: 'How long we keep it',
		body: [
			'We keep your resumes and letters until you delete them or delete your account.',
			'You can delete a resume or a letter at any time. You can delete your whole account and all of your data from the Account page. Stripe may keep payment records as the law requires.',
		],
	},
	{
		heading: 'Security',
		body: [
			'Your data travels over an encrypted connection and sits on Cloudflare. We limit who can access it. No system is completely secure, so we cannot promise absolute security.',
		],
	},
	{
		heading: 'Cookies',
		body: [
			'We use cookies that keep you signed in. We do not use advertising cookies.',
		],
	},
	{
		heading: 'Children',
		body: [
			'CoverBetter is not for anyone under 16. We do not knowingly collect data from children.',
		],
	},
	{
		heading: 'Where data is processed',
		body: [
			'Our providers may process your data in the United States and other countries.',
		],
	},
	{
		heading: 'Changes',
		body: [
			'If we change this policy, we update the date at the top of this page. For a material change we also tell you in the app or by email.',
		],
	},
	{
		heading: 'Contact',
		body: ['Write to support@coverbetter.io with any question about your data.'],
	},
];

export default function Privacy() {
	return (
		<LegalPage
			title="Privacy Policy"
			updated="2026-11-13"
			intro="This policy explains what data CoverBetter collects when you use the service, and what we do with it."
			sections={sections}
		/>
	);
}
