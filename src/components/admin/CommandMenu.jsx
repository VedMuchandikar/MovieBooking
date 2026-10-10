import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clapperboard, Ticket } from 'lucide-react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useDb, useUi } from '@/store/db'
import { NAV } from './Sidebar'

/** Cmd/Ctrl + K: jump to any page, film or booking. */
export function CommandMenu() {
  const { cmdOpen, setCmdOpen } = useUi()
  const navigate = useNavigate()
  const movies = useDb((s) => s.movies)
  const bookings = useDb((s) => s.bookings)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen(!useUi.getState().cmdOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCmdOpen])

  const go = (to) => {
    setCmdOpen(false)
    navigate(to)
  }

  return (
    <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen} title="Search" description="Jump to a page, film or booking" className="glass-strong sm:max-w-xl">
      <CommandInput placeholder="Search pages, films, booking IDs, emails…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results.</CommandEmpty>
        {NAV.map(({ section, items }) => (
          <CommandGroup key={section} heading={section}>
            {items.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} value={`page ${label}`} onSelect={() => go(to)}>
                <Icon className="text-gold" /> {label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandGroup heading="Films">
          {movies.slice(0, 40).map((m) => (
            <CommandItem key={m.id} value={`film ${m.title}`} onSelect={() => go(`/admin/movies?q=${encodeURIComponent(m.title)}`)}>
              <Clapperboard className="text-gold" /> {m.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Bookings">
          {bookings.slice(0, 120).map((b) => (
            <CommandItem key={b.id} value={`booking ${b.id} ${b.userEmail} ${b.userName}`} onSelect={() => go(`/admin/bookings?open=${b.id}`)}>
              <Ticket className="text-gold" />
              <span className="font-medium">{b.id}</span>
              <span className="truncate text-muted-foreground">{b.userEmail}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
