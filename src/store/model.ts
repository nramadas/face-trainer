import type { IntensityName } from '../face/params';
import type { ZoneKey } from '../data/types';
import type { Step } from '../lib/session';
import type { GradeValue, StoredCard } from '../lib/srs';
import { readJSON, writeJSON, removeKey } from '../lib/safeStorage';

/** Bump when the stored shape changes, and add a step to MIGRATIONS. */
export const SCHEMA_VERSION = 1;
export const NS = 'stageface:v1';
export const KEYS = {
  meta: `${NS}:meta`,
  settings: `${NS}:settings`,
  queue: `${NS}:queue`,
  cards: `${NS}:cards`,
  sessions: `${NS}:sessions`,
  active: `${NS}:active`,
} as const;
export const LOG_CAP = 50;
export const SESSION_CAP = 1000;

export interface Settings {
  newPerSession: number;
  maxReviews: number;
  defaultIntensity: IntensityName;
  faces: { cartoon: boolean; male: boolean; female: boolean };
  mirrorDefault: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  newPerSession: 1,
  maxReviews: 2,
  defaultIntensity: 'clear',
  faces: { cartoon: true, male: true, female: true },
  mirrorDefault: false,
  reduceMotion: false,
};

export type ResultKind = 'first' | 'due' | 'bonus' | 'retry';

export interface ReviewEntry {
  at: string;
  grade: GradeValue;
  recallMs: number;
  keyCue: boolean;
  zones: ZoneKey[];
  kind: ResultKind;
  sessionId: string;
}

export interface CardRecord {
  fsrs: StoredCard;
  introducedAt: string;
  /** Last LOG_CAP reviews, oldest first. */
  log: ReviewEntry[];
}

export interface StepResult {
  id: string;
  kind: ResultKind;
  grade: GradeValue;
  recallMs: number;
  zonesHit: number;
  keyCue: boolean;
}

export interface SessionRecord {
  id: string;
  number: number;
  startedAt: string;
  finishedAt: string;
  newIds: string[];
  reviewIds: string[];
  results: StepResult[];
}

export interface ActiveSession {
  id: string;
  number: number;
  startedAt: string;
  steps: Step[];
  index: number;
  /** Stage inside a learn step: 0 meet, 1 build, 2 contrast, 3 say, 4 first try. */
  learnStage: number;
  /** Zone index inside the build stage. */
  buildZone: number;
  results: StepResult[];
}

export interface AppData {
  settings: Settings;
  queue: string[];
  cards: Record<string, CardRecord>;
  sessions: SessionRecord[];
  active: ActiveSession | null;
}

export function defaultData(order: readonly string[]): AppData {
  return { settings: { ...DEFAULT_SETTINGS, faces: { ...DEFAULT_SETTINGS.faces } }, queue: [...order], cards: {}, sessions: [], active: null };
}

/**
 * Migrations from older schema versions. MIGRATIONS[n] turns version n data
 * into version n + 1 data. There are none yet; version 1 is the first.
 */
const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {};

export function migrate(raw: Record<string, unknown>, fromVersion: number): Record<string, unknown> {
  let d = raw;
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`No migration from version ${v}`);
    d = step(d);
  }
  return d;
}

/** Keep the queue valid: only known, unlearned ids, and any new ids appended in default order. */
export function reconcileQueue(queue: readonly string[], cards: Record<string, unknown>, order: readonly string[]): string[] {
  const valid = new Set(order);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of queue) {
    if (valid.has(id) && !cards[id] && !seen.has(id)) {
      out.push(id);
      seen.add(id);
    }
  }
  for (const id of order) if (!cards[id] && !seen.has(id)) out.push(id);
  return out;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isDate = (v: unknown) => isStr(v) && !Number.isNaN(Date.parse(v));

function checkSettings(s: unknown): Settings | string {
  if (!isObj(s)) return 'Settings are missing.';
  const f = s.faces;
  if (!isNum(s.newPerSession) || !isNum(s.maxReviews)) return 'Settings have bad numbers.';
  if (!['camera', 'clear', 'stage'].includes(s.defaultIntensity as string)) return 'Settings have a bad intensity.';
  if (!isObj(f) || typeof f.cartoon !== 'boolean' || typeof f.male !== 'boolean' || typeof f.female !== 'boolean') return 'Settings have bad face choices.';
  if (typeof s.mirrorDefault !== 'boolean' || typeof s.reduceMotion !== 'boolean') return 'Settings have bad switches.';
  return s as unknown as Settings;
}

function checkCard(c: unknown): string | null {
  if (!isObj(c) || !isObj(c.fsrs)) return 'a card is missing its schedule';
  const f = c.fsrs;
  if (!isDate(f.due) || !isNum(f.stability) || !isNum(f.difficulty) || !isNum(f.reps) || !isNum(f.lapses) || !isNum(f.state)) return 'a card has a bad schedule';
  if (!isDate(c.introducedAt) || !Array.isArray(c.log)) return 'a card has a bad history';
  for (const e of c.log) if (!isObj(e) || !isDate(e.at) || !isNum(e.grade) || !isNum(e.recallMs)) return 'a review entry is broken';
  return null;
}

