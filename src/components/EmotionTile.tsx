import { Link } from 'react-router';
import type { Emotion } from '../data/types';
import { Face } from '../face/Face';
import { useApp } from '../store/appStore';
import { statusOf, STATUS_LABEL } from '../lib/stats';
import { StatusDot, TierBadge } from './ui';

export function EmotionTile({ e }: { e: Emotion }) {
  const status = useApp((s) => statusOf(s.cards[e.id]));
  return (
    <Link
      to={`/explore/${e.id}`}
      className="glass group flex flex-col rounded-[22px] p-2.5 transition-colors hover:bg-white/9"
      aria-label={`${e.name}. ${STATUS_LABEL[status]}.`}
    >
      <div className="rounded-[16px] bg-white/[0.04] px-2 pt-2">
        <Face params={e.face} label={`Cartoon face showing ${e.name}`} />
      </div>
      <div className="mt-2.5 flex items-center gap-2 px-1">
        <span className="min-w-0 flex-1 truncate font-semibold text-ink">{e.name}</span>
        <StatusDot status={status} />
      </div>
      <div className="mt-1.5 px-1 pb-1">
        <TierBadge tier={e.tier} />
      </div>
    </Link>
  );
}
