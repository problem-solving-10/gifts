import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { debounce } from '../lib/utils'

/**
 * Global search across all events, or scoped to a single event.
 * Searches: person_name, phone, address, amount, gift_type,
 *           event name, event_type, event location, event address, gift id
 */
export function useSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQueryState] = useState('')

  const runSearch = useCallback(async (q, eventId = null) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Join gifts_received with events
    let dbQuery = supabase
      .from('gifts_received')
      .select(`
        id,
        event_id,
        person_name,
        phone,
        address,
        amount,
        gift_type,
        created_at,
        events (
          id,
          name,
          event_type,
          event_date,
          location,
          address
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    // Scope to event if provided
    if (eventId) {
      dbQuery = dbQuery.eq('event_id', eventId)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Search error:', error)
      setResults([])
      setLoading(false)
      return
    }

    const lower = trimmed.toLowerCase()
    const numVal = parseFloat(trimmed.replace(/,/g, ''))

    const filtered = (data || []).filter(g => {
      const ev = g.events || {}
      return (
        g.id?.toString().includes(trimmed) ||
        g.person_name?.toLowerCase().includes(lower) ||
        g.phone?.includes(trimmed) ||
        g.address?.toLowerCase().includes(lower) ||
        g.gift_type?.toLowerCase().includes(lower) ||
        (!isNaN(numVal) && Number(g.amount) === numVal) ||
        ev.name?.toLowerCase().includes(lower) ||
        ev.event_type?.toLowerCase().includes(lower) ||
        ev.location?.toLowerCase().includes(lower) ||
        ev.address?.toLowerCase().includes(lower)
      )
    })

    // Flatten event data
    const mapped = filtered.map(g => ({
      ...g,
      event_name:     g.events?.name,
      event_type:     g.events?.event_type,
      event_date:     g.events?.event_date,
      event_location: g.events?.location,
      event_address:  g.events?.address,
    }))

    setResults(mapped)
    setLoading(false)
  }, [])

  // Debounced version for input onChange
  const debouncedSearch = useCallback(
    debounce((q, eventId) => runSearch(q, eventId), 300),
    [runSearch]
  )

  function setQuery(q, eventId = null) {
    setQueryState(q)
    if (!q.trim()) {
      setResults([])
      return
    }
    debouncedSearch(q, eventId)
  }

  function clearSearch() {
    setQueryState('')
    setResults([])
  }

  return { query, setQuery, results, loading, clearSearch }
}
