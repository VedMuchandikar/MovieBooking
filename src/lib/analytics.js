import { capacity, dayKey } from './schedule'

const sum = (xs, f) => xs.reduce((n, x) => n + f(x), 0)
const confirmed = (b) => b.status === 'CONFIRMED'

/** Today's headline numbers (bookings counted by the day they were made). */
export function kpis(s) {
  const today = dayKey(new Date())
  const todays = s.bookings.filter((b) => confirmed(b) && dayKey(b.createdAt) === today)
  return {
    bookings: todays.length,
    revenue: sum(todays, (b) => b.amount),
    users: s.totalUsers,
    activeShows: s.shows.filter((x) => x.status === 'SCHEDULED' && dayKey(x.start) === today).length,
  }
}

/** Daily revenue: closed-book history for older days, live bookings for yesterday and today. */
export function revenueSeries(s, days) {
  const hist = Object.fromEntries(s.history.map((h) => [h.date, h]))
  return Array.from({ length: days }, (_, k) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - k))
    const key = dayKey(d)
    const h = hist[key]
    const live = h ? null : s.bookings.filter((b) => confirmed(b) && dayKey(b.createdAt) === key)
    return {
      key,
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: h ? h.revenue : sum(live, (b) => b.amount),
      bookings: h ? h.bookings : live.length,
    }
  })
}

/** Best titles by tickets sold: 28 days of history + screenings up to today. Occupancy = sold / capacity. */
export function topTitles(s, limit = 5) {
  const today = dayKey(new Date())
  const acc = {}
  const row = (title) => (acc[title] ??= { title, tickets: 0, revenue: 0, cap: 0, poster: '' })
  s.history.forEach((h) => Object.entries(h.byTitle).forEach(([t, [tk, rev, cap]]) => { const r = row(t); r.tickets += tk; r.revenue += rev; r.cap += cap }))
  const screens = Object.fromEntries(s.screens.map((x) => [x.id, x]))
  for (const show of s.shows) {
    const r = row(show.movie.title)
    r.poster = show.movie.poster
    if (show.status === 'CANCELLED' || dayKey(show.start) > today) continue
    const mine = s.bookings.filter((b) => b.showId === show.id && confirmed(b))
    r.tickets += sum(mine, (b) => b.seats.length)
    r.revenue += sum(mine, (b) => b.amount)
    r.cap += capacity(screens[show.screenId])
  }
  const byTitle = Object.fromEntries(s.movies.map((m) => [m.title, m.poster_url]))
  return Object.values(acc)
    .map((r) => ({ ...r, poster: byTitle[r.title] || r.poster, occupancy: r.cap ? Math.min(100, Math.round((r.tickets / r.cap) * 100)) : 0 }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, limit)
}

/** seatId -> { status: 'booked' | 'blocked', booking? } for one show. Booked wins over blocked. */
export function seatStates(s, show) {
  const map = new Map((s.blocks[show.id] ?? []).map((id) => [id, { status: 'blocked' }]))
  s.bookings
    .filter((b) => b.showId === show.id && confirmed(b))
    .forEach((b) => b.seats.forEach((id) => map.set(id, { status: 'booked', booking: b })))
  return map
}

export function showOccupancy(s, show) {
  const sc = s.screens.find((x) => x.id === show.screenId)
  const cap = capacity(sc)
  const booked = sum(s.bookings.filter((b) => b.showId === show.id && confirmed(b)), (b) => b.seats.length)
  return { cap, booked, pct: cap ? Math.round((booked / cap) * 100) : 0 }
}
