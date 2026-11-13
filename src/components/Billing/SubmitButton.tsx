'use client';

import { useFormStatus } from 'react-dom';

/** Submit button that shows a busy state while the server action runs. */
export default function SubmitButton({
	children,
	pendingLabel = 'One moment...',
	className = 'btn btn-primary',
	disabled = false,
}: Readonly<{
	children: React.ReactNode;
	pendingLabel?: string;
	className?: string;
	disabled?: boolean;
}>) {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			className={`${className} min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral`}
			disabled={disabled || pending}
		>
			{pending ? pendingLabel : children}
		</button>
	);
}
