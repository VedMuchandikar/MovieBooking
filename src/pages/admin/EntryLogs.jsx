import { useState, useMemo } from 'react'
import { Scan, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/admin/StatusPill'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDb } from '@/store/db'

const pad = (n) => String(n).padStart(2, '0')
function formatDateTime(iso) {
  const d = new Date(iso)
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EntryLogs() {
  const { logs, shows, staff } = useDb()
  const [q, setQ] = useState('')
  const [result, setResult] = useState('all')
  const [guardFilter, setGuardFilter] = useState('all')

  const guards = useMemo(() => staff.filter(s => s.role === 'guard'), [staff])

  const rows = useMemo(() => {
    return logs
      .map(log => {
        const sh = log.showId ? shows.find(s => s.id === log.showId) : null
        return { ...log, movieTitle: sh?.movie?.title || 'Unknown' }
      })
      .filter((log) => {
        if (result !== 'all' && log.result !== result) return false
        if (guardFilter !== 'all' && log.guard !== guardFilter) return false
        if (q) {
          const lq = q.toLowerCase()
          return log.bookingRef.toLowerCase().includes(lq) || log.movieTitle.toLowerCase().includes(lq)
        }
        return true
      })
  }, [logs, shows, q, result, guardFilter])

  return (
    <>
      <PageHeader eyebrow="Security" title="Gate Entry Logs" description="Real-time audit log of all QR scans from theatre gates." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/70" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking ref or film..." className="pl-9" />
        </div>
        
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Result" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="ADMIT">Admitted</SelectItem>
            <SelectItem value="REJECT">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={guardFilter} onValueChange={setGuardFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Guard" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Guards</SelectItem>
            {guards.map(g => (
              <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="ml-auto text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'scan' : 'scans'}
        </div>
      </div>

      <DataTable
        rows={rows}
        empty="No scan logs found."
        columns={[
          {
            key: 'ts',
            header: 'Timestamp',
            cell: (l) => <span className="text-sm">{formatDateTime(l.ts)}</span>
          },
          {
            key: 'bookingRef',
            header: 'Booking Ref',
            cell: (l) => (
              <div className="flex items-center gap-2">
                <Scan className="size-3.5 text-muted-foreground" />
                <span className="font-mono text-xs font-medium">{l.bookingRef}</span>
              </div>
            )
          },
          {
            key: 'movieTitle',
            header: 'Show',
            cell: (l) => <span className="text-sm">{l.movieTitle}</span>
          },
          {
            key: 'guard',
            header: 'Scanned By',
            cell: (l) => <span className="text-sm">{l.guard}</span>
          },
          {
            key: 'result',
            header: 'Result',
            cell: (l) => (
              <div className="flex flex-col items-start gap-1">
                <StatusPill status={l.result} />
                {l.result === 'REJECT' && l.reason && (
                  <span className="text-[10px] text-crimson flex items-center gap-1">
                    <AlertCircle className="size-2.5" /> {l.reason}
                  </span>
                )}
              </div>
            )
          },
        ]}
      />
    </>
  )
}
