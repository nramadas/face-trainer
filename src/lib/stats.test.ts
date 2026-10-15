import { describe, expect, it } from 'vitest';
import { streak, median, dueWords } from './stats';
import type { SessionRecord } from '../store/model';

const rec = (iso: string): SessionRecord => ({ id: iso, number: 1, startedAt: iso, finishedAt: iso, newIds: [], reviewIds: [], results: [] });

describe('stats', () => {
  it('counts a streak of consecutive days, including today', () => {
    const now = new Date(2026, 9, 15, 20);
    const s = [rec(new Date(2026, 9, 13, 9).toISOString()), rec(new Date(2026, 9, 14, 9).toISOString()), rec(new Date(2026, 9, 15, 9).toISOString())];
    expect(streak(s, now)).toBe(3);
  });
  it('keeps the streak alive until today is over', () => {
    const now = new Date(2026, 9, 15, 8);
    expect(streak([rec(new Date(2026, 9, 14, 9).toISOString())], now)).toBe(1);
  });
  it('breaks the streak after a missed day', () => {
    const now = new Date(2026, 9, 15, 8);
    expect(streak([rec(new Date(2026, 9, 12, 9).toISOString())], now)).toBe(0);
  });
  it('computes the median', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });
  it('words due dates plainly', () => {
    const now = new Date(2026, 9, 15, 9);
    expect(dueWords(new Date(2026, 9, 15, 20), now)).toBe('today');
    expect(dueWords(new Date(2026, 9, 16, 1), now)).toBe('tomorrow');
    expect(dueWords(new Date(2026, 9, 20, 1), now)).toBe('in 5 days');
  });
});
