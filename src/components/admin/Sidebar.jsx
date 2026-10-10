import { NavLink } from 'react-router-dom'
import { BarChart3, Building2, CalendarClock, Clapperboard, Settings, ShieldCheck, Ticket, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDb } from '@/store/db'

export const NAV = [
  { section: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 }] },
  { section: 'Catalogue', items: [{ to: '/admin/movies', label: 'Films', icon: Clapperboard }] },
  {
    section: 'Operations',
    items: [
      { to: '/admin/theatres', label: 'Theatres & Screens', icon: Building2 },
      { to: '/admin/shows', label: 'Shows', icon: CalendarClock },
      { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
    ],
  },
  {
    section: 'Security',
    items: [
      { to: '/admin/staff', label: 'Staff', icon: ShieldCheck },
      { to: '/admin/entry-logs', label: 'Gate Logs', icon: ScanLine },
    ],
  },
  { section: 'Settings', items: [{ to: '/admin/settings', label: 'Platform Rules', icon: Settings }] },
]

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold/20 to-transparent font-display text-lg text-gold">C</div>
      <div className="leading-tight">
        <p className="gold-text font-display text-lg font-semibold tracking-wide">CINEVERSE</p>
        <p className="label-caps text-[10px] tracking-[0.3em]">Maison · Admin</p>
      </div>
    </div>
  )
}

export function NavContent({ onNavigate }) {
  const online = useDb((s) => s.moviesOnline)
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7"><Brand /></div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="label-caps px-3 pb-2 text-[10px]">{section}</p>
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground',
                        isActive && 'bg-gold/[0.07] text-gold hover:bg-gold/[0.07] hover:text-gold',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute inset-y-2 -left-3 w-0.5 rounded-full bg-gold shadow-[0_0_12px_rgba(230,198,135,0.8)]" />}
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', online ? 'bg-emerald shadow-[0_0_8px_var(--emerald)]' : 'bg-gold')} />
          <span className="font-medium">{online ? 'Films API · live' : 'Films API · offline'}</span>
        </div>
        <p className="mt-1 text-muted-foreground">{online ? 'Catalogue syncs with Postgres.' : 'Showing demo catalogue.'}</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 border-y-0 border-l-0 lg:block">
      <NavContent />
    </aside>
  )
}
