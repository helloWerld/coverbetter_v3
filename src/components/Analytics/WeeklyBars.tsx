import { weekLabel } from './helpers';

const W = 600;
const H = 220;
const PAD = { l: 28, r: 8, t: 22, b: 28 };

/** A bar with 4px rounded top corners. */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
	const rr = Math.min(r, w / 2, h);
	return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export default function WeeklyBars({
	weeks,
}: Readonly<{ weeks: { weekStart: string; count: number }[] }>) {
	const max = Math.max(1, ...weeks.map((w) => w.count));
	const plotW = W - PAD.l - PAD.r;
	const plotH = H - PAD.t - PAD.b;
	const slot = plotW / Math.max(1, weeks.length);
	const bw = slot * 0.62;
	const base = PAD.t + plotH;

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label="Applications per week, last 12 weeks">
			<line x1={PAD.l} x2={W - PAD.r} y1={base} y2={base} stroke="rgba(255,255,255,0.25)" />
			<line x1={PAD.l} x2={W - PAD.r} y1={PAD.t} y2={PAD.t} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
			<text x={PAD.l - 6} y={PAD.t} textAnchor="end" dominantBaseline="central" fontSize={11} className="fill-base-100/70 tabular-nums">
				{max}
			</text>
			<text x={PAD.l - 6} y={base} textAnchor="end" dominantBaseline="central" fontSize={11} className="fill-base-100/70 tabular-nums">
				0
			</text>
			{weeks.map((w, i) => {
				const x = PAD.l + i * slot;
				const bx = x + (slot - bw) / 2;
				const h = (w.count / max) * plotH;
				const label = `Week of ${weekLabel(w.weekStart)}: ${w.count} ${w.count === 1 ? 'application' : 'applications'}`;
				return (
					<g key={w.weekStart} className="group outline-none" tabIndex={0} role="img" aria-label={label}>
						<rect
							x={x + 1}
							y={PAD.t - 18}
							width={slot - 2}
							height={plotH + 18}
							rx={4}
							fill="transparent"
							className="stroke-transparent group-focus-visible:stroke-accent"
							strokeWidth={2}
						/>
						{w.count > 0 ? (
							<path d={barPath(bx, base - h, bw, h)} className="fill-secondary transition-colors group-hover:fill-neutral group-focus-visible:fill-neutral" />
						) : (
							<rect x={bx} y={base - 2} width={bw} height={2} className="fill-base-100/20" />
						)}
						<text
							x={x + slot / 2}
							y={base - h - 6}
							textAnchor="middle"
							fontSize={12}
							fontWeight={600}
							className="fill-base-100 tabular-nums opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
						>
							{w.count}
						</text>
						{(weeks.length - 1 - i) % 2 === 0 && (
							<text x={x + slot / 2} y={H - 8} textAnchor="middle" fontSize={11} className="fill-base-100/70">
								{weekLabel(w.weekStart)}
							</text>
						)}
					</g>
				);
			})}
		</svg>
	);
}