/** Validate a whole AppData object. Returns an error message, or null if valid. */
export function validateData(d: unknown, validIds: readonly string[]): string | null {
  if (!isObj(d)) return 'The file has no progress data.';
  const s = checkSettings(d.settings);
  if (typeof s === 'string') return s;
  const ids = new Set(validIds);
  if (!Array.isArray(d.queue) || !d.queue.every((x) => isStr(x) && ids.has(x))) return 'The new-emotion queue is broken.';
  if (!isObj(d.cards)) return 'Cards are missing.';
  for (const [id, c] of Object.entries(d.cards)) {
    if (!ids.has(id)) return `Unknown emotion "${id}".`;
    const err = checkCard(c);
    if (err) return `In "${id}", ${err}.`;
  }
  if (!Array.isArray(d.sessions)) return 'Session history is missing.';
  for (const s of d.sessions) {
    if (!isObj(s) || !isStr(s.id) || !isDate(s.startedAt) || !isDate(s.finishedAt) || !Array.isArray(s.results)) return 'A session record is broken.';
  }
  if (d.active !== null && (!isObj(d.active) || !Array.isArray(d.active.steps) || !isNum(d.active.index))) return 'The session in progress is broken.';
  return null;
}

export interface ExportFile {
  app: 'stage-face';
  schemaVersion: number;
  exportedAt: string;
  data: AppData;
}

export function toExport(data: AppData, now = new Date()): ExportFile {
  return { app: 'stage-face', schemaVersion: SCHEMA_VERSION, exportedAt: now.toISOString(), data: structuredClone(data) };
}

export function parseImport(text: string, validIds: readonly string[]): { ok: true; data: AppData } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  if (!isObj(raw) || raw.app !== 'stage-face' || !isNum(raw.schemaVersion)) return { ok: false, error: 'This is not a Stage Face progress file.' };
  if (raw.schemaVersion > SCHEMA_VERSION) return { ok: false, error: 'This file comes from a newer version of the app. Update the app first.' };
  let data: Record<string, unknown>;
  try {
    data = migrate(raw.data as Record<string, unknown>, raw.schemaVersion);
  } catch {
    return { ok: false, error: 'This file could not be upgraded to the current version.' };
  }
  const err = validateData(data, validIds);
  if (err) return { ok: false, error: err };
  return { ok: true, data: data as unknown as AppData };
}

/* ---------- localStorage ---------- */

export function loadData(order: readonly string[], validIds: readonly string[]): AppData {
  const meta = readJSON<{ schemaVersion: number }>(KEYS.meta);
  const fallback = defaultData(order);
  if (!meta) return fallback;
  const raw: Record<string, unknown> = {
    settings: readJSON(KEYS.settings) ?? fallback.settings,
    queue: readJSON(KEYS.queue) ?? fallback.queue,
    cards: readJSON(KEYS.cards) ?? {},
    sessions: readJSON(KEYS.sessions) ?? [],
    active: readJSON(KEYS.active) ?? null,
  };
  let d: Record<string, unknown>;
  try {
    d = migrate(raw, meta.schemaVersion);
  } catch {
    return fallback;
  }
  // Fill in settings added later, then validate each slice; drop what is broken.
  d.settings = { ...DEFAULT_SETTINGS, ...(isObj(d.settings) ? d.settings : {}) };
  const ids = new Set(validIds);
  const cards: Record<string, CardRecord> = {};
  if (isObj(d.cards)) for (const [id, c] of Object.entries(d.cards)) if (ids.has(id) && !checkCard(c)) cards[id] = c as unknown as CardRecord;
  const sessions = Array.isArray(d.sessions) ? (d.sessions as SessionRecord[]) : [];
  const active = isObj(d.active) && Array.isArray(d.active.steps) ? (d.active as unknown as ActiveSession) : null;
  const queue = reconcileQueue(Array.isArray(d.queue) ? (d.queue as string[]) : [], cards, order);
  const settingsOk = checkSettings(d.settings);
  return {
    settings: typeof settingsOk === 'string' ? fallback.settings : settingsOk,
    queue,
    cards,
    sessions,
    active,
  };
}

/** Write every slice. Returns false if any write failed. */
export function saveAll(d: AppData): boolean {
  let ok = writeJSON(KEYS.meta, { schemaVersion: SCHEMA_VERSION });
  ok = writeJSON(KEYS.settings, d.settings) && ok;
  ok = writeJSON(KEYS.queue, d.queue) && ok;
  ok = writeJSON(KEYS.cards, d.cards) && ok;
  ok = writeJSON(KEYS.sessions, d.sessions) && ok;
  ok = writeJSON(KEYS.active, d.active) && ok;
  return ok;
}

/** Write only the slices that changed. */
export function saveChanged(next: AppData, prev: AppData): boolean {
  let ok = writeJSON(KEYS.meta, { schemaVersion: SCHEMA_VERSION });
  if (next.settings !== prev.settings) ok = writeJSON(KEYS.settings, next.settings) && ok;
  if (next.queue !== prev.queue) ok = writeJSON(KEYS.queue, next.queue) && ok;
  if (next.cards !== prev.cards) ok = writeJSON(KEYS.cards, next.cards) && ok;
  if (next.sessions !== prev.sessions) ok = writeJSON(KEYS.sessions, next.sessions) && ok;
  if (next.active !== prev.active) ok = writeJSON(KEYS.active, next.active) && ok;
  return ok;
}

export function clearAll(): void {
  for (const k of Object.values(KEYS)) removeKey(k);
}
