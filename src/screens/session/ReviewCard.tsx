import { useEffect, useRef, useState } from 'react';
import { Checkbox } from '@base-ui/react/checkbox';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import { Check, KeyRound, ScanFace } from 'lucide-react';
import type { Emotion, ZoneKey } from '../../data/types';
import { ZONE_ORDER } from '../../data/types';
import { FaceViewer, type FaceKind } from '../../components/FaceViewer';
import { MirrorView } from '../../components/Mirror';
import type { MirrorControl } from '../../hooks/useMirror';
import { suggestRating } from '../../lib/rating';
import { GRADE_LABEL, type GradeValue } from '../../lib/srs';
import { formatSeconds } from '../../lib/stats';
import { Button, Card, cx } from '../../components/ui';

export interface ReviewResult {
  grade: GradeValue;
  recallMs: number;
  keyCue: boolean;
  zones: ZoneKey[];
}

interface Props {
  emotion: Emotion;
  badge: string;
  kinds: FaceKind[];
  intensity: number;
  mirror?: MirrorControl;
  showMirror?: boolean;
  submitLabel?: string;
  /** Shown above the card front only. */
  frontNote?: React.ReactNode;
  onSubmit: (r: ReviewResult) => void;
}

/** The big glowing round button, styled like the "Listening…" microphone in the reference. */
export function FaceIsSetButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative mx-auto grid size-56 place-items-center">
      <span aria-hidden className="absolute inset-4 rounded-full border border-accent/30 bg-accent/5" />
      <span aria-hidden className="absolute inset-9 rounded-full bg-accent/25 animate-ring" />
      <button
        type="button"
        onClick={onClick}
        className="glow relative grid size-40 place-items-center rounded-full border-2 border-accent-text/70 bg-[radial-gradient(circle_at_50%_35%,#1f9aa6,#127480_60%,#0d5c65)] text-white transition-transform active:scale-95"
      >
        <span className="flex flex-col items-center gap-1.5">
          <ScanFace className="size-10" aria-hidden />
          <span className="text-lg font-semibold">Face is set</span>
        </span>
      </button>
    </div>
  );
}

export function ReviewCard({ emotion: e, badge, kinds, intensity, mirror, showMirror, submitLabel = 'Save and continue', frontNote, onSubmit }: Props) {
  const [phase, setPhase] = useState<'front' | 'back'>('front');
  const [recallMs, setRecallMs] = useState(0);
  const [keyCue, setKeyCue] = useState(false);
  const [zones, setZones] = useState<ZoneKey[]>([]);
  const [override, setOverride] = useState<GradeValue | null>(null);
  const [kind, setKind] = useState<FaceKind>(kinds[0]);
  const shownAt = useRef(0);
  const backHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    shownAt.current = performance.now();
  }, []);
  useEffect(() => {
    if (phase === 'back') backHeading.current?.focus();
  }, [phase]);

  const suggestion = suggestRating(keyCue, zones.length, recallMs);
  const grade = override ?? suggestion.grade;

  if (phase === 'front') {
    return (
      <>
      {frontNote}
      <div className="flex flex-col items-center pt-4 text-center animate-fade-in">
        <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-medium text-muted">{badge}</span>
        <h2 className="mt-5 text-[44px] leading-none font-bold tracking-tight text-white">{e.name}</h2>
        <p className="mt-4 max-w-sm text-lg leading-snug text-muted">{e.oneLiner}</p>
        {showMirror && mirror && <MirrorView mirror={mirror} compact className="mt-6 w-full max-w-[220px]" />}
        <div className="mt-6">
          <FaceIsSetButton
            onClick={() => {
              setRecallMs(performance.now() - shownAt.current);
              setPhase('back');
            }}
          />
        </div>
        <p className="mt-1 text-sm text-faint">Make the face. Tap the button when it is set.</p>
      </div>
      </>
    );
  }

  const toggleZone = (z: ZoneKey, on: boolean) => setZones((cur) => (on ? [...new Set([...cur, z])] : cur.filter((x) => x !== z)));

  return (
    <div className="animate-fade-in pb-4">
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <h2 ref={backHeading} tabIndex={-1} className="text-2xl font-bold text-white outline-none">
          {e.name}
        </h2>
        <p className="tabular text-sm text-muted">
          Your time: <span className="font-semibold text-ink">{formatSeconds(recallMs)}</span>
        </p>
      </div>

      <Card className="mt-3 p-3">
        <FaceViewer emotion={e} kinds={kinds} value={kind} onValueChange={setKind} intensity={intensity} animateOnMount size="sm" />
      </Card>

      <Card className="mt-3 flex gap-3 border-accent/40 p-4">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden />
        <div>
          <p className="text-sm font-medium text-accent-text">Key cue</p>
          <p className="mt-0.5 text-ink">{e.keyCue}</p>
        </div>
      </Card>

      <h3 className="mt-6 mb-1 font-semibold text-ink">What did you get right?</h3>
      <p className="mb-3 text-sm text-muted">Compare with the reference. Tick only what matched.</p>
      <div className="space-y-2">
        <CheckRow checked={keyCue} onChange={setKeyCue} title="Key cue" text={e.keyCue} />
        {ZONE_ORDER.map((z) => (
          <CheckRow key={z.key} checked={zones.includes(z.key)} onChange={(v) => toggleZone(z.key, v)} title={z.label} text={e.zones[z.key]} />
        ))}
      </div>

      <h3 className="mt-6 mb-1 font-semibold text-ink">How did it go?</h3>
      <p className="mb-3 text-sm text-muted" aria-live="polite">
        Suggested: <span className="font-medium text-ink">{GRADE_LABEL[suggestion.grade]}</span>. {suggestion.reason}
      </p>
      <RadioGroup value={String(grade)} onValueChange={(v) => setOverride(Number(v) as GradeValue)} aria-label="Rating" className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as GradeValue[]).map((g) => (
          <Radio.Root
            key={g}
            value={String(g)}
            className={cx(
              'glass flex h-12 items-center justify-center rounded-full text-[15px] font-medium text-ink transition-colors',
              'data-[checked]:btn-accent data-[checked]:border-accent/60',
            )}
          >
            {GRADE_LABEL[g]}
          </Radio.Root>
        ))}
      </RadioGroup>

      <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => onSubmit({ grade, recallMs, keyCue, zones })}>
        {submitLabel}
      </Button>
    </div>
  );
}

function CheckRow({ checked, onChange, title, text }: { checked: boolean; onChange: (v: boolean) => void; title: string; text: string }) {
  return (
    <label className={cx('glass flex cursor-pointer gap-3 rounded-[18px] p-3.5 transition-colors', checked && 'border-accent/50 bg-accent/10')}>
      <Checkbox.Root
        checked={checked}
        onCheckedChange={(v) => onChange(v)}
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-white/35 bg-white/5 data-[checked]:border-accent data-[checked]:bg-accent-strong"
      >
        <Checkbox.Indicator>
          <Check className="size-4 text-white" strokeWidth={3} aria-hidden />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span className="min-w-0">
        <span className="block font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-muted">{text}</span>
      </span>
    </label>
  );
}
