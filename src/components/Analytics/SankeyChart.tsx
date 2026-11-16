'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { sankey, sankeyLeft, sankeyLinkHorizontal } from 'd3-sankey';
import type { SankeyLink, SankeyNode } from '@/lib/applications/analytics';
import {
	chartSize,
	flowSummary,
	fullName,
	highlightPath,
	linkText,
	nodeLabel,
} from './helpers';

const PURPLE = '#9333ea';
const LIGHT_PURPLE = '#a868e4';
const YELLOW = '#f5cf0f';
const END_LINK = '#4a4458';
const END_BAR = '#6e6684';

const COLOR: Record<SankeyNode['kind'], { link: string; bar: string }> = {
	go: { link: PURPLE, bar: LIGHT_PURPLE },
	win: { link: YELLOW, bar: YELLOW },
	end: { link: END_LINK, bar: END_BAR },
};

const query = '(max-width: 639px)';
function subscribe(cb: () => void) {
	const m = window.matchMedia(query);
	m.addEventListener('change', cb);
	return () => m.removeEventListener('change', cb);
}
const useCompact = () =>
	useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);

type LNode = SankeyNode & { x0?: number; x1?: number; y0?: number; y1?: number; depth?: number };
type LLink = {
	source: LNode;
	target: LNode;
	value: number;
	width?: number;
	y0?: number;
	y1?: number;
};

const css = `
.sk-link{stroke-dasharray:1;animation:sk-draw .9s cubic-bezier(.4,0,.2,1) both;animation-delay:var(--d,0s)}
.sk-fade{transition:opacity .15s}
@keyframes sk-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.sk-link{animation:none;stroke-dashoffset:0}.sk-fade{transition:none}}
`;

