'use client';

import { useFormStatus } from 'react-dom';

/** Submit button that shows a busy state while the server action runs. */
export default function SubmitButton({
	children,
	pendingLabel = 'One moment...',
	className = 'btn btn-secondary min-h-11',
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
			className={`${className} min-h-11 disabled:!border-base-100/10 disabled:!bg-base-200 disabled:!bg-none disabled:!text-base-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral`}
			disabled={disabled || pending}
		>
			{pending ? pendingLabel : children}
		</button>
	);
}
