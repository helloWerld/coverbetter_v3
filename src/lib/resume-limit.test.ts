import { describe, expect, it } from 'vitest';
import { MAX_RESUMES, canAddResume } from '@/lib/resume-limit';

describe('canAddResume', () => {
	it('allows an add below the limit', () => {
		expect(MAX_RESUMES).toBe(5);
		expect(canAddResume(0)).toBe(true);
		expect(canAddResume(4)).toBe(true);
	});
	it('blocks an add at or above the limit', () => {
		expect(canAddResume(5)).toBe(false);
		expect(canAddResume(6)).toBe(false);
	});
});
