import { EMOTIONS, RAW_EMOTIONS } from '../src/data/emotions/index';
import { validateEmotion, faceKey } from '../src/data/validate';
let bad = 0;
const keys = new Map<string, string>();
for (const e of RAW_EMOTIONS) {
  const errs = validateEmotion(e);
  const k = faceKey(e.face);
  if (keys.has(k)) errs.push(`${e.id}: identical face to ${keys.get(k)}`);
  keys.set(k, e.id);
  errs.forEach((m) => console.log('✗ ' + m));
  bad += errs.length;
}
console.log('raw', RAW_EMOTIONS.length, 'ordered', EMOTIONS.length, bad ? `${bad} problems` : 'all valid');
// difference-text starts
for (const e of EMOTIONS) for (const c of e.confusedWith) console.log(`${e.id} -> ${c.id}: ${c.difference.slice(0, 70)}`);
