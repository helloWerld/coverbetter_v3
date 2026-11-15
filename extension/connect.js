// Runs only on the CoverBetter "Connect the extension" page.
// The page posts a new token. This script saves it and confirms.
// Keep the message names the same as in ConnectExtension.tsx.
(() => {
	const TOKEN_MESSAGE = 'coverbetter:extension-token';
	const ACK_MESSAGE = 'coverbetter:extension-connected';

	window.addEventListener('message', (e) => {
		if (e.source !== window || e.origin !== window.location.origin) return;
		const data = e.data;
		if (!data || data.type !== TOKEN_MESSAGE || typeof data.token !== 'string') return;
		if (!/^cbx_[A-Za-z0-9_-]{40,}$/.test(data.token)) return;

		chrome.storage.local.set({ token: data.token, baseUrl: window.location.origin }, () => {
			window.postMessage({ type: ACK_MESSAGE }, window.location.origin);
		});
	});
})();
