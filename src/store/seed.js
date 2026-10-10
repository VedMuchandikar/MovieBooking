import { buildLayout, dayKey, seatId } from '@/lib/schedule'

// ---------- tiny seeded RNG so the demo data is stable per day ----------
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x }
const isoDate = (d) => dayKey(d)

const POSTER = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`

export function seedMovies() {
  const today = new Date()
  const m = (id, title, genre, language, duration_min, rating, photo, release_date, description) => ({
    id, title, genre, language, duration_min, rating, poster_url: POSTER(photo), release_date, description,
    trailer_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`,
  })
  return [
    m(1, 'Dune: Part Two', ['Sci-Fi', 'Adventure'], 'English', 166, 8.8, '1534447677768-be436bb09401', '2024-03-01', 'Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family.'),
    m(2, 'Oppenheimer', ['Biography', 'Drama'], 'English', 180, 8.9, '1578328819058-b69f3a3b0f6b', '2023-07-21', 'The story of J. Robert Oppenheimer and the development of the atomic bomb.'),
    m(3, 'Interstellar', ['Sci-Fi', 'Drama'], 'English', 169, 8.7, '1451187580459-43490279c0fa', '2024-09-27', 'A team of explorers travels through a wormhole in search of a new home for humanity.'),
    m(4, 'Spider-Verse: Across', ['Animation', 'Action'], 'English', 140, 8.7, '1635805737707-575885ab0820', '2023-06-02', 'Miles Morales catapults across the Multiverse and meets a team of Spider-People.'),
    m(5, 'Deadpool & Wolverine', ['Action', 'Comedy'], 'English', 128, 8.2, '1568832359672-e36cf5d74f54', '2024-07-26', 'A listless Wade Wilson is recruited by the TVA, and an unlikely alliance is forged.'),
    m(6, 'Kalki 2898 AD', ['Sci-Fi', 'Action'], 'Telugu', 181, 8.1, '1518709268805-4e9042af9f23', '2024-06-27', 'A modern-day avatar of Vishnu is born in a post-apocalyptic world.'),
    m(7, 'The Batman', ['Action', 'Crime'], 'English', 176, 7.9, '1509198397868-475647b2a1e5', '2022-03-04', 'Batman ventures into Gotham City’s underworld when a sadistic killer leaves behind a trail of cryptic clues.'),
    m(8, 'Gladiator II', ['Action', 'Drama'], 'English', 148, 8.4, '1533928298208-27ff66555d8d', isoDate(addDays(today, 21)), 'Lucius is forced to enter the Colosseum after his home is conquered.'),
    m(9, 'Avatar: Fire and Ash', ['Sci-Fi', 'Adventure'], 'English', 190, 8.9, '1446776811953-b23d57bd21aa', isoDate(addDays(today, 45)), 'Jake and Neytiri face a new, aggressive Na’vi clan on Pandora.'),
  ]
}

