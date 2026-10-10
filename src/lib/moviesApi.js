// Real backend: backend/ (Express + Neon). Only /movies exists there today.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const req = async (path, opts = {}) => {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000),
    ...opts,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || res.statusText)
  return body
}

/** DB row -> UI shape. genre may be "A, B" (text) or an array. */
export const normalizeMovie = (r) => ({
  id: r.id,
  title: r.title ?? '',
  description: r.description ?? '',
  genre: Array.isArray(r.genre) ? r.genre : String(r.genre ?? '').split(',').map((g) => g.trim()).filter(Boolean),
  language: r.language ?? '',
  duration_min: Number(r.duration_min) || 0,
  rating: r.rating == null ? null : Number(r.rating),
  poster_url: r.poster_url ?? '',
  trailer_url: r.trailer_url ?? '',
  release_date: r.release_date ? String(r.release_date).slice(0, 10) : '',
})

const toBody = (m) => ({ ...m, genre: m.genre.join(', '), rating: m.rating === '' ? null : m.rating })

export const moviesApi = {
  list: () => req('/movies').then((rows) => rows.map(normalizeMovie)),
  create: (m) => req('/movies/create', { method: 'POST', body: JSON.stringify(toBody(m)) }),
  update: (id, m) => req(`/movies/update/${id}`, { method: 'PUT', body: JSON.stringify(toBody(m)) }),
  remove: (id) => req(`/movies/delete/${id}`, { method: 'DELETE' }),
}
