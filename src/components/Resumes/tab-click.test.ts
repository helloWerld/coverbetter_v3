import { describe, expect, it } from 'vitest';
import { tabClickAction } from './tab-click';

describe('tabClickAction', () => {
	it('opens the file picker when the Upload tab is already selected', () => {
		expect(tabClickAction('upload', 'upload')).toBe('open-picker');
	});

	it('switches to Upload from Paste without opening the picker', () => {
		expect(tabClickAction('paste', 'upload')).toBe('switch');
	});

	it('switches to Paste from Upload', () => {
		expect(tabClickAction('upload', 'paste')).toBe('switch');
	});

	it('does nothing when Paste is clicked again', () => {
		expect(tabClickAction('paste', 'paste')).toBe('none');
	});
});
