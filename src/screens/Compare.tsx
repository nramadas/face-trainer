import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { RotateCcw, ArrowLeftRight } from 'lucide-react';
import { Tabs } from '@base-ui/react/tabs';
import { differenceBetween, getEmotion } from '../data/emotions';
import { ZONE_ORDER, type Emotion, type ZoneKey } from '../data/types';
import { Face } from '../face/Face';
import { IntensitySlider } from '../face/IntensitySlider';
import { INTENSITY_VALUES } from '../face/params';
import { PhotoOrCartoon, type FaceKind } from '../components/FaceViewer';
import { useApp } from '../store/appStore';
import { Button, Card, PageHeader, SectionTitle, cx } from '../components/ui';
import { NotFound } from './NotFound';

export function Compare() {
  const { a, b } = useParams();
  const A = getEmotion(a);
  const B = getEmotion(b);
  if (!A || !B) return <NotFound />;
  return <CompareView key={`${A.id}-${B.id}`} A={A} B={B} />;
}

/** Side-by-side compare of two faces. Reused by the learn flow. */
export function SideBySide({ A, B, kind = 'cartoon', intensity = 1, replayKey, highlight, small }: { A: Emotion; B: Emotion; kind?: FaceKind; intensity?: number; replayKey?: number; highlight?: ZoneKey | null; small?: boolean }) {
  const hl = highlight ? ZONE_ORDER.find((z) => z.key === highlight)!.highlight : null;
  return (
    <div className={cx('grid grid-cols-2', small ? 'gap-1.5' : 'gap-3')}>
      {[A, B].map((e) => (
        <figure key={e.id} className="min-w-0">
          <div className={cx('rounded-[18px] bg-white/[0.04]', small ? 'p-0.5' : 'p-1.5')}>
            {kind === 'cartoon' ? (
              <Face params={e.face} intensity={intensity} replayKey={replayKey} highlight={hl} label={`Cartoon face showing ${e.name}`} />
            ) : (
              <PhotoOrCartoon emotion={e} persona={kind} intensity={intensity} compact />
            )}
          </div>
          <figcaption className={cx('text-center font-semibold text-ink', small ? 'mt-0.5 text-xs' : 'mt-2')}>{e.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function CompareView({ A, B }: { A: Emotion; B: Emotion }) {
  const defaultIntensity = useApp((s) => INTENSITY_VALUES[s.settings.defaultIntensity]);
  const [kind, setKind] = useState<FaceKind>('cartoon');
  const [intensity, setIntensity] = useState(defaultIntensity);
  const [replay, setReplay] = useState(0);
  const [zone, setZone] = useState<ZoneKey | null>(null);
  const diff = differenceBetween(A.id, B.id);

  return (
    <div>
      <PageHeader
        title="Compare"
        subtitle={`${A.name} and ${B.name}`}
        back
        action={
          <Link to={`/compare/${B.id}/${A.id}`} aria-label="Swap sides" title="Swap sides" className="glass grid size-12 place-items-center rounded-full hover:bg-white/10">
            <ArrowLeftRight className="size-5" aria-hidden />
          </Link>
        }
      />

      <Tabs.Root value={kind} onValueChange={(v) => setKind(v as FaceKind)}>
        <Tabs.List aria-label="Face to show" className="relative mx-auto mb-3 flex w-fit gap-1 rounded-full glass p-1">
          {(['cartoon', 'male', 'female'] as const).map((k) => (
            <Tabs.Tab key={k} value={k} className="relative z-10 h-9 rounded-full px-4 text-sm font-medium text-muted data-[active]:text-white">
              {k === 'cartoon' ? 'Cartoon' : k === 'male' ? 'Man' : 'Woman'}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute top-1 left-0 z-0 h-9 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-full btn-accent transition-[translate,width] duration-200" />
        </Tabs.List>
      </Tabs.Root>

      <Card className="p-3">
        <SideBySide A={A} B={B} kind={kind} intensity={intensity} replayKey={replay} highlight={zone} />
        {kind === 'cartoon' && (
          <div className="mt-4 space-y-3 px-1">
            <IntensitySlider value={intensity} onChange={setIntensity} />
            <Button size="sm" className="w-full" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setReplay((r) => r + 1)}>
              Replay both from neutral
            </Button>
          </div>
        )}
      </Card>

      {diff && (
        <Card className="mt-4 border-accent/40 p-4">
          <p className="text-sm font-medium text-accent-text">The difference</p>
          <p className="mt-1 leading-relaxed text-ink">{diff}</p>
        </Card>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {[A, B].map((e) => (
          <Card key={e.id} className="p-3">
            <p className="text-xs font-medium text-muted">{e.name}: key cue</p>
            <p className="mt-1 text-sm text-ink">{e.keyCue}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Zone by zone</SectionTitle>
      <div className="sticky top-[calc(env(safe-area-inset-top)+8px)] z-10 mx-auto mb-3 w-56 rounded-[18px] border border-white/12 bg-[#10292c]/90 p-1.5 shadow-lg backdrop-blur-xl">
        <SideBySide A={A} B={B} intensity={intensity} highlight={zone} small />
      </div>
      <ul className="space-y-2">
        {ZONE_ORDER.map((z) => (
          <li key={z.key}>
            <button
              type="button"
              aria-pressed={zone === z.key}
              onMouseEnter={() => setZone(z.key)}
              onMouseLeave={() => setZone(null)}
              onFocus={() => setZone(z.key)}
              onBlur={() => setZone(null)}
              onClick={() => {
                setZone((cur) => (cur === z.key ? null : z.key));
                setKind('cartoon');
              }}
              className={cx('glass w-full rounded-[20px] p-4 text-left', zone === z.key && 'border-accent/60 bg-accent/12')}
            >
              <span className="block font-semibold text-ink">{z.label}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">
                <span className="font-medium text-ink">{A.name}: </span>
                {A.zones[z.key]}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">
                <span className="font-medium text-ink">{B.name}: </span>
                {B.zones[z.key]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to={`/explore/${A.id}`} className="glass flex h-12 items-center justify-center rounded-full font-medium text-ink">
          Open {A.name}
        </Link>
        <Link to={`/explore/${B.id}`} className="glass flex h-12 items-center justify-center rounded-full font-medium text-ink">
          Open {B.name}
        </Link>
      </div>
    </div>
  );
}
