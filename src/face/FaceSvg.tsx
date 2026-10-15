import type { ResolvedFace } from './params';

export type Zone = 'brows' | 'eyes' | 'mouth' | 'head';

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const r = (n: number) => Math.round(n * 10) / 10;

interface FaceSvgProps {
  p: ResolvedFace;
  /** Unique, url-safe id prefix for clip paths. */
  uid: string;
  label: string;
  highlight?: Zone | null;
  className?: string;
}

/**
 * Pure SVG drawing of the cartoon face. A port of the prototype renderer
 * (Appendix B). With all new parameters at 0 the geometry is identical to the
 * prototype, so the five original faces look the same.
 */
export function FaceSvg({ p, uid, label, highlight, className }: FaceSvgProps) {
  const fx = p.turn * 10;
  const fy = p.pitch * 10;
  const sy = 278 - p.shoulders * 16 + Math.max(0, p.slump) * 7;
  const cr = cl(p.cheekRaise);

  function eye(cx0: number, side: 'L' | 'R') {
    const cx = cx0 + fx;
    const cy = 134 + fy;
    const hu = Math.max(2.2 - cl(p.lidClose) * 1.2, 9 + p.eyeOpen * 5 - p.lidClose * 6.5);
    let hl2 = Math.max(1.4, 6 - p.lowerLid * 3.5) - p.cheekRaise * 5.5;
    hl2 = Math.max(hl2, -hu * 0.6);
    const shape = `M${r(cx - 17)} ${r(cy)} Q${r(cx)} ${r(cy - 2 * hu)} ${r(cx + 17)} ${r(cy)} Q${r(cx)} ${r(cy + 2 * hl2)} ${r(cx - 17)} ${r(cy)}Z`;
    const ix = cx + p.gx * 7;
    const iy = cy + p.gy * 4.5 - 1;
    const cid = `${uid}-eye${side}`;
    const s = side === 'L' ? -1 : 1;
    const crowO = r(cl(cr * 1.25 - 0.25) * 0.8);
    return (
      <g key={side}>
        <clipPath id={cid}>
          <path d={shape} />
        </clipPath>
        <path d={shape} fill="var(--sclera)" />
        <g clipPath={`url(#${cid})`}>
          <circle cx={r(ix)} cy={r(iy)} r="7.6" fill="var(--face-ink)" />
          <circle cx={r(ix + 2.6)} cy={r(iy - 2.6)} r="1.9" fill="var(--sclera)" />
        </g>
        <path className="ln" d={shape} strokeWidth="1.4" />
        <path className="ln" d={`M${r(cx - 17)} ${r(cy)} Q${r(cx)} ${r(cy - 2 * hu)} ${r(cx + 17)} ${r(cy)}`} strokeWidth="2.8" />
        <path className="ln" d={`M${r(cx - 15)} ${r(cy - 4)} Q${r(cx)} ${r(cy - 2 * hu - 9)} ${r(cx + 15)} ${r(cy - 4)}`} strokeWidth="1.2" opacity=".35" />
        <path
          className="ln"
          d={`M${r(cx - 13)} ${r(cy + 4)} Q${r(cx)} ${r(cy + 2 * hl2 + 7)} ${r(cx + 13)} ${r(cy + 4)}`}
          strokeWidth="1.2"
          opacity={r(cl(Math.max(p.lowerLid, cr)) * 0.7)}
        />
        {cr > 0.02 && (
          <>
            <path
              className="ln"
              d={`M${r(cx - 15)} ${r(cy + 15 - cr * 3)} Q${r(cx)} ${r(cy + 6 - cr * 4)} ${r(cx + 15)} ${r(cy + 15 - cr * 3)}`}
              strokeWidth="1.2"
              opacity={r(cr * 0.55)}
            />
            <path
              className="ln"
              d={`M${r(cx + s * 20)} ${r(cy - 2)} l${6 * s} -3 M${r(cx + s * 20.5)} ${r(cy + 1.5)} l${7 * s} .5 M${r(cx + s * 20)} ${r(cy + 5)} l${6 * s} 3.5`}
              strokeWidth="1.1"
              opacity={crowO}
            />
          </>
        )}
      </g>
    );
  }

  function brow(side: 'L' | 'R') {
    const s = side === 'L' ? -1 : 1;
    const extra = side === 'R' ? p.asym : 0;
    const ix = 120 + s * (14 - p.squeeze * 5) + fx;
    const ox = 120 + s * 50 + fx;
    const iy = 108 - p.browInner * 11 + p.squeeze * 3 - extra * 9 + fy;
    const oy = 110 - p.browOuter * 8 - extra * 11 + fy;
    const mx = ix * 0.45 + ox * 0.55;
    const my = Math.min(iy, oy) - 7 + Math.max(0, p.browInner) * 3;
    return <path key={side} className="ln" d={`M${r(ix)} ${r(iy)} Q${r(mx)} ${r(my)} ${r(ox)} ${r(oy)}`} strokeWidth="6.5" />;
  }
  const furrowO = cl(p.squeeze * 1.1 - 0.2);
  const foreO = cl(p.browInner * 1.1 + p.asym * 0.4);

  // mouth
  const ulr = cl(p.upperLipRaise);
  const caR = Math.max(0, p.cornerAsym);
  const caL = Math.max(0, -p.cornerAsym);
  const mcx = 120 + fx + p.shift * 5;
  const mcy = 204 + fy;
  const hw = 24 - p.press * 3 + p.stretch * 6 + Math.max(0, p.cornerUp) * 4;
  const Lx = mcx - hw - caL * 3;
  const Rx = mcx + hw + p.shift * 5 + caR * 3;
  const Ly = mcy - p.cornerUp * 7 - caL * 10;
  const Ry = mcy - p.cornerUp * 7 - Math.max(0, p.shift) * 3 - caR * 10;
  const midY = mcy + 1 - p.chin * 5;
  const isOpen = p.open > 0.05 || ulr > 0.05;
  const topCtrl = mcy - 3 - ulr * 9;
  // Smiles and stretched (crying) mouths drop the lower lip further when open, for a laughing "D" or a square cry.
  const botCtrl = mcy + 2 + p.open * 24 + Math.max(0, p.cornerUp) * p.open * 18 + cl(p.stretch) * p.open * 10;
  const mouthShape = `M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(topCtrl)} ${r(Rx)} ${r(Ry)} Q${r(mcx)} ${r(botCtrl)} ${r(Lx)} ${r(Ly)}Z`;
  const topMid = 0.25 * Ly + 0.5 * topCtrl + 0.25 * Ry;
  const botMid = 0.25 * Ly + 0.5 * botCtrl + 0.25 * Ry;
  const tth = cl(p.teeth);
  const opening = Math.max(0, botMid - topMid);
  const upperT = opening * (0.18 + 0.27 * tth) + 1.5;
  const lowerT = tth > 0.6 ? opening * 0.22 * ((tth - 0.6) / 0.4) : 0;
  const mid = `${uid}-mouth`;

  const mouthPath = isOpen ? (
    <>
      <path d={mouthShape} fill="var(--mouth)" />
      {tth > 0.02 && (
        <>
          <clipPath id={mid}>
            <path d={mouthShape} />
          </clipPath>
          <g clipPath={`url(#${mid})`}>
            <rect x={r(Lx)} y={r(topMid - 16)} width={r(Rx - Lx)} height={r(16 + upperT)} fill="var(--teeth)" />
            <path className="ln" d={`M${r(Lx)} ${r(topMid + upperT)} L${r(Rx)} ${r(topMid + upperT)}`} strokeWidth="1" opacity=".35" />
            {lowerT > 0.3 && <rect x={r(Lx)} y={r(botMid - lowerT)} width={r(Rx - Lx)} height={r(lowerT + 16)} fill="var(--teeth)" />}
          </g>
        </>
      )}
      <path className="ln" d={`M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(topCtrl)} ${r(Rx)} ${r(Ry)}`} strokeWidth="2.4" />
    </>
  ) : (
    <path className="ln" d={`M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(midY)} ${r(Rx)} ${r(Ry)}`} strokeWidth={r(2.6 + p.press * 1.6)} />
  );
  const pb = p.press * 4 - ulr * 6;
  const upperLip = `M${r(Lx + 4)} ${r(Ly - 3)} Q${r(mcx - 7)} ${r(mcy - 11 + pb)} ${r(mcx)} ${r(mcy - 8 + pb)} Q${r(mcx + 7)} ${r(mcy - 11 + pb)} ${r(Rx - 4)} ${r(Ry - 3)}`;
  const lb = cl(p.lipBite);
  const lowerLip = `M${r(Lx + 6)} ${r(Ly + 5)} Q${r(mcx)} ${r(mcy + 15 - p.press * 7 - p.chin * 3 + p.open * 22 - lb * 4)} ${r(Rx - 6)} ${r(Ry + 5)}`;
  const chinO = cl(p.chin) * 0.75;
  const jawO = cl(p.jaw) * 0.65;
  const nlO = cl(
    0.2 +
      cl(p.stretch) * 0.4 +
      cl(-p.cornerUp) * 0.15 +
      cl(p.cornerUp) * 0.3 +
      ulr * 0.5 +
      cr * 0.15 +
      cl(Math.abs(p.cornerAsym)) * 0.2,
  );
  const neckO = cl(p.stretch * 1.2 + p.jaw * 0.3 - 0.35);
  const nw = cl(p.noseWrinkle);
  // Nostrils show only when the chin is clearly up, so small head-backs (like Hurt's flinch) stay as in the prototype.
  const nostrilO = r(cl((-p.pitch - 0.32) * 1.8) * 0.7);

  return (
    <svg className={`face ${className ?? ''}`} viewBox="0 0 240 300" role="img" aria-label={label} data-hl={highlight ?? undefined}>
      <g data-zone="head">
        <path d={`M100 222 L100 ${r(sy)} L140 ${r(sy)} L140 222Z`} fill="var(--face)" />
        <path className="ln" d={`M100 222 L100 ${r(sy)} M140 222 L140 ${r(sy)}`} strokeWidth="1.6" />
        <path className="ln" d={`M110 236 L105 ${r(sy - 3)} M130 236 L135 ${r(sy - 3)}`} strokeWidth="1.4" opacity={r(neckO)} />
        <path
          d={`M-2 302 L-2 ${r(sy + 20)} C12 ${r(sy + 2)} 60 ${r(sy - 6 + p.slump * 5)} 100 ${r(sy - 4)} L140 ${r(sy - 4)} C180 ${r(sy - 6 + p.slump * 5)} 228 ${r(sy + 2)} 242 ${r(sy + 20)} L242 302Z`}
          fill="var(--shirt)"
        />
        <path
          className="ln"
          d={`M-2 ${r(sy + 20)} C12 ${r(sy + 2)} 60 ${r(sy - 6 + p.slump * 5)} 100 ${r(sy - 4)} L140 ${r(sy - 4)} C180 ${r(sy - 6 + p.slump * 5)} 228 ${r(sy + 2)} 242 ${r(sy + 20)}`}
          strokeWidth="1.8"
        />
      </g>
      <g transform={`translate(${r(p.turn * 6)} ${r(p.pitch * 6)}) rotate(${r(p.tilt)} 120 236)`}>
        <g data-zone="head">
          <ellipse cx={r(39 - p.turn * 4)} cy="142" rx="8" ry="16" fill="var(--face)" />
          <ellipse className="ln" cx={r(39 - p.turn * 4)} cy="142" rx="8" ry="16" strokeWidth="1.6" />
          <ellipse cx={r(201 - p.turn * 4)} cy="142" rx="8" ry="16" fill="var(--face)" />
          <ellipse className="ln" cx={r(201 - p.turn * 4)} cy="142" rx="8" ry="16" strokeWidth="1.6" />
          <path d="M120 38 C170 38 200 80 200 132 C200 192 166 242 120 242 C74 242 40 192 40 132 C40 80 70 38 120 38Z" fill="var(--face)" />
          <path className="ln" d="M120 38 C170 38 200 80 200 132 C200 192 166 242 120 242 C74 242 40 192 40 132 C40 80 70 38 120 38Z" strokeWidth="2" />
          <path d="M40 132 C34 62 76 30 120 30 C164 30 206 62 200 132 C192 98 168 72 120 72 C72 72 48 98 40 132Z" fill="var(--hair)" />
          <path className="ln" d="M40 132 C48 98 72 72 120 72 C168 72 192 98 200 132" strokeWidth="1.4" opacity=".6" />
        </g>
        <g data-zone="brows">
          <path
            className="ln"
            d={`M${r(98 + fx)} ${r(86 + fy)} Q${r(120 + fx)} ${r(80 + fy)} ${r(142 + fx)} ${r(86 + fy)} M${r(104 + fx)} ${r(95 + fy)} Q${r(120 + fx)} ${r(90 + fy)} ${r(136 + fx)} ${r(95 + fy)}`}
            strokeWidth="1.3"
            opacity={r(foreO * 0.8)}
          />
          <path className="ln" d={`M${r(117 + fx)} ${r(111 + fy)} l-1 10 M${r(123 + fx)} ${r(111 + fy)} l1 10`} strokeWidth="1.5" opacity={r(furrowO)} />
          {brow('L')}
          {brow('R')}
        </g>
        <g data-zone="eyes">
          {cr > 0.02 && (
            <>
              <ellipse cx={r(84 + fx)} cy={r(160 + fy - cr * 5)} rx="15" ry="9" fill="var(--cheek)" opacity={r(cr * 0.35)} />
              <ellipse cx={r(156 + fx)} cy={r(160 + fy - cr * 5)} rx="15" ry="9" fill="var(--cheek)" opacity={r(cr * 0.35)} />
            </>
          )}
          {eye(90, 'L')}
          {eye(150, 'R')}
        </g>
        <path
          className="ln"
          d={`M${r(118 + fx)} ${r(144 + fy)} Q${r(112 + fx)} ${r(162 + fy)} ${r(110 + fx)} ${r(172 + fy)} Q${r(120 + fx)} ${r(179 + fy)} ${r(130 + fx)} ${r(172 + fy)}`}
          strokeWidth="1.7"
        />
        {nostrilO > 0 && (
          <g opacity={nostrilO}>
            <ellipse cx={r(114 + fx)} cy={r(174.5 + fy)} rx="2.8" ry="1.4" fill="var(--face-ink)" />
            <ellipse cx={r(126 + fx)} cy={r(174.5 + fy)} rx="2.8" ry="1.4" fill="var(--face-ink)" />
          </g>
        )}
        <g data-zone="mouth">
          {nw > 0.02 && (
            <path
              className="ln"
              d={`M${r(114 + fx)} ${r(140 + fy)} q6 -2.5 12 0 M${r(113 + fx)} ${r(146 + fy)} q7 -3 14 0 M${r(114 + fx)} ${r(152 + fy)} q6 -2.5 12 0 M${r(107 + fx)} ${r(163 + fy)} q-4.5 5 1 10 M${r(133 + fx)} ${r(163 + fy)} q4.5 5 -1 10`}
              strokeWidth="1.2"
              opacity={r(nw * 0.85)}
            />
          )}
          <path
            className="ln"
            d={`M${r(108 + fx)} ${r(176 + fy)} Q${r(96 + fx)} ${r(188 + fy)} ${r(Lx - 3)} ${r(Ly + 3)} M${r(132 + fx)} ${r(176 + fy)} Q${r(144 + fx)} ${r(188 + fy)} ${r(Rx + 3)} ${r(Ry + 3)}`}
            strokeWidth="1.3"
            opacity={r(nlO)}
          />
          <path className="ln" d={upperLip} strokeWidth="1.3" opacity=".35" />
          {mouthPath}
          <path className="ln" d={lowerLip} strokeWidth="1.3" opacity=".4" />
          {lb > 0.05 && (
            <rect
              x={r(mcx - 7)}
              y={r((isOpen ? topMid : mcy) - 1.5)}
              width="14"
              height={r(2.5 + lb * 3.5)}
              rx="1.5"
              fill="var(--teeth)"
              stroke="var(--face-ink)"
              strokeWidth="1"
              opacity={r(cl(lb * 1.5))}
            />
          )}
          {lb > 0.05 && (
            <path className="ln" d={`M${r(mcx)} ${r((isOpen ? topMid : mcy) - 1.5)} l0 ${r(2.5 + lb * 3.5)}`} strokeWidth="0.8" opacity={r(cl(lb * 1.5) * 0.6)} />
          )}
          {caR > 0.02 && <path className="ln" d={`M${r(Rx + 1)} ${r(Ry - 5)} q4 4 0 9`} strokeWidth="1.3" opacity={r(cl(caR * 1.2) * 0.8)} />}
          {caL > 0.02 && <path className="ln" d={`M${r(Lx - 1)} ${r(Ly - 5)} q-4 4 0 9`} strokeWidth="1.3" opacity={r(cl(caL * 1.2) * 0.8)} />}
          <path
            className="ln"
            d={`M${r(mcx - 12)} ${r(mcy + 30)} Q${r(mcx)} ${r(mcy + 25 - p.chin * 4)} ${r(mcx + 12)} ${r(mcy + 30)}`}
            strokeWidth="1.4"
            opacity={r(chinO)}
          />
          <path
            className="ln"
            d={`M${r(60 + fx * 0.5)} ${r(188 + fy * 0.5)} Q${r(66 + fx * 0.5)} ${r(198 + fy * 0.5)} ${r(61 + fx * 0.5)} ${r(210 + fy * 0.5)} M${r(180 + fx * 0.5)} ${r(188 + fy * 0.5)} Q${r(174 + fx * 0.5)} ${r(198 + fy * 0.5)} ${r(179 + fx * 0.5)} ${r(210 + fy * 0.5)}`}
            strokeWidth="1.4"
            opacity={r(jawO)}
          />
        </g>
      </g>
    </svg>
  );
}
