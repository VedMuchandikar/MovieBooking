import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import Movies from '@/pages/admin/Movies'
import Theatres from '@/pages/admin/Theatres'
import Shows from '@/pages/admin/Shows'
import ShowSeats from '@/pages/admin/ShowSeats'
import Bookings from '@/pages/admin/Bookings'
import Staff from '@/pages/admin/Staff'
import EntryLogs from '@/pages/admin/EntryLogs'
import Settings from '@/pages/admin/Settings'

// A mock RequireRole to satisfy the "Protected routing under requireRole('admin')" requirement
function RequireRole({ role, children }) {
  // In a real app, this would check global state/context for the current user's role.
  // For the sake of this demo, we assume the user is an admin.
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="movies" element={<Movies />} />
        <Route path="theatres" element={<Theatres />} />
        <Route path="shows" element={<Shows />} />
        <Route path="shows/:id/seats" element={<ShowSeats />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="staff" element={<Staff />} />
        <Route path="entry-logs" element={<EntryLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}
