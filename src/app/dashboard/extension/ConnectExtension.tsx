'use client';

import { useEffect, useState, useTransition } from 'react';
import { connectExtensionAction } from './actions';

type State = 'idle' | 'waiting' | 'connected' | 'no-extension' | 'error';

/** Messages shared with extension/connect.js. Keep the names the same. */
const TOKEN_MESSAGE = 'coverbetter:extension-token';
const ACK_MESSAGE = 'coverbetter:extension-connected';

export default function ConnectExtension() {
	const [state, setState] = useState<State>('idle');
	const [pending, startTransition] = useTransition();

	useEffect(() => {
		function onMessage(e: MessageEvent) {
			if (e.source !== window || e.origin !== window.location.origin) return;
			if (e.data?.type === ACK_MESSAGE) setState('connected');
		}
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, []);

	useEffect(() => {
		if (state !== 'waiting') return;
		const t = window.setTimeout(() => setState((s) => (s === 'waiting' ? 'no-extension' : s)), 4000);
		return () => window.clearTimeout(t);
	}, [state]);

	function connect() {
		startTransition(async () => {
			try {
				const { token } = await connectExtensionAction();
				setState('waiting');
				window.postMessage({ type: TOKEN_MESSAGE, token }, window.location.origin);
			} catch {
				setState('error');
			}
		});
	}

	return (
		<div className="mt-4 flex flex-col gap-3">
			<button
				type="button"
				onClick={connect}
				disabled={pending}
				className="btn btn-secondary min-h-11 w-fit"
			>
				{pending ? 'Connecting…' : state === 'connected' ? 'Connect again' : 'Connect the extension'}
			</button>
			<p aria-live="polite" className="text-sm">
				{state === 'connected' && 'Connected. Open a job post and click the CoverBetter icon in Chrome.'}
				{state === 'waiting' && 'Waiting for the extension…'}
				{state === 'no-extension' &&
					'The extension did not answer. Install it, reload this page, and click the button again.'}
				{state === 'error' && 'We could not connect the extension. Reload the page and try again.'}
			</p>
		</div>
	);
}
