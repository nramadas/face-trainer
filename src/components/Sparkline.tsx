/** Tiny line chart of recall times. Lower is faster. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const w = 72;
  const h = 24;
  if (values.length < 2) return <span className="inline-block w-[72px] text-center text-xs text-faint">–</span>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`);
  const last = pts.at(-1)!.split(',');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke="#6fd0d9" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill="#6fd0d9" />
    </svg>
  );
}
