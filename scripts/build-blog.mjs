// Turns content/blog/*.md into src/content/blog-posts.json.
// The Worker has no file system, so the posts ship as one JSON module.
// Run: node scripts/build-blog.mjs  (the "build" script runs it first).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const BLOG_DIR = path.join(ROOT, 'content', 'blog');
export const OUT_FILE = path.join(ROOT, 'src', 'content', 'blog-posts.json');

const WORDS_PER_MINUTE = 230;

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

/** Markdown to HTML. H2 and H3 get ids for the table of contents. Outside links open in a new tab. */
function render(markdown) {
	const headings = [];
	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }) {
				const text = this.parser.parseInline(tokens);
				const id = slugify(text);
				if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, '') });
				return `<h${depth} id="${id}">${text}</h${depth}>\n`;
			},
			link({ href, title, tokens }) {
				const text = this.parser.parseInline(tokens);
				const t = title ? ` title="${title}"` : '';
				const external = /^https?:\/\//.test(href) && !href.startsWith('https://coverbetter.io');
				const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
				return `<a href="${href}"${t}${rel}>${text}</a>`;
			},
		},
	});
	return { html: /** @type {string} */ (marked.parse(markdown, { async: false })), headings };
}

export function readPosts(dir = BLOG_DIR) {
	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.md'))
		.map((file) => {
			const raw = fs.readFileSync(path.join(dir, file), 'utf8');
			const { data, content } = matter(raw);
			const { html, headings } = render(content);
			const words = content.split(/\s+/).filter(Boolean).length;
			return {
				slug: file.replace(/\.md$/, ''),
				title: String(data.title ?? ''),
				description: String(data.description ?? ''),
				publishDate: String(data.publishDate ?? ''),
				keyword: String(data.keyword ?? ''),
				cluster: String(data.cluster ?? ''),
				faqs: Array.isArray(data.faqs) ? data.faqs.map((f) => ({ q: String(f.q), a: String(f.a) })) : [],
				words,
				readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
				headings,
				markdown: content,
				html,
			};
		})
		.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
}

/** Problems that must stop the build. Empty when all posts are fine. */
export function validatePosts(posts) {
	const errors = [];
	const slugs = new Set(posts.map((p) => p.slug));
	const dateOf = new Map(posts.map((p) => [p.slug, p.publishDate]));
	const dates = new Set();
	for (const p of posts) {
		const where = `${p.slug}.md`;
		if (!p.title) errors.push(`${where}: no title`);
		if (p.title.length > 70) errors.push(`${where}: title is over 70 characters`);
		if (!p.description || p.description.length > 160) errors.push(`${where}: description must be 1 to 160 characters`);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(p.publishDate)) errors.push(`${where}: publishDate must be YYYY-MM-DD`);
		if (dates.has(p.publishDate)) errors.push(`${where}: two posts share ${p.publishDate}`);
		dates.add(p.publishDate);
		if (!p.keyword) errors.push(`${where}: no keyword`);
		if (/[—–]/.test(p.markdown + p.title + p.description)) errors.push(`${where}: em or en dash`);
		// A link to another post must point to a post that is already live on that date.
		for (const m of p.markdown.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
			const target = m[1];
			if (!slugs.has(target)) errors.push(`${where}: link to missing post /blog/${target}`);
			else if (dateOf.get(target) > p.publishDate) errors.push(`${where}: link to later post /blog/${target}`);
		}
	}
	return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const posts = readPosts();
	const errors = validatePosts(posts);
	if (errors.length) {
		console.error(errors.join('\n'));
		process.exit(1);
	}
	const out = posts.map(({ markdown, ...rest }) => rest);
	fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
	fs.writeFileSync(OUT_FILE, JSON.stringify(out) + '\n');
	console.log(`Wrote ${out.length} posts to ${path.relative(ROOT, OUT_FILE)}`);
}
