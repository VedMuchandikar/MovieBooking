import { cn } from '@/lib/utils'

const TONES = {
  emerald: 'bg-[#3d7a5a]/12 text-[#2d5c43] border-[#3d7a5a]/30',
  crimson: 'bg-[#b85244]/12 text-[#8f362a] border-[#b85244]/30',
  gold: 'bg-[#c2782f]/12 text-[#995517] border-[#c2782f]/30',
  cyan: 'bg-[#607d9b]/12 text-[#465f79] border-[#607d9b]/30',
  purple: 'bg-[#8b7355]/12 text-[#68533a] border-[#8b7355]/30',
  muted: 'bg-[#f0eae0] text-[#5c574f] border-[#d8d0c2]',
  burgundy: 'bg-[#222226]/08 text-[#18181b] border-[#222226]/20',
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
