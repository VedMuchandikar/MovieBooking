import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { moviesApi } from '@/lib/moviesApi'
import { buildLayout, dayKey, findConflict } from '@/lib/schedule'
import { seedMovies, seedState } from './seed'

const nextId = (arr) => arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1

/**
 * Single data layer. Movies hit the real Express API (falling back to demo data when it is unreachable);
 * everything else is a localStorage-persisted mock. Each action below is the seam to swap for a real endpoint.
 */
export const useDb = create(
  persist(
    (set, get) => ({
      ...seedState(),
      seededOn: dayKey(new Date()),
      movies: [],
      moviesOnline: false,
      moviesLoading: false,

      // ---------- movies (real API) ----------
      loadMovies: async () => {
        set({ moviesLoading: true })
        try {
          set({ movies: await moviesApi.list(), moviesOnline: true })
        } catch {
          set((s) => ({ moviesOnline: false, movies: s.movies.length ? s.movies : seedMovies() }))
        } finally {
          set({ moviesLoading: false })
        }
      },
      saveMovie: async (data, id) => {
        if (get().moviesOnline) {
          const row = id ? await moviesApi.update(id, data) : await moviesApi.create(data)
          await get().loadMovies()
          return id ?? row.id
        }
        const newId = id ?? nextId(get().movies)
        set((s) => ({ movies: id ? s.movies.map((m) => (m.id === id ? { ...m, ...data } : m)) : [{ ...data, id: newId }, ...s.movies] }))
        return newId
      },
      deleteMovie: async (id) => {
        if (get().moviesOnline) {
          await moviesApi.remove(id)
          await get().loadMovies()
        } else set((s) => ({ movies: s.movies.filter((m) => m.id !== id) }))
      },
      setMovieMeta: (id, patch) => set((s) => ({ movieMeta: { ...s.movieMeta, [id]: { ...s.movieMeta[id], ...patch } } })),

      // ---------- theatres & screens ----------
      saveTheatre: (t, id) => {
        const newId = id ?? nextId(get().theatres)
        set((s) => ({ theatres: id ? s.theatres.map((x) => (x.id === id ? { ...x, ...t } : x)) : [...s.theatres, { ...t, id: newId }] }))
        return newId
      },
      /** Returns an error string, or null when deleted. */
      deleteTheatre: (id) => {
        const { screens, shows } = get()
        const ids = screens.filter((s) => s.theatreId === id).map((s) => s.id)
        if (shows.some((s) => ids.includes(s.screenId))) return 'This theatre has shows on its screens. Cancel and clear them first.'
        set((s) => ({ theatres: s.theatres.filter((t) => t.id !== id), screens: s.screens.filter((x) => x.theatreId !== id) }))
        return null
      },
      saveScreen: (sc, id) => {
        const newId = id ?? nextId(get().screens)
        set((s) => ({
          screens: id ? s.screens.map((x) => (x.id === id ? { ...x, ...sc } : x)) : [...s.screens, { ...sc, id: newId, rows: buildLayout(8, 10) }],
        }))
        return newId
      },
      saveLayout: (screenId, rows) => set((s) => ({ screens: s.screens.map((x) => (x.id === screenId ? { ...x, rows } : x)) })),
      deleteScreen: (id) => {
        if (get().shows.some((s) => s.screenId === id)) return 'This screen has shows scheduled. Cancel and clear them first.'
        set((s) => ({ screens: s.screens.filter((x) => x.id !== id) }))
        return null
      },

      // ---------- shows ----------
      /** data: { movie:{id,title,poster,duration}, screenId, start(ISO), prices }. Returns { error } on screen conflict. */
      saveShow: (data, id) => {
        const clash = findConflict(get().shows, { screenId: data.screenId, start: data.start, duration: data.movie.duration, ignoreId: id })
        if (clash) return { error: `Overlaps “${clash.movie.title}” on this screen (runtime + 30 min cleaning buffer).` }
        set((s) => ({
          shows: id ? s.shows.map((x) => (x.id === id ? { ...x, ...data } : x)) : [...s.shows, { ...data, id: nextId(s.shows), status: 'SCHEDULED' }],
        }))
        return { ok: true }
      },
      /** Cancels the show, flags its live bookings for refund and frees every seat. Returns flagged count. */
      cancelShow: (id) => {
        const flagged = get().bookings.filter((b) => b.showId === id && b.status === 'CONFIRMED').length
        set((s) => ({
          shows: s.shows.map((x) => (x.id === id ? { ...x, status: 'CANCELLED' } : x)),
          bookings: s.bookings.map((b) => (b.showId === id && b.status === 'CONFIRMED' ? { ...b, status: 'REFUND_PENDING' } : b)),
          blocks: { ...s.blocks, [id]: [] },
        }))
        return flagged
      },

      // ---------- bookings & seats ----------
      cancelBooking: (id) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)) })),
      toggleBlock: (showId, seat) =>
        set((s) => {
          const cur = s.blocks[showId] ?? []
          return { blocks: { ...s.blocks, [showId]: cur.includes(seat) ? cur.filter((x) => x !== seat) : [...cur, seat] } }
        }),

      // ---------- staff & settings ----------
      saveStaff: (m, id) => set((s) => ({ staff: id ? s.staff.map((x) => (x.id === id ? { ...x, ...m } : x)) : [...s.staff, { ...m, id: nextId(s.staff), active: true }] })),
      toggleStaff: (id) => set((s) => ({ staff: s.staff.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) })),
      saveSettings: (settings) => set({ settings }),
      resetDemo: () => set({ ...seedState(), seededOn: dayKey(new Date()) }),
    }),
    {
      name: 'cineverse-maison-v1',
      partialize: ({ moviesOnline, moviesLoading, ...rest }) => rest,
      // demo data is relative to "today": a stale snapshot from an earlier day is replaced by a fresh seed
      merge: (persisted, current) => (persisted?.seededOn === current.seededOn ? { ...current, ...persisted } : { ...current, movies: persisted?.movies ?? [] }),
    },
  ),
)

export const useUi = create((set) => ({
  navOpen: false,
  cmdOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  setCmdOpen: (cmdOpen) => set({ cmdOpen }),
}))
