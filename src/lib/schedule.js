// Pure scheduling + status helpers (no React, no store) so they can be checked with plain `node`.

export const BUFFER_MIN = 30
export const TIERS = ['regular', 'premium', 'recliner']

const pad = (n) => String(n).padStart(2, '0')

/** Local yyyy-mm-dd for a Date / ISO string. */
export const dayKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

/** A show blocks its screen from start until runtime + cleaning buffer elapses. */
export const showEnd = (startISO, durationMin) =>
  new Date(new Date(startISO).getTime() + (Number(durationMin) + BUFFER_MIN) * 60_000)

/** First active show on the same screen whose [start, end+buffer) window overlaps the candidate. */
export function findConflict(shows, { screenId, start, duration, ignoreId }) {
  const s = new Date(start).getTime()
  const e = showEnd(start, duration).getTime()
  return shows.find((x) => {
    if (x.status === 'CANCELLED' || x.id === ignoreId || x.screenId !== screenId) return false
    const xs = new Date(x.start).getTime()
    const xe = showEnd(x.start, x.movie.duration).getTime()
    return s < xe && xs < e
  })
}

/** Archived is a manual flag; Upcoming/Now Showing are derived from release_date. */
export const movieStatus = (movie, meta, now = new Date()) => {
  if (meta?.archived) return 'Archived'
  return movie.release_date && movie.release_date > dayKey(now) ? 'Upcoming' : 'Now Showing'
}

export const seatId = (row, seat) => `${row.label}${seat.n}`
export const capacity = (screen) =>
  screen ? screen.rows.reduce((n, r) => n + r.seats.filter((s) => s.state === 'ok').length, 0) : 0

/** rows x perRow grid; first rows regular, middle premium, back rows recliner. One aisle gap mid-row. */
export function buildLayout(rowCount, perRow, tiers) {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const gap = Math.floor(perRow / 2)
  return Array.from({ length: rowCount }, (_, i) => ({
    label: labels[i],
    tier: tiers?.[i] ?? (i >= rowCount - 2 ? 'recliner' : i >= Math.ceil(rowCount / 2) - 1 ? 'premium' : 'regular'),
    seats: Array.from({ length: perRow }, (_, j) => ({ n: j + 1, state: j + 1 === gap && perRow > 4 ? 'aisle' : 'ok' })),
  }))
}
