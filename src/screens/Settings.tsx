import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import { Checkbox } from '@base-ui/react/checkbox';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Check, Download, Upload, Trash2, ChevronRight, ImageDown } from 'lucide-react';
import { useApp, currentData } from '../store/appStore';
import { parseImport, toExport, type AppData } from '../store/model';
import { ALL_IDS } from '../data/groups';
import { allPhotoUrls, PHOTO_CACHE } from '../lib/photos';
import { useSystemReducedMotion } from '../hooks/useReducedMotion';
import type { IntensityName } from '../face/params';
import { Button, Card, PageHeader, ProgressBar, SectionTitle, Toggle, cx } from '../components/ui';

function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="py-3">
      <p id={`seg-${label}`} className="mb-2 font-medium text-ink">
        {label}
      </p>
      <RadioGroup
        aria-labelledby={`seg-${label}`}
        value={String(value)}
        onValueChange={(v) => onChange((typeof value === 'number' ? Number(v) : v) as T)}
        className="flex gap-1.5"
      >
        {options.map((o) => (
          <Radio.Root key={String(o.value)} value={String(o.value)} className="glass flex h-11 min-w-0 flex-1 items-center justify-center rounded-full px-2 text-[15px] font-medium text-ink data-[checked]:btn-accent data-[checked]:border-accent/60">
            {o.label}
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="border-b border-white/8 px-4 last:border-b-0">{children}</div>;
}

export function SettingsScreen() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const systemReduce = useSystemReducedMotion();
  const faces = settings.faces;
  const faceCount = Number(faces.cartoon) + Number(faces.male) + Number(faces.female);

  return (
    <div>
      <PageHeader title="Settings" />

      <SectionTitle>Sessions</SectionTitle>
      <Card>
        <Row>
          <Segmented label="New emotions per session" value={settings.newPerSession} options={[1, 2, 3].map((n) => ({ value: n, label: String(n) }))} onChange={(v) => update({ newPerSession: v })} />
        </Row>
        <Row>
          <Segmented label="Most reviews per session" value={settings.maxReviews} options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} onChange={(v) => update({ maxReviews: v })} />
        </Row>
        <Row>
          <Segmented<IntensityName>
            label="Default intensity"
            value={settings.defaultIntensity}
            options={[
              { value: 'camera', label: 'Camera' },
              { value: 'clear', label: 'Clear' },
              { value: 'stage', label: 'Stage' },
            ]}
            onChange={(v) => update({ defaultIntensity: v })}
          />
        </Row>
        <Row>
          <div className="py-3">
            <p className="font-medium text-ink">Faces to show in training</p>
            <p className="mt-0.5 text-sm text-muted">Pick at least one.</p>
            <div className="mt-3 flex gap-2">
              {(['cartoon', 'male', 'female'] as const).map((k) => {
                const on = faces[k];
                const last = on && faceCount === 1;
                return (
                  <label key={k} className={cx('glass flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-medium text-ink', on && 'border-accent/50 bg-accent/12', last && 'cursor-not-allowed')}>
                    <Checkbox.Root
                      checked={on}
                      disabled={last}
                      onCheckedChange={(v) => update({ faces: { ...faces, [k]: v } })}
                      className="grid size-5 place-items-center rounded-md border-2 border-white/35 data-[checked]:border-accent data-[checked]:bg-accent-strong"
                    >
                      <Checkbox.Indicator>
                        <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    {k === 'cartoon' ? 'Cartoon' : k === 'male' ? 'Man' : 'Woman'}
                  </label>
                );
              })}
            </div>
          </div>
        </Row>
        <Row>
          <Toggle
            id="mirror-default"
            checked={settings.mirrorDefault}
            onChange={(v) => update({ mirrorDefault: v })}
            label="Show the mirror in sessions"
            description="Shows the mirror panel when a session starts. You still tap to turn the camera on. Nothing is recorded."
          />
        </Row>
        <Row>
          <Toggle
            id="reduce-motion"
            checked={settings.reduceMotion || systemReduce}
            onChange={(v) => update({ reduceMotion: v })}
            label="Reduce motion"
            description={systemReduce ? 'Your device asks for reduced motion, so this is always on.' : 'Faces jump straight to the end instead of animating.'}
          />
        </Row>
      </Card>

      <SectionTitle>Offline</SectionTitle>
      <PhotoDownload />

      <SectionTitle>Your progress</SectionTitle>
      <p className="-mt-1 mb-3 text-sm text-muted">Your progress lives only on this device. Export it to keep a copy or move it to another device.</p>
      <ExportImport />

      <SectionTitle>About</SectionTitle>
      <Link to="/about" className="block">
        <Card className="flex items-center gap-3 p-4 hover:bg-white/8">
          <span className="flex-1 font-medium text-ink">About Stage Face and credits</span>
          <ChevronRight className="size-5 text-muted" aria-hidden />
        </Card>
      </Link>
    </div>
  );
}

