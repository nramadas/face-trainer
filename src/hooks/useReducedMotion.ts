import { useSyncExternalStore } from 'react';
import { useApp } from '../store/appStore';

const query = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(query);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const getSnapshot = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);

export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True when the system asks for reduced motion or the user turned it on in Settings. */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const setting = useApp((s) => s.settings.reduceMotion);
  return system || setting;
}
