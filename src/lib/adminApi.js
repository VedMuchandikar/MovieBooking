/**
 * Centralized API client for CineShow Admin Portal
 * Connects directly to backend Express APIs (proxied via Vite to http://localhost:4000)
 */

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const req = async (path, opts = {}) => {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json().catch(() => ({}));
  } else {
    body = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const errorMsg = (body && (body.message || body.error)) || `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  return body;
};

// 1. MOVIES API
export const normalizeMovie = (r) => ({
  id: r.id,
  title: r.title ?? '',
  description: r.description ?? '',
  genre: Array.isArray(r.genre)
    ? r.genre
    : String(r.genre ?? '')
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
  language: r.language ?? '',
  duration_min: Number(r.duration_min) || 0,
  rating: r.rating == null ? null : Number(r.rating),
  poster_url: r.poster_url ?? '',
  trailer_url: r.trailer_url ?? '',
  release_date: r.release_date ? String(r.release_date).slice(0, 10) : '',
});

const toMovieBody = (m) => ({
  title: m.title,
  description: m.description,
  genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre,
  language: m.language,
  duration_min: Number(m.duration_min) || 0,
  rating: m.rating === '' || m.rating == null ? null : Number(m.rating),
  poster_url: m.poster_url,
  trailer_url: m.trailer_url,
  release_date: m.release_date || null,
});

export const moviesApi = {
  list: () => req('/movies').then((rows) => (Array.isArray(rows) ? rows.map(normalizeMovie) : [])),
  getById: (id) => req(`/movies/${id}`).then(normalizeMovie),
  create: (m) => req('/movies/create', { method: 'POST', body: JSON.stringify(toMovieBody(m)) }),
  update: (id, m) => req(`/movies/update/${id}`, { method: 'PUT', body: JSON.stringify(toMovieBody(m)) }),
  remove: (id) => req(`/movies/delete/${id}`, { method: 'DELETE' }),
};

// 2. THEATRES API
export const theatresApi = {
  list: () => req('/theatres'),
  getById: (id) => req(`/theatres/${id}`),
  create: (t) => req('/theatres/create', { method: 'POST', body: JSON.stringify(t) }),
  update: (id, t) => req(`/theatres/update/${id}`, { method: 'PUT', body: JSON.stringify(t) }),
  remove: (id) => req(`/theatres/delete/${id}`, { method: 'DELETE' }),
};

// 3. SCREENS & SEATS API
export const screensApi = {
  list: () => req('/screens'),
  getById: (id) => req(`/screens/${id}`),
  create: (sc) => req('/screens/create', { method: 'POST', body: JSON.stringify(sc) }),
  update: (id, sc) => req(`/screens/update/${id}`, { method: 'PUT', body: JSON.stringify(sc) }),
  remove: (id) => req(`/screens/screens/delete/${id}`, { method: 'DELETE' }).catch(() => req(`/screens/delete/${id}`, { method: 'DELETE' })),
  getSeats: (screenId) => req(`/screens/${screenId}/seats`),
};

export const seatsApi = {
  update: (id, s) => req(`/seats/update/${id}`, { method: 'PUT', body: JSON.stringify(s) }),
  remove: (id) => req(`/seats/delete/${id}`, { method: 'DELETE' }),
};

// 4. SHOWS API
export const showsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/shows${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => req(`/api/shows/${id}`),
  create: (show) => req('/api/shows', { method: 'POST', body: JSON.stringify(show) }),
  update: (id, show) => req(`/api/shows/${id}`, { method: 'PUT', body: JSON.stringify(show) }),
  remove: (id) => req(`/api/shows/${id}`, { method: 'DELETE' }),
};

// 5. BOOKINGS & PAYMENTS API (ADMIN)
export const bookingsApi = {
  listAll: () => req('/api/bookings'),
  getById: (id) => req(`/api/bookings/${id}`),
};

export const paymentsApi = {
  getByBooking: (bookingId) => req(`/api/payments/booking/${bookingId}`),
};

// 6. ADMIN DASHBOARD STATS API
export const adminApi = {
  getDashboard: () => req('/api/admin/dashboard'),
};

export default {
  movies: moviesApi,
  theatres: theatresApi,
  screens: screensApi,
  seats: seatsApi,
  shows: showsApi,
  bookings: bookingsApi,
  payments: paymentsApi,
  admin: adminApi,
};
