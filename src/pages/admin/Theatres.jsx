import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Building2, MapPin, Pencil, Plus, Save, Sparkles, Trash2, Tv2, Undo2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { SeatGrid, SeatLegend } from '@/components/admin/SeatGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { TIERS, buildLayout, capacity } from '@/lib/schedule'
import { useDb } from '@/store/db'

const FORMATS = ['IMAX', 'Dolby Atmos', 'Standard']

/** Small generic create/edit modal: fields = [{ key, label, type?, options? }]. */
function EntityDialog({ open, onOpenChange, title, description, fields, initial, onSave }) {
  const [v, setV] = useState(initial)
  useEffect(() => { if (open) setV(initial) }, [open, initial])
  const valid = fields.every((f) => String(v[f.key] ?? '').trim())
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valid) return
            onSave(v)
            onOpenChange(false)
          }}
        >
          {fields.map((f) => (
            <div key={f.key}>
              <Label className="label-caps mb-2 block">{f.label}</Label>
              {f.options ? (
                <Select value={v[f.key]} onValueChange={(x) => setV({ ...v, [f.key]: x })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input value={v[f.key] ?? ''} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} autoFocus={f === fields[0]} />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SeatArchitect({ screen }) {
  const saveLayout = useDb((s) => s.saveLayout)
  const [draft, setDraft] = useState(screen.rows)
  const [gen, setGen] = useState({ rows: screen.rows.length, perRow: screen.rows[0]?.seats.length ?? 10 })
  const [brush, setBrush] = useState('aisle')

  useEffect(() => {
    setDraft(screen.rows)
    setGen({ rows: screen.rows.length, perRow: screen.rows[0]?.seats.length ?? 10 })
  }, [screen.id, screen.rows])

  const dirty = JSON.stringify(draft) !== JSON.stringify(screen.rows)
  const cap = capacity({ rows: draft })
  const counts = useMemo(() => Object.fromEntries(TIERS.map((t) => [t, draft.filter((r) => r.tier === t).reduce((n, r) => n + r.seats.filter((s) => s.state === 'ok').length, 0)])), [draft])

  const generate = () => {
    const rows = Math.min(26, Math.max(1, Number(gen.rows) || 1))
    const perRow = Math.min(24, Math.max(2, Number(gen.perRow) || 2))
    setGen({ rows, perRow })
    setDraft(buildLayout(rows, perRow))
  }
  const paint = (row, seat) =>
    setDraft((d) => d.map((r) => (r.label !== row.label ? r : { ...r, seats: r.seats.map((s) => (s.n === seat.n ? { ...s, state: s.state === brush ? 'ok' : brush } : s)) })))
  const setTier = (label, tier) => setDraft((d) => d.map((r) => (r.label === label ? { ...r, tier } : r)))

  return (
    <section className="glass rise mt-6 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-gold/80">Seat architect</p>
          <h3 className="mt-1 text-xl font-semibold">{screen.name} <span className="text-sm font-normal text-muted-foreground">· {screen.format}</span></h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(screen.rows)}><Undo2 /> Discard</Button>
          <Button disabled={!dirty} onClick={() => { saveLayout(screen.id, draft); toast.success(`${screen.name} layout saved (${cap} seats)`) }}><Save /> Save layout</Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="w-28"><Label className="label-caps mb-2 block">Rows</Label><Input type="number" min="1" max="26" value={gen.rows} onChange={(e) => setGen({ ...gen, rows: e.target.value })} /></div>
        <div className="w-28"><Label className="label-caps mb-2 block">Seats / row</Label><Input type="number" min="2" max="24" value={gen.perRow} onChange={(e) => setGen({ ...gen, perRow: e.target.value })} /></div>
        <Button variant="secondary" onClick={generate}><Sparkles /> Generate matrix</Button>
        <p className="text-xs text-muted-foreground">Generates {Number(gen.rows) * Number(gen.perRow) || 0} positions, then tune tiers and gaps below.</p>
        <div className="ml-auto">
          <Label className="label-caps mb-2 block">Click a seat to</Label>
          <Tabs value={brush} onValueChange={setBrush}>
            <TabsList>
              <TabsTrigger value="aisle">Mark aisle gap</TabsTrigger>
              <TabsTrigger value="disabled">Disable seat</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mt-8">
        <SeatGrid
          rows={draft}
          tierTint
          cellKind={(_, s) => (s.state === 'ok' ? 'available' : s.state)}
          onSeatClick={paint}
          titleFor={(r, s) => `${r.label}${s.n} · ${r.tier} · click to ${s.state === brush ? 'restore' : brush === 'aisle' ? 'make an aisle' : 'disable'}`}
          rowEnd={(r) => (
            <Select value={r.tier} onValueChange={(t) => setTier(r.label, t)}>
              <SelectTrigger size="sm" className="h-7 w-28 text-xs capitalize" aria-label={`Tier for row ${r.label}`}><SelectValue /></SelectTrigger>
              <SelectContent>{TIERS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
        <SeatLegend items={[['available', 'Seat'], ['disabled', 'Disabled / broken']]} />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="border-gold/30 text-gold">{cap} sellable seats</Badge>
          {TIERS.map((t) => <Badge key={t} variant="outline" className="border-white/10 capitalize text-muted-foreground">{t} · {counts[t]}</Badge>)}
          {dirty && <Badge className="bg-gold/15 text-gold">Unsaved changes</Badge>}
        </div>
      </div>
    </section>
  )
}

export default function Theatres() {
  const { theatres, screens, saveTheatre, deleteTheatre, saveScreen, deleteScreen } = useDb()
  const [theatreId, setTheatreId] = useState(theatres[0]?.id)
  const [screenId, setScreenId] = useState(null)
  const [dlg, setDlg] = useState(null) // { kind, initial, id }
  const [del, setDel] = useState(null)

  const theatre = theatres.find((t) => t.id === theatreId) ?? theatres[0]
  const mine = screens.filter((s) => s.theatreId === theatre?.id)
  const screen = mine.find((s) => s.id === screenId) ?? mine[0]

  const err = (msg) => msg && toast.error(msg)
  const remove = () => {
    if (del.kind === 'theatre') {
      const e = deleteTheatre(del.item.id)
      if (!e) { toast.success('Theatre removed'); setTheatreId(null) }
      err(e)
    } else {
      const e = deleteScreen(del.item.id)
      if (!e) toast.success('Screen removed')
      err(e)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Operations" title="Theatres & Screens" description="Venues, auditoriums, and the seat matrix customers choose from.">
        <Button onClick={() => setDlg({ kind: 'theatre', initial: { name: '', city: '', address: '' } })}><Plus /> Add theatre</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          {theatres.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTheatreId(t.id); setScreenId(null) }}
              className={cn('glass w-full rounded-2xl p-4 text-left transition-all hover:border-gold/30', t.id === theatre?.id && 'border-gold/40 bg-gold/[0.05] gold-glow')}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-gold/10 text-gold"><Building2 className="size-4" /></span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city} · {screens.filter((s) => s.theatreId === t.id).length} screens</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {theatre && (
          <div className="min-w-0">
            <div className="glass rise rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{theatre.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5 text-gold/70" /> {theatre.address}, {theatre.city}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setDlg({ kind: 'theatre', id: theatre.id, initial: theatre })} aria-label="Edit theatre"><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-crimson hover:text-crimson" onClick={() => setDel({ kind: 'theatre', item: theatre })} aria-label="Delete theatre"><Trash2 className="size-4" /></Button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="label-caps">Screens</p>
                <Button size="sm" variant="secondary" onClick={() => setDlg({ kind: 'screen', initial: { name: '', format: 'Standard' } })}><Plus /> Add screen</Button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mine.map((s) => (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setScreenId(s.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setScreenId(s.id)}
                    className={cn('group cursor-pointer rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all hover:border-gold/30', s.id === screen?.id && 'border-gold/50 bg-gold/[0.06]')}
                  >
                    <div className="flex items-start justify-between">
                      <Tv2 className="size-4 text-gold/80" />
                      <div className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); setDlg({ kind: 'screen', id: s.id, initial: s }) }} aria-label={`Edit ${s.name}`}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-7 text-crimson hover:text-crimson" onClick={(e) => { e.stopPropagation(); setDel({ kind: 'screen', item: s }) }} aria-label={`Delete ${s.name}`}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </div>
                    <p className="mt-3 font-medium">{s.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-gold/30 text-gold">{s.format}</Badge>
                      {capacity(s)} seats
                    </div>
                  </div>
                ))}
                {mine.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted-foreground">No screens yet. Add the first auditorium.</p>}
              </div>
            </div>

            {screen && <SeatArchitect screen={screen} />}
          </div>
        )}
      </div>

      <EntityDialog
        open={dlg?.kind === 'theatre'}
        onOpenChange={(o) => !o && setDlg(null)}
        title={dlg?.id ? 'Edit theatre' : 'Add theatre'}
        description="Name, city and street address."
        fields={[{ key: 'name', label: 'Name' }, { key: 'city', label: 'City' }, { key: 'address', label: 'Address' }]}
        initial={dlg?.initial ?? {}}
        onSave={(v) => { const id = saveTheatre({ name: v.name.trim(), city: v.city.trim(), address: v.address.trim() }, dlg.id); setTheatreId(id); toast.success('Theatre saved') }}
      />
      <EntityDialog
        open={dlg?.kind === 'screen'}
        onOpenChange={(o) => !o && setDlg(null)}
        title={dlg?.id ? 'Edit screen' : 'Add screen'}
        description="New screens start with an 8 × 10 matrix you can reshape in the architect."
        fields={[{ key: 'name', label: 'Screen name' }, { key: 'format', label: 'Format', options: FORMATS }]}
        initial={dlg?.initial ?? {}}
        onSave={(v) => { const id = saveScreen({ theatreId: theatre.id, name: v.name.trim(), format: v.format }, dlg.id); setScreenId(id); toast.success('Screen saved') }}
      />
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={`Delete ${del?.item.name}?`}
        description={del?.kind === 'theatre' ? 'The theatre and its screens will be removed. Blocked if any shows exist on them.' : 'The screen and its seat layout will be removed. Blocked if shows exist on it.'}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </>
  )
}