function PhotoDownload() {
  const urls = allPhotoUrls();
  const [done, setDone] = useState(0);
  const [cached, setCached] = useState<number | null>(null);
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error' | 'unsupported'>('idle');
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    if (!('caches' in window) || !urls.length) return;
    let live = true;
    void (async () => {
      try {
        const cache = await caches.open(PHOTO_CACHE);
        let n = 0;
        for (const u of urls) if (await cache.match(u)) n++;
        if (live) setCached(n);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async () => {
    if (!('caches' in window)) {
      setState('unsupported');
      return;
    }
    setState('running');
    setDone(0);
    let bad = 0;
    try {
      const cache = await caches.open(PHOTO_CACHE);
      let i = 0;
      for (const u of urls) {
        try {
          if (!(await cache.match(u))) {
            const res = await fetch(u);
            if (!res.ok) throw new Error(String(res.status));
            await cache.put(u, res);
          }
        } catch {
          bad++;
        }
        setDone(++i);
      }
      setFailed(bad);
      setCached(urls.length - bad);
      setState(bad ? 'error' : 'done');
    } catch {
      setState('error');
    }
  };

  if (!urls.length) {
    return (
      <Card className="p-4">
        <p className="font-medium text-ink">Download all faces for offline</p>
        <p className="mt-1 text-sm text-muted">No photos have been generated yet. The app uses the cartoon faces until they are.</p>
      </Card>
    );
  }
  return (
    <Card className="p-4">
      <p className="font-medium text-ink">Download all faces for offline</p>
      <p className="mt-1 text-sm text-muted">
        {urls.length} photos. {cached != null ? `${cached} already saved on this device.` : 'Photos you have already seen are saved automatically.'}
      </p>
      {state === 'running' && <ProgressBar value={done} max={urls.length} label={`Downloaded ${done} of ${urls.length} photos`} className="mt-3" />}
      <p className="mt-2 text-sm text-muted" role="status">
        {state === 'running' && `Downloading ${done} of ${urls.length}…`}
        {state === 'done' && 'All photos are saved for offline use.'}
        {state === 'error' && `${failed} photos could not be downloaded. Check your connection and try again.`}
        {state === 'unsupported' && 'This browser cannot save photos for offline use.'}
      </p>
      <Button className="mt-3 w-full" disabled={state === 'running'} icon={<ImageDown className="size-4" aria-hidden />} onClick={() => void run()}>
        {state === 'done' ? 'Check again' : 'Download all faces'}
      </Button>
    </Card>
  );
}

function ExportImport() {
  const replaceAll = useApp((s) => s.replaceAll);
  const resetProgress = useApp((s) => s.resetAll);
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppData | null>(null);
  const [message, setMessage] = useState<{ text: string; bad?: boolean } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const doExport = () => {
    const blob = new Blob([JSON.stringify(toExport(currentData()), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stage-face-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ text: 'Progress exported.' });
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const r = parseImport(text, ALL_IDS);
    if (file.current) file.current.value = '';
    if (!r.ok) {
      setMessage({ text: r.error, bad: true });
      return;
    }
    setMessage(null);
    setPending(r.data);
  };

  return (
    <>
      <Card className="space-y-2 p-4">
        <Button className="w-full" icon={<Download className="size-4" aria-hidden />} onClick={doExport}>
          Export progress
        </Button>
        <Button className="w-full" icon={<Upload className="size-4" aria-hidden />} onClick={() => file.current?.click()}>
          Import progress
        </Button>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" aria-hidden tabIndex={-1} onChange={(e) => void onFile(e.target.files?.[0])} />

        {pending && (
          <div className="rounded-[18px] border border-warn/40 bg-warn/10 p-4" role="alert">
            <p className="font-medium text-ink">Replace your progress on this device?</p>
            <p className="mt-1 text-sm text-muted">
              The file has {Object.keys(pending.cards).length} learned emotions and {pending.sessions.length} sessions. Your current progress will be replaced.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  replaceAll(pending);
                  setPending(null);
                  setMessage({ text: 'Progress imported.' });
                }}
              >
                Replace
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {message && (
          <p role="status" className={cx('pt-1 text-sm', message.bad ? 'text-danger' : 'text-muted')}>
            {message.text}
          </p>
        )}
      </Card>

      <Button variant="danger" className="mt-3 w-full" icon={<Trash2 className="size-4" aria-hidden />} onClick={() => setResetOpen(true)}>
        Reset progress
      </Button>
      <AlertDialog.Root open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <AlertDialog.Popup className="glass-strong fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[#0f2a2e]/95 p-6">
            <AlertDialog.Title className="text-lg font-semibold text-ink">Reset all progress?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">
              This deletes your learned emotions, schedule, recall times and session history on this device. Your settings stay. This cannot be undone, so export first if you
              want a copy.
            </AlertDialog.Description>
            <div className="mt-5 flex gap-2">
              <AlertDialog.Close render={<Button className="flex-1" />}>Cancel</AlertDialog.Close>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  resetProgress();
                  setResetOpen(false);
                  setMessage({ text: 'Progress reset.' });
                }}
              >
                Reset
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
