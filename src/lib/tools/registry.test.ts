import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import posts from '@/content/blog-posts.json';
import { TOOLS } from './registry';
import { TOOL_GROUPS } from './types';

const blogSlugs = new Set((posts as { slug: string }[]).map((p) => p.slug));
const toolSlugs = new Set(TOOLS.map((t) => t.slug));
const APP = path.join(__dirname, '..', '..', 'app', '(home)', 'tools');

describe('free tool pages', () => {
	it('has unique slugs', () => {
		expect(toolSlugs.size).toBe(TOOLS.length);
	});

	for (const t of TOOLS) {
		it(`${t.slug}: meets the page rules`, () => {
			expect(t.title.length, 'title').toBeLessThanOrEqual(70);
			expect(t.description.length, 'description').toBeGreaterThan(0);
			expect(t.description.length, 'description').toBeLessThanOrEqual(160);
			expect(t.faqs.length, 'faqs').toBeGreaterThanOrEqual(3);
			expect(t.faqs.length, 'faqs').toBeLessThanOrEqual(5);
			expect(t.guide.length, 'guide sections').toBeGreaterThanOrEqual(2);
			expect(TOOL_GROUPS).toContain(t.group);
			expect(t.cta.href.startsWith('/'), 'cta is internal').toBe(true);
			for (const s of t.blogSlugs) expect(blogSlugs.has(s), `blog ${s}`).toBe(true);
			for (const s of t.relatedTools) {
				expect(s, 'not itself').not.toBe(t.slug);
				expect(toolSlugs.has(s), `tool ${s}`).toBe(true);
			}
			expect(JSON.stringify(t), 'no em or en dash').not.toMatch(/[—–]/);
			expect(fs.existsSync(path.join(APP, t.slug, 'page.tsx')), 'route file').toBe(true);
		});
	}
});