export const seedMovieMeta = () => ({
  1: { cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson' },
  2: { cast: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.' },
  3: { cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain' },
  7: { cast: 'Robert Pattinson, Zoë Kravitz, Paul Dano', archived: true },
})

const FIRST = ['Aarav', 'Diya', 'Kabir', 'Ishita', 'Vihaan', 'Anaya', 'Reyansh', 'Meera', 'Arjun', 'Saanvi', 'Krish', 'Tara', 'Aditya', 'Riya', 'Neil', 'Zoya']
const LAST = ['Mehta', 'Kapoor', 'Iyer', 'Rao', 'Sethi', 'Bose', 'Khanna', 'Malhotra', 'Nair', 'Shah', 'Verma', 'Desai']
const DOMAINS = ['gmail.com', 'outlook.com', 'icloud.com', 'proton.me']

const THEATRES = [
  { id: 1, name: 'Maison Royale', city: 'Mumbai', address: 'Level 4, Palladium, Lower Parel, Mumbai 400013' },
  { id: 2, name: 'Aurum Cinemas', city: 'Bengaluru', address: '12 MG Road, Ashok Nagar, Bengaluru 560001' },
  { id: 3, name: 'The Gilded Reel', city: 'Delhi-NCR', address: 'DLF Avenue, Saket, New Delhi 110017' },
]

// [id, theatreId, name, format, rows, perRow, regular/premium/recliner price]
const SCREEN_DEFS = [
  [11, 1, 'Imperial IMAX', 'IMAX', 8, 12, [340, 480, 720]],
  [12, 1, 'Salon Noir', 'Standard', 6, 10, [220, 320, 480]],
  [21, 2, 'Atmos Grand', 'Dolby Atmos', 7, 10, [280, 400, 600]],
  [22, 2, 'Velvet Room', 'Standard', 6, 10, [220, 320, 480]],
  [31, 3, 'Opus Atmos', 'Dolby Atmos', 7, 10, [280, 400, 600]],
  [32, 3, 'Grand IMAX', 'IMAX', 8, 12, [340, 480, 720]],
]

export function seedState() {
  const rand = mulberry32(Number(dayKey(new Date()).replaceAll('-', '')))
  const pick = (a) => a[Math.floor(rand() * a.length)]
  const between = (a, b) => a + rand() * (b - a)
  const now = new Date()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const screens = SCREEN_DEFS.map(([id, theatreId, name, format, r, p]) => ({ id, theatreId, name, format, rows: buildLayout(r, p) }))
  const priceByScreen = Object.fromEntries(SCREEN_DEFS.map((d) => [d[0], d[6]]))

  // ---- users ----
  const users = Array.from({ length: 40 }, (_, i) => {
    const f = FIRST[i % FIRST.length], l = LAST[(i * 5) % LAST.length]
    return { name: `${f} ${l}`, email: `${f}.${l}${i % 3 ? '' : i}@${DOMAINS[i % DOMAINS.length]}`.toLowerCase(), phone: `+91 9${String(Math.floor(rand() * 1e9)).padStart(9, '0')}` }
  })

  // ---- staff ----
  const staff = [
    { id: 1, name: 'Aurelia Voss', email: 'aurelia@cineverse.in', role: 'admin', active: true },
    { id: 2, name: 'Rohan Mehta', email: 'rohan@cineverse.in', role: 'admin', active: true },
    { id: 3, name: 'Karan Singh', email: 'karan.gate@cineverse.in', role: 'guard', active: true },
    { id: 4, name: 'Imran Sheikh', email: 'imran.gate@cineverse.in', role: 'guard', active: true },
    { id: 5, name: 'Meera Nair', email: 'meera.gate@cineverse.in', role: 'guard', active: true },
    { id: 6, name: 'Devraj Patil', email: 'devraj.gate@cineverse.in', role: 'guard', active: true },
    { id: 7, name: 'Sana Qureshi', email: 'sana.gate@cineverse.in', role: 'guard', active: false },
  ]

  // ---- shows: yesterday .. +2, 3 slots per screen ----
  const programme = seedMovies().slice(0, 6).map((m) => ({ id: m.id, title: m.title, poster: m.poster_url, duration: m.duration_min }))
  const SLOTS = [[11, 0], [15, 0], [19, 30]]
  const shows = []
  let showId = 1000
  for (let day = -1; day <= 2; day++) {
    screens.forEach((sc, si) => {
      SLOTS.forEach(([h, m], sl) => {
        const [regular, premium, recliner] = priceByScreen[sc.id]
        shows.push({
          id: showId++,
          movie: programme[(si * 2 + sl + day + 12) % programme.length],
          screenId: sc.id,
          start: at(addDays(today, day), h, m).toISOString(),
          prices: { regular, premium, recliner },
          status: day === 1 && si === 1 && sl === 2 ? 'CANCELLED' : 'SCHEDULED',
        })
      })
    })
  }

  // ---- bookings ----
  const bookings = []
  let bookingNo = 48210
  const screenById = Object.fromEntries(screens.map((s) => [s.id, s]))
  for (const show of shows) {
    const sc = screenById[show.screenId]
    const startsAt = new Date(show.start)
    const dayOffset = Math.round((at(startsAt, 0).getTime() - today.getTime()) / 864e5)
    const started = startsAt < now
    const fill = dayOffset < 0 ? between(0.5, 0.82) : dayOffset === 0 ? (started ? between(0.55, 0.85) : between(0.3, 0.62)) : dayOffset === 1 ? between(0.2, 0.5) : between(0.1, 0.32)
    const cap = sc.rows.reduce((n, r) => n + r.seats.filter((s) => s.state === 'ok').length, 0)
    const target = Math.round(cap * fill)
    const taken = new Set()
    let sold = 0
    for (let guard = 0; sold < target && guard < 300; guard++) {
      let size = pick([1, 2, 2, 2, 3, 3, 4])
      const row = pick(sc.rows)
      let run = null
      for (; size >= 1 && !run; size--) {
        const startN = 1 + Math.floor(rand() * row.seats.length)
        for (let k = 0; k < row.seats.length && !run; k++) {
          const from = ((startN - 1 + k) % row.seats.length) + 1
          const group = Array.from({ length: size }, (_, i) => row.seats.find((s) => s.n === from + i))
          if (group.every((s) => s && s.state === 'ok' && !taken.has(seatId(row, s)))) run = group.map((s) => seatId(row, s))
        }
      }
      if (!run) continue
      const cancelled = show.status === 'CANCELLED' ? 'REFUND_PENDING' : rand() < 0.05 ? 'CANCELLED' : 'CONFIRMED'
      if (cancelled === 'CONFIRMED') run.forEach((s) => taken.add(s))
      sold += run.length
      const price = show.prices[row.tier]
      const user = pick(users)
      // every live booking was made yesterday or today, always before "now" and before the show
      const day0 = dayOffset < 0 ? addDays(today, -1) : rand() < 0.45 ? addDays(today, -1) : today
      const hi = Math.min(now.getTime(), startsAt.getTime() - 15 * 60_000, at(day0, 23, 30).getTime())
      const lo = Math.min(at(day0, 6).getTime(), hi - 3_600_000)
      const created = new Date(lo + rand() * Math.max(hi - lo, 60_000))
      bookings.push({
        id: `CV-${bookingNo++}`,
        userName: user.name, userEmail: user.email, userPhone: user.phone,
        showId: show.id, seats: run, amount: price * run.length,
        status: cancelled,
        paymentId: `pay_${Math.floor(rand() * 36 ** 12).toString(36).padStart(12, '0').toUpperCase()}`,
        checkedIn: cancelled === 'CONFIRMED' && started && rand() < 0.88,
        createdAt: created.toISOString(),
      })
    }
  }

  // ---- 28 days of closed-book history (older than yesterday) ----
  const history = []
  for (let d = 29; d >= 2; d--) {
    const date = addDays(today, -d)
    const dow = date.getDay()
    const factor = dow === 5 || dow === 6 || dow === 0 ? 1.25 : 1
    const seats = Math.round(between(470, 640) * factor)
    const avg = between(300, 350)
    const weights = programme.map(() => 0.4 + rand())
    const wSum = weights.reduce((a, b) => a + b, 0)
    const byTitle = {}
    programme.forEach((m, i) => {
      const t = Math.round((seats * weights[i]) / wSum)
      byTitle[m.title] = [t, Math.round(t * avg), Math.round(t / between(0.6, 0.85))]
    })
    history.push({ date: isoDate(date), bookings: Math.round(seats / 2.4), tickets: seats, revenue: Math.round((seats * avg) / 10) * 10, byTitle })
  }

  // ---- gate scan logs ----
  const guards = staff.filter((s) => s.role === 'guard' && s.active)
  const showById = Object.fromEntries(shows.map((s) => [s.id, s]))
  const admitted = bookings.filter((b) => b.checkedIn)
  const logs = []
  admitted.sort(() => rand() - 0.5).slice(0, 55).forEach((b, i) => {
    const sh = showById[b.showId]
    logs.push({ id: `L${i}`, ts: new Date(new Date(sh.start).getTime() - between(4, 40) * 60_000).toISOString(), guard: pick(guards).name, bookingRef: b.id, showId: sh.id, result: 'ADMIT', reason: '' })
  })
  const rejects = [
    ['Already scanned', () => pick(admitted)],
    ['Already scanned', () => pick(admitted)],
    ['Booking cancelled', () => pick(bookings.filter((b) => b.status === 'CANCELLED'))],
    ['Booking cancelled', () => pick(bookings.filter((b) => b.status === 'CANCELLED'))],
    ['Outside entry window', () => pick(bookings.filter((b) => b.status === 'CONFIRMED' && new Date(showById[b.showId].start) > now))],
    ['Outside entry window', () => pick(bookings.filter((b) => b.status === 'CONFIRMED' && new Date(showById[b.showId].start) > now))],
    ['Wrong screen', () => pick(bookings.filter((b) => b.status === 'CONFIRMED'))],
    ['Wrong screen', () => pick(bookings.filter((b) => b.status === 'CONFIRMED'))],
    ['Invalid QR', () => null],
    ['Invalid QR', () => null],
    ['Refund pending', () => pick(bookings.filter((b) => b.status === 'REFUND_PENDING'))],
  ]
  rejects.forEach(([reason, get], i) => {
    const b = get()
    const sh = b && showById[b.showId]
    const ts = sh && new Date(sh.start) < now ? new Date(new Date(sh.start).getTime() - between(1, 25) * 60_000) : new Date(now.getTime() - between(5, 240) * 60_000)
    logs.push({ id: `R${i}`, ts: ts.toISOString(), guard: pick(guards).name, bookingRef: b ? b.id : '—', showId: sh ? sh.id : null, result: 'REJECT', reason })
  })
  logs.sort((a, b) => new Date(b.ts) - new Date(a.ts))

  return {
    theatres: THEATRES, screens, shows, bookings, staff, logs, history,
    totalUsers: 12840,
    settings: { seatLockMin: 8, entryBeforeMin: 45, entryAfterMin: 30, maxTickets: 10 },
    movieMeta: seedMovieMeta(),
    blocks: sampleBlock(shows, bookings, screenById, now),
  }
}

// A maintenance hold on two free rear seats of the next scheduled show, so the inspector shows the gold state.
function sampleBlock(shows, bookings, screenById, now) {
  const show = shows.find((s) => s.status === 'SCHEDULED' && new Date(s.start) > now)
  if (!show) return {}
  const booked = new Set(bookings.filter((b) => b.showId === show.id && b.status === 'CONFIRMED').flatMap((b) => b.seats))
  const free = [...screenById[show.screenId].rows].reverse().flatMap((r) => r.seats.filter((s) => s.state === 'ok').map((s) => seatId(r, s))).filter((id) => !booked.has(id))
  return { [show.id]: free.slice(0, 2) }
}
