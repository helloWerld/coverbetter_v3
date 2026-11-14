import Image from 'next/image';

/**
 * The CoverBetter wordmark for dark backgrounds (white text, purple "B").
 * public/logo-on-light.png is the black-text version for white backgrounds.
 * Set the height with className; the width follows the 960 x 348 ratio.
 */
export default function Logo({
	className = 'h-8 w-auto',
	priority = false,
}: Readonly<{ className?: string; priority?: boolean }>) {
	return (
		<Image
			src="/logo-on-dark.png"
			alt="CoverBetter"
			width={960}
			height={348}
			unoptimized
			priority={priority}
			className={className}
		/>
	);
}
