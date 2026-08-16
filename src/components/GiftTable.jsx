import { Eye, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, giftTypeBadgeColor } from '../lib/utils'

export default function GiftTable({ gifts, onView, onEdit, onDelete, showEvent = false }) {
  if (!gifts || gifts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No gifts found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 pr-4 font-medium text-gray-500 whitespace-nowrap">Gift ID</th>
            {showEvent && <th className="pb-3 pr-4 font-medium text-gray-500">Event</th>}
            <th className="pb-3 pr-4 font-medium text-gray-500">Person Name</th>
            <th className="pb-3 pr-4 font-medium text-gray-500">Phone</th>
            <th className="pb-3 pr-4 font-medium text-gray-500">Address</th>
            <th className="pb-3 pr-4 font-medium text-gray-500">Amount</th>
            <th className="pb-3 pr-4 font-medium text-gray-500">Gift Type</th>
            <th className="pb-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {gifts.map(gift => (
            <tr key={gift.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{gift.id}</td>
              {showEvent && (
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-800">{gift.event_name}</div>
                  {gift.event_type && (
                    <div className="text-xs text-gray-400">{gift.event_type}</div>
                  )}
                </td>
              )}
              <td className="py-3 pr-4 font-medium text-gray-800">{gift.person_name}</td>
              <td className="py-3 pr-4 text-gray-600">{gift.phone || '—'}</td>
              <td className="py-3 pr-4 text-gray-600 max-w-[180px]">
                <div className="truncate" title={gift.address}>{gift.address || '—'}</div>
              </td>
              <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                {formatCurrency(gift.amount)}
              </td>
              <td className="py-3 pr-4">
                <span className={`badge ${giftTypeBadgeColor(gift.gift_type)}`}>
                  {gift.gift_type}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView?.(gift)}
                    className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit?.(gift)}
                    className="p-1.5 rounded hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(gift)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
