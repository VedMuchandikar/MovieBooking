import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  moviesApi,
  theatresApi,
  screensApi,
  showsApi,
  bookingsApi,
  adminApi,
  seatsApi,
} from '@/lib/adminApi'
import { buildLayout, dayKey, findConflict } from '@/lib/schedule'
import { seedMovies, seedState } from './seed'

const nextId = (arr) => arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1

/**
 * Unified data layer for CineShow Admin Portal.
 * Syncs seamlessly with PostgreSQL Express backend (Movies, Theatres, Screens, Shows, Bookings, Dashboard).
 */
export const useDb = create(
  persist(
    (set, get) => ({
      ...seedState(),
      seededOn: dayKey(new Date()),
      movies: [],
      moviesOnline: false,
      moviesLoading: false,

      // Live backend tracking states
      theatresOnline: false,
      theatresLoading: false,
      screensOnline: false,
      showsOnline: false,
      showsLoading: false,
      bookingsOnline: false,
      bookingsLoading: false,
      dashboardStats: null,

      // ---------- MOVIES (Live API) ----------
      loadMovies: async () => {
        set({ moviesLoading: true })
        try {
          const list = await moviesApi.list()
          set({ movies: list, moviesOnline: true })
        } catch (err) {
          console.warn('Movies API unavailable:', err.message)
          set({ moviesOnline: false })
        } finally {
          set({ moviesLoading: false })
        }
      },
      saveMovie: async (data, id) => {
        if (get().moviesOnline) {
          const row = id ? await moviesApi.update(id, data) : await moviesApi.create(data)
          await get().loadMovies()
          return id ?? row?.id
        }
        const newId = id ?? nextId(get().movies)
        set((s) => ({
          movies: id
            ? s.movies.map((m) => (m.id === id ? { ...m, ...data } : m))
            : [{ ...data, id: newId }, ...s.movies],
        }))
        return newId
      },
      deleteMovie: async (id) => {
        if (get().moviesOnline) {
          await moviesApi.remove(id)
          await get().loadMovies()
        } else {
          set((s) => ({ movies: s.movies.filter((m) => m.id !== id) }))
        }
      },
      setMovieMeta: (id, patch) =>
        set((s) => ({ movieMeta: { ...s.movieMeta, [id]: { ...s.movieMeta[id], ...patch } } })),

      // ---------- THEATRES & SCREENS (Live API) ----------
      loadTheatres: async () => {
        set({ theatresLoading: true })
        try {
          const [tRows, scRows] = await Promise.all([
            theatresApi.list().catch(() => null),
            screensApi.list().catch(() => null),
          ])

          if (Array.isArray(tRows) && tRows.length > 0) {
            set({
              theatres: tRows.map((t) => ({
                id: Number(t.id),
                name: t.name,
                city: t.city,
                address: t.address || '',
              })),
              theatresOnline: true,
            })
          }

          if (Array.isArray(scRows) && scRows.length > 0) {
            const screensWithSeats = await Promise.all(
              scRows.map(async (sc) => {
                let rows = null
                try {
                  const seatsList = await screensApi.getSeats(sc.id)
                  if (Array.isArray(seatsList) && seatsList.length > 0) {
                    const rowMap = new Map()
                    for (const s of seatsList) {
                      const rLabel = s.row_label
                      if (!rowMap.has(rLabel)) {
                        rowMap.set(rLabel, { label: rLabel, tier: s.tier || 'regular', seats: [] })
                      }
                      rowMap.get(rLabel).seats.push({
                        n: Number(s.seat_number),
                        state: 'ok',
                        id: s.id,
                      })
                    }
                    rows = Array.from(rowMap.values()).sort((a, b) => a.label.localeCompare(b.label))
                  }
                } catch {
                  // Fallback to default layout
                }
                return {
                  id: Number(sc.id),
                  theatreId: Number(sc.theatre_id),
                  name: sc.name,
                  format: sc.format || 'Standard',
                  rows: rows || buildLayout(8, 10),
                }
              })
            )
            set({ screens: screensWithSeats, screensOnline: true })
          }
        } catch (err) {
          console.warn('Theatres/Screens load failed:', err.message)
        } finally {
          set({ theatresLoading: false })
        }
      },

      saveTheatre: async (t, id) => {
        try {
          if (id) {
            await theatresApi.update(id, t)
          } else {
            await theatresApi.create(t)
          }
          await get().loadTheatres()
          return id ?? get().theatres[get().theatres.length - 1]?.id
        } catch (err) {
          console.warn('Fallback saving theatre locally:', err.message)
          const newId = id ?? nextId(get().theatres)
          set((s) => ({
            theatres: id
              ? s.theatres.map((x) => (x.id === id ? { ...x, ...t } : x))
              : [...s.theatres, { ...t, id: newId }],
          }))
          return newId
        }
      },

      deleteTheatre: async (id) => {
        const { screens, shows } = get()
        const ids = screens.filter((s) => s.theatreId === id).map((s) => s.id)
        if (shows.some((s) => ids.includes(s.screenId))) {
          return 'This theatre has shows on its screens. Cancel and clear them first.'
        }
        try {
          await theatresApi.remove(id)
          await get().loadTheatres()
          return null
        } catch (err) {
          console.warn('Fallback deleting theatre locally:', err.message)
          set((s) => ({
            theatres: s.theatres.filter((t) => t.id !== id),
            screens: s.screens.filter((x) => x.theatreId !== id),
          }))
          return null
        }
      },

      saveScreen: async (sc, id) => {
        try {
          if (id) {
            await screensApi.update(id, { name: sc.name, theatre_id: sc.theatreId })
          } else {
            await screensApi.create({ name: sc.name, theatre_id: sc.theatreId })
          }
          await get().loadTheatres()
          return id ?? get().screens[get().screens.length - 1]?.id
        } catch (err) {
          console.warn('Fallback saving screen locally:', err.message)
          const newId = id ?? nextId(get().screens)
          set((s) => ({
            screens: id
              ? s.screens.map((x) => (x.id === id ? { ...x, ...sc } : x))
              : [...s.screens, { ...sc, id: newId, rows: buildLayout(8, 10) }],
          }))
          return newId
        }
      },

      saveLayout: (screenId, rows) =>
        set((s) => ({ screens: s.screens.map((x) => (x.id === screenId ? { ...x, rows } : x)) })),

      deleteScreen: async (id) => {
        if (get().shows.some((s) => s.screenId === id)) {
          return 'This screen has shows scheduled. Cancel and clear them first.'
        }
        try {
          await screensApi.remove(id)
          await get().loadTheatres()
          return null
        } catch (err) {
          console.warn('Fallback deleting screen locally:', err.message)
          set((s) => ({ screens: s.screens.filter((x) => x.id !== id) }))
          return null
        }
      },

      // ---------- SHOWS (Live API) ----------
      loadShows: async () => {
        set({ showsLoading: true })
        try {
          const list = await showsApi.list()
          const rows = Array.isArray(list) ? list : list?.shows || []
          if (rows.length > 0) {
            const mapped = rows.map((sh) => {
              const movieObj = get().movies.find((m) => m.id === Number(sh.movie_id))
              return {
                id: Number(sh.id),
                screenId: Number(sh.screen_id),
                start: sh.start_time,
                status: sh.status || 'SCHEDULED',
                movie: {
                  id: Number(sh.movie_id),
                  title: sh.movie_title || movieObj?.title || 'Unknown Film',
                  poster: sh.poster_url || movieObj?.poster_url || '',
                  duration: Number(sh.duration_min) || movieObj?.duration_min || 120,
                },
                prices: {
                  regular: Number(sh.price_regular) || 150,
                  premium: Number(sh.price_premium) || 250,
                  recliner: Number(sh.price_recliner) || 400,
                },
              }
            })
            set({ shows: mapped, showsOnline: true })
          }
        } catch (err) {
          console.warn('Shows API unavailable, using local cache:', err.message)
        } finally {
          set({ showsLoading: false })
        }
      },

      saveShow: async (data, id) => {
        const clash = findConflict(get().shows, {
          screenId: data.screenId,
          start: data.start,
          duration: data.movie.duration,
          ignoreId: id,
        })
        if (clash) {
          return { error: `Overlaps “${clash.movie.title}” on this screen (runtime + 30 min cleaning buffer).` }
        }

        const payload = {
          movie_id: Number(data.movie.id),
          screen_id: Number(data.screenId),
          start_time: data.start,
          price_regular: data.prices.regular,
          price_premium: data.prices.premium,
          price_recliner: data.prices.recliner,
        }

        try {
          if (id) {
            await showsApi.update(id, payload)
          } else {
            await showsApi.create(payload)
          }
          await get().loadShows()
          return { ok: true }
        } catch (err) {
          console.warn('Fallback saving show locally:', err.message)
          set((s) => ({
            shows: id
              ? s.shows.map((x) => (x.id === id ? { ...x, ...data } : x))
              : [...s.shows, { ...data, id: nextId(s.shows), status: 'SCHEDULED' }],
          }))
          return { ok: true }
        }
      },

      cancelShow: async (id) => {
        try {
          await showsApi.remove(id)
        } catch (err) {
          console.warn('Live show deletion failed, canceling locally:', err.message)
        }
        const flagged = get().bookings.filter((b) => b.showId === id && b.status === 'CONFIRMED').length
        set((s) => ({
          shows: s.shows.map((x) => (x.id === id ? { ...x, status: 'CANCELLED' } : x)),
          bookings: s.bookings.map((b) =>
            b.showId === id && b.status === 'CONFIRMED' ? { ...b, status: 'REFUND_PENDING' } : b
          ),
          blocks: { ...s.blocks, [id]: [] },
        }))
        return flagged
      },

      // ---------- BOOKINGS (Live API) ----------
      loadBookings: async () => {
        set({ bookingsLoading: true })
        try {
          const list = await bookingsApi.listAll()
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((b) => ({
              id: `BKG-${b.id}`,
              numericId: b.id,
              showId: Number(b.show_id),
              userName: b.customer_name || 'Patron',
              userEmail: b.customer_email || 'patron@example.com',
              userPhone: b.customer_phone || '+91 98765 43210',
              seats: Array.isArray(b.seat_ids) ? b.seat_ids : ['A1'],
              total: Number(b.total_amount) || 0,
              status: b.status || 'CONFIRMED',
              createdAt: b.created_at || new Date().toISOString(),
              ticketCode: b.ticket_code,
              movieTitle: b.movie_title,
              theatreName: b.theatre_name,
              screenName: b.screen_name,
            }))
            set({ bookings: mapped, bookingsOnline: true })
          }
        } catch (err) {
          console.warn('Bookings API unavailable or unauthorized, using local cache:', err.message)
        } finally {
          set({ bookingsLoading: false })
        }
      },

      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)),
        })),

      toggleBlock: (showId, seat) =>
        set((s) => {
          const cur = s.blocks[showId] ?? []
          return { blocks: { ...s.blocks, [showId]: cur.includes(seat) ? cur.filter((x) => x !== seat) : [...cur, seat] } }
        }),

      // ---------- DASHBOARD METRICS (Live API) ----------
      loadDashboardStats: async () => {
        try {
          const stats = await adminApi.getDashboard()
          set({ dashboardStats: stats })
        } catch (err) {
          console.warn('Dashboard stats API unavailable:', err.message)
        }
      },

      // ---------- STAFF & SETTINGS ----------
      saveStaff: (m, id) =>
        set((s) => ({
          staff: id
            ? s.staff.map((x) => (x.id === id ? { ...x, ...m } : x))
            : [...s.staff, { ...m, id: nextId(s.staff), active: true }],
        })),
      toggleStaff: (id) =>
        set((s) => ({
          staff: s.staff.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
        })),
      saveSettings: (settings) => set({ settings }),
      resetDemo: () => set({ ...seedState(), seededOn: dayKey(new Date()) }),
    }),
    {
      name: 'cineverse-live-v2',
      partialize: ({
        moviesOnline,
        moviesLoading,
        theatresOnline,
        theatresLoading,
        screensOnline,
        showsOnline,
        showsLoading,
        bookingsOnline,
        bookingsLoading,
        dashboardStats,
        ...rest
      }) => rest,
      merge: (persisted, current) =>
        persisted?.seededOn === current.seededOn
          ? { ...current, ...persisted }
          : { ...current, movies: persisted?.movies ?? [] },
    }
  )
)

export const useUi = create((set) => ({
  navOpen: false,
  cmdOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  setCmdOpen: (cmdOpen) => set({ cmdOpen }),
}))
