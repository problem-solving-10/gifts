import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, ExternalLink } from 'lucide-react'
import { useGifts } from '../hooks/useGifts'
import { useEvents } from '../hooks/useEvents'
import GiftTable from '../components/GiftTable'
import GiftViewModal from '../components/GiftViewModal'
import GiftForm from '../components/GiftForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { formatCurrency } from '../lib/utils'

export default function GiftsReceived() {
  const navigate = useNavigate()
  const { gifts, loading, totals, updateGift, deleteGift } = useGifts(null)
  const { events } = useEvents()

  const [viewTarget, setViewTarget]     = useState(null)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Enrich gifts with event name
  const eventsMap = Object.fromEntries(events.map(e => [e.id, e]))
  const enriched = gifts.map(g => ({
    ...g,
    event_name: eventsMap[g.event_id]?.name,
    event_type: eventsMap[g.event_id]?.event_type,
    event_date: eventsMap[g.event_id]?.event_date,
    event_location: eventsMap[g.event_id]?.location,
  }))

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gifts Received</h1>
        <p className="text-sm text-gray-500 mt-0.5">All gifts across all events</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totals.count.toLocaleString('en-IN')}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total Gifts</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(totals.amount)}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total Amount</div>
        </div>
        <div className="card p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-primary-700">
            {totals.count > 0 ? formatCurrency(Math.round(totals.amount / totals.count)) : '₹0'}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Average Gift</div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
        <Gift className="w-4 h-4 flex-shrink-0" />
        To add a new gift, open an event and click "Add Gift Received".
        <button
          onClick={() => navigate('/events')}
          className="ml-auto flex items-center gap-1 underline underline-offset-2 hover:text-blue-900 whitespace-nowrap"
        >
          Go to Events <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="card p-5">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <GiftTable
            gifts={enriched}
            showEvent
            onView={setViewTarget}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

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
