import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Calendar, MonitorPlay, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/admin/StatusPill'
import { Poster } from '@/components/admin/Poster'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ShowDialog } from '@/components/admin/ShowDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDb } from '@/store/db'
import { Link } from 'react-router-dom'

const pad = (n) => String(n).padStart(2, '0')

function formatTime(iso) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
}

export default function Shows() {
  const { shows, screens, cancelShow } = useDb()
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [cancelling, setCancelling] = useState(null)

  const rows = useMemo(() => {
    return shows
      .filter((s) => s.movie.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [shows, q])

  const confirmCancel = () => {
    try {
      const flagged = cancelShow(cancelling.id)
      toast.success(`Show cancelled. ${flagged > 0 ? `${flagged} bookings flagged for refund.` : ''}`)
    } catch (e) {
      toast.error(e.message || 'Failed to cancel show')
    }
  }

  return (
    <>
      <PageHeader eyebrow="Operations" title="Schedule & Shows" description="Allocate screens and manage timelines. The engine prevents overlaps automatically.">
        <Button onClick={() => setCreating(true)}><Plus /> Schedule show</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/70" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search film title..." className="pl-9" />
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'show' : 'shows'}
        </div>
      </div>

      <DataTable
        rows={rows}
        empty="No shows match your search."
        columns={[
          {
            key: 'movie',
            header: 'Film',
            cell: (s) => (
              <div className="flex items-center gap-3">
                <Poster src={s.movie.poster} title={s.movie.title} className="h-10 w-7 shrink-0 rounded-sm border border-white/10" />
                <div>
                  <p className="font-medium text-sm">{s.movie.title}</p>
                  <p className="text-xs text-muted-foreground">{s.movie.duration} min</p>
                </div>
              </div>
            ),
          },
          {
            key: 'screen',
            header: 'Screen',
            cell: (s) => {
              const sc = screens.find((x) => x.id === s.screenId)
              return (
                <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
                  <MonitorPlay className="size-3.5 text-muted-foreground" /> {sc ? sc.name : '—'}
                </span>
              )
            }
          },
          {
            key: 'start',
            header: 'Date & Time',
            cell: (s) => (
              <div className="whitespace-nowrap">
                <p className="font-medium text-sm flex items-center gap-1.5"><Calendar className="size-3.5 text-muted-foreground"/> {formatDate(s.start)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatTime(s.start)} start</p>
              </div>
            )
          },
          {
            key: 'prices',
            header: 'Tiers (₹)',
            cell: (s) => (
              <div className="flex gap-2 text-xs">
                {s.prices && Object.entries(s.prices).map(([t, p]) => (
                  <span key={t} className="rounded bg-white/[0.04] px-1.5 py-0.5" title={t}>
                    <span className="text-muted-foreground">{t[0].toUpperCase()}:</span> {p}
                  </span>
                ))}
              </div>
            )
          },
          {
            key: 'status',
            header: 'Status',
            cell: (s) => <StatusPill status={s.status} />
          },
          {
            key: 'actions',
            header: '',
            className: 'w-24 text-right',
            cell: (s) => (
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" asChild>
                  <Link to={`/admin/shows/${s.id}/seats`}>Seats</Link>
                </Button>
                {s.status !== 'CANCELLED' && (
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-crimson" onClick={() => setCancelling(s)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            )
          },
        ]}
      />

      <ShowDialog open={creating} onOpenChange={setCreating} />
      
      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        title={`Cancel show for ${cancelling?.movie?.title}?`}
        description="This will immediately flag all confirmed bookings for refund and release the seats. This action cannot be undone."
        confirmLabel="Yes, cancel show"
        destructive
        onConfirm={confirmCancel}
      />
    </>
  )
}
