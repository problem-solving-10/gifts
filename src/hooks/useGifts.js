import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

/**
 * Fetch gifts for a specific event, or all gifts if eventId is null.
 */
export function useGifts(eventId = null) {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ count: 0, amount: 0 })

  const fetchGifts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('gifts_received')
      .select('*')
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Failed to load gifts')
      console.error(error)
    } else {
      setGifts(data || [])
      const count = data?.length || 0
      const amount = data?.reduce((sum, g) => sum + Number(g.amount || 0), 0) || 0
      setTotals({ count, amount })
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => { fetchGifts() }, [fetchGifts])

  async function addGift(form, overrideEventId) {
    const eid = overrideEventId || eventId
    if (!eid) { toast.error('No event selected'); return null }

    const payload = {
      event_id:    eid,
      person_name: form.person_name.trim(),
      phone:       form.phone?.trim() || null,
      address:     form.address?.trim() || null,
      amount:      Number(form.amount),
      gift_type:   form.gift_type || 'Cash',
    }

    const { data, error } = await supabase
      .from('gifts_received')
      .insert(payload)
      .select()
      .single()

    if (error) {
      toast.error('Failed to add gift')
      console.error(error)
      return null
    }
    toast.success('Gift added!')
    await fetchGifts()
    return data
  }

  async function updateGift(id, form) {
    const payload = {
      person_name: form.person_name.trim(),
      phone:       form.phone?.trim() || null,
      address:     form.address?.trim() || null,
      amount:      Number(form.amount),
      gift_type:   form.gift_type || 'Cash',
    }

    const { error } = await supabase
      .from('gifts_received')
      .update(payload)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update gift')
      console.error(error)
      return false
    }
    toast.success('Gift updated!')
    await fetchGifts()
    return true
  }

  async function deleteGift(id) {
    const { error } = await supabase.from('gifts_received').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete gift')
      console.error(error)
      return false
    }
    toast.success('Gift deleted!')
    await fetchGifts()
    return true
  }

  return { gifts, loading, totals, fetchGifts, addGift, updateGift, deleteGift }
}
