import { Link } from 'react-router';
import { Flame, CheckCheck, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../store/appStore';
import { finishedCount } from '../store/appStore';
import { streak } from '../lib/stats';
import { SessionCard } from '../components/SessionCard';
import { Card, SectionTitle } from '../components/ui';

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Home() {
  const sessions = useApp((s) => s.sessions);
  const learned = useApp((s) => Object.keys(s.cards).length);
  const days = streak(sessions, new Date());
  const total = finishedCount(sessions);

  return (
    <div className="pt-6">
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute -top-10 -right-16 size-64 rounded-full bg-accent/10 blur-3xl" />
        <p className="text-base text-muted">{greeting()}</p>
        <h1 className="mt-2 text-[40px] leading-[1.08] font-bold tracking-tight text-white">
          Ready to <em className="font-bold italic">train</em> your face?
        </h1>
      </section>

      <div className="mt-7">
        <SessionCard />
      </div>

      {total === 0 && (
        <p className="mt-4 px-1 text-sm leading-relaxed text-muted">
          Each session teaches one new emotion. From your third session on, it also brings back one or two you have already learned. This is called
          spaced repetition: each emotion comes back just before you are likely to forget it, so recall gets faster over time.
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon={<Flame className="size-4" aria-hidden />} value={days} label={days === 1 ? 'day streak' : 'day streak'} />
        <Stat icon={<CheckCheck className="size-4" aria-hidden />} value={total} label={total === 1 ? 'session' : 'sessions'} />
        <Stat icon={<BookOpen className="size-4" aria-hidden />} value={`${learned}`} label="of 87 learned" />
      </div>

      <SectionTitle>Library</SectionTitle>
      <Link to="/explore" className="block">
        <Card className="flex items-center gap-4 p-4 hover:bg-white/8">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Explore all 87 emotions</p>
            <p className="mt-0.5 text-sm text-muted">See each face, how to build it, and what it is easy to mix up with.</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
        </Card>
      </Link>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <Card className="px-3 py-3.5">
      <div className="flex items-center gap-1.5 text-accent-text">{icon}</div>
      <p className="tabular mt-1.5 text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
