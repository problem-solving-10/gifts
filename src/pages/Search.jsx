import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X, User, ExternalLink } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import { useEvents } from '../hooks/useEvents'
import GiftViewModal from '../components/GiftViewModal'
import GiftForm from '../components/GiftForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, giftTypeBadgeColor } from '../lib/utils'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Search() {
  const navigate = useNavigate()
  const { query, setQuery, results, loading, clearSearch } = useSearch()
  const { events } = useEvents()

  const [viewTarget, setViewTarget]     = useState(null)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [personView, setPersonView]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Group results by person for history
  const personGroups = {}
  results.forEach(g => {
    const key = g.person_name?.toLowerCase().trim()
    if (!personGroups[key]) {
      personGroups[key] = { name: g.person_name, phone: g.phone, address: g.address, gifts: [] }
    }
    personGroups[key].gifts.push(g)
  })

  async function handleEdit(form) {
    setSaving(true)
    const { error } = await supabase
      .from('gifts_received')
      .update({
        person_name: form.person_name.trim(),
        phone:       form.phone?.trim() || null,
        address:     form.address?.trim() || null,
        amount:      Number(form.amount),
        gift_type:   form.gift_type || 'Cash',
      })
      .eq('id', editTarget.id)
    setSaving(false)
    if (error) { toast.error('Failed to update'); return }
    toast.success('Gift updated!')
    setEditTarget(null)
    if (query) setQuery(query)
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('gifts_received').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Gift deleted!')
    setDeleteTarget(null)
    if (query) setQuery(query)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>
        <p className="text-sm text-gray-500 mt-0.5">Search gifts across ALL events</p>
      </div>

      {/* Search box */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          autoFocus
          className="form-input pl-11 pr-10 py-3 text-base"
          placeholder="Search by name, village, phone, amount, event, gift type..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hint chips */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {['Ravi', 'Bengaluru', 'Cash', 'Wedding', '5000', '9876543210'].map(hint => (
            <button
              key={hint}
              onClick={() => setQuery(hint)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Status */}
      {query && (
        <div className="text-sm text-gray-500">
          {loading
            ? 'Searching...'
            : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
        </div>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No gifts found for "{query}"</p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(gift => (
            <SearchResultCard
              key={gift.id}
              gift={gift}
              onView={() => setViewTarget(gift)}
              onEdit={() => setEditTarget(gift)}
              onDelete={() => setDeleteTarget(gift)}
              onOpenEvent={() => navigate(`/events/${gift.event_id}`)}
              onPersonHistory={() => {
                const key = gift.person_name?.toLowerCase().trim()
                setPersonView(personGroups[key])
              }}
            />
          ))}
        </div>
      )}

      {/* Person History Modal */}
      {personView && (
        <PersonHistoryModal
          person={personView}
          onClose={() => setPersonView(null)}
          onViewGift={g => { setPersonView(null); setViewTarget(g) }}
          onOpenEvent={id => navigate(`/events/${id}`)}
        />
      )}

      {/* View Modal */}
      <GiftViewModal
        gift={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={g => { setViewTarget(null); setEditTarget(g) }}
        onDelete={g => { setViewTarget(null); setDeleteTarget(g) }}
      />

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Gift">
        <GiftForm
          initial={editTarget}
          eventName={editTarget?.event_name}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
          loading={saving}
        />
      </Modal>

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

// ─── Sub-components ────────────────────────────────────────────────────────────

function SearchResultCard({ gift, onView, onEdit, onDelete, onOpenEvent, onPersonHistory }) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onPersonHistory}
              className="font-semibold text-gray-900 hover:text-primary-700 hover:underline flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              {gift.person_name}
            </button>
            <span className="font-bold text-primary-700">{formatCurrency(gift.amount)}</span>
            <span className={`badge ${giftTypeBadgeColor(gift.gift_type)}`}>{gift.gift_type}</span>
            <span className="text-xs text-gray-400">#{gift.id}</span>
          </div>

          {gift.phone && (
            <div className="text-sm text-gray-500 mt-1">📞 {gift.phone}</div>
          )}
          {gift.address && (
            <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">📍 {gift.address}</div>
          )}

          <div className="mt-2">
            <button
              onClick={onOpenEvent}
              className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              {gift.event_name}
              {gift.event_type && ` · ${gift.event_type}`}
              {gift.event_date && ` · ${formatDate(gift.event_date)}`}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={onView}   className="btn btn-sm btn-outline">View</button>
          <button onClick={onEdit}   className="btn btn-sm btn-secondary">Edit</button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">Delete</button>
        </div>
      </div>
    </div>
  )
}

function PersonHistoryModal({ person, onClose, onViewGift, onOpenEvent }) {
  const total = person.gifts.reduce((s, g) => s + Number(g.amount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            {person.name} — Gift History
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {person.phone   && <p className="text-sm text-gray-500">📞 {person.phone}</p>}
          {person.address && <p className="text-sm text-gray-500">📍 {person.address}</p>}

          <div className="space-y-2 mt-3">
            {person.gifts.map(g => (
              <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <button
                    onClick={() => onOpenEvent(g.event_id)}
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    {g.event_name}
                  </button>
                  <div className="text-xs text-gray-400">{g.gift_type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{formatCurrency(g.amount)}</span>
                  <button onClick={() => onViewGift(g)} className="btn btn-sm btn-outline">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="font-medium text-gray-700">Total from {person.name}</span>
            <span className="text-xl font-bold text-primary-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
