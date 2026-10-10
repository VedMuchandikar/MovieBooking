import { cn } from '@/lib/utils'
import { seatId } from '@/lib/schedule'

const KIND = {
  available: 'border-white/10 bg-white/[0.07] text-white/40 hover:border-gold/60 hover:bg-gold/10 hover:text-gold',
  booked: 'border-[#a8324f]/50 bg-burgundy text-[#f0a3b6]',
  blocked: 'border-gold bg-gold text-[#15110a] shadow-[0_0_14px_-2px_rgba(230,198,135,0.7)]',
  disabled: 'border-dashed border-white/15 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.06)_3px,rgba(255,255,255,0.06)_6px)] text-white/20',
}

const TINT = {
  premium: 'border-[#9fb4d8]/45 bg-[#9fb4d8]/[0.09]',
  recliner: 'border-gold/55 bg-gold/[0.1]',
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
          <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-80 shadow-[0_8px_30px_rgba(230,198,135,0.45)]" />
          <p className="label-caps mt-3 text-center text-gold/60">Screen</p>
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
