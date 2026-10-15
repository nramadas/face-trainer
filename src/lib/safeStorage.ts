/** localStorage access that never throws. */
let available: boolean | null = null;

export function storageAvailable(): boolean {
  if (available !== null) return available;
  try {
    const k = '__stageface_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

export function readJSON<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

/** Returns false if the write failed (storage full, blocked, or unavailable). */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    available = false;
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
