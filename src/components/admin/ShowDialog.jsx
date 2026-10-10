import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDb } from '@/store/db'
import { TIERS, showEnd } from '@/lib/schedule'

const pad = (n) => String(n).padStart(2, '0')
const toLocalISOString = (d) => {
  const date = new Date(d)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function Field({ label, children, className, error }) {
  return (
    <div className={className}>
      <Label className="label-caps mb-2 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-crimson">{error}</p>}
    </div>
  )
}

function ShowForm({ onClose }) {
  const { movies, screens, saveShow } = useDb()
  const activeMovies = useMemo(() => movies.filter(m => m.status !== 'Archived'), [movies])
  
  // Default values
  const defaultStart = new Date()
  defaultStart.setMinutes(Math.ceil(defaultStart.getMinutes() / 30) * 30) // round to next 30 min
  
  const [movieId, setMovieId] = useState('')
  const [screenId, setScreenId] = useState('')
  const [start, setStart] = useState(toLocalISOString(defaultStart))
  const [prices, setPrices] = useState({ regular: '150', premium: '250', recliner: '400' })
  const [busy, setBusy] = useState(false)

  const selectedMovie = movies.find((m) => String(m.id) === movieId)

  const errors = {
    movie: !movieId && 'Select a movie',
    screen: !screenId && 'Select a screen',
    start: !start && 'Select start time',
    prices: TIERS.some(t => !Number(prices[t]) || Number(prices[t]) <= 0) && 'Valid prices required for all tiers'
  }
  const invalid = Object.values(errors).some(Boolean)

  const submit = (e) => {
    e.preventDefault()
    if (invalid) return
    setBusy(true)

    const parsedPrices = {}
    TIERS.forEach(t => { parsedPrices[t] = Number(prices[t]) })

    const res = saveShow({
      movie: { id: selectedMovie.id, title: selectedMovie.title, poster: selectedMovie.poster_url, duration: selectedMovie.duration_min },
      screenId: Number(screenId),
      start: new Date(start).toISOString(),
      prices: parsedPrices,
    })

    if (res.error) {
      toast.error(res.error)
      setBusy(false)
      return
    }

    toast.success('Show scheduled successfully')
    onClose()
  }

  const endTime = useMemo(() => {
    if (!start || !selectedMovie?.duration_min) return null
    try {
      const e = showEnd(new Date(start).toISOString(), selectedMovie.duration_min)
      return `${pad(e.getHours())}:${pad(e.getMinutes())}`
    } catch { return null }
  }, [start, selectedMovie])

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Movie" error={errors.movie}>
          <Select value={movieId} onValueChange={setMovieId}>
            <SelectTrigger><SelectValue placeholder="Select film..." /></SelectTrigger>
            <SelectContent>
              {activeMovies.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        
        <Field label="Screen" error={errors.screen}>
          <Select value={screenId} onValueChange={setScreenId}>
            <SelectTrigger><SelectValue placeholder="Select screen..." /></SelectTrigger>
            <SelectContent>
              {screens.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Start Time" error={errors.start} className="sm:col-span-2">
          <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          {endTime && <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1"><CalendarIcon className="size-3" /> Ends around {endTime} (including 30m cleaning buffer)</p>}
        </Field>

        <div className="sm:col-span-2 mt-2">
          <Label className="label-caps mb-3 block">Tier Pricing (₹)</Label>
          <div className="grid grid-cols-3 gap-4">
            {TIERS.map(tier => (
              <div key={tier}>
                <Label className="text-xs text-muted-foreground capitalize mb-1 block">{tier}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  value={prices[tier] || ''} 
                  onChange={e => setPrices(p => ({ ...p, [tier]: e.target.value }))} 
                />
              </div>
            ))}
          </div>
          {errors.prices && <p className="mt-1 text-xs text-crimson">{errors.prices}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={invalid || busy}>
          {busy && <Loader2 className="animate-spin" />}
          Schedule Show
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ShowDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Schedule a Show</DialogTitle>
          <DialogDescription>The scheduling engine will automatically prevent overlapping times on the same screen.</DialogDescription>
        </DialogHeader>
        {open && <ShowForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
