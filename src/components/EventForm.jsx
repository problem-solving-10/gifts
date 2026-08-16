import { useState, useEffect } from 'react'
import { EVENT_TYPES } from '../lib/utils'

const empty = {
  name: '',
  event_type: '',
  event_date: '',
  location: '',
  address: '',
}

export default function EventForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty)
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
      {/* Event Name */}
      <div>
        <label className="form-label">Event Name <span className="text-red-500">*</span></label>
        <input
          className="form-input"
          placeholder="e.g. My Wedding"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
        />
      </div>

      {/* Event Type */}
      <div>
        <label className="form-label">Event Type</label>
        <select
          className="form-input"
          value={form.event_type}
          onChange={e => set('event_type', e.target.value)}
        >
          <option value="">Select type...</option>
          {EVENT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Event Date */}
      <div>
        <label className="form-label">Event Date</label>
        <input
          type="date"
          className="form-input"
          value={form.event_date}
          onChange={e => set('event_date', e.target.value)}
        />
      </div>

      {/* Location */}
      <div>
        <label className="form-label">Location</label>
        <input
          className="form-input"
          placeholder="e.g. Bengaluru"
          value={form.location}
          onChange={e => set('location', e.target.value)}
        />
      </div>

      {/* Address */}
      <div>
        <label className="form-label">Address</label>
        <textarea
          className="form-input"
          rows={3}
          placeholder="e.g. Convention Hall, MG Road, Bengaluru"
          value={form.address}
          onChange={e => set('address', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary btn" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
