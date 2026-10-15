/**
 * Validate one or more emotion data files without loading the full index.
 *   npx tsx --tsconfig tsconfig.node.json scripts/check-data.ts src/data/emotions/uncertain.ts
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Emotion } from '../src/data/types';
import { validateEmotion, faceKey } from '../src/data/validate';

let bad = 0;
const keys = new Map<string, string>();
for (const f of process.argv.slice(2)) {
  const mod = await import(pathToFileURL(resolve(f)).href);
  for (const v of Object.values(mod)) {
    if (!Array.isArray(v)) continue;
    for (const e of v as Emotion[]) {
      const errs = validateEmotion(e);
      const k = faceKey(e.face);
      if (keys.has(k)) errs.push(`${e.id}: face parameters identical to ${keys.get(k)}`);
      keys.set(k, e.id);
      for (const m of errs) console.log('  ✗ ' + m);
      bad += errs.length;
      if (!errs.length) console.log('  ✓ ' + e.id);
    }
  }
}
console.log(bad ? `${bad} problem(s)` : 'All good');
process.exit(bad ? 1 : 0);
