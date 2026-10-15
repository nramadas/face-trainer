import { createEmptyCard, forgetting_curve, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

/**
 * Spaced repetition with FSRS (the algorithm modern Anki uses).
 * Short-term learning steps are off: the trainer is session based, and cards
 * rated "Again" come back once at the end of the same session instead.
 */
const params = generatorParameters({ enable_fuzz: true, enable_short_term: false, request_retention: 0.9 });
const scheduler = fsrs(params);

export type GradeValue = 1 | 2 | 3 | 4;
export const GRADE_LABEL: Record<GradeValue, string> = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

/** Card as stored in localStorage (dates as ISO strings). */
export interface StoredCard {
  due: string;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export function toStored(c: Card): StoredCard {
  return {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? c.last_review.toISOString() : undefined,
  };
}

export function fromStored(s: StoredCard): Card {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: 0,
    scheduled_days: s.scheduled_days,
    learning_steps: s.learning_steps,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state as State,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

/** Apply a rating. With no card, this is the first rating of a new emotion. */
export function rate(card: StoredCard | undefined, now: Date, grade: GradeValue): StoredCard {
  const base = card ? fromStored(card) : createEmptyCard(now);
  const { card: next } = scheduler.next(base, now, grade as Grade);
  return toStored(next);
}

/**
 * FSRS estimate (0 to 1) of how likely you are to remember this card right now.
 * Uses fractional days, so two cards reviewed on the same day still differ.
 */
export function retrievability(card: StoredCard, now: Date): number {
  if (!card.last_review) return 0;
  const days = Math.max(0, (now.getTime() - new Date(card.last_review).getTime()) / 86_400_000);
  return forgetting_curve(params.w, days, card.stability);
}

export function isDue(card: StoredCard, now: Date): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

export { Rating };
