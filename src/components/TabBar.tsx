import { NavLink, useLocation } from 'react-router';
import { House, LayoutGrid, ScanFace, ChartNoAxesColumn, Settings } from 'lucide-react';
import { cx } from './ui';

const TABS = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/explore', label: 'Explore', Icon: LayoutGrid },
  { to: '/train', label: 'Train', Icon: ScanFace, center: true },
  { to: '/progress', label: 'Progress', Icon: ChartNoAxesColumn },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

/** Bottom tab bar. The middle Train button is raised and glows, except on Home where "Start session" is the one glowing element. */
export function TabBar() {
  const { pathname } = useLocation();
  const centerGlow = pathname !== '/';
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),10px)]">
        <ul className="relative flex items-end justify-between rounded-[28px] border border-white/10 bg-[#0b1a1c]/80 px-2 pt-2 pb-2 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {TABS.map(({ to, label, Icon, end, center }) => (
            <li key={to} className="flex flex-1 justify-center">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-medium transition-colors',
                    center ? '-mt-7' : 'min-w-14',
                    isActive ? 'text-white' : 'text-faint hover:text-ink',
                  )
                }
              >
                {({ isActive }) =>
                  center ? (
                    <>
                      <span
                        className={cx(
                          'grid size-[60px] place-items-center rounded-full border border-white/20 btn-accent',
                          centerGlow && 'glow',
                          isActive && 'ring-2 ring-accent-text/70 ring-offset-2 ring-offset-[#0b1a1c]',
                        )}
                      >
                        <Icon className="size-7" aria-hidden />
                      </span>
                      <span>{label}</span>
                    </>
                  ) : (
                    <>
                      <Icon className={cx('size-6', isActive && 'fill-white/15')} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                      <span>{label}</span>
                    </>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
