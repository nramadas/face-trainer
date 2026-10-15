import type { GradeValue } from './srs';

export interface Suggestion {
  grade: GradeValue;
  reason: string;
}

export const FAST_RECALL_MS = 4000;

/**
 * Suggested rating for a review card.
 * - Key cue missed, or fewer than 3 zones: Again.
 * - Key cue hit, 3 or 4 zones: Hard.
 * - All zones, recall over 4 seconds: Good.
 * - All zones, recall 4 seconds or under: Easy.
 */
export function suggestRating(keyCue: boolean, zonesHit: number, recallMs: number, totalZones = 5): Suggestion {
  if (!keyCue) return { grade: 1, reason: 'The key cue was missing.' };
  if (zonesHit < 3) return { grade: 1, reason: `Only ${zonesHit} of ${totalZones} zones were right.` };
  if (zonesHit < totalZones) return { grade: 2, reason: `Key cue was there, with ${zonesHit} of ${totalZones} zones.` };
  const secs = (recallMs / 1000).toFixed(1);
  if (recallMs > FAST_RECALL_MS) return { grade: 3, reason: `All zones right, in ${secs} seconds.` };
  return { grade: 4, reason: `All zones right, and fast: ${secs} seconds.` };
}
