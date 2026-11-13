import type { ClerkProvider } from '@clerk/nextjs';

type Appearance = NonNullable<
	React.ComponentProps<typeof ClerkProvider>['appearance']
>;

/** v2 dark theme: black and #111 surfaces, purple primary, white text. */
export const clerkAppearance: Appearance = {
	variables: {
		colorPrimary: '#9333ea',
		colorPrimaryForeground: '#ffffff',
		colorBackground: '#111111',
		colorForeground: '#ffffff',
		colorMutedForeground: '#c9c9c9',
		colorMuted: '#2a2a2a',
		colorInput: '#000000',
		colorInputForeground: '#ffffff',
		colorBorder: '#2a2a2a',
		colorNeutral: '#ffffff',
		colorRing: '#a868e4',
		colorDanger: '#f87171',
		colorSuccess: '#4ade80',
		borderRadius: '0.5rem',
	},
	elements: {
		card: 'border border-white/10 shadow-none',
		footerActionLink: 'text-[#a868e4] hover:text-white',
		formButtonPrimary: 'bg-gradient-to-br from-[#9333ea] to-purple-950',
	},
};
