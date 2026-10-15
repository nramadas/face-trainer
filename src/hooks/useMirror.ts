import { useCallback, useEffect, useRef, useState } from 'react';

export type MirrorStatus = 'off' | 'starting' | 'on' | 'denied' | 'unavailable';

/**
 * Front camera as a mirror. Nothing is recorded, saved or uploaded.
 * All tracks stop when the mirror is turned off or the component unmounts.
 */
export function useMirror() {
  const [status, setStatus] = useState<MirrorStatus>('off');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const ref = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    ref.current?.getTracks().forEach((t) => t.stop());
    ref.current = null;
    setStream(null);
    setStatus((s) => (s === 'on' || s === 'starting' ? 'off' : s));
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }
    setStatus('starting');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      ref.current?.getTracks().forEach((t) => t.stop());
      ref.current = s;
      setStream(s);
      setStatus('on');
    } catch (e) {
      const name = (e as DOMException)?.name;
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
    }
  }, []);

  useEffect(() => () => ref.current?.getTracks().forEach((t) => t.stop()), []);

  return { status, stream, start, stop };
}

export type MirrorControl = ReturnType<typeof useMirror>;
