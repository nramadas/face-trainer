import { useEffect, useRef } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import type { MirrorControl } from '../hooks/useMirror';
import { Button, cx } from './ui';

const MESSAGES: Partial<Record<MirrorControl['status'], string>> = {
  denied: 'Camera permission was not given, so the mirror is off. You can keep training without it.',
  unavailable: 'No camera was found on this device, so the mirror is off. You can keep training without it.',
};

/** Flipped live camera view. Never records. */
export function MirrorView({ mirror, className, compact }: { mirror: MirrorControl; className?: string; compact?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (video.current) video.current.srcObject = mirror.stream;
  }, [mirror.stream]);

  if (mirror.status === 'on' && mirror.stream) {
    return (
      <div className={cx('relative overflow-hidden rounded-[20px] border border-white/10 bg-black', className)}>
        <video ref={video} autoPlay playsInline muted aria-label="Your camera, shown as a mirror" className="aspect-[4/5] w-full scale-x-[-1] object-cover" />
        <button
          type="button"
          onClick={mirror.stop}
          className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
        >
          <CameraOff className="size-3.5" aria-hidden /> Turn off
        </button>
      </div>
    );
  }
  const msg = MESSAGES[mirror.status];
  return (
    <div className={cx('flex flex-col items-center justify-center gap-2 text-center', className)}>
      {msg ? (
        <p className="text-sm text-muted">{msg}</p>
      ) : (
        <Button size={compact ? 'sm' : 'md'} onClick={() => void mirror.start()} disabled={mirror.status === 'starting'} icon={<Camera className="size-4" aria-hidden />}>
          {mirror.status === 'starting' ? 'Starting camera…' : 'Turn on mirror'}
        </Button>
      )}
      {!msg && !compact && <p className="text-xs text-faint">The camera only shows you to yourself. Nothing is recorded.</p>}
    </div>
  );
}
