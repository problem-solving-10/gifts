import { useState, useEffect } from 'react'
import { GIFT_TYPES } from '../lib/utils'

const empty = {
  person_name: '',
  phone: '',
  address: '',
  amount: '',
  gift_type: 'Cash',
}

export default function GiftForm({ initial, onSubmit, onCancel, loading, eventName }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial, amount: initial.amount ?? '' } : empty)
  }, [initial])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Event context badge */}
      {eventName && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2 text-sm text-primary-700">
          Adding gift for: <span className="font-semibold">{eventName}</span>
        </div>
      )}

      {/* Person Name */}
      <div>
        <label className="form-label">Person Name <span className="text-red-500">*</span></label>
        <input
          className="form-input"
          placeholder="e.g. Ravi Kumar"
          value={form.person_name}
          onChange={e => set('person_name', e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* Phone */}
      <div>
        <label className="form-label">Phone Number</label>
        <input
          className="form-input"
          placeholder="e.g. 9876543210"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          type="tel"
        />
      </div>

      {/* Address */}
      <div>
        <label className="form-label">Address</label>
        <textarea
          className="form-input"
          rows={3}
          placeholder={"e.g. #45, 2nd Cross,\nVijayanagar,\nBengaluru, Karnataka"}
          value={form.address}
          onChange={e => set('address', e.target.value)}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="form-label">Amount (₹) <span className="text-red-500">*</span></label>
        <input
          className="form-input"
          placeholder="e.g. 5000"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          type="number"
          min="0"
          step="1"
          required
        />
      </div>

      {/* Gift Type */}
      <div>
        <label className="form-label">Gift Type</label>
        <select
          className="form-input"
          value={form.gift_type}
          onChange={e => set('gift_type', e.target.value)}
        >
          {GIFT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary btn" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Gift' : 'Add Gift'}
        </button>
      </div>
    </form>
  )
}
