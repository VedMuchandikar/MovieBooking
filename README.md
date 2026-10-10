# Cineverse — Luxury Multiplex Cinema Management Suite

An ultra-luxurious, cinema-enterprise administrative portal for managing movie catalogues, theatrical auditoriums, timetable scheduling, seat maps, ticket reservations, and staff access. Built with a bespoke **Couture Cinema** obsidian and gold design system.

---

## 📽️ Key Features & Modules

- **Executive Analytics Dashboard (`/admin/dashboard`)**: Real-time revenue metrics, occupancy rates, top-grossing films, peak hours booking heatmap, and live operational stats.
- **Film Catalogue & Media Manager (`/admin/movies`)**: Complete movie lifecycle (Now Showing, Upcoming, Archived), runtime & certification filters, poster gallery, and seamless Neon DB API fallback.
- **Complex & Screen Infrastructure (`/admin/theatres`)**: Multi-theatre support, auditorium tier management (IMAX Laser, Dolby Cinema, VIP Recliner), sound profiles, and seat capacity configurations.
- **Timetable Scheduling & Seat Allocation (`/admin/shows`, `/admin/shows/:showId/seats`)**: Conflict-free show scheduling, dynamic tier pricing (Recliner, VIP, Premium, Standard), buffer windows, and real-time interactive seat matrix.
- **Reservations & Ticketing Ledger (`/admin/bookings`)**: Comprehensive booking logs, instant ticket status tracking (Confirmed, Attended, Cancelled), customer lookup, and ticket detail modals.
- **Staff & Operational Access (`/admin/staff`)**: Role-based access control (Superadmin, Cinema Manager, Floor Lead, Box Office), contact directory, and access provisioning.
- **Entry Scanner & Validation Logs (`/admin/entry-logs`)**: Real-time gate scanner logs, turnstile validation, entry timestamps, and fraud prevention alerts.
- **Cinema Configuration & Policy (`/admin/settings`)**: Tax calculation (GST), booking fee rates, cancellation policies, maintenance thresholds, and theme settings.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS, Vanilla CSS custom properties (`src/index.css`), Glassmorphism
- **Design System**: Couture Cinema Obsidian (`#08090C`, `#0D0F14`) & Champagne Gold (`#E6C687`)
- **UI Primitives**: Radix UI / shadcn/ui components (`src/components/ui/*`), Lucide React icons
- **Data & State**: Zustand client store with LocalStorage persistence, Seed dataset, Neon PostgreSQL REST client fallback
- **Notifications**: Sonner toast notifications

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd MovieBooking

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Optionally set your backend movie API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running Locally
```bash
# Start the development server
npm run dev
```

The portal will be accessible at:
- **Local:** `http://localhost:5173/` (Automatically redirects to `/admin/dashboard`)

---

## 📂 Project Structure

```
MovieBooking/
├── public/                 # Static assets (3D models, SVG icons)
├── src/
│   ├── assets/             # Brand graphics, badges, hero imagery
│   ├── components/
│   │   ├── admin/          # Admin layout, header, navigation, and dialogs
│   │   └── ui/             # Reusable UI primitives (dialog, button, table, etc.)
│   ├── lib/                # Business logic, analytics helpers, schedule math
│   ├── pages/admin/        # Operational admin views
│   ├── store/              # Zustand database state, mock seed data
│   ├── App.jsx             # Route definitions and administrative shell
│   ├── index.css           # Couture Cinema design tokens and glass effects
│   └── main.jsx            # Application entrypoint
├── components.json         # UI component configuration
├── eslint.config.js        # ESLint configuration
├── jsconfig.json           # Path alias resolution (@/*)
├── package.json            # Project dependencies and scripts
└── vite.config.js          # Vite build configuration
```

---

## 📜 Available Scripts

- `npm run dev` — Starts the development server with Hot Module Replacement (HMR).
- `npm run build` — Bundles the production application to the `dist` folder.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs ESLint across the codebase.
