import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import { useApp } from '../store/appStore';
import { EMOTIONS, getEmotion, lookAlikeIds } from '../data/emotions';
import { useMirror } from '../hooks/useMirror';
import { MirrorView } from '../components/Mirror';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Button, Card, LinkButton, PageHeader, SectionTitle, Toggle, cx } from '../components/ui';
import { SWITCH_UNLOCK } from './TrainHub';

const SWITCHES = 12;

/** Suggested sets of 2 or 3 learned look-alikes. */
export function suggestSets(learned: string[]): string[][] {
  const have = new Set(learned);
  const seen = new Set<string>();
  const sets: string[][] = [];
  for (const id of learned) {
    const look = lookAlikeIds(id).filter((x) => have.has(x)).slice(0, 2);
    if (!look.length) continue;
    const set = [id, ...look];
    const key = [...set].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    sets.push(set);
  }
  return sets;
}

function nextName(set: string[], current: string | null): string {
  const options = set.filter((x) => x !== current);
  return options[Math.floor(Math.random() * options.length)];
}

export function SwitchDrill() {
  const cards = useApp((s) => s.cards);
  const learned = useMemo(() => EMOTIONS.filter((e) => cards[e.id]).map((e) => e.id), [cards]);
  const sets = useMemo(() => suggestSets(learned), [learned]);
  const [custom, setCustom] = useState<string[]>([]);
  const [setKey, setSetKey] = useState<string>(sets[0]?.join('|') ?? 'custom');
  const [pace, setPace] = useState('4');
  const [showCue, setShowCue] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const mirror = useMirror();
  const reduce = useReducedMotion();
  const timer = useRef<number | undefined>(undefined);

  const chosen = setKey === 'custom' ? custom : setKey.split('|');
  const ms = Number(pace) * 1000;

  useEffect(() => {
    if (!running || paused) return;
    timer.current = window.setTimeout(() => {
      if (count + 1 >= SWITCHES) {
        setRunning(false);
        setDone(true);
        return;
      }
      setCurrent((c) => nextName(chosen, c));
      setCount((n) => n + 1);
    }, ms);
    return () => window.clearTimeout(timer.current);
  }, [running, paused, count, ms, chosen]);

  if (learned.length < SWITCH_UNLOCK) {
    return (
      <div>
        <PageHeader title="Switch drill" back="/train" />
        <Card className="p-5">
          <p className="text-ink">Switch drill unlocks after you learn {SWITCH_UNLOCK} emotions.</p>
          <p className="mt-1 text-sm text-muted">You have learned {learned.length}. Keep going with daily sessions.</p>
        </Card>
      </div>
    );
  }

  const start = () => {
    setDone(false);
    setCount(0);
    setCurrent(chosen[0]);
    setPaused(false);
    setRunning(true);
  };

  if (running) {
    const e = getEmotion(current ?? undefined);
    return (
      <div>
        <PageHeader title="Switch drill" subtitle={`Switch ${count + 1} of ${SWITCHES}`} />
        {showMirror && <MirrorView mirror={mirror} compact className="mx-auto mb-4 max-w-[200px]" />}
        <Card className="px-5 py-10 text-center">
          <p className="text-sm text-muted">Make</p>
          <p key={`${count}-${current}`} className="mt-2 text-5xl font-bold tracking-tight text-white animate-fade-in" aria-live="assertive">
            {e?.name}
          </p>
          {showCue && <p className="mt-4 text-muted">{e?.keyCue}</p>}
          <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            {!reduce && !paused && (
              <div key={count} className="h-full rounded-full bg-accent" style={{ animation: `drill-bar ${ms}ms linear forwards` }} />
            )}
          </div>
        </Card>
        <style>{`@keyframes drill-bar { from { width: 0 } to { width: 100% } }`}</style>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button size="lg" icon={paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            size="lg"
            icon={<Square className="size-4" aria-hidden />}
            onClick={() => {
              setRunning(false);
              setDone(true);
            }}
          >
            Stop
          </Button>
        </div>
      </div>
    );
  }

  const toggleCustom = (id: string) =>
    setCustom((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  return (
    <div>
      <PageHeader title="Switch drill" subtitle="Look-alikes, fast" back="/train" />
      {done && (
        <Card className="mb-4 p-4 text-center">
          <p className="font-semibold text-ink">Drill done.</p>
          <p className="text-sm text-muted">Did each face feel different from the last? If two felt the same, open Compare for that pair.</p>
        </Card>
      )}
      <p className="text-muted">
        A name appears every few seconds. Change your face to match it as fast as you can. Make each face fully, then let it go.
      </p>

      <SectionTitle>Which faces</SectionTitle>
      <RadioGroup value={setKey} onValueChange={(v) => setSetKey(v as string)} aria-label="Set of emotions" className="space-y-2">
        {sets.map((s) => (
          <Radio.Root key={s.join('|')} value={s.join('|')} className="glass flex w-full items-center gap-3 rounded-[18px] p-3.5 text-left data-[checked]:border-accent/60 data-[checked]:bg-accent/12">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-white/35">
              <Radio.Indicator className="size-2.5 rounded-full bg-accent-text" />
            </span>
            <span className="text-ink">{s.map((id) => getEmotion(id)?.name).join(' · ')}</span>
          </Radio.Root>
        ))}
        <Radio.Root value="custom" className="glass flex w-full items-center gap-3 rounded-[18px] p-3.5 text-left data-[checked]:border-accent/60 data-[checked]:bg-accent/12">
          <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-white/35">
            <Radio.Indicator className="size-2.5 rounded-full bg-accent-text" />
          </span>
          <span className="text-ink">Pick my own (2 or 3)</span>
        </Radio.Root>
      </RadioGroup>
      {setKey === 'custom' && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pick 2 or 3 emotions">
          {learned.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={custom.includes(id)}
              onClick={() => toggleCustom(id)}
              className={cx('h-10 rounded-full px-4 text-sm font-medium', custom.includes(id) ? 'btn-accent' : 'glass text-ink')}
            >
              {getEmotion(id)?.name}
            </button>
          ))}
        </div>
      )}

      <SectionTitle>Pace</SectionTitle>
      <RadioGroup value={pace} onValueChange={(v) => setPace(v as string)} aria-label="Seconds per name" className="grid grid-cols-3 gap-2">
        {['3', '4', '5'].map((p) => (
          <Radio.Root key={p} value={p} className="glass flex h-12 items-center justify-center rounded-full font-medium text-ink data-[checked]:btn-accent">
            {p} seconds
          </Radio.Root>
        ))}
      </RadioGroup>

      <Card className="mt-5 px-4">
        <Toggle id="cue" checked={showCue} onChange={setShowCue} label="Show the key cue" description="A hint under each name." />
        <Toggle
          id="mirror"
          checked={showMirror}
          onChange={(v) => {
            setShowMirror(v);
            if (!v) mirror.stop();
          }}
          label="Show the mirror"
          description="You tap to turn the camera on. Nothing is recorded."
        />
      </Card>

      <Button variant="primary" size="lg" glow className="mt-6 w-full" disabled={chosen.length < 2} onClick={start}>
        Start drill
      </Button>
      {chosen.length < 2 && <p className="mt-2 text-center text-sm text-muted">Pick at least 2 emotions.</p>}
      <LinkButton to="/train" variant="ghost" className="mt-2 w-full">
        Back to Train
      </LinkButton>
    </div>
  );
}
