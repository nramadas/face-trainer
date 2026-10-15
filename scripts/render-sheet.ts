/**
 * Render a PNG contact sheet of cartoon faces, for checking face parameters by eye.
 *
 *   npm run faces:sheet -- --file=src/data/emotions/uncertain.ts --out=scripts/out/sheet.png
 *   npm run faces:sheet -- --ids=stress,fear --gold
 *
 * --file   one or more emotion data files (comma separated). Each must export arrays of Emotion.
 * --ids    only these ids
 * --gold   also include the five gold-standard faces for reference
 * --intensity=1
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Emotion } from '../src/data/types';
import { gold } from '../src/data/emotions/gold';
import { faceSvgString } from './lib/faceMarkup';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : 'true'];
  }),
);

async function main() {
  const list: Emotion[] = [];
  if (args.gold === 'true') list.push(...gold);
  if (args.file) {
    for (const f of String(args.file).split(',')) {
      const mod = await import(pathToFileURL(resolve(f)).href);
      for (const v of Object.values(mod)) if (Array.isArray(v)) list.push(...(v as Emotion[]));
    }
  }
  if (!args.file && args.gold !== 'true') {
    const { EMOTIONS } = await import('../src/data/emotions/index');
    list.push(...EMOTIONS);
  }
  let items = list;
  if (args.ids) {
    const ids = String(args.ids).split(',');
    items = ids.map((id) => list.find((e) => e.id === id)).filter((e): e is Emotion => !!e);
  }
  const intensity = Number(args.intensity ?? 1);
  const cols = Number(args.cols ?? 6);
  const cw = 240, ch = 340;
  const rows = Math.ceil(items.length / cols);
  const cells = items
    .map((e, i) => {
      const x = (i % cols) * cw;
      const y = Math.floor(i / cols) * ch;
      const svg = faceSvgString(e.face, { uid: `c${i}`, label: e.name, intensity })
        .replace(/^<svg /, `<svg x="${x}" y="${y}" width="${cw}" height="300" `);
      return `${svg}<text x="${x + cw / 2}" y="${y + 324}" font-family="Helvetica, Arial" font-size="20" fill="#E8F1F2" text-anchor="middle">${e.name}</text>`;
    })
    .join('');
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * ch}"><rect width="100%" height="100%" fill="#163236"/>${cells}</svg>`;
  const out = resolve(String(args.out ?? 'scripts/out/sheet.png'));
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(sheet)).png().toFile(out);
  console.log(`Wrote ${items.length} faces to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
