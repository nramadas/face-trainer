import type { StoredCard, GradeValue } from './srs';
import { isDue, retrievability } from './srs';

export type Step =
  | { kind: 'warmup' }
  | { kind: 'review'; id: string; reason: 'due' | 'bonus' | 'retry' }
  | { kind: 'learn'; id: string };

export interface SessionInput {
  /** FSRS card per learned emotion id. */
  cards: Record<string, { fsrs: StoredCard }>;
  /** New-emotion queue, front first. */
  queue: string[];
  /** Number of finished sessions so far. */
  finishedSessions: number;
}

export interface SessionSettings {
  newPerSession: number;
  maxReviews: number;
}

export interface SessionPlan {
  /** 1-based number of this session. */
  number: number;
  steps: Step[];
  reviewIds: string[];
  newIds: string[];
  bonus: boolean;
}

/**
 * Build one session.
 * 1. Warm-up (skippable in the UI).
 * 2. Reviews first. None in sessions 1 and 2. From session 3: due cards, oldest
 *    due first, up to maxReviews. If nothing is due and at least 2 emotions are
 *    learned, one bonus review: the card with the lowest retrievability.
 * 3. New emotions from the front of the queue, skipping look-alikes of ones
 *    already picked for this session.
 */
export function buildSession(
  state: SessionInput,
  now: Date,
  settings: SessionSettings,
  lookAlikes: (id: string) => string[] = () => [],
): SessionPlan {
  const number = state.finishedSessions + 1;
  const learned = Object.entries(state.cards);
  let reviewIds: string[] = [];
  let bonus = false;

  if (number >= 3) {
    reviewIds = learned
      .filter(([, c]) => isDue(c.fsrs, now))
      .sort((a, b) => new Date(a[1].fsrs.due).getTime() - new Date(b[1].fsrs.due).getTime() || a[0].localeCompare(b[0]))
      .slice(0, Math.max(0, settings.maxReviews))
      .map(([id]) => id);
    if (reviewIds.length === 0 && learned.length >= 2) {
      const weakest = learned
        .map(([id, c]) => ({ id, r: retrievability(c.fsrs, now), s: c.fsrs.stability }))
        .sort((a, b) => a.r - b.r || a.s - b.s || a.id.localeCompare(b.id))[0];
      reviewIds = [weakest.id];
      bonus = true;
    }
  }

  const newIds: string[] = [];
  const blocked = new Set<string>();
  for (const id of state.queue) {
    if (newIds.length >= settings.newPerSession) break;
    if (state.cards[id] || blocked.has(id)) continue;
    newIds.push(id);
    for (const l of lookAlikes(id)) blocked.add(l);
  }

  const steps: Step[] = [
    { kind: 'warmup' },
    ...reviewIds.map((id): Step => ({ kind: 'review', id, reason: bonus ? 'bonus' : 'due' })),
    ...newIds.map((id): Step => ({ kind: 'learn', id })),
  ];
  return { number, steps, reviewIds, newIds, bonus };
}

/**
 * Re-try rule: a card rated "Again" in this session comes back once more at the
 * end. A re-try that is rated "Again" does not come back a third time.
 */
export function applyRetry(steps: Step[], index: number, grade: GradeValue): Step[] {
  const step = steps[index];
  if (grade !== 1 || !step || step.kind === 'warmup') return steps;
  if (step.kind === 'review' && step.reason === 'retry') return steps;
  const already = steps.some((s, i) => i > index && s.kind === 'review' && s.reason === 'retry' && s.id === step.id);
  if (already) return steps;
  return [...steps, { kind: 'review', id: step.id, reason: 'retry' }];
}
