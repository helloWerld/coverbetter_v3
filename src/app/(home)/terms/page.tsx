import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/ui/LegalPage';

export const metadata: Metadata = {
	title: 'Terms of Service — CoverBetter',
	description: 'The terms for using CoverBetter.',
	alternates: { canonical: 'https://coverbetter.io/terms' },
};

const sections: LegalSection[] = [
	{
		heading: 'Using CoverBetter',
		body: [
			'By using CoverBetter you agree to these terms and to our Privacy Policy. You must be at least 18 years old and able to enter a contract.',
			'CoverBetter writes cover letters with AI from the resume and the job post that you give us.',
		],
	},
	{
		heading: 'Your account',
		body: [
			'You sign in with Google, LinkedIn, or an email code. Keep your account secure. You are responsible for what happens under your account.',
		],
	},
	{
		heading: 'Your content',
		body: [
			'You own your resumes and your letters. You give us permission to store them and to send them to our AI providers, only so that we can write your letters and run the service.',
			'Upload only content that you have the right to use. Do not upload anything unlawful.',
		],
	},
	{
		heading: 'AI letters: check before you send',
		body: [
			'AI can make mistakes. Read every letter and correct it before you send it. You are responsible for how you use a letter.',
			'We do not promise that a letter will get you an interview or a job.',
		],
	},
	{
		heading: 'Plans and payments',
		body: [
			'Free: 3 letters for each account.',
			'Pro: $19.97 a month, for up to 200 credits a month.',
			'Pay as you go: $1.50 per credit. Credits that you buy never expire.',
			'1 credit writes 1 letter with its Job Fit Score. A Job Fit Score check of up to 20 saved roles uses 1 credit in total. A check that fails uses no credit.',
			'The Job Fit Score compares your resume with the job post. It does not predict a hiring decision.',
			'Stripe processes all payments. Prices may change. A change to the price of Pro applies from your next billing period, and we tell you before it starts.',
		],
	},
	{
		heading: 'Cancel and refunds',
		body: [
			'You can cancel Pro at any time from the Billing page. You keep Pro access until the end of the period you paid for.',
			'Credits that you have used are not refundable. If a payment went wrong, write to hello@coverbetter.io and we will look into it.',
		],
	},
	{
		heading: 'Acceptable use',
		body: [
			'Do not abuse the service, try to break it, resell it, or use it to write false or misleading statements about yourself. We may limit or close an account that breaks these rules.',
		],
	},
	{
		heading: 'Ending your account',
		body: [
			'You can delete your account and your data at any time from the Account page. We may suspend or close an account that breaks these terms.',
		],
	},
	{
		heading: 'No warranty and limit of liability',
		body: [
			'We provide CoverBetter as is, without warranties of any kind. We do not promise that it will always be available or free of errors.',
			'To the extent the law allows, our total liability to you is limited to the amount you paid us in the 12 months before the claim.',
		],
	},
	{
		heading: 'Changes to these terms',
		body: [
			'We may update these terms. We update the date at the top of this page. If you keep using the service after a change, you accept the new terms.',
		],
	},
	{
		heading: 'Contact',
		body: ['Write to hello@coverbetter.io with any question about these terms.'],
	},
];

export default function Terms() {
	return (
		<LegalPage
			title="Terms of Service"
			updated="2026-11-15"
			intro="These terms govern your use of CoverBetter, an AI service that writes cover letters from your resume and a job post."
			sections={sections}
		/>
	);
}
