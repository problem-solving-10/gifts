import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, CalendarDays, MapPin, Gift,
  IndianRupee, Search, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useGifts } from '../hooks/useGifts'
import { useSearch } from '../hooks/useSearch'
import Modal from '../components/Modal'
import GiftForm from '../components/GiftForm'
import GiftTable from '../components/GiftTable'
import GiftViewModal from '../components/GiftViewModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatCurrency, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const eventId = parseInt(id, 10)

  const [event, setEvent] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(true)

  const { gifts, loading, totals, addGift, updateGift, deleteGift, fetchGifts } = useGifts(eventId)
  const { query, setQuery, results, loading: searching, clearSearch } = useSearch()

  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [id])

  async function loadEvent() {
    setLoadingEvent(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) {
      toast.error('Event not found')
      navigate('/events')
      return
    }
    setEvent(data)
    setLoadingEvent(false)
  }

  async function handleAdd(form) {
    setSaving(true)
    await addGift(form, eventId)
    setSaving(false)
    setShowAdd(false)
  }

  async function handleEdit(form) {
    setSaving(true)
    await updateGift(editTarget.id, form)
    setSaving(false)
    setEditTarget(null)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteGift(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  // Displayed list: search results (scoped) or full list
  const isSearching = query.trim().length > 0
  const displayedGifts = isSearching ? results : gifts

  if (loadingEvent) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      {/* Event header card */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{event?.name}</h1>
              {event?.event_type && (
                <span className="badge bg-primary-50 text-primary-700">{event.event_type}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {event?.event_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(event.event_date)}
                </span>
              )}
              {event?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </span>
              )}
            </div>
            {event?.address && (
              <p className="text-sm text-gray-400">{event.address}</p>
            )}
            <p className="text-xs text-gray-400">Event ID: #{event?.id}</p>
          </div>

          {/* Totals */}
          <div className="flex gap-4 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
              <Gift className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-green-600">Total Gifts</div>
                <div className="font-bold text-green-800">{totals.count.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-xs text-amber-600">Total Amount</div>
                <div className="font-bold text-amber-800">{formatCurrency(totals.amount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gifts section */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="font-semibold text-gray-800 flex-1">Gifts Received</h2>

          {/* Event-scoped search */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="form-input pl-9 pr-8"
              placeholder="Search in this event..."
              value={query}
              onChange={e => setQuery(e.target.value, eventId)}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            className="btn-primary btn"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" /> Add Gift Received
          </button>
        </div>

        {/* Search status */}
        {isSearching && (
          <div className="text-sm text-gray-500">
            {searching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}" in this event`}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <GiftTable
            gifts={displayedGifts}
            onView={setViewTarget}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {/* Add Gift Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Gift Received">
        <GiftForm
          eventName={event?.name}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit Gift Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Gift">
        <GiftForm
          initial={editTarget}
          eventName={event?.name}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
          loading={saving}
        />
      </Modal>

      {/* View Modal */}
      <GiftViewModal
        gift={viewTarget ? { ...viewTarget, event_name: event?.name, event_type: event?.event_type, event_date: event?.event_date, event_location: event?.location } : null}
        onClose={() => setViewTarget(null)}
        onEdit={g => { setViewTarget(null); setEditTarget(g) }}
        onDelete={g => { setViewTarget(null); setDeleteTarget(g) }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Gift"
        message={`Are you sure you want to delete ${formatCurrency(deleteTarget?.amount)} received from ${deleteTarget?.person_name}?`}
      />
    </div>
  )
}
