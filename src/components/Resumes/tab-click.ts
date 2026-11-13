export type ResumeTab = 'upload' | 'paste';

/**
 * What a click on a tab does. The selected Upload tab looks like the main
 * button, so a second click on it opens the file picker.
 */
export function tabClickAction(
	current: ResumeTab,
	clicked: ResumeTab,
): 'open-picker' | 'switch' | 'none' {
	if (current !== clicked) return 'switch';
	return clicked === 'upload' ? 'open-picker' : 'none';
}
