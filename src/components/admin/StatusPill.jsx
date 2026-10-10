import { cn } from '@/lib/utils'

const TONES = {
  emerald: 'bg-emerald/10 text-emerald border-emerald/25',
  crimson: 'bg-crimson/10 text-crimson border-crimson/25',
  gold: 'bg-gold/10 text-gold border-gold/25',
  muted: 'bg-white/[0.04] text-muted-foreground border-white/10',
  burgundy: 'bg-burgundy/30 text-[#f0a3b6] border-burgundy/60',
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
