import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load events')
      console.error(error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  async function createEvent(form) {
    const payload = {
      name:       form.name.trim(),
      event_type: form.event_type || null,
      event_date: form.event_date || null,
      location:   form.location?.trim() || null,
      address:    form.address?.trim() || null,
    }
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single()

    if (error) {
      toast.error('Failed to create event')
      console.error(error)
      return null
    }
    toast.success('Event created!')
    await fetchEvents()
    return data
  }

  async function updateEvent(id, form) {
    const payload = {
      name:       form.name.trim(),
      event_type: form.event_type || null,
      event_date: form.event_date || null,
      location:   form.location?.trim() || null,
      address:    form.address?.trim() || null,
    }
    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update event')
      console.error(error)
      return false
    }
    toast.success('Event updated!')
    await fetchEvents()
    return true
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete event')
      console.error(error)
      return false
    }
    toast.success('Event deleted!')
    await fetchEvents()
    return true
  }

  return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent }
}
