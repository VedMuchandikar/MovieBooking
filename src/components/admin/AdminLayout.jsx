import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useDb, useUi } from '@/store/db'
import { CommandMenu } from './CommandMenu'
import { NavContent, Sidebar } from './Sidebar'

function Topbar() {
  const { setNavOpen, setCmdOpen } = useUi()
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
  return (
    <div className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-3 border-x-0 border-t-0 px-4 sm:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      <button
        type="button"
        onClick={() => setCmdOpen(true)}
        className="group flex h-10 w-full max-w-md items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 text-sm text-muted-foreground transition-colors hover:border-gold/30"
      >
        <Search className="size-4 text-gold/70" />
        <span className="flex-1 truncate text-left">Search films, bookings, pages…</span>
        <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] tracking-wider">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium">Aurelia Voss</p>
          <p className="label-caps text-[10px] text-gold/70">Administrator</p>
        </div>
        <div className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/25 to-transparent font-display text-sm text-gold">AV</div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const loadMovies = useDb((s) => s.loadMovies)
  const { navOpen, setNavOpen } = useUi()
  const { pathname } = useLocation()

  useEffect(() => { loadMovies() }, [loadMovies])
  useEffect(() => setNavOpen(false), [pathname, setNavOpen])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen">
        <Sidebar />
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Admin sections</SheetDescription>
            <NavContent onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandMenu />
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
