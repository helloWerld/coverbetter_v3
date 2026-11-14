import { describe, expect, it } from 'vitest';
import { readPosts, validatePosts } from '../../scripts/build-blog.mjs';
import built from '@/content/blog-posts.json';
import { getPublishedPost, isPublished, publishedPosts, relatedPosts, type Post } from './blog';

const post = (slug: string, publishDate: string, cluster = 'resumes'): Post => ({
	slug,
	title: slug,
	description: '',
	publishDate,
	keyword: '',
	cluster,
	faqs: [],
	words: 1000,
	readingMinutes: 4,
	headings: [],
	html: '',
});

describe('publish dates', () => {
	const all = [post('a', '2026-11-14'), post('b', '2026-11-23', 'interviews'), post('c', '2026-11-30')];

	it('publishes a post at 13:00 UTC on its date, not before', () => {
		expect(isPublished(all[1], new Date('2026-11-23T12:59:59Z'))).toBe(false);
		expect(isPublished(all[1], new Date('2026-11-23T13:00:00Z'))).toBe(true);
	});

	it('lists only live posts, newest first', () => {
		const now = new Date('2026-11-24T00:00:00Z');
		expect(publishedPosts(now, all).map((p) => p.slug)).toEqual(['b', 'a']);
	});

	it('hides a post that is not live yet', () => {
		const now = new Date('2026-11-24T00:00:00Z');
		expect(getPublishedPost('c', now, all)).toBeNull();
		expect(getPublishedPost('a', now, all)?.slug).toBe('a');
		expect(getPublishedPost('missing', now, all)).toBeNull();
	});

	it('puts same-topic posts first in Read next', () => {
		const now = new Date('2027-01-01T00:00:00Z');
		expect(relatedPosts(all[0], now, 3, all).map((p) => p.slug)).toEqual(['c', 'b']);
	});
});

describe('blog content', () => {
	const posts = readPosts();

	it('has 52 posts, one each week', () => {
		expect(posts).toHaveLength(52);
		const days = posts.map((p) => new Date(`${p.publishDate}T00:00:00Z`).getTime());
		for (let i = 2; i < days.length; i++) {
			expect(days[i] - days[i - 1]).toBe(7 * 24 * 3600 * 1000);
		}
	});

	it('passes the build checks', () => {
		expect(validatePosts(posts)).toEqual([]);
	});

	it('gives each post at least 900 words and 3 FAQs', () => {
		for (const p of posts) {
			expect(p.words, p.slug).toBeGreaterThanOrEqual(900);
			expect(p.faqs.length, p.slug).toBeGreaterThanOrEqual(3);
		}
	});

	it('matches the built JSON (run npm run blog after an edit)', () => {
		expect((built as Post[]).map((p) => [p.slug, p.publishDate, p.html])).toEqual(
			posts.map((p) => [p.slug, p.publishDate, p.html]),
		);
	});
});
