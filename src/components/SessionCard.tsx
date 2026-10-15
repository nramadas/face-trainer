import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Play, RotateCw } from 'lucide-react';
import { useApp } from '../store/appStore';
import { getEmotion } from '../data/emotions';
import { groupInfo } from '../data/groups';
import { Face } from '../face/Face';
import { Button, Card } from './ui';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Today's session" card with the Start / Continue button. */
export function SessionCard({ glow = true }: { glow?: boolean }) {
  const navigate = useNavigate();
  const cards = useApp((s) => s.cards);
  const queue = useApp((s) => s.queue);
  const sessions = useApp((s) => s.sessions);
  const settings = useApp((s) => s.settings);
  const active = useApp((s) => s.active);
  const previewSession = useApp((s) => s.previewSession);
  const startSession = useApp((s) => s.startSession);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo(() => previewSession(), [cards, queue, sessions, settings, previewSession]);
  const next = getEmotion(active ? undefined : plan.newIds[0]);
  const work = plan.newIds.length + plan.reviewIds.length;

  if (active) {
    const total = active.steps.filter((s) => s.kind !== 'warmup').length;
    const done = active.steps.slice(0, active.index).filter((s) => s.kind !== 'warmup').length;
    const current = active.steps[active.index];
    const currentEmotion = current && current.kind !== 'warmup' ? getEmotion(current.id) : undefined;
    return (
      <Card className="p-5">
        <p className="text-sm font-medium text-accent-text">Session {active.number} in progress</p>
        <p className="mt-1 text-xl font-semibold text-ink">
          {done} of {total} cards done
        </p>
        {currentEmotion && <p className="mt-1 text-sm text-muted">Up now: {current.kind === 'learn' ? `learning ${currentEmotion.name}` : `reviewing ${currentEmotion.name}`}</p>}
        <Button variant="primary" size="lg" glow={glow} className="mt-5 w-full" icon={<RotateCw className="size-5" aria-hidden />} onClick={() => navigate('/train/session')}>
          Continue session
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-accent-text">Session {plan.number}</p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {plural(plan.newIds.length, 'new emotion', 'new emotions')} · {plural(plan.reviewIds.length, 'review', 'reviews')}
          </p>
          {next ? (
            <p className="mt-2 text-sm text-muted">
              Next new emotion: <span className="font-semibold text-ink">{next.name}</span>
              <br />
              <span className="text-faint">{groupInfo(next.group).label}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">You have met all 87 emotions. Sessions now bring back reviews.</p>
          )}
          {plan.bonus && <p className="mt-2 text-sm text-muted">Nothing is due, so you get one bonus review of the emotion you are most likely to forget.</p>}
        </div>
        {next && (
          <div className="w-20 shrink-0 rounded-2xl bg-white/5 p-1.5" aria-hidden>
            <Face params={next.face} label="" />
          </div>
        )}
      </div>
      <Button
        variant="primary"
        size="lg"
        glow={glow}
        className="mt-5 w-full"
        disabled={work === 0}
        icon={<Play className="size-5 fill-white" aria-hidden />}
        onClick={() => {
          startSession();
          navigate('/train/session');
        }}
      >
        Start session
      </Button>
    </Card>
  );
}
