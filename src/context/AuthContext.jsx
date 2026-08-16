import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const SESSION_KEY = 'gm_session'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // { username }
  const [loading, setLoading] = useState(true)   // checking stored session

  // Restore session on load
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    const { data, error } = await supabase
      .from('app_credentials')
      .select('username')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password.trim())
      .single()

    if (error || !data) {
      return { success: false, message: 'Invalid username or password.' }
    }

    const session = { username: data.username }
    setUser(session)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { success: true }
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
