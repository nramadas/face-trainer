import { useEffect, useRef } from 'react';
import { Toast } from '@base-ui/react/toast';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X } from 'lucide-react';

/** Shows "Update ready" with a Reload button when a new service worker is waiting. */
export function UpdateWatcher() {
  const toast = Toast.useToastManager();
  const shown = useRef(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: () => {} });

  useEffect(() => {
    if (!needRefresh || shown.current) return;
    shown.current = true;
    toast.add({
      title: 'Update ready',
      description: 'A new version of Stage Face is ready.',
      timeout: 0,
      priority: 'high',
      actionProps: { children: 'Reload', onClick: () => void updateServiceWorker(true) },
    });
  }, [needRefresh, toast, updateServiceWorker]);
  return null;
}

export function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-50 mx-auto flex w-[calc(100%-32px)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <Toast.Root key={t.id} toast={t} className="glass-strong rounded-[20px] bg-[#0f2a2e]/90 p-4 shadow-xl transition-all data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-3 data-[starting-style]:opacity-0">
            <Toast.Content className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Toast.Title className="font-semibold text-ink" />
                <Toast.Description className="mt-0.5 text-sm text-muted" />
              </div>
              {t.actionProps && <Toast.Action className="btn-accent h-9 shrink-0 rounded-full px-4 text-sm font-semibold" />}
              <Toast.Close aria-label="Dismiss" className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10">
                <X className="size-4" aria-hidden />
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
