import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CalendarDays, MapPin, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import Modal from '../components/Modal'
import EventForm from '../components/EventForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatDate } from '../lib/utils'

export default function Events() {
  const navigate = useNavigate()
  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleCreate(form) {
    setSaving(true)
    await createEvent(form)
    setSaving(false)
    setShowCreate(false)
  }

  async function handleEdit(form) {
    setSaving(true)
    await updateEvent(editTarget.id, form)
    setSaving(false)
    setEditTarget(null)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteEvent(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage your events</p>
        </div>
        <button
          className="btn-primary btn"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card p-5 h-36 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No events yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Create Event" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              onOpen={() => navigate(`/events/${ev.id}`)}
              onEdit={() => setEditTarget(ev)}
              onDelete={() => setDeleteTarget(ev)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Event">
        <EventForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Event">
        <EventForm
          initial={editTarget}
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
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All gifts in this event will also be deleted.`}
      />
    </div>
  )
}

function EventCard({ event, onOpen, onEdit, onDelete }) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-gray-900">{event.name}</div>
          {event.event_type && (
            <span className="badge bg-primary-50 text-primary-700 mt-1">{event.event_type}</span>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-amber-50 text-amber-500 hover:text-amber-700"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-500">
        {event.event_date && (
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            {formatDate(event.event_date)}
          </div>
        )}
        {(event.location || event.address) && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location || event.address}</span>
          </div>
        )}
      </div>

      <button
        onClick={onOpen}
        className="btn-primary btn btn-sm mt-auto justify-between"
      >
        <span>View Event</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