export default function SankeyChart({
	nodes,
	links,
	total,
}: Readonly<{ nodes: SankeyNode[]; links: SankeyLink[]; total: number }>) {
	const compact = useCompact();
	const size = chartSize(compact);
	const [hover, setHover] = useState<string | null>(null);
	const [focus, setFocus] = useState<string | null>(null);
	const [pinned, setPinned] = useState<string | null>(null);
	const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
	const [showTable, setShowTable] = useState(false);

	const graph = useMemo(() => {
		const layout = sankey<LNode, { value: number }>()
			.nodeId((n) => n.id)
			.nodeAlign(sankeyLeft)
			.nodeWidth(size.nodeWidth)
			.nodePadding(size.nodePadding)
			.extent([
				[size.marginLeft, size.marginTop],
				[size.width - size.marginRight, size.height - size.marginBottom],
			]);
		const g = layout({
			nodes: nodes.map((n) => ({ ...n })),
			links: links.map((l) => ({ ...l })),
		});
		return { nodes: g.nodes as LNode[], links: g.links as unknown as LLink[] };
	}, [nodes, links, size.width, size.height, size.marginLeft, size.marginRight, size.marginTop, size.marginBottom, size.nodeWidth, size.nodePadding]);

	const nameOf = useMemo(() => {
		const m = new Map(nodes.map((n) => [n.id, fullName(n.id, n.label)]));
		return (id: string) => m.get(id) ?? id;
	}, [nodes]);

	const active = hover ?? focus ?? pinned;
	const path = useMemo(() => (active ? highlightPath(active, links) : null), [active, links]);
	const linkPath = sankeyLinkHorizontal();

	const nodeOpacity = (id: string) => (path && !path.nodes.has(id) ? 0.2 : 1);
	const linkOpacity = (i: number, kind: SankeyNode['kind']) => {
		const base = kind === 'end' ? 0.55 : 0.7;
		if (!path) return base;
		return path.links.has(i) ? 0.95 : 0.08;
	};

	const showTip = (e: React.PointerEvent, text: string) => {
		const box = e.currentTarget.closest('[data-chart]')?.getBoundingClientRect();
		if (box) setTip({ x: e.clientX - box.left, y: e.clientY - box.top, text });
	};

	const togglePin = (id: string) => setPinned((p) => (p === id ? null : id));

	return (
		<div>
			<style>{css}</style>
			<div className="overflow-x-auto" tabIndex={-1}>
				<div data-chart className="relative min-w-[560px]">
					<svg
						viewBox={`0 0 ${size.width} ${size.height}`}
						className="block h-auto w-full"
						role="img"
						aria-label={flowSummary(nodes, total)}
					>
						<defs>
							{graph.links.map((l, i) => (
								<linearGradient
									key={i}
									id={`sk-grad-${i}`}
									gradientUnits="userSpaceOnUse"
									x1={l.source.x1}
									x2={l.target.x0}
								>
									<stop offset="0" stopColor={COLOR[l.source.kind].link} />
									<stop offset="1" stopColor={COLOR[l.target.kind].link} />
								</linearGradient>
							))}
						</defs>
						<g fill="none">
							{graph.links.map((l, i) => {
								const d = linkPath(l as never);
								if (!d) return null;
								const text = linkText(nameOf(l.source.id), nameOf(l.target.id), l.value, l.source.value);
								return (
									<path
										key={i}
										d={d}
										pathLength={1}
										stroke={`url(#sk-grad-${i})`}
										strokeWidth={Math.max(1, l.width ?? 1)}
										className="sk-link sk-fade"
										style={{
											opacity: linkOpacity(i, l.target.kind),
											['--d' as string]: `${(l.source.depth ?? 0) * 0.35}s`,
										}}
										onPointerMove={(e) => showTip(e, text)}
										onPointerLeave={() => setTip(null)}
									/>
								);
							})}
						</g>
						<g>
							{graph.nodes.map((n) => {
								const x0 = n.x0 ?? 0;
								const y0 = n.y0 ?? 0;
								const y1 = n.y1 ?? 0;
								const end = n.kind === 'end';
								return (
									<g
										key={n.id}
										className="sk-fade"
										style={{ opacity: nodeOpacity(n.id), cursor: 'pointer' }}
										onPointerEnter={() => setHover(n.id)}
										onPointerLeave={() => setHover(null)}
										onClick={() => togglePin(n.id)}
									>
										<rect
											x={x0}
											y={y0}
											width={size.nodeWidth}
											height={Math.max(2, y1 - y0)}
											rx={2}
											fill={COLOR[n.kind].bar}
										/>
										<text
											x={(n.x1 ?? 0) + 8}
											y={(y0 + y1) / 2}
											dominantBaseline="central"
											fontSize={compact ? 13 : 14}
											fill={end ? 'rgba(255,255,255,0.72)' : '#ffffff'}
											stroke="#000"
											strokeWidth={4}
											strokeLinejoin="round"
											paintOrder="stroke"
										>
											{nodeLabel(n.label, size.short)}
											<tspan dx={6} fontWeight={600} className="tabular-nums">
												{n.value}
											</tspan>
										</text>
									</g>
								);
							})}
						</g>
					</svg>
					{tip && (
						<div
							role="presentation"
							className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-base-100/20 bg-base-300 px-3 py-1.5 text-sm text-base-100 shadow-lg"
							style={{ left: tip.x, top: tip.y - 12 }}
						>
							{tip.text}
						</div>
					)}
				</div>
			</div>

			<div role="group" aria-label="Highlight the path of one stage" className="mt-4">
				<p className="text-sm text-base-100/70">Pick a stage to follow its path.</p>
				<ul className="mt-2 flex flex-wrap gap-2">
					{nodes.map((n) => (
						<li key={n.id}>
							<button
								type="button"
								aria-pressed={pinned === n.id}
								aria-label={`${nameOf(n.id)}: ${n.value}`}
								onFocus={() => setFocus(n.id)}
								onBlur={() => setFocus(null)}
								onClick={() => togglePin(n.id)}
								className={`min-h-11 rounded-full border px-4 text-sm tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
									pinned === n.id
										? 'border-secondary bg-secondary text-base-100'
										: 'border-base-100/20 text-base-100/80 hover:border-base-100/50'
								}`}
							>
								{nameOf(n.id)} <span className="font-semibold">{n.value}</span>
							</button>
						</li>
					))}
				</ul>
			</div>

			<div className="mt-4">
				<button
					type="button"
					aria-expanded={showTable}
					aria-controls="sankey-table"
					onClick={() => setShowTable((v) => !v)}
					className="min-h-11 rounded-md px-1 text-sm text-neutral underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
				>
					{showTable ? 'Hide the table' : 'Show the data as a table'}
				</button>
				<div id="sankey-table" className={showTable ? 'mt-2 overflow-x-auto' : 'sr-only'}>
					<table className="w-full text-left text-sm tabular-nums text-base-100/80">
						<caption className="sr-only">Applications that moved from one stage to the next</caption>
						<thead>
							<tr className="border-b border-base-100/20 text-base-100">
								<th scope="col" className="py-2 pr-4 font-normal">From</th>
								<th scope="col" className="py-2 pr-4 font-normal">To</th>
								<th scope="col" className="py-2 text-right font-normal">Applications</th>
							</tr>
						</thead>
						<tbody>
							{links.map((l, i) => (
								<tr key={i} className="border-b border-base-100/10">
									<td className="py-2 pr-4">{nameOf(l.source)}</td>
									<td className="py-2 pr-4">{nameOf(l.target)}</td>
									<td className="py-2 text-right">{l.value}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
