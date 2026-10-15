import { useEffect, useId, useRef, useState } from 'react';
import { FaceSvg, type Zone } from './FaceSvg';
import { scaleFace, type FaceParams } from './params';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface FaceProps {
  params: FaceParams;
  /** 0 to 1.5. Scales every parameter. */
  intensity?: number;
  highlight?: Zone | null;
  /** Accessible description, e.g. "Cartoon face showing Stress". */
  label: string;
  /** Change this value to replay the face from neutral. */
  replayKey?: string | number;
  /** Animate from neutral on first render. */
  animateOnMount?: boolean;
  /** Show the neutral face instead. */
  neutral?: boolean;
  className?: string;
}

const HOLD_MS = 350;
const RUN_MS = 1100;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The cartoon face, with "replay from neutral" animation. */
export function Face({ params, intensity = 1, highlight, label, replayKey, animateOnMount = false, neutral = false, className }: FaceProps) {
  const uid = 'f' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const reduce = useReducedMotion();
  const [t, setT] = useState(animateOnMount && !reduce ? 0 : 1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!animateOnMount) return;
    }
    if (reduce) {
      setT(1);
      return;
    }
    let raf = 0;
    let start = 0;
    setT(0);
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const k = Math.min(1, (now - start) / RUN_MS);
        setT(ease(k));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, HOLD_MS);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      setT(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey, reduce]);

  const p = scaleFace(params, neutral ? 0 : intensity * t);
  return <FaceSvg p={p} uid={uid} label={label} highlight={highlight} className={className} />;
}
