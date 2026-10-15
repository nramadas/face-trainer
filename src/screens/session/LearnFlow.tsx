import { useState } from 'react';
import { RotateCcw, Quote, KeyRound } from 'lucide-react';
import type { Emotion } from '../../data/types';
import { CONTEXT_NOTE, ZONE_ORDER } from '../../data/types';
import { getEmotion, lookAlikeEntries } from '../../data/emotions';
import { groupInfo } from '../../data/groups';
import { FaceViewer, type FaceKind } from '../../components/FaceViewer';
import { Face } from '../../face/Face';
import { MirrorView } from '../../components/Mirror';
import type { MirrorControl } from '../../hooks/useMirror';
import { SideBySide } from '../Compare';
import { ReviewCard, type ReviewResult } from './ReviewCard';
import { Button, Card, CoachBubble, cx } from '../../components/ui';

export const LEARN_STAGES = ['Meet', 'Build', 'Contrast', 'Say', 'First try'] as const;

interface Props {
  emotion: Emotion;
  stage: number;
  zone: number;
  onProgress: (stage: number, zone?: number) => void;
  onFirstTry: (r: ReviewResult) => void;
  kinds: FaceKind[];
  intensity: number;
  mirror?: MirrorControl;
  showMirror?: boolean;
  practice?: boolean;
}

