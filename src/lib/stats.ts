import type { CardRecord, SessionRecord } from '../store/model';

export type Status = 'new' | 'learning' | 'learned' | 'solid';

export const STATUS_LABEL: Record<Status, string> = {
  new: 'Not started',
  learning: 'Learning',
  learned: 'Learned',
  solid: 'Solid',
};

export const STATUS_HELP: Record<Status, string> = {
  new: 'Not taught yet.',
  learning: 'Taught, but recall is not steady yet.',
  learned: 'You can recall it.',
  solid: 'Recall has held for three weeks or more.',
};

/** Days of FSRS stability at which a card counts as solid. */
export const SOLID_DAYS = 21;

export function statusOf(rec: CardRecord | undefined): Status {
  if (!rec) return 'new';
  if (rec.fsrs.stability >= SOLID_DAYS) return 'solid';
  const scheduled = rec.log.filter((e) => e.kind !== 'retry');
  const last = scheduled.at(-1);
  if (rec.fsrs.reps < 2 || !last || last.grade === 1) return 'learning';
  return 'learned';
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Median recall time over the last n reviews (ms). */
export function recallMedian(rec: CardRecord, n = 5): number | null {
  return median(rec.log.slice(-n).map((e) => e.recallMs));
}

export function recallSeries(rec: CardRecord, n = 12): number[] {
  return rec.log.slice(-n).map((e) => e.recallMs);
}

export function againCount(rec: CardRecord): number {
  return rec.log.filter((e) => e.grade === 1).length;
}

/** Local calendar day key, e.g. 2026-10-15. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Consecutive days with at least one finished session, counting back from today.
 * If there is no session today yet, the streak still counts up to yesterday.
 */
export function streak(sessions: SessionRecord[], now: Date): number {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.finishedAt))));
  const d = new Date(now);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function formatSeconds(ms: number | null | undefined): string {
  if (ms == null) return '–';
  return `${(ms / 1000).toFixed(1)} s`;
}

/** Plain "in 3 days" / "today" / "tomorrow" wording for a due date. */
export function dueWords(due: Date, now: Date): string {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const days = Math.round((b - a) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
