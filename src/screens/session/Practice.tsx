import { useState } from 'react';
import { useParams } from 'react-router';
import { getEmotion } from '../../data/emotions';
import { useMirror } from '../../hooks/useMirror';
import { useApp } from '../../store/appStore';
import { GRADE_LABEL } from '../../lib/srs';
import { formatSeconds } from '../../lib/stats';
import { Button, Card, LinkButton, PageHeader } from '../../components/ui';
import { NotFound } from '../NotFound';
import { LearnFlow } from './LearnFlow';
import type { ReviewResult } from './ReviewCard';
import { useDefaultIntensity, useTrainingKinds } from './useTrainingKinds';

/** Free practice of one emotion. Does not change the schedule. */
export function Practice() {
  const { id } = useParams();
  const e = getEmotion(id);
  const kinds = useTrainingKinds();
  const intensity = useDefaultIntensity();
  const mirrorDefault = useApp((s) => s.settings.mirrorDefault);
  const mirror = useMirror();
  const [stage, setStage] = useState(0);
  const [zone, setZone] = useState(0);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [run, setRun] = useState(0);
  if (!e) return <NotFound />;

  return (
    <div>
      <PageHeader title={`Practice: ${e.name}`} subtitle="Free practice" back={`/explore/${e.id}`} />
      {result ? (
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <p className="text-sm text-muted">Practice try</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatSeconds(result.recallMs)}</p>
            <p className="mt-1 text-muted">
              {GRADE_LABEL[result.grade]} · {result.zones.length} of 5 zones · key cue {result.keyCue ? 'hit' : 'missed'}
            </p>
            <p className="mt-3 text-sm text-faint">Practice only. Your schedule did not change.</p>
          </Card>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              setResult(null);
              setStage(4);
              setRun((r) => r + 1);
            }}
          >
            Try again from memory
          </Button>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setResult(null);
              setStage(0);
              setZone(0);
              setRun((r) => r + 1);
            }}
          >
            Start over
          </Button>
          <LinkButton to={`/explore/${e.id}`} variant="ghost" className="w-full">
            Back to {e.name}
          </LinkButton>
        </div>
      ) : (
        <LearnFlow
          key={run}
          emotion={e}
          stage={stage}
          zone={zone}
          onProgress={(s, z) => {
            setStage(s);
            setZone(z ?? 0);
            window.scrollTo(0, 0);
          }}
          onFirstTry={(r) => {
            setResult(r);
            mirror.stop();
          }}
          kinds={kinds}
          intensity={intensity}
          mirror={mirror}
          showMirror={mirrorDefault || mirror.status === 'on'}
          practice
        />
      )}
      {!mirrorDefault && !result && mirror.status === 'off' && stage > 0 && (
        <div className="mt-2 flex justify-center">
          <Button size="sm" variant="ghost" onClick={() => void mirror.start()}>
            Turn on mirror
          </Button>
        </div>
      )}
    </div>
  );
}
