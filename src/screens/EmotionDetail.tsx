import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Eye, RotateCcw, Dumbbell, ListPlus, Check, ChevronRight, Quote, KeyRound } from 'lucide-react';
import { getEmotion, lookAlikeEntries } from '../data/emotions';
import { groupInfo } from '../data/groups';
import { CONTEXT_NOTE, ZONE_ORDER, type Emotion, type ZoneKey } from '../data/types';
import { FaceViewer, type FaceKind } from '../components/FaceViewer';
import { IntensitySlider } from '../face/IntensitySlider';
import { Face } from '../face/Face';
import { INTENSITY_VALUES } from '../face/params';
import { useApp } from '../store/appStore';
import { statusOf, STATUS_LABEL } from '../lib/stats';
import { Button, Card, PageHeader, SectionTitle, StatusDot, TierBadge, cx } from '../components/ui';
import { NotFound } from './NotFound';

export function EmotionDetail() {
  const { id } = useParams();
  const e = getEmotion(id);
  if (!e) return <NotFound />;
  return <Detail key={e.id} e={e} />;
}

function Detail({ e }: { e: Emotion }) {
  const navigate = useNavigate();
  const defaultIntensity = useApp((s) => INTENSITY_VALUES[s.settings.defaultIntensity]);
  const rec = useApp((s) => s.cards[e.id]);
  const queueFront = useApp((s) => s.queue[0]);
  const learnNext = useApp((s) => s.learnNext);
  const status = statusOf(rec);

  const [kind, setKind] = useState<FaceKind>('cartoon');
  const [intensity, setIntensity] = useState(defaultIntensity);
  const [replay, setReplay] = useState(0);
  const [neutral, setNeutral] = useState(false);
  const [hover, setHover] = useState<ZoneKey | null>(null);
  const [pinned, setPinned] = useState<ZoneKey | null>(null);
  const [queued, setQueued] = useState(false);

  const activeZone = hover ?? pinned;
  const highlight = activeZone ? ZONE_ORDER.find((z) => z.key === activeZone)!.highlight : null;
  const looks = lookAlikeEntries(e.id);

  const focusZone = (z: ZoneKey | null) => {
    setHover(z);
    if (z) setKind('cartoon');
  };

  return (
    <div>
      <PageHeader title={e.name} subtitle={groupInfo(e.group).short} back />

      <Card className="p-4">
        <FaceViewer
          emotion={e}
          value={kind}
          onValueChange={setKind}
          intensity={intensity}
          highlight={highlight}
          replayKey={replay}
          neutral={neutral}
          animateOnMount
          cartoonControls={
            <div className="mt-4 space-y-4">
              <IntensitySlider value={intensity} onChange={setIntensity} />
              <div className="flex gap-2">
                <Button size="sm" className="flex-[1.4] gap-1.5 px-3 text-[13px] whitespace-nowrap" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => { setNeutral(false); setReplay((r) => r + 1); }}>
                  Replay from neutral
                </Button>
                <Button size="sm" className={cx('flex-1 gap-1.5 px-3 text-[13px] whitespace-nowrap', neutral && 'bg-white/15')} aria-pressed={neutral} icon={<Eye className="size-4" aria-hidden />} onClick={() => setNeutral((n) => !n)}>
                  Show neutral
                </Button>
              </div>
            </div>
          }
        />
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TierBadge tier={e.tier} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-muted">
          <StatusDot status={status} className="size-2" /> {STATUS_LABEL[status]}
        </span>
      </div>

      {e.tier === 'context' && (
        <Card className="mt-3 p-4 text-sm leading-relaxed">
          <p className="text-muted">{CONTEXT_NOTE}</p>
          {e.playableNote && <p className="mt-2 text-ink">{e.playableNote}</p>}
        </Card>
      )}

      <p className="mt-5 text-[17px] leading-relaxed text-ink">{e.definition}</p>
      <p className="mt-3 text-[17px] leading-relaxed text-muted italic">{e.oneLiner}</p>

      <Card className="mt-5 flex gap-3 border-accent/40 p-4">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden />
        <div>
          <p className="text-sm font-medium text-accent-text">Key cue</p>
          <p className="mt-0.5 text-ink">{e.keyCue}</p>
        </div>
      </Card>

      <SectionTitle>Build it in this order</SectionTitle>
      <p className="-mt-1 mb-3 text-sm text-muted">Tap or hover a step to see that part of the face.</p>
      <div className="sticky top-[calc(env(safe-area-inset-top)+8px)] z-10 mx-auto mb-3 w-32 rounded-[18px] border border-white/12 bg-[#10292c]/90 p-1.5 shadow-lg backdrop-blur-xl">
        <Face params={e.face} intensity={intensity} highlight={highlight} label={activeZone ? `Cartoon face showing ${e.name}, ${activeZone} highlighted` : `Cartoon face showing ${e.name}`} />
      </div>
      <ol className="space-y-2">
        {ZONE_ORDER.map((z, i) => {
          const on = activeZone === z.key;
          return (
            <li key={z.key}>
              <button
                type="button"
                aria-pressed={pinned === z.key}
                onMouseEnter={() => focusZone(z.key)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => focusZone(z.key)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  setPinned((p) => (p === z.key ? null : z.key));
                  setKind('cartoon');
                }}
                className={cx('glass flex w-full gap-3 rounded-[20px] p-4 text-left transition-colors', on && 'border-accent/60 bg-accent/12')}
              >
                <span className={cx('grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold', on ? 'btn-accent' : 'bg-white/10 text-ink')}>{i + 1}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{z.label}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-muted">{e.zones[z.key]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {looks.length > 0 && (
        <>
          <SectionTitle>Easy to mix up with</SectionTitle>
          <ul className="space-y-2">
            {looks.map((l) => {
              const other = getEmotion(l.id);
              if (!other) return null;
              return (
                <li key={l.id}>
                  <Link to={`/compare/${e.id}/${l.id}`} className="glass flex items-center gap-3 rounded-[20px] p-3 hover:bg-white/9">
                    <div className="w-16 shrink-0 rounded-xl bg-white/5 p-1" aria-hidden>
                      <Face params={other.face} label="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{other.name}</p>
                      <p className="mt-0.5 line-clamp-3 text-sm text-muted">{l.difference}</p>
                      <p className="mt-1 text-sm font-medium text-accent-text">Compare side by side</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <SectionTitle>Try it with a line</SectionTitle>
      <Card className="flex gap-3 p-5">
        <Quote className="size-5 shrink-0 text-accent-text" aria-hidden />
        <div>
          <p className="text-lg leading-snug text-ink">{e.line}</p>
          <p className="mt-2 text-sm text-muted">Make the face first. Then say the line out loud while you hold it.</p>
        </div>
      </Card>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <Button size="lg" icon={<Dumbbell className="size-5" aria-hidden />} onClick={() => navigate(`/train/practice/${e.id}`)}>
          Practice now
        </Button>
        {rec ? (
          <Button size="lg" disabled icon={<Check className="size-5" aria-hidden />}>
            Learned
          </Button>
        ) : (
          <Button
            size="lg"
            variant="primary"
            disabled={queueFront === e.id}
            icon={queueFront === e.id ? <Check className="size-5" aria-hidden /> : <ListPlus className="size-5" aria-hidden />}
            onClick={() => {
              learnNext(e.id);
              setQueued(true);
            }}
          >
            {queueFront === e.id ? 'Up next' : 'Learn this next'}
          </Button>
        )}
      </div>
      <p className="mt-2 min-h-5 text-center text-sm text-muted" role="status">
        {queued ? `${e.name} is now your next new emotion.` : 'Practice does not change your schedule.'}
      </p>

      <p className="mt-6 text-xs text-faint">Facial action units (FACS): {e.actionUnits.join(', ')}</p>
    </div>
  );
}
