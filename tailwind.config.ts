import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			listStyleImage: {
				checkmark: 'url("/checkmark.png")',
				ex: 'url("/ex.png")',
			},
			keyframes: {
				'slow-pulse': {
					'0%, 100%': { opacity: '50%' },
					'50%': { opacity: '30%' },
				},
			},
			animation: {
				'slow-pulse': 'slow-pulse 3s ease-in-out infinite',
			},
			backgroundImage: {
				'circular-gradient':
					'radial-gradient(circle, var(--tw-gradient-stops))',
			},
		},
	},
	daisyui: {
		themes: [
			{
				//prettier-ignore
				dark: {
					primary: '#000000', // black
					secondary: '#9333ea', // purple
					accent: '#f5cf0f', // yellow
					neutral: '#a868e4', // light purple
					'base-100': '#ffffff', // white
					'base-200': '#2a2a2a', // light grey
					'base-300': '#111111', // dark-grey

					'--rounded-box': '1rem', // border radius rounded-box utility class, used in card and other large boxes
					'--rounded-btn': '0.5rem', // border radius rounded-btn utility class, used in buttons and similar element
					'--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
					'--animation-btn': '0.25s', // duration of animation when you click on button
					'--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
					'--btn-focus-scale': '0.95', // scale transform of button when you focus on it
					'--border-btn': '1px', // border width of buttons
					'--tab-border': '1px', // border width of tabs
					'--tab-radius': '0.5rem', // border radius of tabs
					'link-focus': '#a868e4', // Ensure focus state is white
				},
			},
		],
	},
	plugins: [require('daisyui')],
} satisfies Config;
