import { cn } from '@/lib/utils'
import { seatId } from '@/lib/schedule'

const KIND = {
  available: 'border-[#d4ccbd] bg-[#ffffff] text-[#3f3c37] hover:border-primary hover:bg-primary/10 hover:text-primary font-medium shadow-[0_1px_2px_rgba(30,20,10,0.05)]',
  booked: 'border-[#a39c91] bg-[#e2ddd5] text-[#716c64]',
  blocked: 'border-[#aa6522] bg-[#c2782f] text-white shadow-[0_2px_8px_rgba(194,120,47,0.35)] font-semibold',
  disabled: 'border-dashed border-[#d8d0c2] bg-[#ede7da] text-[#a39c91]',
}

const TINT = {
  regular: 'border-[#607d9b]/40 bg-[#607d9b]/10 text-[#607d9b]',
  premium: 'border-[#8b7355]/40 bg-[#8b7355]/10 text-[#8b7355]',
  recliner: 'border-[#c2782f]/40 bg-[#c2782f]/10 text-[#c2782f]',
}

/**
 * Shared 2D seat matrix.
 * cellKind(row, seat) -> 'available' | 'booked' | 'blocked' | 'disabled' | 'aisle'
 * Used by the seat architect (editable) and the live seat inspector.
 */
export function SeatGrid({ rows, cellKind, onSeatClick, rowEnd, titleFor, tierTint }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto w-max min-w-full px-2">
        <div className="mx-auto mb-8 max-w-md">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#222226] to-transparent opacity-60 shadow-[0_4px_16px_rgba(34,34,38,0.2)]" />
          <p className="label-caps mt-3 text-center text-foreground/70">Cinema Screen</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-5 text-center font-display text-xs text-muted-foreground">{row.label}</span>
              <div className="flex gap-1.5">
                {row.seats.map((seat) => {
                  const kind = cellKind(row, seat)
                  if (kind === 'aisle') return <span key={seat.n} className="size-7" aria-hidden />
                  return (
                    <button
                      key={seat.n}
                      type="button"
                      title={titleFor?.(row, seat, kind) ?? `${seatId(row, seat)} · ${kind}`}
                      aria-label={`Seat ${seatId(row, seat)} ${kind}`}
                      onClick={() => onSeatClick?.(row, seat, kind)}
                      className={cn('size-7 rounded-md border text-[9px] font-medium tabular-nums transition-all', KIND[kind], tierTint && kind === 'available' && TINT[row.tier], onSeatClick ? 'cursor-pointer' : 'cursor-default')}
                    >
                      {seat.n}
                    </button>
                  )
                })}
              </div>
              <div className="w-28">{rowEnd?.(row)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SeatLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {items.map(([kind, label]) => (
        <span key={kind} className="flex items-center gap-2">
          <span className={cn('size-4 rounded border', KIND[kind])} />
          {label}
        </span>
      ))}
    </div>
  )
}
