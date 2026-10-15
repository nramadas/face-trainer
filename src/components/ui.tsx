import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { Progress } from '@base-ui/react/progress';
import { Switch } from '@base-ui/react/switch';
import type { Tier } from '../data/types';
import { TIER_LABEL } from '../data/types';
import { STATUS_LABEL, type Status } from '../lib/stats';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export function Card({ className, children, strong, ...rest }: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div className={cx(strong ? 'glass-strong' : 'glass', 'rounded-[24px]', className)} {...rest}>
      {children}
    </div>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'sm'; glow?: boolean; icon?: ReactNode };

const variantClass: Record<Variant, string> = {
  primary: 'btn-accent font-semibold',
  secondary: 'glass text-ink font-medium hover:bg-white/10',
  ghost: 'text-accent-text font-medium hover:bg-white/5',
  danger: 'bg-[#5a2420] text-white font-semibold border border-[#a8524a]/60 hover:bg-[#6b2b26]',
};
const sizeClass = { sm: 'h-10 px-4 text-sm', md: 'h-12 px-5 text-base', lg: 'h-14 px-6 text-lg' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', glow, icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full transition-colors select-none disabled:opacity-45 disabled:pointer-events-none',
        variantClass[variant],
        sizeClass[size],
        glow && 'glow',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export function LinkButton({ to, variant = 'secondary', size = 'md', glow, icon, className, children }: { to: string; variant?: Variant; size?: 'md' | 'lg' | 'sm'; glow?: boolean; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cx('inline-flex items-center justify-center gap-2 rounded-full transition-colors select-none', variantClass[variant], sizeClass[size], glow && 'glow', className)}
    >
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cx('glass grid size-12 shrink-0 place-items-center rounded-full text-ink hover:bg-white/10', className)} {...rest}>
      {children}
    </button>
  );
}

/** Screen header with a circular back button, centered title and an optional action, like the reference. */
export function PageHeader({ title, subtitle, back, action }: { title: string; subtitle?: string; back?: string | true; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-3 pt-4 pb-3">
      {back ? (
        <IconButton label="Back" onClick={() => (back === true ? navigate(-1) : navigate(back))}>
          <ChevronLeft className="size-5" aria-hidden />
        </IconButton>
      ) : (
        <span className="size-12 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>
      {action ?? <span className="size-12 shrink-0" aria-hidden />}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-muted">
      {TIER_LABEL[tier]}
    </span>
  );
}

export const STATUS_COLOR: Record<Status, string> = {
  new: 'bg-status-new',
  learning: 'bg-status-learning',
  learned: 'bg-status-learned',
  solid: 'bg-status-solid',
};

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return <span role="img" aria-label={STATUS_LABEL[status]} title={STATUS_LABEL[status]} className={cx('inline-block size-2.5 rounded-full', STATUS_COLOR[status], className)} />;
}

export function ProgressBar({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  return (
    <Progress.Root value={value} max={max} aria-label={label} getAriaValueText={(_, v) => `${v ?? 0} of ${max}`} className={cx('w-full', className)}>
      <Progress.Track className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <Progress.Indicator className="block h-full rounded-full bg-gradient-to-r from-accent-strong to-accent transition-[width] duration-500" />
      </Progress.Track>
    </Progress.Root>
  );
}

/** Chat-style coach bubble, like the assistant bubbles in the reference. */
export function CoachBubble({ children, className, avatar = true }: { children: ReactNode; className?: string; avatar?: boolean }) {
  return (
    <div className={cx('flex items-end gap-2.5 animate-fade-in', className)}>
      {avatar ? <CoachAvatar /> : <span className="w-8 shrink-0" />}
      <div className="glass min-w-0 flex-1 rounded-[22px] rounded-bl-md px-4 py-3 text-[15px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export function CoachAvatar() {
  return (
    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#6fd0d9,#17808b_55%,#0a2a2e)] shadow-[0_0_14px_rgba(47,164,176,0.45)]">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="#e9fbfc" strokeWidth="2" strokeLinecap="round">
        <path d="M7 10.5q1.5-1.5 3 0M14 10.5q1.5-1.5 3 0M8.5 15q3.5 2.5 7 0" />
      </svg>
    </span>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="max-w-[85%] rounded-[22px] rounded-br-md bg-white/9 px-4 py-3 text-[15px] leading-relaxed text-ink border border-white/10">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; id: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(v)}
        className="relative mt-0.5 flex h-7 w-12 shrink-0 rounded-full border border-white/15 bg-white/10 p-0.5 transition-colors data-[checked]:border-accent/60 data-[checked]:bg-accent-strong"
      >
        <Switch.Thumb className="size-[22px] rounded-full bg-white shadow transition-transform data-[checked]:translate-x-5" />
      </Switch.Root>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="p-6 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </Card>
  );
}
