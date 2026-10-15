import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { EMOTIONS } from '../data/emotions';
import { GROUPS, type GroupId } from '../data/groups';
import { EmotionTile } from '../components/EmotionTile';
import { Empty, PageHeader, cx } from '../components/ui';

export function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const g = (params.get('g') ?? 'all') as GroupId | 'all';

  const update = (next: { q?: string; g?: string }) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === 'all') p.delete(k);
      else p.set(k, v);
    }
    setParams(p, { replace: true });
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EMOTIONS.filter((e) => (g === 'all' || e.group === g) && (!term || e.name.toLowerCase().includes(term) || e.definition.toLowerCase().includes(term) || e.oneLiner.toLowerCase().includes(term)));
  }, [q, g]);

  const grouped = g === 'all' && !q.trim();

  return (
    <div>
      <PageHeader title="Explore" subtitle="87 emotions, 13 groups" />
      <div className="glass flex h-14 items-center gap-3 rounded-full px-5">
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(ev) => update({ q: ev.target.value })}
          placeholder="Search…"
          aria-label="Search emotions"
          className="h-full min-w-0 flex-1 bg-transparent text-lg text-ink placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => update({ q: '' })} className="grid size-8 place-items-center rounded-full text-muted hover:bg-white/10">
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <ToggleGroup
        value={[g]}
        onValueChange={(v) => update({ g: (v[0] as string) ?? 'all' })}
        aria-label="Filter by group"
        className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {[{ id: 'all', short: 'All', label: 'All groups' }, ...GROUPS].map((grp) => (
          <Toggle
            key={grp.id}
            value={grp.id}
            title={grp.label}
            className={cx(
              'h-11 shrink-0 rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-colors',
              'glass text-ink data-[pressed]:btn-accent data-[pressed]:border-accent/50',
            )}
          >
            {grp.short}
          </Toggle>
        ))}
      </ToggleGroup>

      {g !== 'all' && <p className="mt-4 text-sm text-muted">{GROUPS.find((x) => x.id === g)?.label}</p>}

      <p className="sr-only" aria-live="polite">
        {results.length} emotions shown
      </p>

      {results.length === 0 && (
        <div className="mt-6">
          <Empty title="No emotions match">Try a different word, or clear the filter.</Empty>
        </div>
      )}

      {grouped ? (
        GROUPS.map((grp) => (
          <section key={grp.id} aria-labelledby={`grp-${grp.id}`} className="mt-7">
            <h2 id={`grp-${grp.id}`} className="mb-3 text-sm font-medium text-muted">
              {grp.label}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {results.filter((e) => e.group === grp.id).map((e) => (
                <EmotionTile key={e.id} e={e} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {results.map((e) => (
            <EmotionTile key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
