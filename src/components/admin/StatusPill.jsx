import { cn } from '@/lib/utils'

const TONES = {
  emerald: 'bg-emerald/10 text-emerald border-emerald/25',
  crimson: 'bg-primary/15 text-primary border-primary/30',
  gold: 'bg-amber/15 text-amber border-amber/30',
  cyan: 'bg-cyan/15 text-cyan border-cyan/30',
  purple: 'bg-purple/15 text-purple border-purple/30',
  muted: 'bg-white/[0.04] text-muted-foreground border-white/10',
  burgundy: 'bg-primary/20 text-[#fda4af] border-primary/35',
}

const MAP = {
  'Now Showing': ['emerald', 'Now Showing'],
  Upcoming: ['gold', 'Upcoming'],
  Archived: ['muted', 'Archived'],
  SCHEDULED: ['emerald', 'Scheduled'],
  CONFIRMED: ['emerald', 'Confirmed'],
  CANCELLED: ['crimson', 'Cancelled'],
  REFUND_PENDING: ['gold', 'Refund pending'],
  ADMIT: ['emerald', 'Admit'],
  REJECT: ['crimson', 'Reject'],
  admin: ['gold', 'Admin'],
  guard: ['muted', 'Guard'],
  active: ['emerald', 'Active'],
  inactive: ['muted', 'Inactive'],
}

/** One pill for every status in the product, so colours stay consistent. */
export function StatusPill({ status, tone, children, className }) {
  const [t, label] = MAP[status] ?? ['muted', status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', TONES[tone ?? t], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {children ?? label}
    </span>
  )
}
