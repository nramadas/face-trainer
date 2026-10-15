import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Check, X } from 'lucide-react';
import { EMOTIONS, differenceBetween, getEmotion, lookAlikeIds } from '../data/emotions';
import type { Emotion } from '../data/types';
import { Face } from '../face/Face';
import { PhotoOrCartoon } from '../components/FaceViewer';
import { photoUrl } from '../lib/photos';
import { useApp } from '../store/appStore';
import { Button, Card, PageHeader, Toggle, cx } from '../components/ui';
import { useTrainingKinds } from './session/useTrainingKinds';

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Four options: the answer, its look-alikes, then same-group emotions, then any. */
export function buildOptions(answer: Emotion, pool: Emotion[]): Emotion[] {
  const picked = new Set<string>([answer.id]);
  const out: Emotion[] = [answer];
  const add = (e: Emotion | undefined) => {
    if (e && !picked.has(e.id) && out.length < 4) {
      picked.add(e.id);
      out.push(e);
    }
  };
  for (const id of shuffle(lookAlikeIds(answer.id))) add(getEmotion(id));
  for (const e of shuffle(EMOTIONS.filter((x) => x.group === answer.group && x.tier !== 'context'))) add(e);
  for (const e of shuffle(pool)) add(e);
  return shuffle(out);
}

interface Round {
  answer: Emotion;
  options: Emotion[];
  kind: 'cartoon' | 'male' | 'female';
}

export function SpotIt() {
  const cards = useApp((s) => s.cards);
  const kinds = useTrainingKinds();
  const [onlyLearned, setOnlyLearned] = useState(false);
  const learnedCount = Object.keys(cards).length;
  const pool = useMemo(
    () => EMOTIONS.filter((e) => e.tier !== 'context' && (!onlyLearned || cards[e.id])),
    [onlyLearned, cards],
  );
  const makeRound = (): Round | null => {
    if (pool.length < 2) return null;
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const photoKinds = kinds.filter((k) => k !== 'cartoon' && photoUrl(answer.id, k));
    const usable = [...(kinds.includes('cartoon') ? ['cartoon' as const] : []), ...photoKinds];
    const kind = usable.length ? usable[Math.floor(Math.random() * usable.length)] : 'cartoon';
    return { answer, options: buildOptions(answer, pool), kind };
  };
  const [round, setRound] = useState<Round | null>(makeRound);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const next = () => {
    setChoice(null);
    setRound(makeRound());
  };

  return (
    <div>
      <PageHeader title="Spot it" subtitle={`${score.right} of ${score.total} right`} back="/train" />
      {!round ? (
        <Card className="p-5 text-muted">Learn a few more emotions first, or turn off "Only emotions I have learned".</Card>
      ) : (
        <>
          <Card className="mx-auto max-w-[260px] p-2">
            {round.kind === 'cartoon' ? (
              <Face key={round.answer.id} params={round.answer.face} label="A face showing an emotion. Which one?" />
            ) : (
              <PhotoOrCartoon emotion={round.answer} persona={round.kind} />
            )}
          </Card>
          <p className="mt-4 text-center text-lg font-semibold text-ink">Which emotion is this?</p>
          <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Options">
            {round.options.map((o) => {
              const isAnswer = o.id === round.answer.id;
              const picked = choice === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={!!choice}
                  onClick={() => {
                    setChoice(o.id);
                    setScore((s) => ({ right: s.right + (isAnswer ? 1 : 0), total: s.total + 1 }));
                  }}
                  className={cx(
                    'glass flex h-14 items-center justify-center gap-2 rounded-full px-3 font-medium text-ink transition-colors',
                    choice && isAnswer && 'border-status-solid/70 bg-status-solid/15',
                    picked && !isAnswer && 'border-danger/70 bg-danger/15',
                  )}
                >
                  {choice && isAnswer && <Check className="size-4 text-status-solid" aria-hidden />}
                  {picked && !isAnswer && <X className="size-4 text-danger" aria-hidden />}
                  {o.name}
                </button>
              );
            })}
          </div>
          {choice && (
            <Card className="mt-4 p-4" aria-live="polite">
              {choice === round.answer.id ? (
                <p className="text-ink">
                  Right. <span className="font-semibold">{round.answer.name}</span>: {round.answer.keyCue}
                </p>
              ) : (
                <>
                  <p className="text-ink">
                    This was <span className="font-semibold">{round.answer.name}</span>. {round.answer.keyCue}
                  </p>
                  {differenceBetween(round.answer.id, choice) && <p className="mt-2 text-sm text-muted">{differenceBetween(round.answer.id, choice)}</p>}
                  <Link to={`/compare/${round.answer.id}/${choice}`} className="mt-2 inline-block text-sm font-medium text-accent-text">
                    Compare {round.answer.name} and {getEmotion(choice)?.name}
                  </Link>
                </>
              )}
              <Button variant="primary" className="mt-4 w-full" onClick={next}>
                Next face
              </Button>
            </Card>
          )}
        </>
      )}
      {learnedCount >= 4 && (
        <Card className="mt-6 px-4">
          <Toggle
            id="only-learned"
            checked={onlyLearned}
            onChange={(v) => {
              setOnlyLearned(v);
              setChoice(null);
              setTimeout(() => setRound(makeRound()), 0);
            }}
            label="Only emotions I have learned"
          />
        </Card>
      )}
      <p className="mt-4 px-1 text-xs text-faint">Context emotions are left out here, since they have no face of their own.</p>
    </div>
  );
}
