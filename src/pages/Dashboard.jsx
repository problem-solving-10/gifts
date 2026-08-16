import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import StatCard from '../components/StatCard'
import { CalendarDays, Gift, IndianRupee, TrendingUp, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ events: 0, gifts: 0, amount: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [recentGifts, setRecentGifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    const [eventsRes, giftsRes, recentEventsRes, recentGiftsRes] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('gifts_received').select('amount'),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
      supabase
        .from('gifts_received')
        .select('*, events(name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const totalGifts = giftsRes.data?.length || 0
    const totalAmount = giftsRes.data?.reduce((s, g) => s + Number(g.amount || 0), 0) || 0

    setStats({
      events: eventsRes.count || 0,
      gifts: totalGifts,
      amount: totalAmount,
    })

    // Enrich events with totals
    const eventIds = (recentEventsRes.data || []).map(e => e.id)
    let giftsByEvent = {}
    if (eventIds.length > 0) {
      const { data: gd } = await supabase
        .from('gifts_received')
        .select('event_id, amount')
        .in('event_id', eventIds)
      ;(gd || []).forEach(g => {
        if (!giftsByEvent[g.event_id]) giftsByEvent[g.event_id] = { count: 0, amount: 0 }
        giftsByEvent[g.event_id].count++
        giftsByEvent[g.event_id].amount += Number(g.amount || 0)
      })
    }
    setRecentEvents((recentEventsRes.data || []).map(e => ({
      ...e,
      _count:  giftsByEvent[e.id]?.count  || 0,
      _amount: giftsByEvent[e.id]?.amount || 0,
    })))

    setRecentGifts(recentGiftsRes.data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all gifts received</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Events"
          value={loading ? '—' : stats.events}
          icon={CalendarDays}
          color="primary"
        />
        <StatCard
          label="Total Gifts Received"
          value={loading ? '—' : stats.gifts.toLocaleString('en-IN')}
          icon={Gift}
          color="green"
        />
        <StatCard
          label="Total Amount Received"
          value={loading ? '—' : formatCurrency(stats.amount)}
          icon={IndianRupee}
          color="amber"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Events</h2>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-primary-600 hover:underline flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No events yet.</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{ev.name}</div>
                    <div className="text-xs text-gray-400">
                      {ev.event_type}{ev.event_date ? ` · ${formatDate(ev.event_date)}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{formatCurrency(ev._amount)}</div>
                    <div className="text-xs text-gray-400">{ev._count} gifts</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Gifts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Gifts</h2>
            <button
              onClick={() => navigate('/gifts')}
              className="text-xs text-primary-600 hover:underline flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : recentGifts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No gifts yet.</p>
          ) : (
            <div className="space-y-2">
              {recentGifts.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{g.person_name}</div>
                    <div className="text-xs text-gray-400">
                      {g.events?.name}{g.gift_type ? ` · ${g.gift_type}` : ''}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {formatCurrency(g.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
