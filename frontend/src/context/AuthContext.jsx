import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'cravefeed_auth'

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth)

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  function login(role, profile) {
    setAuth({ role, profile })
  }

  async function logout() {
    const path = auth?.role === 'partner' ? '/api/auth/food-partner/logout' : '/api/auth/user/logout'
    try {
      await client.get(path)
    } catch {
      // ignore network errors on logout, still clear local state
    }
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, role: auth?.role ?? null, profile: auth?.profile ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