export function StageIndicator({ stage }: { stage: number }) {
  return (
    <nav aria-label="Learning steps" className="mb-4">
      <ol className="flex gap-1.5">
        {LEARN_STAGES.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === stage ? 'step' : undefined}>
            <span className={cx('block h-1.5 rounded-full', i < stage ? 'bg-accent' : i === stage ? 'bg-accent-text' : 'bg-white/12')} />
            <span className={cx('mt-1.5 block text-center text-[11px]', i === stage ? 'font-semibold text-ink' : 'text-faint')}>{s}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Reference face, with the mirror beside it when the mirror is on. */
function ReferenceWithMirror({ children, mirror, showMirror }: { children: React.ReactNode; mirror?: MirrorControl; showMirror?: boolean }) {
  const on = showMirror && mirror?.status === 'on';
  return (
    <div className={cx(on && 'grid grid-cols-2 items-start gap-3')}>
      <div>{children}</div>
      {showMirror && mirror && <MirrorView mirror={mirror} compact className={on ? '' : 'mt-3'} />}
    </div>
  );
}

export function LearnFlow({ emotion: e, stage, zone, onProgress, onFirstTry, kinds, intensity, mirror, showMirror, practice }: Props) {
  const [replay, setReplay] = useState(0);
  const [kind, setKind] = useState<FaceKind>(kinds[0]);
  const [drill, setDrill] = useState(-1);
  const look = lookAlikeEntries(e.id)[0];
  const other = getEmotion(look?.id);

  const replayBtn = (
    <Button size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setReplay((r) => r + 1)}>
      Replay from neutral
    </Button>
  );

  return (
    <div className="pb-4">
      <StageIndicator stage={stage} />

      {stage === 0 && (
        <div className="space-y-3">
          <Card className="p-3">
            <FaceViewer emotion={e} kinds={kinds} value={kind} onValueChange={setKind} intensity={intensity} replayKey={replay} animateOnMount size="sm" />
            {kind === 'cartoon' && <div className="mt-3 flex justify-center">{replayBtn}</div>}
          </Card>
          <CoachBubble>
            This is <strong className="font-semibold">{e.name}</strong>. It is one of the places we go {groupInfo(e.group).label.replace('Places we go ', '')}.
          </CoachBubble>
          <CoachBubble avatar={false}>{e.definition}</CoachBubble>
          <CoachBubble avatar={false}>
            The moment to play: <em>{e.oneLiner}</em>
          </CoachBubble>
          {e.tier === 'context' && (
            <CoachBubble avatar={false}>
              {CONTEXT_NOTE} {e.playableNote}
            </CoachBubble>
          )}
          <Button variant="primary" size="lg" className="mt-3 w-full" onClick={() => onProgress(1, 0)}>
            Next: build it
          </Button>
        </div>
      )}

      {stage === 1 && (
        <div className="space-y-3">
          <ReferenceWithMirror mirror={mirror} showMirror={showMirror}>
            <Card className="p-2">
              <Face params={e.face} intensity={intensity} replayKey={replay} highlight={ZONE_ORDER[zone].highlight} label={`Cartoon face showing ${e.name}, ${ZONE_ORDER[zone].label.toLowerCase()} highlighted`} />
            </Card>
          </ReferenceWithMirror>
          <div className="flex justify-center">{replayBtn}</div>
          <p className="text-center text-sm text-muted" aria-live="polite">
            Step {zone + 1} of 5: <span className="font-semibold text-ink">{ZONE_ORDER[zone].label}</span>
          </p>
          <CoachBubble key={zone}>{e.zones[ZONE_ORDER[zone].key]}</CoachBubble>
          {zone === 0 && (
            <Card className="flex gap-3 border-accent/40 p-3.5">
              <KeyRound className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden />
              <p className="text-sm text-ink">
                <span className="font-medium text-accent-text">Key cue: </span>
                {e.keyCue}
              </p>
            </Card>
          )}
          <div className="flex gap-2 pt-2">
            {zone > 0 && (
              <Button size="lg" onClick={() => onProgress(1, zone - 1)}>
                Back
              </Button>
            )}
            <Button variant="primary" size="lg" className="flex-1" onClick={() => (zone < 4 ? onProgress(1, zone + 1) : onProgress(2, 0))}>
              Got it
            </Button>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-3">
          {other && look ? (
            <>
              <Card className="p-3">
                <SideBySide A={e} B={other} intensity={intensity} replayKey={replay} />
                <div className="mt-3 flex justify-center">{replayBtn}</div>
              </Card>
              <CoachBubble>
                {e.name} is easy to mix up with <strong className="font-semibold">{other.name}</strong>. {look.difference}
              </CoachBubble>
              {drill < 0 ? (
                <>
                  <CoachBubble avatar={false}>Now switch between them, three times. Make each face fully before you move on.</CoachBubble>
                  <Button variant="primary" size="lg" className="mt-3 w-full" onClick={() => setDrill(0)}>
                    Start the switch
                  </Button>
                </>
              ) : drill < 3 ? (
                <Card className="p-6 text-center" aria-live="polite">
                  <p className="text-sm text-muted">{drill === 0 ? 'Make' : 'Now'}</p>
                  <p className="mt-1 text-4xl font-bold text-white">{drill === 1 ? other.name : e.name}</p>
                  <p className="mt-2 text-sm text-muted">{drill === 1 ? other.keyCue : e.keyCue}</p>
                  <p className="mt-3 text-xs text-faint">Switch {drill + 1} of 3</p>
                  <Button variant="primary" size="lg" className="mt-5 w-full" onClick={() => setDrill(drill + 1)}>
                    {drill < 2 ? 'Done, next' : 'Done'}
                  </Button>
                </Card>
              ) : (
                <Button variant="primary" size="lg" className="mt-3 w-full" onClick={() => onProgress(3)}>
                  Next: say it
                </Button>
              )}
            </>
          ) : (
            <Button variant="primary" size="lg" className="w-full" onClick={() => onProgress(3)}>
              Next: say it
            </Button>
          )}
        </div>
      )}

      {stage === 3 && (
        <div className="space-y-3">
          <ReferenceWithMirror mirror={mirror} showMirror={showMirror}>
            <Card className="mx-auto max-w-[200px] p-2">
              <Face params={e.face} intensity={intensity} label={`Cartoon face showing ${e.name}`} />
            </Card>
          </ReferenceWithMirror>
          <CoachBubble>Make the face. Then say this line out loud while you hold it. Keep the face on through the last word.</CoachBubble>
          <Card className="flex gap-3 p-5">
            <Quote className="size-5 shrink-0 text-accent-text" aria-hidden />
            <p className="text-xl leading-snug text-ink">{e.line}</p>
          </Card>
          <Button variant="primary" size="lg" className="mt-3 w-full" onClick={() => onProgress(4)}>
            I said it
          </Button>
        </div>
      )}

      {stage === 4 && (
        <ReviewCard
            frontNote={<CoachBubble>Now from memory. The reference is hidden. Make the face as fast as you can, then tap the button.</CoachBubble>}
            emotion={e}
            badge={practice ? 'Practice try' : 'First try'}
            kinds={kinds}
            intensity={intensity}
            mirror={mirror}
            showMirror={showMirror}
            submitLabel={practice ? 'Finish practice' : 'Save and continue'}
            onSubmit={onFirstTry}
          />
      )}
    </div>
  );
}
