'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FaCompress, FaExpand, FaMagnifyingGlassMinus, FaMagnifyingGlassPlus, FaXmark } from 'react-icons/fa6';
import type { SankeyLink, SankeyNode } from '@/lib/applications/analytics';
import { STATUS_LABEL, type Status } from '@/lib/applications/types';
import AppDrawer from './AppDrawer';
import { CARD_H, flowLayout, pathThrough, type CardBox } from './flow-layout';
import { fullName, percentOf } from './helpers';

export type AppBrief = { id: string; company: string; jobTitle: string; status: Status };

const PANEL_W = 300;
const MIN_H = 360;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
/** The zoom buttons move between these levels. Ctrl or Cmd + scroll zooms freely. */
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
const ctrl =
	'flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-base-100/20 px-3 text-sm text-base-100 hover:border-neutral hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral disabled:opacity-40';

const LINE: Record<SankeyNode['kind'], string> = { go: '#a855f7', win: '#f5cf0f', end: '#5b5470' };

const css = `
.fm-grid{background-image:linear-gradient(rgba(168,85,247,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.07) 1px,transparent 1px);background-size:28px 28px}
.fm-card{transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s,opacity .2s,border-color .2s;animation:fm-in .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0s)}
.fm-go{box-shadow:inset 0 0 0 1px rgba(168,85,247,.18),0 0 18px rgba(147,51,234,.18)}
.fm-win{box-shadow:inset 0 0 0 1px rgba(245,207,15,.2),0 0 18px rgba(245,207,15,.16)}
.fm-card:hover,.fm-card:focus-visible,.fm-on{transform:translateY(-2px) scale(1.04)}
.fm-go.fm-on,.fm-go:hover{box-shadow:inset 0 0 0 1px rgba(168,85,247,.5),0 0 28px rgba(147,51,234,.45)}
.fm-win.fm-on,.fm-win:hover{box-shadow:inset 0 0 0 1px rgba(245,207,15,.5),0 0 28px rgba(245,207,15,.35)}
.fm-flow{stroke-dasharray:2 10;animation:fm-flow 1.4s linear infinite}
.fm-edge{transition:opacity .2s}
.fm-panel{animation:fm-open .18s cubic-bezier(.2,.8,.2,1) both;transform-origin:var(--ox,left) top}
.fb-drawer{animation:fm-slide .25s cubic-bezier(.2,.8,.2,1) both}
.fb-backdrop{animation:fm-fade .2s both}
@keyframes fm-flow{to{stroke-dashoffset:-24}}
@keyframes fm-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes fm-open{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@keyframes fm-slide{from{transform:translateX(100%)}to{transform:none}}
@keyframes fm-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.fm-card,.fm-panel,.fb-drawer,.fb-backdrop{animation:none}.fm-flow{animation:none;stroke-dasharray:none}.fm-card,.fm-edge{transition:none}.fm-card:hover,.fm-card:focus-visible,.fm-on{transform:none}}
`;

function cardClass(kind: SankeyNode['kind']): string {
	if (kind === 'go') return 'fm-go border-secondary/50 bg-[#100a1c]/90';
	if (kind === 'win') return 'fm-win border-accent/60 bg-[#14110a]/90';
	return 'border-base-100/15 bg-[#0c0b10]/90';
}

/**
 * The application flow: one card for each stage, thin glowing lines between them.
 * Hover or click a card to see its applications. Click an application to open the sidebar.
 */
