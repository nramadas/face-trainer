import { create } from 'zustand';
import { ALL_IDS } from '../data/groups';
import { DEFAULT_ORDER } from '../data/order';
import { lookAlikeIds } from '../data/emotions';
import type { ZoneKey } from '../data/types';
import { buildSession, applyRetry, type SessionPlan } from '../lib/session';
import { rate, type GradeValue } from '../lib/srs';
import { storageAvailable } from '../lib/safeStorage';
import {
  LOG_CAP,
  SESSION_CAP,
  clearAll,
  defaultData,
  loadData,
  saveAll,
  saveChanged,
  type ActiveSession,
  type AppData,
  type ReviewEntry,
  type ResultKind,
  type SessionRecord,
  type Settings,
  type StepResult,
} from './model';

export interface ResultInput {
  grade: GradeValue;
  recallMs: number;
  keyCue: boolean;
  zones: ZoneKey[];
}

interface StoreState extends AppData {
  storageOk: boolean;
  updateSettings: (p: Partial<Settings>) => void;
  learnNext: (id: string) => void;
  previewSession: (now?: Date) => SessionPlan;
  startSession: (now?: Date) => void;
  setLearnProgress: (learnStage: number, buildZone?: number) => void;
  /** Finish the warm-up (or skip it). Returns the finished session id if the session ended. */
  completeWarmup: () => string | null;
  /** Record the rating for the current card. Returns the finished session id if the session ended. */
  recordResult: (r: ResultInput, now?: Date) => string | null;
  quitSession: () => void;
  replaceAll: (d: AppData) => void;
  resetAll: () => void;
}

const pick = (s: AppData): AppData => ({ settings: s.settings, queue: s.queue, cards: s.cards, sessions: s.sessions, active: s.active });

export function finishedCount(sessions: SessionRecord[]): number {
  return Math.max(sessions.length, sessions.at(-1)?.number ?? 0);
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function requestPersistence() {
  try {
    void navigator.storage?.persist?.();
  } catch {
    /* not supported */
  }
}

/** Advance past the current step; finalize the session when the plan runs out. */
function advance(s: AppData, active: ActiveSession, steps = active.steps, results = active.results, now = new Date()) {
  const index = active.index + 1;
  if (index < steps.length) {
    return { active: { ...active, steps, results, index, learnStage: 0, buildZone: 0 }, finished: null as SessionRecord | null };
  }
  const record: SessionRecord = {
    id: active.id,
    number: finishedCount(s.sessions) + 1,
    startedAt: active.startedAt,
    finishedAt: now.toISOString(),
    newIds: steps.filter((x) => x.kind === 'learn').map((x) => (x as { id: string }).id),
    reviewIds: steps.filter((x) => x.kind === 'review' && x.reason !== 'retry').map((x) => (x as { id: string }).id),
    results,
  };
  return { active: null, finished: record };
}

const initial = loadData(DEFAULT_ORDER, ALL_IDS);

export const useApp = create<StoreState>()((set, get) => ({
  ...initial,
  storageOk: typeof window !== 'undefined' ? storageAvailable() : true,

  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

  learnNext: (id) =>
    set((s) => {
      if (s.cards[id]) return {};
      return { queue: [id, ...s.queue.filter((q) => q !== id)] };
    }),

  previewSession: (now = new Date()) => {
    const s = get();
    return buildSession({ cards: s.cards, queue: s.queue, finishedSessions: finishedCount(s.sessions) }, now, s.settings, lookAlikeIds);
  },

  startSession: (now = new Date()) => {
    const s = get();
    if (s.active) return;
    const plan = s.previewSession(now);
    set({
      active: { id: newId(), number: plan.number, startedAt: now.toISOString(), steps: plan.steps, index: 0, learnStage: 0, buildZone: 0, results: [] },
    });
  },

  setLearnProgress: (learnStage, buildZone = 0) =>
    set((s) => (s.active ? { active: { ...s.active, learnStage, buildZone } } : {})),

  completeWarmup: () => {
    const s = get();
    const a = s.active;
    if (!a || a.steps[a.index]?.kind !== 'warmup') return null;
    const { active, finished } = advance(s, a);
    if (finished) {
      set({ active: null, sessions: [...s.sessions, finished].slice(-SESSION_CAP) });
      if (s.sessions.length === 0) requestPersistence();
      return finished.id;
    }
    set({ active });
    return null;
  },

  recordResult: (r, now = new Date()) => {
    const s = get();
    const a = s.active;
    const step = a?.steps[a.index];
    if (!a || !step || step.kind === 'warmup') return null;
    const id = step.id;
    const existing = s.cards[id];
    let kind: ResultKind = step.kind === 'learn' ? 'first' : step.reason;
    if (kind === 'first' && existing) kind = 'due';
    const at = now.toISOString();
    const entry: ReviewEntry = { at, grade: r.grade, recallMs: Math.round(r.recallMs), keyCue: r.keyCue, zones: r.zones, kind, sessionId: a.id };
    let cards = s.cards;
    let queue = s.queue;
    if (kind === 'retry') {
      // A re-try is practice: it is logged but does not change the FSRS schedule.
      if (existing) cards = { ...cards, [id]: { ...existing, log: [...existing.log, entry].slice(-LOG_CAP) } };
    } else {
      cards = {
        ...cards,
        [id]: {
          fsrs: rate(existing?.fsrs, now, r.grade),
          introducedAt: existing?.introducedAt ?? at,
          log: [...(existing?.log ?? []), entry].slice(-LOG_CAP),
        },
      };
      if (kind === 'first') queue = queue.filter((q) => q !== id);
    }
    const steps = applyRetry(a.steps, a.index, r.grade);
    const result: StepResult = { id, kind, grade: r.grade, recallMs: entry.recallMs, zonesHit: r.zones.length, keyCue: r.keyCue };
    const { active, finished } = advance({ ...s, cards }, a, steps, [...a.results, result], now);
    if (finished) {
      set({ cards, queue, active: null, sessions: [...s.sessions, finished].slice(-SESSION_CAP) });
      if (s.sessions.length === 0) requestPersistence();
      return finished.id;
    }
    set({ cards, queue, active });
    return null;
  },

  quitSession: () => set({ active: null }),

  replaceAll: (d) => set({ ...structuredClone(d) }),

  /** Reset progress. Settings are kept. */
  resetAll: () => {
    const settings = get().settings;
    clearAll();
    set({ ...defaultData(DEFAULT_ORDER), settings });
  },
}));

// Persist every change to localStorage, one key per slice.
const SLICES = ['settings', 'queue', 'cards', 'sessions', 'active'] as const;
useApp.subscribe((state, prev) => {
  if (SLICES.every((k) => state[k] === prev[k])) return;
  const ok = state.storageOk ? saveChanged(pick(state), pick(prev)) : false;
  if (!ok && state.storageOk) useApp.setState({ storageOk: false });
});

/** Snapshot of everything that is saved, for export. */
export function currentData(): AppData {
  return pick(useApp.getState());
}

export function forceSaveAll(): boolean {
  return saveAll(currentData());
}
