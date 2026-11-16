import { Fragment } from 'react';
import { parseMarkdown, type Inline } from '@/lib/markdown-lite';

function Line({ parts }: Readonly<{ parts: Inline[] }>) {
	return (
		<>
			{parts.map((p, i) => {
				if (p.bold && p.italic) return <strong key={i}><em>{p.text}</em></strong>;
				if (p.bold) return <strong key={i}>{p.text}</strong>;
				if (p.italic) return <em key={i}>{p.text}</em>;
				return <Fragment key={i}>{p.text}</Fragment>;
			})}
		</>
	);
}

const H = { 1: 'mb-2 mt-1 text-2xl font-semibold', 2: 'mb-1 mt-4 border-b border-black/15 pb-1 text-sm font-semibold uppercase tracking-wide', 3: 'mb-1 mt-3 font-semibold' } as const;

/** A resume in Markdown, shown as a white page. React makes the elements, so the text cannot run as code. */
export default function MarkdownView({ source }: Readonly<{ source: string }>) {
	const blocks = parseMarkdown(source);
	if (blocks.length === 0) return <p className="text-black/50">Nothing to show yet.</p>;
	return (
		<div className="text-[15px] leading-relaxed text-black">
			{blocks.map((b, i) => {
				if (b.type === 'heading') {
					const Tag = `h${b.level + 2}` as 'h3' | 'h4' | 'h5';
					return (
						<Tag key={i} className={H[b.level]}>
							<Line parts={b.content} />
						</Tag>
					);
				}
				if (b.type === 'list') {
					const L = b.ordered ? 'ol' : 'ul';
					return (
						<L key={i} className={`mb-2 pl-5 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
							{b.items.map((it, j) => (
								<li key={j}>
									<Line parts={it} />
								</li>
							))}
						</L>
					);
				}
				return (
					<p key={i} className="mb-2">
						{b.lines.map((l, j) => (
							<Fragment key={j}>
								{j > 0 && <br />}
								<Line parts={l} />
							</Fragment>
						))}
					</p>
				);
			})}
		</div>
	);
}
