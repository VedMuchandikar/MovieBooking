import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle2, AlertTriangle, MonitorPlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/admin/PageHeader'
import { useDb } from '@/store/db'
import { cn } from '@/lib/utils'
import { seatId } from '@/lib/schedule'

const pad = (n) => String(n).padStart(2, '0')
function formatDateTime(iso) {
  const d = new Date(iso)
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ShowSeats() {
  const { id } = useParams()
  const { shows, screens, bookings, blocks, toggleBlock } = useDb()

  const show = shows.find((s) => String(s.id) === id)
  const screen = show ? screens.find((s) => s.id === show.screenId) : null
  
  const showBlocks = blocks[show?.id] || []
  
  const bookedSeats = useMemo(() => {
    if (!show) return new Set()
    const active = bookings.filter(b => b.showId === show.id && b.status === 'CONFIRMED')
    return new Set(active.flatMap(b => b.seats))
  }, [shows, bookings, show])

  if (!show || !screen) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Show not found.</p>
        <Button variant="link" asChild className="mt-4"><Link to="/admin/shows">Back to shows</Link></Button>
      </div>
    )
  }

  const handleSeatClick = (seatName, state, isBooked) => {
    if (state !== 'ok' || isBooked) return
    toggleBlock(show.id, seatName)
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-white">
          <Link to="/admin/shows"><ArrowLeft className="mr-2 size-4" /> Back to Shows</Link>
        </Button>
      </div>
      
      <PageHeader 
        eyebrow={`Screen: ${screen.name}`} 
        title={show.movie.title} 
        description={`${formatDateTime(show.start)} • Click any available seat to toggle a maintenance block/admin hold.`} 
      />

      <div className="mt-8 flex flex-col items-center">
        {/* Screen visual */}
        <div className="mb-12 flex flex-col items-center">
          <div className="h-1 w-full max-w-2xl rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
          <p className="mt-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <MonitorPlay className="size-3" /> Screen
          </p>
        </div>

        {/* Seat Matrix */}
        <div className="flex flex-col gap-3 overflow-x-auto pb-8 w-full items-center">
          {screen.rows.map((row) => (
            <div key={row.label} className="flex items-center gap-6">
              <div className="w-4 text-right text-xs font-semibold text-muted-foreground">{row.label}</div>
              
              <div className="flex gap-2">
                {row.seats.map((seat) => {
                  if (seat.state === 'aisle') {
                    return <div key={`${row.label}${seat.n}`} className="w-6" /> // spacer
                  }

                  const sName = seatId(row, seat)
                  const isBooked = bookedSeats.has(sName)
                  const isBlocked = showBlocks.includes(sName)
                  const isBroken = seat.state === 'broken'

                  return (
                    <button
                      key={sName}
                      disabled={isBooked || isBroken}
                      onClick={() => handleSeatClick(sName, seat.state, isBooked)}
                      className={cn(
                        "relative flex size-8 sm:size-9 items-center justify-center rounded-t-lg rounded-b-sm border text-[10px] font-medium transition-all duration-200",
                        // Available
                        !isBooked && !isBlocked && !isBroken && "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer",
                        // Admin Blocked (Gold)
                        isBlocked && "bg-gold/20 border-gold/50 text-gold cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]",
                        // Booked (Burgundy)
                        isBooked && "bg-burgundy/40 border-burgundy/60 text-[#f0a3b6] cursor-not-allowed opacity-80",
                        // Broken
                        isBroken && "bg-crimson/10 border-crimson/30 text-crimson/50 cursor-not-allowed"
                      )}
                      title={`${sName} - ${row.tier}`}
                    >
                      {isBlocked && <Lock className="absolute size-3.5 opacity-60" />}
                      {!isBlocked && sName}
                    </button>
                  )
                })}
              </div>
              
              <div className="w-4 text-left text-xs font-semibold text-muted-foreground">{row.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/[0.05] bg-white/[0.01] px-6 py-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2"><div className="size-4 rounded-sm border border-white/10 bg-white/[0.04]" /> Available</div>
          <div className="flex items-center gap-2"><div className="size-4 rounded-sm border border-burgundy/60 bg-burgundy/40" /> Booked</div>
          <div className="flex items-center gap-2"><div className="flex size-4 items-center justify-center rounded-sm border border-gold/50 bg-gold/20"><Lock className="size-2.5 text-gold" /></div> Admin Hold</div>
          <div className="flex items-center gap-2"><div className="size-4 rounded-sm border border-crimson/30 bg-crimson/10" /> Broken</div>
        </div>
      </div>
    </>
  )
}
