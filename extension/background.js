// Right-click menu: "Write a cover letter from this text".
// Saves the highlighted text for the popup, then opens the popup.

const MENU_ID = 'coverbetter-write-from-selection';

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: MENU_ID,
		title: 'Write a cover letter from this text',
		contexts: ['selection'],
	});
});

/** The highlight with line breaks. Runs in the frame the user right-clicked. */
function readSelectionInPage() {
	return window.getSelection ? String(window.getSelection()) : '';
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId !== MENU_ID || !tab || !tab.id) return;

	// selectionText has no line breaks, so read the page selection when Chrome allows it.
	let text = info.selectionText || '';
	try {
		const [res] = await chrome.scripting.executeScript({
			target: { tabId: tab.id, frameIds: [info.frameId || 0] },
			func: readSelectionInPage,
		});
		if (res && typeof res.result === 'string' && res.result.trim().length >= text.trim().length) {
			text = res.result;
		}
	} catch {
		// Keep selectionText.
	}

	const description = text
		.replace(/ /g, ' ')
		.replace(/[ \t]+/g, ' ')
		.replace(/ *\n */g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
		.slice(0, 20000);

	await chrome.storage.session.set({ pendingJob: { tabId: tab.id, description, at: Date.now() } });
	try {
		await chrome.action.openPopup();
	} catch {
		// Older Chrome versions cannot open the popup from here. A badge tells the user to click the icon.
		chrome.action.setBadgeBackgroundColor({ color: '#9333ea' });
		chrome.action.setBadgeText({ text: '1', tabId: tab.id });
	}
});
