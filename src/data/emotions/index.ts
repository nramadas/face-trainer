import type { Emotion } from '../types';
import { ALL_IDS } from '../groups';
import { gold } from './gold';
import { uncertain } from './uncertain';
import { compare } from './compare';
import { unplanned } from './unplanned';
import { beyond } from './beyond';
import { notWhatTheySeem } from './notWhatTheySeem';
import { hurting } from './hurting';
import { withOthers } from './withOthers';
import { fallShort } from './fallShort';
import { connection } from './connection';
import { heartOpen } from './heartOpen';
import { lifeGood } from './lifeGood';
import { wronged } from './wronged';
import { selfAssess } from './selfAssess';

const all: Emotion[] = [
  ...gold,
  ...uncertain,
  ...compare,
  ...unplanned,
  ...beyond,
  ...notWhatTheySeem,
  ...hurting,
  ...withOthers,
  ...fallShort,
  ...connection,
  ...heartOpen,
  ...lifeGood,
  ...wronged,
  ...selfAssess,
];

/** Every entry ever defined, before ordering (used by tests to catch duplicates). */
export const RAW_EMOTIONS: readonly Emotion[] = all;

const byId = new Map(all.map((e) => [e.id, e]));

/** All 87 emotions, in Atlas of the Heart group order. */
export const EMOTIONS: Emotion[] = ALL_IDS.map((id) => byId.get(id)).filter((e): e is Emotion => !!e);

export function getEmotion(id: string | undefined): Emotion | undefined {
  return id ? byId.get(id) : undefined;
}

export interface LookAlike {
  id: string;
  difference: string;
  /** True when the link was written on the other emotion's entry. */
  reverse: boolean;
}

/** An emotion's own look-alikes first, then emotions that list it as their look-alike. */
export function lookAlikeEntries(id: string): LookAlike[] {
  const e = byId.get(id);
  if (!e) return [];
  const out: LookAlike[] = e.confusedWith.map((c) => ({ ...c, reverse: false }));
  const seen = new Set(out.map((c) => c.id));
  for (const other of EMOTIONS) {
    if (seen.has(other.id) || other.id === id) continue;
    const back = other.confusedWith.find((c) => c.id === id);
    if (back) {
      out.push({ id: other.id, difference: back.difference, reverse: true });
      seen.add(other.id);
    }
  }
  return out;
}

export function lookAlikeIds(id: string): string[] {
  return lookAlikeEntries(id).map((l) => l.id);
}

/** The difference text between a and b, from whichever entry states it. */
export function differenceBetween(a: string, b: string): string | undefined {
  return byId.get(a)?.confusedWith.find((c) => c.id === b)?.difference ?? byId.get(b)?.confusedWith.find((c) => c.id === a)?.difference;
}
