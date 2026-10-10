import { useState, useMemo } from 'react'
import { Search, User, CreditCard, Ticket, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/admin/StatusPill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { useDb } from '@/store/db'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

const pad = (n) => String(n).padStart(2, '0')
function formatDateTime(iso) {
  const d = new Date(iso)
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function BookingDrawer({ booking, open, onOpenChange, onCancelRequest }) {
  const { shows } = useDb()
  if (!booking) return null

  const show = shows.find((s) => s.id === booking.showId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Booking Details</SheetTitle>
          <SheetDescription>{booking.id}</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="flex justify-between items-start">
            <StatusPill status={booking.status} />
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Booked on</p>
              <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="label-caps flex items-center gap-2"><User className="size-4" /> Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{booking.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.userPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{booking.userEmail}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="label-caps flex items-center gap-2"><Ticket className="size-4" /> Show & Seats</h3>
            <div className="text-sm space-y-4">
              <div>
                <p className="font-medium text-base">{show?.movie?.title || 'Unknown Film'}</p>
                <p className="text-muted-foreground">{show ? formatDateTime(show.start) : '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Seats ({booking.seats.length})</p>
                  <p className="font-medium text-gold">{booking.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-in Status</p>
                  <p className="font-medium flex items-center gap-1.5 mt-0.5">
                    {booking.checkedIn ? <span className="text-emerald flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Admitted</span> : <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3.5" /> Pending</span>}
                  </p>
                </div>
              </div>
            </div>
            {show && (
              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link to={`/admin/shows/${show.id}/seats`}>Inspect Live Seat Map <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="label-caps flex items-center gap-2"><CreditCard className="size-4" /> Payment</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">₹{booking.amount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-medium font-mono text-xs mt-1">{booking.paymentId}</p>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto sm:justify-between border-t border-white/[0.06] pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          {booking.status === 'CONFIRMED' && (
            <Button variant="destructive" onClick={() => onCancelRequest(booking)}>
              <XCircle className="mr-2 size-4" /> Cancel Booking
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default function Bookings() {
  const { bookings, shows, cancelBooking } = useDb()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const rows = useMemo(() => {
    return bookings
      .map(b => {
        const sh = shows.find(s => s.id === b.showId)
        return { ...b, movieTitle: sh?.movie?.title || 'Unknown' }
      })
      .filter((b) => {
        if (status !== 'all' && b.status !== status) return false
        if (q) {
          const lq = q.toLowerCase()
          return b.id.toLowerCase().includes(lq) || 
                 b.userEmail.toLowerCase().includes(lq) || 
                 b.movieTitle.toLowerCase().includes(lq)
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [bookings, shows, q, status])

  const confirmCancel = () => {
    try {
      cancelBooking(cancelling.id)
      toast.success('Booking cancelled and seats released.')
      if (selected?.id === cancelling.id) setSelected(null)
    } catch (e) {
      toast.error(e.message || 'Failed to cancel booking')
    }
  }

  return (
    <>
      <PageHeader eyebrow="Operations" title="Master Booking Register" description="Full ledger of all transactions. Cancel bookings to instantly release holds." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/70" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, email or film..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUND_PENDING">Refund pending</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'booking' : 'bookings'}
        </div>
      </div>

      <DataTable
        rows={rows}
        empty="No bookings found."
        onRowClick={setSelected}
        columns={[
          {
            key: 'id',
            header: 'Booking ID',
            cell: (b) => <span className="font-mono text-xs font-medium">{b.id}</span>
          },
          {
            key: 'customer',
            header: 'Customer',
            cell: (b) => (
              <div>
                <p className="font-medium text-sm">{b.userName}</p>
                <p className="text-xs text-muted-foreground">{b.userEmail}</p>
              </div>
            )
          },
          {
            key: 'movieTitle',
            header: 'Film & Seats',
            cell: (b) => (
              <div>
                <p className="font-medium text-sm line-clamp-1">{b.movieTitle}</p>
                <p className="text-xs text-muted-foreground">{b.seats.length} {b.seats.length === 1 ? 'seat' : 'seats'} · {b.seats.slice(0, 3).join(', ')}{b.seats.length > 3 ? '...' : ''}</p>
              </div>
            )
          },
          {
            key: 'amount',
            header: 'Amount',
            cell: (b) => <span className="text-sm font-medium">₹{b.amount}</span>
          },
          {
            key: 'status',
            header: 'Status',
            cell: (b) => <StatusPill status={b.status} />
          },
        ]}
      />

      <BookingDrawer 
        booking={selected} 
        open={!!selected} 
        onOpenChange={(v) => !v && setSelected(null)}
        onCancelRequest={(b) => setCancelling(b)}
      />

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        title={`Cancel booking ${cancelling?.id}?`}
        description="This will cancel the booking, trigger a refund workflow, and immediately release the seats back to the public pool."
        confirmLabel="Yes, cancel booking"
        destructive
        onConfirm={confirmCancel}
      />
    </>
  )
}
