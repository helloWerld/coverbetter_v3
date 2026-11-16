'use client';

import { useEffect, useRef } from 'react';

/** Native modal dialog. The browser traps focus and closes it on Escape. */
export default function Dialog({
	open,
	onClose,
	labelledBy,
	children,
	wide,
}: Readonly<{
	open: boolean;
	onClose: () => void;
	labelledBy: string;
	children: React.ReactNode;
	wide?: boolean | 'xl';
}>) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (open && !el.open) el.showModal();
		if (!open && el.open) el.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			className="modal"
			aria-labelledby={labelledBy}
			onClose={onClose}
		>
			{open && (
				<div
					className={`modal-box border border-base-100/10 bg-base-300 text-base-100 ${wide === 'xl' ? 'w-11/12 max-w-6xl' : wide ? 'max-w-3xl' : ''}`}
				>
					{children}
				</div>
			)}
		</dialog>
	);
}
