import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/admin/PageHeader'
import { SeatGrid } from '@/components/admin/SeatGrid'
import { useDb } from '@/store/db'
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
  }, [bookings, show])

  if (!show || !screen) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Show not found.</p>
        <Button variant="link" asChild className="mt-4"><Link to="/admin/shows">Back to shows</Link></Button>
      </div>
    )
  }

  const handleSeatClick = (row, seat) => {
    const sName = seatId(row, seat)
    if (seat.state !== 'ok' || bookedSeats.has(sName)) return
    toggleBlock(show.id, sName)
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

      <div className="glass rise mt-8 rounded-2xl p-5 sm:p-6">
        <SeatGrid
          rows={screen.rows}
          bookedSeats={bookedSeats}
          blockedSeats={showBlocks}
          pricing={show.prices}
          onSeatClick={handleSeatClick}
          promptText="Click any available seat to toggle maintenance block / admin hold"
          showPromptBanner={true}
          showLegend={true}
        />
      </div>
    </>
  )
}
