import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Poster } from './Poster'
import { useDb } from '@/store/db'

const EMPTY = { title: '', description: '', duration_min: '', rating: '', release_date: '', language: 'English', genre: '', cast: '', trailer_url: '', poster_url: '', archived: false }

const isUrl = (v) => {
  try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false }
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

function MovieForm({ movie, onClose }) {
  const { saveMovie, setMovieMeta, movieMeta } = useDb()
  const meta = movie ? movieMeta[movie.id] : null
  const [f, setF] = useState(
    movie ? { ...EMPTY, ...movie, genre: movie.genre.join(', '), cast: meta?.cast ?? '', archived: !!meta?.archived, rating: movie.rating ?? '' } : EMPTY,
  )
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target?.value ?? e }))

  const errors = {
    title: !f.title.trim() && 'Title is required',
    duration_min: !(Number(f.duration_min) > 0) && 'Enter the runtime in minutes',
    rating: f.rating !== '' && !(Number(f.rating) >= 0 && Number(f.rating) <= 10) && '0 – 10',
    poster_url: f.poster_url && !isUrl(f.poster_url) && 'Use a full http(s) link',
    trailer_url: f.trailer_url && !isUrl(f.trailer_url) && 'Use a full http(s) link',
  }
  const invalid = Object.values(errors).some(Boolean)

  const submit = async (e) => {
    e.preventDefault()
    if (invalid) return
    setBusy(true)
    try {
      const { cast, archived, ...rest } = f
      const data = {
        ...rest,
        title: f.title.trim(),
        duration_min: Number(f.duration_min),
        rating: f.rating === '' ? '' : Number(f.rating),
        genre: f.genre.split(',').map((g) => g.trim()).filter(Boolean),
      }
      const id = await saveMovie(data, movie?.id)
      setMovieMeta(id, { cast, archived })
      toast.success(movie ? 'Film updated' : 'Film added to the catalogue')
      onClose()
    } catch (err) {
      toast.error(`Could not save film: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_13rem]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2" error={errors.title}>
          <Input value={f.title} onChange={set('title')} placeholder="Dune: Part Two" autoFocus />
        </Field>
        <Field label="Synopsis" className="sm:col-span-2">
          <Textarea value={f.description} onChange={set('description')} rows={3} placeholder="A sweeping tale of…" />
        </Field>
        <Field label="Duration (mins)" error={errors.duration_min}>
          <Input type="number" min="1" value={f.duration_min} onChange={set('duration_min')} />
        </Field>
        <Field label="Rating (0–10)" error={errors.rating}>
          <Input type="number" min="0" max="10" step="0.1" value={f.rating} onChange={set('rating')} />
        </Field>
        <Field label="Release date">
          <Input type="date" value={f.release_date} onChange={set('release_date')} />
        </Field>
        <Field label="Language">
          <Input value={f.language} onChange={set('language')} />
        </Field>
        <Field label="Genres (comma separated)">
          <Input value={f.genre} onChange={set('genre')} placeholder="Sci-Fi, Adventure" />
        </Field>
        <Field label="Cast (comma separated)">
          <Input value={f.cast} onChange={set('cast')} placeholder="Zendaya, Timothée Chalamet" />
        </Field>
        <Field label="Trailer URL" className="sm:col-span-2" error={errors.trailer_url}>
          <Input value={f.trailer_url} onChange={set('trailer_url')} placeholder="https://…" />
        </Field>
        <Field label="Poster URL" className="sm:col-span-2" error={errors.poster_url}>
          <Input value={f.poster_url} onChange={set('poster_url')} placeholder="https://…" />
        </Field>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:col-span-2">
          <span>
            <span className="block text-sm font-medium">Archived</span>
            <span className="text-xs text-muted-foreground">Hide from the catalogue without deleting</span>
          </span>
          <Switch checked={f.archived} onCheckedChange={set('archived')} />
        </label>
      </div>

      <div className="order-first md:order-none">
        <p className="label-caps mb-2">Live preview</p>
        <Poster src={f.poster_url} title={f.title} className="aspect-[2/3] w-full max-w-52 rounded-xl border border-white/10 text-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]" />
        <p className="mt-3 line-clamp-2 text-sm font-medium">{f.title || 'Untitled film'}</p>
      </div>

      <DialogFooter className="md:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={invalid || busy}>
          {busy && <Loader2 className="animate-spin" />}
          {movie ? 'Save changes' : 'Add film'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function MovieDialog({ open, onOpenChange, movie }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{movie ? 'Edit film' : 'Add a film'}</DialogTitle>
          <DialogDescription>Catalogue details sync to the films API; cast and archive state are stored locally.</DialogDescription>
        </DialogHeader>
        <MovieForm movie={movie} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
