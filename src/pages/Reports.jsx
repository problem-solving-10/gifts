import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, giftTypeBadgeColor } from '../lib/utils'
import { BarChart2, TrendingUp, TrendingDown, Award, ChevronRight, Download } from 'lucide-react'

export default function Reports() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReports() }, [])

  async function loadReports() {
    setLoading(true)

    const [eventsRes, giftsRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('gifts_received').select('*'),
    ])

    const events = eventsRes.data || []
    const gifts  = giftsRes.data  || []

    if (gifts.length === 0) {
      setData({ events, gifts, eventTotals: [], personTotals: [], typeTotals: [], stats: null })
      setLoading(false)
      return
    }

    // Event-wise totals
    const eventMap = {}
    events.forEach(e => { eventMap[e.id] = { ...e, count: 0, amount: 0 } })
    gifts.forEach(g => {
      if (eventMap[g.event_id]) {
        eventMap[g.event_id].count++
        eventMap[g.event_id].amount += Number(g.amount || 0)
      }
    })
    const eventTotals = Object.values(eventMap)
      .filter(e => e.count > 0)
      .sort((a, b) => b.amount - a.amount)

    // Person-wise totals
    const personMap = {}
    gifts.forEach(g => {
      const key = g.person_name?.toLowerCase().trim()
      if (!personMap[key]) personMap[key] = { name: g.person_name, phone: g.phone, count: 0, amount: 0 }
      personMap[key].count++
      personMap[key].amount += Number(g.amount || 0)
    })
    const personTotals = Object.values(personMap).sort((a, b) => b.amount - a.amount).slice(0, 20)

    // Gift-type totals
    const typeMap = {}
    gifts.forEach(g => {
      const t = g.gift_type || 'Other'
      if (!typeMap[t]) typeMap[t] = { type: t, count: 0, amount: 0 }
      typeMap[t].count++
      typeMap[t].amount += Number(g.amount || 0)
    })
    const typeTotals = Object.values(typeMap).sort((a, b) => b.amount - a.amount)

    // Overall stats
    const amounts = gifts.map(g => Number(g.amount || 0))
    const total   = amounts.reduce((s, a) => s + a, 0)
    const avg     = total / amounts.length
    const highest = Math.max(...amounts)
    const lowest  = Math.min(...amounts)
    const highGift = gifts.find(g => Number(g.amount) === highest)
    const lowGift  = gifts.find(g => Number(g.amount) === lowest)

    setData({
      events, gifts, eventTotals, personTotals, typeTotals,
      stats: { total, avg, highest, lowest, highGift, lowGift, count: gifts.length },
    })
    setLoading(false)
  }

  function exportCSV() {
    if (!data?.gifts?.length) return
    const evMap = Object.fromEntries((data.events || []).map(e => [e.id, e]))
    const rows = [
      ['Gift ID', 'Event Name', 'Person Name', 'Phone', 'Address', 'Amount', 'Gift Type'],
      ...data.gifts.map(g => [
        g.id,
        evMap[g.event_id]?.name || '',
        g.person_name,
        g.phone || '',
        (g.address || '').replace(/\n/g, ' '),
        g.amount,
        g.gift_type,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'gifts_received.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const { eventTotals, personTotals, typeTotals, stats } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Summary of all gifts received</p>
        </div>
        <button onClick={exportCSV} className="btn btn-outline gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {!stats ? (
        <div className="card p-12 text-center text-gray-400">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No gift data yet. Add gifts to see reports.</p>
        </div>
      ) : (
        <>
          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Gifts" value={stats.count.toLocaleString('en-IN')} />
            <StatBox label="Total Amount" value={formatCurrency(stats.total)} accent />
            <StatBox label="Average Gift" value={formatCurrency(Math.round(stats.avg))} />
            <StatBox label="Events with Gifts" value={eventTotals.length} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Highest Gift</div>
                <div className="font-bold text-gray-900">{formatCurrency(stats.highest)}</div>
                <div className="text-xs text-gray-500">{stats.highGift?.person_name}</div>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Lowest Gift</div>
                <div className="font-bold text-gray-900">{formatCurrency(stats.lowest)}</div>
                <div className="text-xs text-gray-500">{stats.lowGift?.person_name}</div>
              </div>
            </div>
          </div>

          {/* Event-wise */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Event-wise Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-4 font-medium text-gray-500">Event</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Type</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Date</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Gifts</th>
                    <th className="pb-2 font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {eventTotals.map(ev => (
                    <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => navigate(`/events/${ev.id}`)}
                          className="font-medium text-primary-700 hover:underline flex items-center gap-1"
                        >
                          {ev.name} <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{ev.event_type || '—'}</td>
                      <td className="py-2 pr-4 text-gray-500">{ev.event_date ? formatDate(ev.event_date) : '—'}</td>
                      <td className="py-2 pr-4 text-gray-700">{ev.count.toLocaleString('en-IN')}</td>
                      <td className="py-2 font-semibold text-gray-800">{formatCurrency(ev.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gift type totals */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Gift Type Summary</h2>
            <div className="space-y-2">
              {typeTotals.map(t => (
                <div key={t.type} className="flex items-center gap-3">
                  <span className={`badge w-28 justify-center ${giftTypeBadgeColor(t.type)}`}>{t.type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(t.amount / stats.total * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-28 text-right">{formatCurrency(t.amount)}</span>
                  <span className="text-xs text-gray-400 w-16 text-right">{t.count} gifts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top persons */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Top Gift Givers (by Amount)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-4 font-medium text-gray-500">#</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Person</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Phone</th>
                    <th className="pb-2 pr-4 font-medium text-gray-500">Gifts</th>
                    <th className="pb-2 font-medium text-gray-500">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {personTotals.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4 font-medium text-gray-800">{p.name}</td>
                      <td className="py-2 pr-4 text-gray-500">{p.phone || '—'}</td>
                      <td className="py-2 pr-4 text-gray-700">{p.count}</td>
                      <td className="py-2 font-semibold text-gray-800">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatBox({ label, value, accent }) {
  return (
    <div className={`card p-4 text-center ${accent ? 'bg-primary-50 border-primary-100' : ''}`}>
      <div className={`text-2xl font-bold ${accent ? 'text-primary-700' : 'text-gray-900'}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
