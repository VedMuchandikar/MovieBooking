import { useState } from 'react'
import { toast } from 'sonner'
import { Save, ShieldAlert, Timer, Ticket } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDb } from '@/store/db'

export default function Settings() {
  const { settings, saveSettings } = useDb()
  const [f, setF] = useState(settings || { seatLockMin: 8, entryBeforeMin: 45, entryAfterMin: 30, maxTickets: 10 })
  const [busy, setBusy] = useState(false)

  const isDirty = JSON.stringify(f) !== JSON.stringify(settings)

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      saveSettings({
        seatLockMin: Number(f.seatLockMin),
        entryBeforeMin: Number(f.entryBeforeMin),
        entryAfterMin: Number(f.entryAfterMin),
        maxTickets: Number(f.maxTickets)
      })
      toast.success('Platform settings updated')
      setBusy(false)
    }, 400)
  }

  return (
    <>
      <PageHeader eyebrow="System" title="Platform Settings" description="Configure global booking rules, seat lock TTL, and gate entry bounds." />

      <form onSubmit={submit} className="max-w-2xl space-y-8 mt-6">
        
        {/* Booking Rules */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <Ticket className="size-4 text-gold" />
            <h2 className="text-lg font-medium">Booking Rules</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
            <div>
              <Label className="label-caps mb-2 block">Max Tickets per Transaction</Label>
              <Input type="number" min="1" max="20" value={f.maxTickets} onChange={e => setF({...f, maxTickets: e.target.value})} />
              <p className="mt-1.5 text-xs text-muted-foreground">Limit bulk buying to prevent scalping.</p>
            </div>
            <div>
              <Label className="label-caps mb-2 block">Seat Lock Expiration (mins)</Label>
              <Input type="number" min="1" max="15" value={f.seatLockMin} onChange={e => setF({...f, seatLockMin: e.target.value})} />
              <p className="mt-1.5 text-xs text-muted-foreground">How long seats are held during checkout.</p>
            </div>
          </div>
        </section>

        {/* Gate Entry Bounds */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <Timer className="size-4 text-gold" />
            <h2 className="text-lg font-medium">Gate Entry Windows</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
            <div>
              <Label className="label-caps mb-2 block">Scan Valid Before Show (mins)</Label>
              <Input type="number" min="0" value={f.entryBeforeMin} onChange={e => setF({...f, entryBeforeMin: e.target.value})} />
              <p className="mt-1.5 text-xs text-muted-foreground">How early customers can enter.</p>
            </div>
            <div>
              <Label className="label-caps mb-2 block">Scan Valid After Show (mins)</Label>
              <Input type="number" min="0" value={f.entryAfterMin} onChange={e => setF({...f, entryAfterMin: e.target.value})} />
              <p className="mt-1.5 text-xs text-muted-foreground">Late entry grace period.</p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-crimson/20 pb-2">
            <ShieldAlert className="size-4 text-crimson" />
            <h2 className="text-lg font-medium text-crimson">Security Rules</h2>
          </div>
          <div className="p-4 rounded-xl border border-crimson/20 bg-crimson/5 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm text-crimson">Force Session Expiry</p>
              <p className="text-xs text-muted-foreground">Requires all staff to log in again.</p>
            </div>
            <Button type="button" variant="outline" className="border-crimson/30 text-crimson hover:bg-crimson/10" onClick={() => toast('All active sessions invalidated.')}>
              Invalidate Sessions
            </Button>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={!isDirty || busy} className="min-w-32">
            <Save className="mr-2 size-4" /> Save Settings
          </Button>
          {isDirty && (
            <Button type="button" variant="ghost" onClick={() => setF(settings)}>Discard Changes</Button>
          )}
        </div>
      </form>
    </>
  )
}
