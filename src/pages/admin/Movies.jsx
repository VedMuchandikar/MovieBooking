import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Archive, ArchiveRestore, Clock, Globe, LayoutGrid, List, MoreHorizontal, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Poster } from '@/components/admin/Poster'
import { StatusPill } from '@/components/admin/StatusPill'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { MovieDialog } from '@/components/admin/MovieDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { runtime } from '@/lib/format'
import { movieStatus } from '@/lib/schedule'
import { useDb } from '@/store/db'

const Genres = ({ list }) => (
  <div className="flex flex-wrap gap-1">
    {list.slice(0, 3).map((g) => (
      <Badge key={g} variant="outline" className="border-white/10 text-[10px] font-medium text-muted-foreground">{g}</Badge>
    ))}
  </div>
)

function RowMenu({ movie, status, onEdit, onArchive, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${movie.title}`} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={onEdit}><Pencil /> Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchive}>
          {status === 'Archived' ? <ArchiveRestore /> : <Archive />}
          {status === 'Archived' ? 'Restore' : 'Archive'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Movies() {
  const { movies, movieMeta, moviesLoading, moviesOnline, setMovieMeta, deleteMovie } = useDb()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')
  const [editing, setEditing] = useState(null) // movie | 'new' | null
  const [deleting, setDeleting] = useState(null)

  const rows = useMemo(
    () =>
      movies
        .map((m) => ({ ...m, status: movieStatus(m, movieMeta[m.id]) }))
        .filter((m) => (status === 'all' || m.status === status) && (m.title.toLowerCase().includes(q.toLowerCase()) || m.genre.join(' ').toLowerCase().includes(q.toLowerCase()))),
    [movies, movieMeta, q, status],
  )

  const toggleArchive = (m) => {
    setMovieMeta(m.id, { archived: m.status !== 'Archived' })
    toast.success(m.status === 'Archived' ? `${m.title} restored` : `${m.title} archived`)
  }
  const confirmDelete = async () => {
    try {
      await deleteMovie(deleting.id)
      toast.success(`${deleting.title} deleted`)
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`)
    }
  }
  const menu = (m) => <RowMenu movie={m} status={m.status} onEdit={() => setEditing(m)} onArchive={() => toggleArchive(m)} onDelete={() => setDeleting(m)} />

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Film Catalogue" description="Curate what plays. Posters, runtimes and release windows, with archive instead of delete.">
        <Button onClick={() => setEditing('new')}><Plus /> Add film</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/70" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or genre" className="pl-9" aria-label="Search films" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Now Showing">Now Showing</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:block">{moviesOnline ? 'Live API' : 'Demo data'} · {rows.length} films</span>
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {[['grid', LayoutGrid], ['table', List]].map(([v, Icon]) => (
              <Button key={v} variant={view === v ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={() => setView(v)} aria-label={`${v} view`}>
                <Icon className="size-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {moviesLoading && movies.length === 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)}
        </div>
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
            {rows.map((m) => (
              <article key={m.id} className="rise glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:border-gold/30">
                <div className="relative">
                  <Poster src={m.poster_url} title={m.title} className="aspect-[2/3] w-full text-4xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-transparent" />
                  <div className="absolute left-3 top-3"><StatusPill status={m.status} /></div>
                  {m.rating != null && (
                    <span className="glass-strong absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-gold">
                      <Star className="size-3 fill-current" /> {m.rating}
                    </span>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug">{m.title}</h3>
                    {menu(m)}
                  </div>
                  <Genres list={m.genre} />
                  <p className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Globe className="size-3" /> {m.language || '—'}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {runtime(m.duration_min)}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
          {rows.length === 0 && <p className="py-20 text-center text-sm text-muted-foreground">No films match these filters.</p>}
        </>
      ) : (
        <DataTable
          rows={rows}
          empty="No films match these filters."
          onRowClick={setEditing}
          columns={[
            {
              key: 'title',
              header: 'Film',
              cell: (m) => (
                <div className="flex items-center gap-3">
                  <Poster src={m.poster_url} title={m.title} className="h-14 w-10 shrink-0 rounded-md border border-white/10 text-xs" />
                  <div><p className="font-medium">{m.title}</p><p className="text-xs text-muted-foreground">Released {m.release_date || '—'}</p></div>
                </div>
              ),
            },
            { key: 'genre', header: 'Genres', cell: (m) => <Genres list={m.genre} /> },
            { key: 'language', header: 'Language' },
            { key: 'duration_min', header: 'Runtime', cell: (m) => runtime(m.duration_min) },
            { key: 'rating', header: 'Rating', cell: (m) => (m.rating == null ? '—' : <span className="flex items-center gap-1 text-gold"><Star className="size-3 fill-current" />{m.rating}</span>) },
            { key: 'status', header: 'Status', cell: (m) => <StatusPill status={m.status} /> },
            { key: 'actions', header: '', className: 'w-12 text-right', cell: menu },
          ]}
        />
      )}

      <MovieDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} movie={editing === 'new' ? null : editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="This removes the film permanently. Consider archiving instead, which hides it without losing history."
        confirmLabel="Delete film"
        destructive
        onConfirm={confirmDelete}
      />
    </>
  )
}
