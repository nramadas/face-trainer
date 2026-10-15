import { FACE_KEYS, PARAM_SPECS, type FaceKey } from '../face/params';
import { ALL_IDS, GROUP_MEMBERS } from './groups';
import { imagePaths, type Emotion, type ZoneKey } from './types';

const ZONES: ZoneKey[] = ['brows', 'eyes', 'mouth', 'head', 'breath'];
const sentences = (s: string) => (s.match(/[.!?]["')]?(\s|$)/g) ?? []).length;
const EMOJI = /\p{Extended_Pictographic}/u;

/** Returns a list of problems with one entry. Empty means valid. */
export function validateEmotion(e: Emotion, allIds: readonly string[] = ALL_IDS): string[] {
  const errs: string[] = [];
  const err = (m: string) => errs.push(`${e.id}: ${m}`);
  if (!/^[a-z]+(-[a-z]+)*$/.test(e.id)) err('id is not kebab-case');
  if (!allIds.includes(e.id)) err('id is not one of the 87');
  if (!GROUP_MEMBERS[e.group]?.includes(e.id)) err(`group "${e.group}" does not contain this id`);
  for (const k of ['name', 'definition', 'oneLiner', 'keyCue', 'line'] as const) {
    if (!e[k] || typeof e[k] !== 'string' || !e[k].trim()) err(`${k} is empty`);
  }
  if (sentences(e.definition) > 2) err('definition is longer than two sentences');
  if (!['face', 'face-body', 'context'].includes(e.tier)) err('bad tier');
  if (e.tier === 'context' && !e.playableNote?.trim()) err('context tier needs a playableNote');
  for (const z of ZONES) {
    const t = e.zones?.[z];
    if (!t?.trim()) err(`zone ${z} is empty`);
    else if (sentences(t) > 3) err(`zone ${z} has more than 3 sentences`);
  }
  if (!e.actionUnits?.length) err('no actionUnits');
  for (const au of e.actionUnits ?? []) if (!/^AU\d+/.test(au)) err(`bad action unit "${au}"`);
  if (!e.confusedWith || e.confusedWith.length < 1 || e.confusedWith.length > 3) err('confusedWith needs 1 to 3 entries');
  const seen = new Set<string>();
  for (const c of e.confusedWith ?? []) {
    if (!allIds.includes(c.id)) err(`confusedWith id "${c.id}" does not exist`);
    if (c.id === e.id) err('confusedWith points to itself');
    if (seen.has(c.id)) err(`confusedWith "${c.id}" is listed twice`);
    seen.add(c.id);
    if (!c.difference?.trim()) err(`confusedWith "${c.id}" has no difference`);
  }
  for (const [k, v] of Object.entries(e.face ?? {})) {
    if (!FACE_KEYS.includes(k as FaceKey)) err(`unknown face parameter "${k}"`);
    else {
      const spec = PARAM_SPECS[k as FaceKey];
      if (typeof v !== 'number' || Number.isNaN(v) || v < spec.min || v > spec.max) err(`face.${k}=${v} is outside ${spec.min}..${spec.max}`);
    }
  }
  const img = imagePaths(e.id);
  if (e.images?.male !== img.male || e.images?.female !== img.female) err('images paths should come from imagePaths(id)');
  const text = [e.name, e.definition, e.oneLiner, e.keyCue, e.line, e.playableNote ?? '', ...ZONES.map((z) => e.zones?.[z] ?? ''), ...(e.confusedWith ?? []).map((c) => c.difference)].join(' ');
  if (EMOJI.test(text)) err('contains emoji');
  return errs;
}

/** Stable key for comparing face parameter sets. */
export function faceKey(face: Emotion['face']): string {
  return FACE_KEYS.map((k) => `${k}:${(face[k] ?? 0).toFixed(3)}`).join('|');
}
