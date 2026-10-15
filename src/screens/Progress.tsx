import { useMemo } from 'react';
import { Link } from 'react-router';
import { useApp } from '../store/appStore';
import { EMOTIONS, getEmotion } from '../data/emotions';
import { GROUPS } from '../data/groups';
import { againCount, formatDate, formatSeconds, recallMedian, recallSeries, statusOf, STATUS_HELP, STATUS_LABEL, type Status } from '../lib/stats';
import { Sparkline } from '../components/Sparkline';
import { Card, Empty, PageHeader, ProgressBar, SectionTitle, STATUS_COLOR, cx } from '../components/ui';

const STATUSES: Status[] = ['new', 'learning', 'learned', 'solid'];
const TILE: Record<Status, string> = {
  new: 'border-white/8 bg-white/[0.03] text-muted',
  learning: 'border-status-learning/45 bg-status-learning/12 text-ink',
  learned: 'border-status-learned/50 bg-status-learned/14 text-ink',
  solid: 'border-status-solid/55 bg-status-solid/15 text-ink',
};

export function ProgressScreen() {
  const cards = useApp((s) => s.cards);
  const sessions = useApp((s) => s.sessions);
  const learnedIds = useMemo(() => Object.keys(cards).sort((a, b) => cards[a].introducedAt.localeCompare(cards[b].introducedAt)), [cards]);
  const counts = useMemo(() => {
    const c: Record<Status, number> = { new: 0, learning: 0, learned: 0, solid: 0 };
    for (const e of EMOTIONS) c[statusOf(cards[e.id])]++;
    return c;
  }, [cards]);
  const hardest = useMemo(
    () =>
      learnedIds
        .map((id) => ({ id, again: againCount(cards[id]), stability: cards[id].fsrs.stability }))
        .filter((x) => x.again > 0 || x.stability < 3)
        .sort((a, b) => b.again - a.again || a.stability - b.stability)
        .slice(0, 5),
    [learnedIds, cards],
  );

  return (
    <div>
      <PageHeader title="Progress" />
      <Card className="p-5">
        <p className="text-sm text-muted">Learned</p>
        <p className="tabular mt-1 text-4xl font-bold text-white">
          {learnedIds.length} <span className="text-xl font-medium text-muted">of 87</span>
        </p>
        <ProgressBar value={learnedIds.length} max={87} label={`${learnedIds.length} of 87 learned`} className="mt-4" />
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {STATUSES.map((s) => (
            <li key={s} className="flex items-center gap-2 text-sm">
              <span className={cx('size-2.5 shrink-0 rounded-full', STATUS_COLOR[s])} aria-hidden />
              <span className="text-ink">{STATUS_LABEL[s]}</span>
              <span className="tabular ml-auto text-muted">{counts[s]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-faint">
          {STATUS_LABEL.learning}: {STATUS_HELP.learning} {STATUS_LABEL.solid}: {STATUS_HELP.solid}
        </p>
      </Card>

      <SectionTitle>All 87</SectionTitle>
      {GROUPS.map((g) => (
        <section key={g.id} className="mb-4" aria-labelledby={`pg-${g.id}`}>
          <h3 id={`pg-${g.id}`} className="mb-2 text-xs font-medium text-muted">
            {g.label}
          </h3>
          <ul className="grid grid-cols-3 gap-1.5">
            {EMOTIONS.filter((e) => e.group === g.id).map((e) => {
              const st = statusOf(cards[e.id]);
              return (
                <li key={e.id}>
                  <Link
                    to={`/explore/${e.id}`}
                    aria-label={`${e.name}: ${STATUS_LABEL[st]}`}
                    className={cx('flex h-11 items-center justify-center rounded-xl border px-1.5 text-center text-[12px] leading-tight font-medium', TILE[st])}
                  >
                    {e.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <SectionTitle>Recall speed</SectionTitle>
      <p className="-mt-1 mb-3 text-sm text-muted">Median time from seeing the name to tapping "Face is set", over your last 5 tries. Lower is faster.</p>
      {learnedIds.length === 0 ? (
        <Empty title="No recall times yet">Finish your first session to see them here.</Empty>
      ) : (
        <Card className="divide-y divide-white/8">
          {learnedIds.map((id) => {
            const rec = cards[id];
            const med = recallMedian(rec);
            const series = recallSeries(rec);
            return (
              <Link key={id} to={`/explore/${id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{getEmotion(id)?.name}</span>
                <Sparkline values={series} label={`Recall times for ${getEmotion(id)?.name}: ${series.map((v) => formatSeconds(v)).join(', ')}`} />
                <span className="tabular w-16 text-right font-semibold text-ink">{formatSeconds(med)}</span>
              </Link>
            );
          })}
        </Card>
      )}

      <SectionTitle>Hardest for you</SectionTitle>
      {hardest.length === 0 ? (
        <Empty title="Nothing stands out yet">Emotions you often rate "Again" will show up here.</Empty>
      ) : (
        <Card className="divide-y divide-white/8">
          {hardest.map((h) => (
            <Link key={h.id} to={`/explore/${h.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5">
              <span className="font-medium text-ink">{getEmotion(h.id)?.name}</span>
              <span className="text-sm text-muted">
                {h.again} × Again · holds {h.stability < 1 ? 'under a day' : `about ${Math.round(h.stability)} days`}
              </span>
            </Link>
          ))}
        </Card>
      )}

      <SectionTitle>Session history</SectionTitle>
      {sessions.length === 0 ? (
        <Empty title="No sessions yet">Start one from Home or Train.</Empty>
      ) : (
        <Card className="divide-y divide-white/8">
          {[...sessions].reverse().slice(0, 60).map((s) => (
            <Link key={s.id} to={`/train/done/${s.id}`} className="block px-4 py-3 hover:bg-white/5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-ink">Session {s.number}</span>
                <span className="text-sm text-muted">{formatDate(s.finishedAt)}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {s.newIds.length ? `New: ${s.newIds.map((id) => getEmotion(id)?.name).join(', ')}` : 'No new emotion'}
                {s.reviewIds.length ? ` · Reviewed: ${s.reviewIds.map((id) => getEmotion(id)?.name).join(', ')}` : ''}
              </p>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
