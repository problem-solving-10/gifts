import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import GiftsReceived from './pages/GiftsReceived'
import Search from './pages/Search'
import Reports from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="gifts" element={<GiftsReceived />} />
        <Route path="search" element={<Search />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}
