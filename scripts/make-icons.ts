/**
 * Generate the app icons from one original SVG: an abstract face outline in the accent color.
 *   npm run icons
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const ACCENT = '#2FA4B0';
const ACCENT_LIGHT = '#7FD6DE';

// The face mark, drawn in a 100x100 box centered at (50, 50).
function mark(scale: number) {
  const s = scale;
  const t = (50 - 50 * s).toFixed(2);
  return `<g transform="translate(${t} ${t}) scale(${s})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 14 C71 14 82 31 82 50 C82 72 68 88 50 88 C32 88 18 72 18 50 C18 31 29 14 50 14Z" stroke="${ACCENT}" stroke-width="5"/>
    <path d="M31 40 Q37 34 44 37" stroke="${ACCENT_LIGHT}" stroke-width="4.5"/>
    <path d="M56 37 Q63 34 69 40" stroke="${ACCENT_LIGHT}" stroke-width="4.5"/>
    <path d="M38 64 Q50 72 62 62" stroke="${ACCENT_LIGHT}" stroke-width="4.5"/>
  </g>`;
}

function svg(opts: { rounded: boolean; scale: number }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14393E"/><stop offset="1" stop-color="#0A1315"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stop-color="${ACCENT}" stop-opacity=".28"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100" height="100" rx="${opts.rounded ? 22 : 0}" fill="url(#bg)"/>
  <rect width="100" height="100" rx="${opts.rounded ? 22 : 0}" fill="url(#glow)"/>
  ${mark(opts.scale)}
</svg>`;
}

mkdirSync('public/icons', { recursive: true });
const anyIcon = svg({ rounded: true, scale: 0.86 });
const maskable = svg({ rounded: false, scale: 0.66 });
writeFileSync('public/favicon.svg', anyIcon);
for (const size of [192, 512]) {
  await sharp(Buffer.from(anyIcon)).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
  await sharp(Buffer.from(maskable)).resize(size, size).png().toFile(`public/icons/maskable-${size}.png`);
}
await sharp(Buffer.from(svg({ rounded: false, scale: 0.78 }))).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Icons written to public/');
