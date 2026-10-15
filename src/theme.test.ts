import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Reads the color tokens from index.css and checks WCAG AA contrast on the glass surfaces.
const css = readFileSync(resolve(__dirname, 'index.css'), 'utf8');
const token = (name: string) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found`);
  return m[1];
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]: number[]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const over = (fg: number[], alpha: number, bg: number[]) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const white = [255, 255, 255];
// The lightest backdrop: top of the gradient plus the strongest accent glow in .app-bg.
const bgBlock = css.slice(css.indexOf('.app-bg {'), css.indexOf('}', css.indexOf('.app-bg {')));
const glowAlpha = Math.max(...[...bgBlock.matchAll(/rgba\(47, 164, 176, ([0-9.]+)\)/g)].map((m) => Number(m[1])));
const lightestBg = over(hex(token('accent')), glowAlpha, hex(token('bg')));
const backdrops = { top: hex(token('bg')), bottom: hex(token('bg-deep')), glow: lightestBg };
// Glass surfaces are white at 6% (and 9% for strong glass), plus active/selected tints.
const surfaces = Object.entries(backdrops).flatMap(([name, bg]) => [
  [`glass on ${name}`, over(white, 0.06, bg)],
  [`strong glass on ${name}`, over(white, 0.09, bg)],
  [`selected row on ${name}`, over(hex(token('accent')), 0.12, over(white, 0.06, bg))],
] as const);

describe('text contrast (WCAG AA, 4.5:1)', () => {
  for (const name of ['ink', 'muted', 'faint', 'accent-text', 'danger', 'warn']) {
    it(`${name} text on every glass surface`, () => {
      for (const [label, bg] of surfaces) expect(contrast(hex(token(name)), bg), `${name} on ${label}`).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('white text on the accent buttons', () => {
    expect(contrast(white, hex(token('accent-strong')))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(white, hex(token('accent-deep')))).toBeGreaterThanOrEqual(4.5);
  });
});
