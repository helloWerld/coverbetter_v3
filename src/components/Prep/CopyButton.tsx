'use client';

import { useState } from 'react';
import { btnGhost } from './styles';

export default function CopyButton({ text, label = 'Copy', what = '' }: Readonly<{ text: string; label?: string; what?: string }>) {
	const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setState('copied');
		} catch {
			setState('failed');
		}
		setTimeout(() => setState('idle'), 2000);
	}

	return (
		<>
			<button type="button" onClick={copy} className={`${btnGhost} btn-sm`} aria-label={what ? `${label} ${what}` : undefined}>
				{label}
			</button>
			<span role="status" className="text-sm text-base-100/70">
				{state === 'copied' ? 'Copied.' : state === 'failed' ? 'Copy failed. Select the text and copy it.' : ''}
			</span>
		</>
	);
}
