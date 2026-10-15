import { describe, expect, it } from 'vitest';
import { applyRetry, buildSession, type SessionInput } from './session';
import { rate, type StoredCard } from './srs';

const now = new Date('2026-10-15T09:00:00Z');
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const settings = { newPerSession: 1, maxReviews: 2 };

/** A card first rated Good at `at`. */
function cardAt(at: Date, grade: 1 | 2 | 3 | 4 = 3): { fsrs: StoredCard } {
  return { fsrs: rate(undefined, at, grade) };
}
/** A card with an explicit due date. */
function dueCard(due: Date): { fsrs: StoredCard } {
  const c = cardAt(daysAgo(30));
  return { fsrs: { ...c.fsrs, due: due.toISOString() } };
}

describe('buildSession', () => {
  it('session 1: warm-up and one new emotion, no reviews', () => {
    const input: SessionInput = { cards: {}, queue: ['stress', 'shame', 'frustration'], finishedSessions: 0 };
    const plan = buildSession(input, now, settings);
    expect(plan.number).toBe(1);
    expect(plan.reviewIds).toEqual([]);
    expect(plan.newIds).toEqual(['stress']);
    expect(plan.steps).toEqual([{ kind: 'warmup' }, { kind: 'learn', id: 'stress' }]);
  });

  it('session 2: no reviews even if a card is due', () => {
    const input: SessionInput = { cards: { stress: dueCard(daysAgo(1)) }, queue: ['shame'], finishedSessions: 1 };
    const plan = buildSession(input, now, settings);
    expect(plan.number).toBe(2);
    expect(plan.reviewIds).toEqual([]);
    expect(plan.newIds).toEqual(['shame']);
  });

  it('session 3 with nothing due: one bonus review, the card with the lowest retrievability', () => {
    // Both reviewed recently, so neither is due. The older one is less likely to be remembered now.
    const older = cardAt(daysAgo(1));
    const newer = cardAt(new Date(now.getTime() - 2 * 3600_000));
    const input: SessionInput = { cards: { stress: older, shame: newer }, queue: ['frustration'], finishedSessions: 2 };
    expect(new Date(older.fsrs.due) > now && new Date(newer.fsrs.due) > now).toBe(true);
    const plan = buildSession(input, now, settings);
    expect(plan.bonus).toBe(true);
    expect(plan.reviewIds).toEqual(['stress']);
    expect(plan.newIds).toEqual(['frustration']);
    expect(plan.steps).toEqual([
      { kind: 'warmup' },
      { kind: 'review', id: 'stress', reason: 'bonus' },
      { kind: 'learn', id: 'frustration' },
    ]);
  });

  it('breaks a retrievability tie with the lower stability (the weaker card)', () => {
    const at = new Date(now.getTime() - 3600_000);
    const input: SessionInput = { cards: { aaa: cardAt(at, 4), zzz: cardAt(at, 2) }, queue: [], finishedSessions: 2 };
    expect(buildSession(input, now, settings).reviewIds).toEqual(['zzz']);
  });

  it('no bonus review with fewer than 2 learned emotions', () => {
    const input: SessionInput = { cards: { stress: cardAt(now) }, queue: ['shame'], finishedSessions: 2 };
    expect(buildSession(input, now, settings).reviewIds).toEqual([]);
  });

  it('session 3 with 5 due and a cap of 2: the two oldest due, reviews before the new one', () => {
    const input: SessionInput = {
      cards: {
        a: dueCard(daysAgo(1)),
        b: dueCard(daysAgo(5)),
        c: dueCard(daysAgo(3)),
        d: dueCard(daysAgo(4)),
        e: dueCard(daysAgo(2)),
        f: dueCard(new Date(now.getTime() + 86_400_000)),
      },
      queue: ['joy'],
      finishedSessions: 2,
    };
    const plan = buildSession(input, now, settings);
    expect(plan.bonus).toBe(false);
    expect(plan.reviewIds).toEqual(['b', 'd']);
    expect(plan.steps.map((s) => s.kind)).toEqual(['warmup', 'review', 'review', 'learn']);
  });

  it('honors the new-per-session setting and skips look-alikes of ones already picked', () => {
    const input: SessionInput = { cards: {}, queue: ['sadness', 'grief', 'joy', 'anger'], finishedSessions: 0 };
    const plan = buildSession(input, now, { newPerSession: 2, maxReviews: 2 }, (id) => (id === 'sadness' ? ['grief'] : []));
    expect(plan.newIds).toEqual(['sadness', 'joy']);
  });

  it('skips queue entries that are already learned', () => {
    const input: SessionInput = { cards: { stress: cardAt(now) }, queue: ['stress', 'shame'], finishedSessions: 1 };
    expect(buildSession(input, now, settings).newIds).toEqual(['shame']);
  });
});

describe('applyRetry ("Again" re-queue)', () => {
  const steps = buildSession({ cards: { a: dueCard(daysAgo(1)), b: dueCard(daysAgo(2)) }, queue: ['n'], finishedSessions: 3 }, now, settings).steps;

  it('adds a card rated Again once more at the end', () => {
    const i = steps.findIndex((s) => s.kind === 'review');
    const next = applyRetry(steps, i, 1);
    expect(next).toHaveLength(steps.length + 1);
    expect(next.at(-1)).toEqual({ kind: 'review', id: (steps[i] as { id: string }).id, reason: 'retry' });
  });

  it('re-queues a new emotion whose first try was Again', () => {
    const i = steps.findIndex((s) => s.kind === 'learn');
    expect(applyRetry(steps, i, 1).at(-1)).toEqual({ kind: 'review', id: 'n', reason: 'retry' });
  });

  it('does not re-queue for Hard, Good or Easy', () => {
    for (const g of [2, 3, 4] as const) expect(applyRetry(steps, 1, g)).toBe(steps);
  });

  it('does not re-queue a re-try a second time', () => {
    const withRetry = applyRetry(steps, 1, 1);
    const last = withRetry.length - 1;
    expect(applyRetry(withRetry, last, 1)).toBe(withRetry);
  });
});