export default function FlowMap({
	nodes,
	links,
	total,
	members,
}: Readonly<{ nodes: SankeyNode[]; links: SankeyLink[]; total: number; members: Record<string, AppBrief[]> }>) {
	const uid = useId();
	const boxRef = useRef<HTMLDivElement>(null);
	const shellRef = useRef<HTMLDivElement>(null);
	const fullBtn = useRef<HTMLButtonElement>(null);
	const exitBtn = useRef<HTMLButtonElement>(null);
	const [zoom, setZoom] = useState(1);
	const zoomRef = useRef(1);
	const center = useRef<{ x: number; y: number } | null>(null);
	const padRef = useRef(0);
	const mapW = useRef(0);
	const drag = useRef<{ x: number; y: number; left: number; top: number; id: number } | null>(null);
	const [dragging, setDragging] = useState(false);
	const [full, setFull] = useState(false);
	const [boxH, setBoxH] = useState(0);
	const [width, setWidth] = useState(900);
	const [active, setActive] = useState<string | null>(null);
	const [pinned, setPinned] = useState(false);
	const [drawer, setDrawer] = useState<string | null>(null);
	const [showTable, setShowTable] = useState(false);
	const [view, setView] = useState({ left: 0, width: 900 });
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	useLayoutEffect(() => {
		const el = boxRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([e]) => {
			setWidth(Math.floor(e.contentRect.width));
			setBoxH(Math.floor(e.contentRect.height));
			setView({ left: el.scrollLeft, width: el.clientWidth });
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const layout = useMemo(() => flowLayout(nodes, links, width), [nodes, links, width]);
	// When the zoomed map is narrower than the box, center it in the box.
	const pad = Math.max(0, (view.width - layout.width * zoom) / 2);
	padRef.current = pad;
	mapW.current = layout.width;
	// The box keeps the 100% size at every zoom. When zoomed out, the map fills the box height.
	const baseH = Math.max(layout.height, MIN_H);
	const height = Math.max(baseH, boxH / zoom);
	const offsetY = (height - layout.height) / 2;
	const hl = useMemo(() => (active ? pathThrough(active, links) : null), [active, links]);
	const card = layout.cards.find((c) => c.id === active) ?? null;

	const clear = () => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
	};
	const hoverOpen = (id: string) => {
		if (pinned || drag.current) return;
		clear();
		timer.current = setTimeout(() => setActive(id), 120);
	};
	const hoverClose = () => {
		if (pinned) return;
		clear();
		timer.current = setTimeout(() => setActive(null), 220);
	};
	const close = useCallback(
		(focusCard = false) => {
			clear();
			setPinned(false);
			setActive((cur) => {
				if (focusCard && cur) cardRefs.current[cur]?.focus();
				return null;
			});
		},
		[],
	);
	useEffect(() => () => clear(), []);

	// Zoom around the point of the map at the center of the box, so that point stays in the center.
	const zoomTo = useCallback((next: number) => {
		const el = boxRef.current;
		const z = clampZoom(next);
		if (!el || z === zoomRef.current) return;
		center.current = {
			x: (el.scrollLeft + el.clientWidth / 2 - padRef.current) / zoomRef.current,
			y: (el.scrollTop + el.clientHeight / 2) / zoomRef.current,
		};
		zoomRef.current = z;
		setZoom(z);
	}, []);
	useLayoutEffect(() => {
		const el = boxRef.current;
		const c = center.current;
		if (!el || !c) return;
		center.current = null;
		const pad = Math.max(0, (el.clientWidth - mapW.current * zoom) / 2);
		el.scrollLeft = c.x * zoom + pad - el.clientWidth / 2;
		el.scrollTop = c.y * zoom - el.clientHeight / 2;
		setView({ left: el.scrollLeft, width: el.clientWidth });
	}, [zoom]);

	// Drag the empty part of the map with the mouse to move it. Touch screens scroll it natively.
	const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
		const el = boxRef.current;
		if (!el || e.pointerType !== 'mouse' || e.button !== 0) return;
		if ((e.target as HTMLElement).closest('button, a, [role="region"]')) return;
		drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, id: e.pointerId };
		el.setPointerCapture(e.pointerId);
		setDragging(true);
		e.preventDefault();
	};
	const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const el = boxRef.current;
		const d = drag.current;
		if (!el || !d || d.id !== e.pointerId) return;
		el.scrollLeft = d.left - (e.clientX - d.x);
		el.scrollTop = d.top - (e.clientY - d.y);
	};
	const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!drag.current || drag.current.id !== e.pointerId) return;
		drag.current = null;
		boxRef.current?.releasePointerCapture(e.pointerId);
		setDragging(false);
	};

	// The scroll wheel and a trackpad pinch zoom the map. Drag to move it.
	useEffect(() => {
		const el = boxRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			// Line mode (some mouse wheels in Firefox) sends about 3 for each notch, pixel mode about 100.
			const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
			// A trackpad pinch sends small steps with ctrlKey, so it needs a larger factor.
			zoomTo(zoomRef.current * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.002)));
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	}, [zoomTo]);

	// Two fingers on a touch screen zoom the map. One finger moves it.
	useEffect(() => {
		const el = boxRef.current;
		if (!el) return;
		let start: { dist: number; zoom: number } | null = null;
		const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
		const onStart = (e: TouchEvent) => {
			if (e.touches.length === 2) start = { dist: dist(e.touches), zoom: zoomRef.current };
		};
		const onMove = (e: TouchEvent) => {
			if (e.touches.length !== 2 || !start || start.dist === 0) return;
			e.preventDefault();
			zoomTo((start.zoom * dist(e.touches)) / start.dist);
		};
		const onEnd = (e: TouchEvent) => {
			if (e.touches.length < 2) start = null;
		};
		// Safari zooms the whole page with its own gesture events. Stop that on the map.
		const noPageZoom = (e: Event) => e.preventDefault();
		el.addEventListener('touchstart', onStart, { passive: true });
		el.addEventListener('touchmove', onMove, { passive: false });
		el.addEventListener('touchend', onEnd);
		el.addEventListener('touchcancel', onEnd);
		el.addEventListener('gesturestart', noPageZoom);
		el.addEventListener('gesturechange', noPageZoom);
		return () => {
			el.removeEventListener('touchstart', onStart);
			el.removeEventListener('touchmove', onMove);
			el.removeEventListener('touchend', onEnd);
			el.removeEventListener('touchcancel', onEnd);
			el.removeEventListener('gesturestart', noPageZoom);
			el.removeEventListener('gesturechange', noPageZoom);
		};
	}, [zoomTo]);

	const enterFull = () => {
		setFull(true);
		// Some phones have no browser full screen. The fixed layer is the fallback.
		shellRef.current?.requestFullscreen?.().catch(() => {});
		setTimeout(() => exitBtn.current?.focus(), 30);
	};
	const exitFull = useCallback(() => {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		setFull(false);
		setTimeout(() => fullBtn.current?.focus(), 30);
	}, []);
	useEffect(() => {
		const onChange = () => {
			if (!document.fullscreenElement) setFull(false);
		};
		document.addEventListener('fullscreenchange', onChange);
		return () => document.removeEventListener('fullscreenchange', onChange);
	}, []);
	useEffect(() => {
		if (!full) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	}, [full]);
	useEffect(() => {
		if (!full || active || drawer) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.fullscreenElement && exitFull();
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [full, active, drawer, exitFull]);

	useEffect(() => {
		if (!active || drawer) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(true);
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [active, drawer, close]);

	const toggle = (id: string, viaKeyboard: boolean) => {
		clear();
		if (active === id && pinned) {
			close();
			return;
		}
		setActive(id);
		setPinned(true);
		if (viaKeyboard) setTimeout(() => document.getElementById(`${uid}-panel`)?.querySelector<HTMLElement>('button, a')?.focus(), 30);
	};

	// Keep the list inside the visible part of the chart, also when the chart scrolls sideways.
	const panelPos = (c: CardBox) => {
		const vLeft = (view.left - pad) / zoom;
		const vWidth = view.width / zoom;
		const minLeft = vLeft + 8;
		const maxLeft = Math.max(minLeft, vLeft + vWidth - PANEL_W - 8);
		const right = c.x + PANEL_W > vLeft + vWidth - 8;
		const want = right ? c.x + c.w - PANEL_W : c.x;
		const left = Math.min(Math.max(want, minLeft), maxLeft);
		const top = Math.max(8, Math.min(c.y + offsetY - 8, height - 300));
		return { left, top, origin: right ? 'right' : 'left' };
	};

	const apps = card ? (members[card.id] ?? []) : [];

	return (
		<div
			ref={shellRef}
			role={full ? 'region' : undefined}
			aria-label={full ? 'Application pipeline map, full screen' : undefined}
			className={full ? 'fixed inset-0 z-40 flex flex-col gap-3 bg-base-300 p-4 sm:p-6' : 'flex flex-col gap-4'}
		>
			<style>{css}</style>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="max-w-prose text-sm text-base-100/60">Hover over a stage, or select it, to see its applications. Select an application to see all its details.</p>
				<div role="group" aria-label="Map view" className="flex items-center gap-2">
					<button type="button" onClick={() => zoomTo([...ZOOM_LEVELS].reverse().find((z) => z < zoom - 0.001) ?? MIN_ZOOM)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out" title="Zoom out" className={ctrl}>
						<FaMagnifyingGlassMinus aria-hidden="true" />
					</button>
					<button type="button" onClick={() => zoomTo(1)} disabled={zoom === 1} aria-label={`Zoom ${Math.round(zoom * 100)}%. Reset to 100%`} title="Reset the zoom" className={`${ctrl} w-16 tabular-nums`}>
						{Math.round(zoom * 100)}%
					</button>
					<button type="button" onClick={() => zoomTo(ZOOM_LEVELS.find((z) => z > zoom + 0.001) ?? MAX_ZOOM)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in" title="Zoom in" className={ctrl}>
						<FaMagnifyingGlassPlus aria-hidden="true" />
					</button>
					{full ? (
						<button ref={exitBtn} type="button" onClick={exitFull} className={`${ctrl} gap-2`}>
							<FaCompress aria-hidden="true" /> Exit full screen
						</button>
					) : (
						<button ref={fullBtn} type="button" onClick={enterFull} className={`${ctrl} gap-2`}>
							<FaExpand aria-hidden="true" /> Full screen
						</button>
					)}
				</div>
			</div>
			<p className="-mb-2 text-xs text-base-100/50">Drag the map to move it. Scroll, or pinch with two fingers, to zoom.</p>
			<div
				ref={boxRef}
				onScroll={(e) => setView({ left: e.currentTarget.scrollLeft, width: e.currentTarget.clientWidth })}
				onPointerDown={onDragStart}
				onPointerMove={onDragMove}
				onPointerUp={onDragEnd}
				onPointerCancel={onDragEnd}
				className={`fm-grid relative touch-pan-x touch-pan-y overflow-auto overscroll-contain scroll-auto ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'} rounded-box border border-secondary/20 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.12),transparent_70%)] ${full ? 'min-h-0 flex-1' : ''}`}
				style={full ? undefined : { height: baseH + 2 }}>
				{/* The outer box has the zoomed size, so the scroll bars match the zoom. */}
				<div className="relative" style={{ width: Math.max(layout.width * zoom, view.width), height: height * zoom }}>
				<div className="absolute top-0 origin-top-left" style={{ left: pad, width: layout.width, height, transform: zoom === 1 ? undefined : `scale(${zoom})` }} onPointerLeave={(e) => e.pointerType === 'mouse' && hoverClose()}>
					<svg width={layout.width} height={height} className="pointer-events-none absolute inset-0" aria-hidden="true">
						<defs>
							<filter id={`${uid}-glow`} x="-20%" y="-50%" width="140%" height="200%">
								<feGaussianBlur stdDeviation="3" result="b" />
								<feMerge>
									<feMergeNode in="b" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>
						<g transform={`translate(0,${offsetY})`}>
							{layout.edges.map((e) => {
								const on = !hl || hl.links.has(`${e.source}>${e.target}`);
								const color = LINE[e.kind];
								return (
									<g key={`${e.source}>${e.target}`} className="fm-edge" opacity={on ? 1 : 0.12}>
										<path d={e.d} fill="none" stroke={color} strokeOpacity={e.kind === 'end' ? 0.45 : 0.35} strokeWidth={e.width} />
										{e.kind !== 'end' && (
											<path d={e.d} fill="none" stroke={color} strokeWidth={Math.max(1.2, e.width * 0.6)} strokeLinecap="round" className="fm-flow" filter={`url(#${uid}-glow)`} />
										)}
									</g>
								);
							})}
						</g>
					</svg>

					{layout.cards.map((c) => {
						const on = !hl || hl.nodes.has(c.id);
						return (
							<button
								key={c.id}
								ref={(el) => {
									cardRefs.current[c.id] = el;
								}}
								type="button"
								aria-expanded={active === c.id}
								aria-controls={active === c.id ? `${uid}-panel` : undefined}
								aria-label={`${fullName(c.id, c.label)}: ${c.value} ${c.value === 1 ? 'application' : 'applications'}. Show the list.`}
								onPointerEnter={(e) => e.pointerType === 'mouse' && hoverOpen(c.id)}
								onFocus={() => !pinned && setActive(null)}
								onClick={(e) => toggle(c.id, e.detail === 0)}
								className={`fm-card absolute flex flex-col justify-between rounded-xl border px-3 py-2 text-left backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ${cardClass(c.kind)} ${active === c.id ? 'fm-on' : ''}`}
								style={{ left: c.x, top: c.y + offsetY, width: c.w, height: CARD_H, opacity: on ? 1 : 0.28, ['--d' as string]: `${c.col * 0.08}s` }}
							>
								<span title={fullName(c.id, c.label)} className={`truncate text-xs ${c.kind === 'end' ? 'text-base-100/55' : 'text-base-100/80'}`}>{c.label}</span>
								<span className="flex items-baseline justify-between gap-2">
									<span className={`text-2xl font-light tabular-nums ${c.kind === 'win' ? 'text-accent' : c.kind === 'go' ? 'text-base-100' : 'text-base-100/70'}`}>{c.value}</span>
									<span className="text-xs tabular-nums text-base-100/45">{percentOf(c.value, total)}%</span>
								</span>
							</button>
						);
					})}

					{card && (
						<div
							id={`${uid}-panel`}
							role="region"
							aria-label={`${fullName(card.id, card.label)}: applications`}
							onPointerEnter={clear}
							onPointerLeave={(e) => e.pointerType === 'mouse' && hoverClose()}
							className={`fm-panel absolute z-20 flex max-h-[300px] flex-col overflow-hidden rounded-xl border bg-[#0b0712]/95 backdrop-blur-md ${card.kind === 'win' ? 'border-accent/60 shadow-[0_0_40px_rgba(245,207,15,0.25)]' : card.kind === 'go' ? 'border-secondary/60 shadow-[0_0_40px_rgba(147,51,234,0.4)]' : 'border-base-100/25 shadow-[0_0_30px_rgba(0,0,0,0.6)]'}`}
							style={{ left: panelPos(card).left, top: panelPos(card).top, width: PANEL_W, ['--ox' as string]: panelPos(card).origin }}
						>
							<div className="flex items-center justify-between gap-2 border-b border-base-100/10 px-3 py-2">
								<p className="min-w-0 text-sm text-base-100">
									<span className="mr-2 text-lg font-light tabular-nums">{card.value}</span>
									<span className="text-base-100/70">{fullName(card.id, card.label)}</span>
								</p>
								<button type="button" onClick={() => close(true)} aria-label="Close the list" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base-100/80 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
									<FaXmark aria-hidden="true" />
								</button>
							</div>
							{apps.length === 0 ? (
								<p className="p-3 text-sm text-base-100/60">No applications.</p>
							) : (
								<ul className="overflow-y-auto p-1">
									{apps.map((a) => (
										<li key={a.id}>
											<button
												type="button"
												onClick={() => {
													setDrawer(a.id);
													clear();
												}}
												className="flex min-h-11 w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-secondary/15 focus-visible:bg-secondary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
											>
												<span className="truncate text-sm text-base-100">{a.company || 'No company'}</span>
												<span className="flex justify-between gap-2 text-xs text-base-100/60">
													<span className="truncate">{a.jobTitle || 'Untitled job'}</span>
													<span className="shrink-0 text-neutral">{STATUS_LABEL[a.status]}</span>
												</span>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
				</div>
			</div>

			{!full && (
			<>
			<button type="button" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable} aria-controls={`${uid}-table`} className="min-h-11 w-fit text-sm text-neutral underline underline-offset-2">
				{showTable ? 'Hide the data table' : 'Show the data as a table'}
			</button>
			<table id={`${uid}-table`} className={showTable ? 'w-full text-left text-sm tabular-nums text-base-100/80' : 'sr-only'}>
				<caption className="sr-only">How the applications moved between stages</caption>
				<thead>
					<tr className="border-b border-base-100/20 text-base-100">
						<th scope="col" className="py-2 pr-4 font-medium">From</th>
						<th scope="col" className="py-2 pr-4 font-medium">To</th>
						<th scope="col" className="py-2 font-medium">Applications</th>
					</tr>
				</thead>
				<tbody>
					{links.map((l) => {
						const s = nodes.find((n) => n.id === l.source);
						const t = nodes.find((n) => n.id === l.target);
						return (
							<tr key={`${l.source}>${l.target}`} className="border-b border-base-100/10">
								<td className="py-2 pr-4">{s ? fullName(s.id, s.label) : l.source}</td>
								<td className="py-2 pr-4">{t ? fullName(t.id, t.label) : l.target}</td>
								<td className="py-2">{l.value}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			</>
			)}

			{/* Inside the full screen element, so the details also show in full screen. */}
			<AppDrawer appId={drawer} onClose={() => setDrawer(null)} />
		</div>
	);
}
