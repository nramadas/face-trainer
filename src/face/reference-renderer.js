// Test fixture: the original prototype renderer from the build brief (Appendix B), unchanged.
// Used by FaceSvg.test.tsx to prove the five gold faces draw exactly as before.
const KEYS = ["browInner","browOuter","squeeze","asym","eyeOpen","lowerLid","gx","gy","cornerUp","press","stretch","open","chin","shift","jaw","tilt","pitch","turn","shoulders","slump"];

export function mix(target, t) {
  const o = {};
  for (const k of KEYS) o[k] = (target[k] || 0) * t;
  return o;
}
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const r = n => Math.round(n * 10) / 10;

export function face(p, id, label, hl) {
  const fx = p.turn * 10, fy = p.pitch * 10;
  const sy = 278 - p.shoulders * 16 + p.slump * 7;

  function eye(cx0, side) {
    const cx = cx0 + fx, cy = 134 + fy;
    const hu = Math.max(2.2, 9 + p.eyeOpen * 5);
    const hl2 = Math.max(1.4, 6 - p.lowerLid * 3.5);
    const shape = `M${r(cx-17)} ${r(cy)} Q${r(cx)} ${r(cy-2*hu)} ${r(cx+17)} ${r(cy)} Q${r(cx)} ${r(cy+2*hl2)} ${r(cx-17)} ${r(cy)}Z`;
    const ix = cx + p.gx * 7, iy = cy + p.gy * 4.5 - 1;
    const cid = `${id}-eye${side}`;
    return `<clipPath id="${cid}"><path d="${shape}"/></clipPath>
      <path d="${shape}" fill="var(--sclera)"/>
      <g clip-path="url(#${cid})"><circle cx="${r(ix)}" cy="${r(iy)}" r="7.6" fill="var(--face-ink)"/><circle cx="${r(ix+2.6)}" cy="${r(iy-2.6)}" r="1.9" fill="var(--sclera)"/></g>
      <path class="ln" d="${shape}" stroke-width="1.4"/>
      <path class="ln" d="M${r(cx-17)} ${r(cy)} Q${r(cx)} ${r(cy-2*hu)} ${r(cx+17)} ${r(cy)}" stroke-width="2.8"/>
      <path class="ln" d="M${r(cx-15)} ${r(cy-4)} Q${r(cx)} ${r(cy-2*hu-9)} ${r(cx+15)} ${r(cy-4)}" stroke-width="1.2" opacity=".35"/>
      <path class="ln" d="M${r(cx-13)} ${r(cy+4)} Q${r(cx)} ${r(cy+2*hl2+7)} ${r(cx+13)} ${r(cy+4)}" stroke-width="1.2" opacity="${r(cl(p.lowerLid)*.7)}"/>`;
  }

  function brow(side) {
    const s = side === "L" ? -1 : 1;
    const extra = side === "R" ? p.asym : 0;
    const ix = 120 + s * (14 - p.squeeze * 5) + fx;
    const ox = 120 + s * 50 + fx;
    const iy = 108 - p.browInner * 11 + p.squeeze * 3 - extra * 9 + fy;
    const oy = 110 - p.browOuter * 8 - extra * 11 + fy;
    const mx = ix * 0.45 + ox * 0.55;
    const my = Math.min(iy, oy) - 7 + Math.max(0, p.browInner) * 3;
    return `<path class="ln" d="M${r(ix)} ${r(iy)} Q${r(mx)} ${r(my)} ${r(ox)} ${r(oy)}" stroke-width="6.5"/>`;
  }
  const furrowO = cl(p.squeeze * 1.1 - 0.2);
  const foreO = cl(p.browInner * 1.1 + p.asym * 0.4);

  const mcx = 120 + fx + p.shift * 5, mcy = 204 + fy;
  const hw = 24 - p.press * 3 + p.stretch * 6;
  const Lx = mcx - hw, Rx = mcx + hw + p.shift * 5;
  const Ly = mcy - p.cornerUp * 7, Ry = mcy - p.cornerUp * 7 - Math.max(0, p.shift) * 3;
  const midY = mcy + 1 - p.chin * 5;
  const mouthPath = p.open > 0.05
    ? `<path d="M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(mcy-3)} ${r(Rx)} ${r(Ry)} Q${r(mcx)} ${r(mcy+2+p.open*24)} ${r(Lx)} ${r(Ly)}Z" fill="var(--mouth)"/><path class="ln" d="M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(mcy-3)} ${r(Rx)} ${r(Ry)}" stroke-width="2.4"/>`
    : `<path class="ln" d="M${r(Lx)} ${r(Ly)} Q${r(mcx)} ${r(midY)} ${r(Rx)} ${r(Ry)}" stroke-width="${r(2.6 + p.press * 1.6)}"/>`;
  const pb = p.press * 4;
  const upperLip = `M${r(Lx+4)} ${r(Ly-3)} Q${r(mcx-7)} ${r(mcy-11+pb)} ${r(mcx)} ${r(mcy-8+pb)} Q${r(mcx+7)} ${r(mcy-11+pb)} ${r(Rx-4)} ${r(Ry-3)}`;
  const lowerLip = `M${r(Lx+6)} ${r(Ly+5)} Q${r(mcx)} ${r(mcy+15-p.press*7-p.chin*3+p.open*22)} ${r(Rx-6)} ${r(Ry+5)}`;
  const chinO = cl(p.chin) * 0.75;
  const jawO = cl(p.jaw) * 0.65;
  const nlO = cl(0.2 + cl(p.stretch) * 0.4 + cl(-p.cornerUp) * 0.15);
  const neckO = cl(p.stretch * 1.2 + p.jaw * 0.3 - 0.35);

  return `<svg class="face" viewBox="0 0 240 300" role="img" aria-label="${label}" ${hl ? `data-hl="${hl}"` : ""}>
    <g data-zone="head">
      <path d="M100 222 L100 ${r(sy)} L140 ${r(sy)} L140 222Z" fill="var(--face)"/>
      <path class="ln" d="M100 222 L100 ${r(sy)} M140 222 L140 ${r(sy)}" stroke-width="1.6"/>
      <path class="ln" d="M110 236 L105 ${r(sy-3)} M130 236 L135 ${r(sy-3)}" stroke-width="1.4" opacity="${r(neckO)}"/>
      <path d="M-2 302 L-2 ${r(sy+20)} C12 ${r(sy+2)} 60 ${r(sy-6+p.slump*5)} 100 ${r(sy-4)} L140 ${r(sy-4)} C180 ${r(sy-6+p.slump*5)} 228 ${r(sy+2)} 242 ${r(sy+20)} L242 302Z" fill="var(--shirt)"/>
      <path class="ln" d="M-2 ${r(sy+20)} C12 ${r(sy+2)} 60 ${r(sy-6+p.slump*5)} 100 ${r(sy-4)} L140 ${r(sy-4)} C180 ${r(sy-6+p.slump*5)} 228 ${r(sy+2)} 242 ${r(sy+20)}" stroke-width="1.8"/>
    </g>
    <g transform="translate(${r(p.turn*6)} ${r(p.pitch*6)}) rotate(${r(p.tilt)} 120 236)">
      <g data-zone="head">
        <ellipse cx="${r(39 - p.turn*4)}" cy="142" rx="8" ry="16" fill="var(--face)"/>
        <ellipse class="ln" cx="${r(39 - p.turn*4)}" cy="142" rx="8" ry="16" stroke-width="1.6"/>
        <ellipse cx="${r(201 - p.turn*4)}" cy="142" rx="8" ry="16" fill="var(--face)"/>
        <ellipse class="ln" cx="${r(201 - p.turn*4)}" cy="142" rx="8" ry="16" stroke-width="1.6"/>
        <path d="M120 38 C170 38 200 80 200 132 C200 192 166 242 120 242 C74 242 40 192 40 132 C40 80 70 38 120 38Z" fill="var(--face)"/>
        <path class="ln" d="M120 38 C170 38 200 80 200 132 C200 192 166 242 120 242 C74 242 40 192 40 132 C40 80 70 38 120 38Z" stroke-width="2"/>
        <path d="M40 132 C34 62 76 30 120 30 C164 30 206 62 200 132 C192 98 168 72 120 72 C72 72 48 98 40 132Z" fill="var(--hair)"/>
        <path class="ln" d="M40 132 C48 98 72 72 120 72 C168 72 192 98 200 132" stroke-width="1.4" opacity=".6"/>
      </g>
      <g data-zone="brows">
        <path class="ln" d="M${r(98+fx)} ${r(86+fy)} Q${r(120+fx)} ${r(80+fy)} ${r(142+fx)} ${r(86+fy)} M${r(104+fx)} ${r(95+fy)} Q${r(120+fx)} ${r(90+fy)} ${r(136+fx)} ${r(95+fy)}" stroke-width="1.3" opacity="${r(foreO*.8)}"/>
        <path class="ln" d="M${r(117+fx)} ${r(111+fy)} l-1 10 M${r(123+fx)} ${r(111+fy)} l1 10" stroke-width="1.5" opacity="${r(furrowO)}"/>
        ${brow("L")}${brow("R")}
      </g>
      <g data-zone="eyes">${eye(90, "L")}${eye(150, "R")}</g>
      <path class="ln" d="M${r(118+fx)} ${r(144+fy)} Q${r(112+fx)} ${r(162+fy)} ${r(110+fx)} ${r(172+fy)} Q${r(120+fx)} ${r(179+fy)} ${r(130+fx)} ${r(172+fy)}" stroke-width="1.7"/>
      <g data-zone="mouth">
        <path class="ln" d="M${r(108+fx)} ${r(176+fy)} Q${r(96+fx)} ${r(188+fy)} ${r(Lx-3)} ${r(Ly+3)} M${r(132+fx)} ${r(176+fy)} Q${r(144+fx)} ${r(188+fy)} ${r(Rx+3)} ${r(Ry+3)}" stroke-width="1.3" opacity="${r(nlO)}"/>
        <path class="ln" d="${upperLip}" stroke-width="1.3" opacity=".35"/>
        ${mouthPath}
        <path class="ln" d="${lowerLip}" stroke-width="1.3" opacity=".4"/>
        <path class="ln" d="M${r(mcx-12)} ${r(mcy+30)} Q${r(mcx)} ${r(mcy+25-p.chin*4)} ${r(mcx+12)} ${r(mcy+30)}" stroke-width="1.4" opacity="${r(chinO)}"/>
        <path class="ln" d="M${r(60+fx*.5)} ${r(188+fy*.5)} Q${r(66+fx*.5)} ${r(198+fy*.5)} ${r(61+fx*.5)} ${r(210+fy*.5)} M${r(180+fx*.5)} ${r(188+fy*.5)} Q${r(174+fx*.5)} ${r(198+fy*.5)} ${r(179+fx*.5)} ${r(210+fy*.5)}" stroke-width="1.4" opacity="${r(jawO)}"/>
      </g>
    </g>
  </svg>`;
}
