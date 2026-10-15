import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Camera, CameraOff } from 'lucide-react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useApp } from '../../store/appStore';
import { getEmotion } from '../../data/emotions';
import { useMirror } from '../../hooks/useMirror';
import { SessionCard } from '../../components/SessionCard';
import { Button, IconButton, PageHeader, cx } from '../../components/ui';
import { WarmUp } from './WarmUp';
import { LearnFlow } from './LearnFlow';
import { ReviewCard } from './ReviewCard';
import { useDefaultIntensity, useTrainingKinds } from './useTrainingKinds';

const REVIEW_BADGE = { due: 'Review', bonus: 'Bonus review', retry: 'Re-try' } as const;

export function SessionScreen() {
  const navigate = useNavigate();
  const active = useApp((s) => s.active);
  const mirrorDefault = useApp((s) => s.settings.mirrorDefault);
  const completeWarmup = useApp((s) => s.completeWarmup);
  const recordResult = useApp((s) => s.recordResult);
  const setLearnProgress = useApp((s) => s.setLearnProgress);
  const quitSession = useApp((s) => s.quitSession);
  const kinds = useTrainingKinds();
  const intensity = useDefaultIntensity();
  const mirror = useMirror();
  const [showMirror, setShowMirror] = useState(mirrorDefault);
  const [leaving, setLeaving] = useState(false);
  const doneId = useRef<string | null>(null);

  if (!active) {
    if (doneId.current) return null;
    return (
      <div>
        <PageHeader title="Session" back="/train" />
        <p className="mb-4 text-muted">There is no session in progress.</p>
        <SessionCard />
      </div>
    );
  }

  const finish = (id: string | null) => {
    window.scrollTo(0, 0);
    if (!id) return;
    doneId.current = id;
    mirror.stop();
    navigate(`/train/done/${id}`, { replace: true });
  };

  const step = active.steps[active.index];
  const cardSteps = active.steps.filter((s) => s.kind !== 'warmup');
  const cardIndex = active.steps.slice(0, active.index).filter((s) => s.kind !== 'warmup').length;
  const emotion = step && step.kind !== 'warmup' ? getEmotion(step.id) : undefined;

  return (
    <div>
      <header className="flex items-center gap-3 pt-4 pb-4">
        <IconButton label="Leave session" onClick={() => setLeaving(true)}>
          <X className="size-5" aria-hidden />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="text-center text-sm font-medium text-ink">
            Session {active.number}
            {step?.kind !== 'warmup' && cardSteps.length > 0 && (
              <span className="text-muted">
                {' '}
                · Card {cardIndex + 1} of {cardSteps.length}
              </span>
            )}
          </p>
          <div className="mt-2 flex gap-1" aria-hidden>
            {cardSteps.map((_, i) => (
              <span key={i} className={cx('h-1 flex-1 rounded-full', i < cardIndex ? 'bg-accent' : i === cardIndex && step?.kind !== 'warmup' ? 'bg-accent-text' : 'bg-white/12')} />
            ))}
          </div>
        </div>
        <IconButton
          label={showMirror ? 'Hide mirror' : 'Show mirror'}
          aria-pressed={showMirror}
          className={cx(showMirror && 'bg-white/12')}
          onClick={() => {
            if (showMirror) mirror.stop();
            setShowMirror(!showMirror);
          }}
        >
          {showMirror ? <CameraOff className="size-5" aria-hidden /> : <Camera className="size-5" aria-hidden />}
        </IconButton>
      </header>

      {step?.kind === 'warmup' && <WarmUp onDone={() => finish(completeWarmup())} />}

      {step?.kind === 'learn' && emotion && (
        <LearnFlow
          key={`${active.index}-${emotion.id}`}
          emotion={emotion}
          stage={active.learnStage}
          zone={active.buildZone}
          onProgress={(st, z) => {
            setLearnProgress(st, z ?? 0);
            window.scrollTo(0, 0);
          }}
          onFirstTry={(r) => finish(recordResult(r))}
          kinds={kinds}
          intensity={intensity}
          mirror={mirror}
          showMirror={showMirror}
        />
      )}

      {step?.kind === 'review' && emotion && (
        <ReviewCard
          key={`${active.index}-${emotion.id}`}
          emotion={emotion}
          badge={REVIEW_BADGE[step.reason]}
          kinds={kinds}
          intensity={intensity}
          mirror={mirror}
          showMirror={showMirror}
          onSubmit={(r) => finish(recordResult(r))}
        />
      )}

      <AlertDialog.Root open={leaving} onOpenChange={setLeaving}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <AlertDialog.Popup className="glass-strong fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[#0f2a2e]/95 p-6">
            <AlertDialog.Title className="text-lg font-semibold text-ink">Leave the session?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">
              You can continue it later from Home. Ratings you already gave are saved.
            </AlertDialog.Description>
            <div className="mt-5 space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  mirror.stop();
                  navigate('/');
                }}
              >
                Continue later
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  mirror.stop();
                  quitSession();
                  navigate('/train');
                }}
              >
                End session now
              </Button>
              <AlertDialog.Close render={<Button variant="ghost" className="w-full" />}>Keep training</AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
