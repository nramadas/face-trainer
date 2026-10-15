// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useApp, currentData } from './appStore';
import { loadData, parseImport, toExport, KEYS, SCHEMA_VERSION } from './model';
import { DEFAULT_ORDER } from '../data/order';
import { ALL_IDS } from '../data/groups';

const s = () => useApp.getState();
const t0 = new Date('2026-10-10T09:00:00Z');
const day = (n: number) => new Date(t0.getTime() + n * 86_400_000);

function runSession(at: Date, grade: 1 | 2 | 3 | 4 = 3) {
  s().startSession(at);
  s().completeWarmup();
  let finished: string | null = null;
  let guard = 0;
  while (s().active && guard++ < 20) finished = s().recordResult({ grade, recallMs: 3200, keyCue: true, zones: ['brows', 'eyes', 'mouth', 'head', 'breath'] }, at);
  return finished;
}

describe('app store', () => {
  beforeEach(() => {
    localStorage.clear();
    s().resetAll();
  });

  it('runs session 1: learns the first emotion and records the session', () => {
    const id = runSession(t0);
    expect(id).toBeTruthy();
    expect(Object.keys(s().cards)).toEqual(['stress']);
    expect(s().queue[0]).toBe('shame');
    expect(s().sessions).toHaveLength(1);
    expect(s().sessions[0].results[0]).toMatchObject({ id: 'stress', kind: 'first', grade: 3 });
    expect(s().active).toBeNull();
  });

  it('adds a re-try at the end when a card is rated Again, without rescheduling it twice', () => {
    s().startSession(t0);
    s().completeWarmup();
    s().recordResult({ grade: 1, recallMs: 5000, keyCue: false, zones: [] }, t0);
    expect(s().active?.steps.at(-1)).toEqual({ kind: 'review', id: 'stress', reason: 'retry' });
    const dueAfterAgain = s().cards.stress.fsrs.due;
    s().recordResult({ grade: 3, recallMs: 2500, keyCue: true, zones: ['brows', 'eyes', 'mouth'] }, t0);
    expect(s().active).toBeNull();
    expect(s().cards.stress.fsrs.due).toBe(dueAfterAgain);
    expect(s().cards.stress.log.map((e) => e.kind)).toEqual(['first', 'retry']);
  });

  it('saves to localStorage under a versioned namespace and resumes a session after reload', () => {
    runSession(t0);
    runSession(day(1));
    s().startSession(day(3));
    s().completeWarmup();
    s().setLearnProgress(2, 0);
    expect(JSON.parse(localStorage.getItem(KEYS.meta)!)).toEqual({ schemaVersion: SCHEMA_VERSION });
    const reloaded = loadData(DEFAULT_ORDER, ALL_IDS);
    expect(reloaded.active).toEqual(s().active);
    expect(reloaded.cards).toEqual(s().cards);
    expect(reloaded.sessions).toEqual(s().sessions);
    expect(reloaded.active?.learnStage).toBe(2);
  });

  it('session 3 brings back a review', () => {
    runSession(t0);
    runSession(t0);
    const plan = s().previewSession(day(1));
    expect(plan.number).toBe(3);
    expect(plan.reviewIds.length).toBeGreaterThanOrEqual(1);
  });

  it('export → reset → import restores the exact same state', () => {
    runSession(t0);
    runSession(day(1));
    runSession(day(3), 2);
    s().updateSettings({ maxReviews: 4, defaultIntensity: 'stage' });
    s().learnNext('awe');
    s().startSession(day(4));
    s().completeWarmup();
    const before = structuredClone(currentData());
    const file = JSON.stringify(toExport(currentData()));

    s().resetAll();
    expect(Object.keys(s().cards)).toHaveLength(0);

    const parsed = parseImport(file, ALL_IDS);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) s().replaceAll(parsed.data);
    expect(currentData()).toEqual(before);
    expect(loadData(DEFAULT_ORDER, ALL_IDS)).toEqual(before);
  });

  it('rejects bad import files with a plain message', () => {
    expect(parseImport('not json', ALL_IDS)).toMatchObject({ ok: false });
    expect(parseImport('{"app":"other"}', ALL_IDS)).toMatchObject({ ok: false });
    const good = JSON.parse(JSON.stringify(toExport(currentData())));
    good.data.queue = ['not-an-emotion'];
    const r = parseImport(JSON.stringify(good), ALL_IDS);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/queue/i);
    const newer = { ...toExport(currentData()), schemaVersion: SCHEMA_VERSION + 1 };
    expect(parseImport(JSON.stringify(newer), ALL_IDS)).toMatchObject({ ok: false });
  });

  it('"Learn this next" moves an emotion to the front of the queue', () => {
    s().learnNext('irony');
    expect(s().queue[0]).toBe('irony');
    expect(s().queue.filter((x) => x === 'irony')).toHaveLength(1);
  });

  it('reset keeps settings', () => {
    s().updateSettings({ newPerSession: 3 });
    runSession(t0);
    s().resetAll();
    expect(s().settings.newPerSession).toBe(3);
    expect(s().sessions).toHaveLength(0);
  });

  it('caps the review log at 50 per emotion', () => {
    runSession(t0);
    const rec = s().cards.stress;
    const log = Array.from({ length: 60 }, () => rec.log[0]);
    useApp.setState({ cards: { stress: { ...rec, log } } });
    s().learnNext('stress');
    // Force a review of stress in a later session.
    for (let i = 0; i < 3; i++) runSession(day(30 + i));
    expect(s().cards.stress.log.length).toBeLessThanOrEqual(50);
  });
});
