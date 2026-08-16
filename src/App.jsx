import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import GiftsReceived from './pages/GiftsReceived'
import Search from './pages/Search'
import Reports from './pages/Reports'

export default function App() {
  const { user, loading } = useAuth()

  // Wait for session restore before rendering
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  // Not logged in → show login page
  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="events"       element={<Events />} />
        <Route path="events/:id"   element={<EventDetail />} />
        <Route path="gifts"        element={<GiftsReceived />} />
        <Route path="search"       element={<Search />} />
        <Route path="reports"      element={<Reports />} />
      </Route>
    </Routes>
  )
}
