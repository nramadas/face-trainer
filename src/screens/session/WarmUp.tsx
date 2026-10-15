import { useEffect, useState } from 'react';
import { Face } from '../../face/Face';
import { Button, Card, CoachBubble, cx } from '../../components/ui';

const STEPS = ['Relax your brows.', 'Unclench your jaw.', 'Drop your shoulders.', 'Breathe out.'];
const STEP_MS = 5000;

/** About 20 seconds of neutral reset before training. Skippable. */
export function WarmUp({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= STEPS.length) return;
    const t = window.setTimeout(() => setI((x) => x + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [i]);
  const finished = i >= STEPS.length;

  return (
    <div className="space-y-4 pt-2">
      <div className="text-center">
        <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-medium text-muted">Warm-up</span>
        <h2 className="mt-4 text-2xl font-bold text-white">Start from neutral</h2>
        <p className="mt-1 text-sm text-muted">A neutral face makes every other face clearer.</p>
      </div>
      <Card className="mx-auto max-w-[220px] p-2">
        <Face params={{}} label="Cartoon face at neutral" />
      </Card>
      <div aria-live="polite" className="space-y-2">
        {STEPS.slice(0, Math.min(i + 1, STEPS.length)).map((s, k) => (
          <CoachBubble key={s} avatar={k === 0}>
            <span className={cx(k === i ? 'font-semibold text-ink' : 'text-muted')}>{s}</span>
          </CoachBubble>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 pt-1" aria-hidden>
        {STEPS.map((s, k) => (
          <span key={s} className={cx('h-1.5 w-8 rounded-full', k < i ? 'bg-accent' : k === i ? 'bg-accent-text' : 'bg-white/12')} />
        ))}
      </div>
      {finished ? (
        <Button variant="primary" size="lg" className="w-full" onClick={onDone}>
          I am ready
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button size="lg" className="flex-1" onClick={onDone}>
            Skip warm-up
          </Button>
          <Button size="lg" className="flex-1" onClick={() => setI((x) => x + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
