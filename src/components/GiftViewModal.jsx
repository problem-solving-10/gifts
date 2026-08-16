import Modal from './Modal'
import { formatCurrency, formatDate, giftTypeBadgeColor } from '../lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

export default function GiftViewModal({ gift, onClose, onEdit, onDelete }) {
  if (!gift) return null

  return (
    <Modal open={!!gift} onClose={onClose} title={`Gift #${gift.id}`} size="md">
      <div className="space-y-4">
        {/* Person */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Person Name</div>
            <div className="font-semibold text-gray-900">{gift.person_name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</div>
            <div className="text-gray-700">{gift.phone || '—'}</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</div>
          <div className="text-gray-700 whitespace-pre-wrap">{gift.address || '—'}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount</div>
            <div className="text-2xl font-bold text-primary-700">{formatCurrency(gift.amount)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gift Type</div>
            <span className={`badge text-sm px-3 py-1 ${giftTypeBadgeColor(gift.gift_type)}`}>
              {gift.gift_type}
            </span>
          </div>
        </div>

        {/* Event info */}
        {gift.event_name && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Event</div>
            <div className="font-medium text-gray-800">{gift.event_name}</div>
            {gift.event_type && <div className="text-sm text-gray-500">{gift.event_type}</div>}
            {gift.event_date && <div className="text-sm text-gray-500">{formatDate(gift.event_date)}</div>}
            {gift.event_location && <div className="text-sm text-gray-500">{gift.event_location}</div>}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            className="btn btn-outline gap-2"
            onClick={() => { onClose(); onEdit(gift) }}
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            className="btn btn-danger gap-2"
            onClick={() => { onClose(); onDelete(gift) }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
