import { Link } from 'react-router';
import { Shuffle, ScanSearch, Lock, ChevronRight, Dumbbell } from 'lucide-react';
import { useApp } from '../store/appStore';
import { SessionCard } from '../components/SessionCard';
import { Card, PageHeader, SectionTitle, cx } from '../components/ui';

export const SWITCH_UNLOCK = 4;

export function TrainHub() {
  const learned = useApp((s) => Object.keys(s.cards).length);
  const switchLocked = learned < SWITCH_UNLOCK;

  return (
    <div>
      <PageHeader title="Train" subtitle="Make the face on cue" />
      <SessionCard glow={false} />
      <p className="mt-3 px-1 text-sm leading-relaxed text-muted">
        Each session teaches one new emotion, then brings back ones you know. They come back right before you are likely to forget them (this is called
        spaced repetition), so recall gets faster over time.
      </p>

      <SectionTitle>More ways to practice</SectionTitle>
      <div className="space-y-3">
        <ModeCard
          to="/train/switch"
          locked={switchLocked}
          icon={<Shuffle className="size-5" aria-hidden />}
          title="Switch drill"
          text={
            switchLocked
              ? `Unlocks after you learn ${SWITCH_UNLOCK} emotions. You have learned ${learned}.`
              : 'Switch fast between look-alike faces, one name every few seconds. Makes each face its own shape.'
          }
        />
        <ModeCard
          to="/train/spot"
          icon={<ScanSearch className="size-5" aria-hidden />}
          title="Spot it"
          text="See a face and pick the emotion. Builds your vocabulary. Not scheduled."
        />
        <ModeCard to="/explore" icon={<Dumbbell className="size-5" aria-hidden />} title="Free practice" text="Pick any emotion in Explore and tap Practice now. Your schedule does not change." />
      </div>
    </div>
  );
}

function ModeCard({ to, icon, title, text, locked }: { to: string; icon: React.ReactNode; title: string; text: string; locked?: boolean }) {
  const inner = (
    <Card className={cx('flex items-center gap-4 p-4', locked ? 'opacity-70' : 'hover:bg-white/8')}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/8 text-accent-text">{locked ? <Lock className="size-5" aria-hidden /> : icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{text}</p>
      </div>
      {!locked && <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />}
    </Card>
  );
  return locked ? <div aria-disabled="true">{inner}</div> : <Link to={to} className="block">{inner}</Link>;
}
