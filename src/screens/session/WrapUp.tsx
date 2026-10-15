import { Link, useParams } from 'react-router';
import { Check } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { getEmotion } from '../../data/emotions';
import { Face } from '../../face/Face';
import { GRADE_LABEL } from '../../lib/srs';
import { dueWords, formatSeconds, streak } from '../../lib/stats';
import type { StepResult } from '../../store/model';
import { Card, LinkButton, PageHeader, SectionTitle } from '../../components/ui';

const KIND_LABEL: Record<StepResult['kind'], string> = { first: 'First try', due: 'Review', bonus: 'Bonus review', retry: 'Re-try' };

export function WrapUp() {
  const { sessionId } = useParams();
  const sessions = useApp((s) => s.sessions);
  const cards = useApp((s) => s.cards);
  const record = sessions.find((s) => s.id === sessionId);
  const now = new Date();

  if (!record) {
    return (
      <div>
        <PageHeader title="Session" back="/" />
        <p className="text-muted">This session could not be found.</p>
      </div>
    );
  }

  const ids = [...new Set(record.results.map((r) => r.id))];
  const days = streak(sessions, now);
  const upcoming = Object.entries(cards)
    .map(([id, c]) => ({ id, due: new Date(c.fsrs.due) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 3);

  return (
    <div className="pb-6">
      <div className="pt-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full btn-accent">
          <Check className="size-7" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white">Session {record.number} done</h1>
        <p className="mt-1 text-muted">
          {days > 1 ? `${days} days in a row.` : 'Nice work.'} You have learned {Object.keys(cards).length} of 87.
        </p>
      </div>

      {record.newIds.length > 0 && (
        <>
          <SectionTitle>Learned today</SectionTitle>
          <div className="space-y-2">
            {record.newIds.map((id) => {
              const e = getEmotion(id);
              if (!e) return null;
              return (
                <Link key={id} to={`/explore/${id}`} className="glass flex items-center gap-3 rounded-[20px] p-3">
                  <div className="w-14 shrink-0 rounded-xl bg-white/5 p-1" aria-hidden>
                    <Face params={e.face} label="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{e.name}</p>
                    <p className="text-sm text-muted">{e.keyCue}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <SectionTitle>Recall speed</SectionTitle>
      <Card className="divide-y divide-white/8">
        {record.results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{getEmotion(r.id)?.name}</p>
              <p className="text-xs text-muted">
                {KIND_LABEL[r.kind]} · {GRADE_LABEL[r.grade]}
              </p>
            </div>
            <p className="tabular font-semibold text-ink">{formatSeconds(r.recallMs)}</p>
          </div>
        ))}
        {record.results.length === 0 && <p className="px-4 py-3 text-sm text-muted">No cards in this session.</p>}
      </Card>
      <p className="mt-2 px-1 text-xs text-faint">Recall speed is the time from seeing the name to tapping "Face is set". Faster means more automatic.</p>

      <SectionTitle>Coming back</SectionTitle>
      <Card className="divide-y divide-white/8">
        {ids.map((id) => {
          const c = cards[id];
          if (!c) return null;
          return (
            <div key={id} className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="font-medium text-ink">{getEmotion(id)?.name}</p>
              <p className="text-sm text-muted">{dueWords(new Date(c.fsrs.due), now)}</p>
            </div>
          );
        })}
      </Card>
      {upcoming.length > 0 && (
        <p className="mt-2 px-1 text-sm text-muted">
          Next due: {upcoming.map((u) => `${getEmotion(u.id)?.name} ${dueWords(u.due, now)}`).join(', ')}.
        </p>
      )}

      <div className="mt-8 grid gap-3">
        <LinkButton to="/" variant="primary" size="lg" glow>
          Done
        </LinkButton>
        <LinkButton to="/progress">See progress</LinkButton>
      </div>
    </div>
  );
}
