import { useEffect, useState } from 'react';
import { HashRouter, Outlet, Route, Routes, useLocation } from 'react-router';
import { Toast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import { TabBar } from './components/TabBar';
import { ToastList, UpdateWatcher } from './components/UpdateToast';
import { useApp } from './store/appStore';
import { Home } from './screens/Home';
import { Explore } from './screens/Explore';
import { EmotionDetail } from './screens/EmotionDetail';
import { Compare } from './screens/Compare';
import { TrainHub } from './screens/TrainHub';
import { SessionScreen } from './screens/session/SessionScreen';
import { WrapUp } from './screens/session/WrapUp';
import { Practice } from './screens/session/Practice';
import { SwitchDrill } from './screens/SwitchDrill';
import { SpotIt } from './screens/SpotIt';
import { ProgressScreen } from './screens/Progress';
import { SettingsScreen } from './screens/Settings';
import { About } from './screens/About';
import { NotFound } from './screens/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StorageWarning() {
  const ok = useApp((s) => s.storageOk);
  const [hidden, setHidden] = useState(false);
  if (ok || hidden) return null;
  return (
    <div role="status" className="glass mt-3 flex items-start gap-3 rounded-[18px] px-4 py-3 text-sm text-muted">
      <p className="flex-1">Progress can't be saved on this device right now. It will last until you close this page.</p>
      <button type="button" aria-label="Dismiss" onClick={() => setHidden(true)} className="grid size-7 place-items-center rounded-full hover:bg-white/10">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function TabLayout() {
  return (
    <>
      <main className="mx-auto min-h-dvh max-w-md px-4 pt-safe pb-[calc(112px+env(safe-area-inset-bottom))]">
        <StorageWarning />
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}

/** Full-screen layout for training flows: no tab bar, fewer distractions. */
function FocusLayout() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pt-safe pb-[calc(24px+env(safe-area-inset-bottom))]">
      <StorageWarning />
      <Outlet />
    </main>
  );
}

function ReduceMotionSync() {
  const reduce = useApp((s) => s.settings.reduceMotion);
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduce);
  }, [reduce]);
  return null;
}

export function App() {
  return (
    <Toast.Provider limit={2}>
      <div className="app-bg" aria-hidden />
      <ReduceMotionSync />
      <UpdateWatcher />
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<TabLayout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="explore/:id" element={<EmotionDetail />} />
            <Route path="compare/:a/:b" element={<Compare />} />
            <Route path="train" element={<TrainHub />} />
            <Route path="progress" element={<ProgressScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<FocusLayout />}>
            <Route path="train/session" element={<SessionScreen />} />
            <Route path="train/done/:sessionId" element={<WrapUp />} />
            <Route path="train/practice/:id" element={<Practice />} />
            <Route path="train/switch" element={<SwitchDrill />} />
            <Route path="train/spot" element={<SpotIt />} />
          </Route>
        </Routes>
      </HashRouter>
      <ToastList />
    </Toast.Provider>
  );
}
