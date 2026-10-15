import { useRef, type ReactNode } from 'react';
import { Tabs } from '@base-ui/react/tabs';
import type { Emotion } from '../data/types';
import { Face } from '../face/Face';
import type { Zone } from '../face/FaceSvg';
import { photoUrl, type Persona } from '../lib/photos';
import { cx } from './ui';

export type FaceKind = 'cartoon' | Persona;
const KIND_LABEL: Record<FaceKind, string> = { cartoon: 'Cartoon', male: 'Man', female: 'Woman' };

interface Props {
  emotion: Emotion;
  kinds?: FaceKind[];
  value: FaceKind;
  onValueChange: (k: FaceKind) => void;
  intensity?: number;
  highlight?: Zone | null;
  replayKey?: string | number;
  neutral?: boolean;
  animateOnMount?: boolean;
  /** Extra controls shown under the cartoon. */
  cartoonControls?: ReactNode;
  className?: string;
  size?: 'md' | 'sm';
}

export function PhotoOrCartoon({ emotion, persona, intensity = 1, compact }: { emotion: Emotion; persona: Persona; intensity?: number; compact?: boolean }) {
  const url = photoUrl(emotion.id, persona);
  const who = persona === 'male' ? 'man' : 'woman';
  if (url) {
    return <img src={url} alt={`Photo of a ${who} showing ${emotion.name}`} className="aspect-[4/5] w-full rounded-[20px] object-cover" loading="lazy" decoding="async" />;
  }
  return (
    <div className="relative">
      <Face params={emotion.face} intensity={intensity} label={`Cartoon face showing ${emotion.name}`} />
      <p className={cx('absolute inset-x-0 bottom-2 text-center text-faint', compact ? 'text-[11px]' : 'text-xs')}>
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[#c9d6d9]">Photo not generated yet</span>
      </p>
    </div>
  );
}

/** Cartoon | Man | Woman switcher (Base UI Tabs). Swipe left or right to switch on touch screens. */
export function FaceViewer({ emotion, kinds = ['cartoon', 'male', 'female'], value, onValueChange, intensity = 1, highlight, replayKey, neutral, animateOnMount, cartoonControls, className, size = 'md' }: Props) {
  const startX = useRef<number | null>(null);
  const current = kinds.includes(value) ? value : kinds[0];
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 50) return;
    const i = kinds.indexOf(current);
    const next = kinds[Math.max(0, Math.min(kinds.length - 1, i + (dx < 0 ? 1 : -1)))];
    if (next !== current) onValueChange(next);
  };

  return (
    <Tabs.Root value={current} onValueChange={(v) => onValueChange(v as FaceKind)} className={className}>
      {kinds.length > 1 && (
        <Tabs.List aria-label="Face to show" className="relative mx-auto mb-3 flex w-fit gap-1 rounded-full glass p-1">
          {kinds.map((k) => (
            <Tabs.Tab
              key={k}
              value={k}
              className="relative z-10 h-9 rounded-full px-4 text-sm font-medium text-muted transition-colors data-[active]:text-white"
            >
              {KIND_LABEL[k]}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute top-1 left-0 z-0 h-9 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-full btn-accent transition-[translate,width] duration-200" />
        </Tabs.List>
      )}
      <div onPointerDown={onPointerDown} onPointerUp={onPointerUp} className={cx('mx-auto', size === 'sm' ? 'max-w-[220px]' : 'max-w-[300px]')}>
        {kinds.map((k) => (
          <Tabs.Panel key={k} value={k} className="outline-none">
            {k === 'cartoon' ? (
              <>
                <Face
                  params={emotion.face}
                  intensity={intensity}
                  highlight={highlight}
                  replayKey={replayKey}
                  neutral={neutral}
                  animateOnMount={animateOnMount}
                  label={neutral ? 'Cartoon face at neutral' : `Cartoon face showing ${emotion.name}`}
                />
                {cartoonControls}
              </>
            ) : (
              <PhotoOrCartoon emotion={emotion} persona={k} intensity={intensity} />
            )}
          </Tabs.Panel>
        ))}
      </div>
    </Tabs.Root>
  );
}
