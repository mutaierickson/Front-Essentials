import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest } from '@/models/authModel'
import { clearStoredProfile, readStoredProfile, saveLastUsername, writeStoredProfile } from '@/lib/offline'

export type Profile = {
  id: number
  username: string
  role: 'Admin' | 'Outlet Manager' | 'Cashier' | 'Manager'
  outlet_id: number | null
}

type AuthContextType = {
  profile: Profile | null
  loading: boolean
  persistSession: boolean
  login: (username: string, password?: string, persist?: boolean) => Promise<void>
  signOut: () => void
}

const normalizeRole = (role?: string): Profile['role'] => {
  if (role === 'Manager') return 'Outlet Manager'
  if (role === 'Admin' || role === 'Outlet Manager' || role === 'Cashier') return role
  return 'Cashier'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [persistSession, setPersistSession] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = readStoredProfile()
    if (stored) {
      try {
        setProfile({ ...stored, role: normalizeRole(stored.role) })
        try {
          const meta = JSON.parse(localStorage.getItem('pos_session_meta') || '{}')
          setPersistSession(meta.persist !== false)
        } catch {
          setPersistSession(true)
        }
      } catch {
        clearStoredProfile()
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!profile) return
    const touch = () => writeStoredProfile(profile, persistSession)
    touch()
    const timer = setInterval(touch, 60_000)
    window.addEventListener('focus', touch)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', touch)
    }
  }, [profile, persistSession])

  const login = useCallback(async (username: string, password?: string, persist = true) => {
    const data = await loginRequest(username, password)
    const normalizedRole = normalizeRole(data.role)
    const userProfile: Profile = {
      id: data.id,
      username: data.username,
      role: normalizedRole,
      outlet_id: normalizedRole === 'Admin' ? null : 1
    }
    setPersistSession(persist)
    setProfile(userProfile)
    saveLastUsername(userProfile.username)
    writeStoredProfile(userProfile, persist)
  }, [])

  const signOut = useCallback(() => {
    setProfile(null)
    clearStoredProfile()
  }, [])

  const value = useMemo(
    () => ({ profile, loading, persistSession, login, signOut }),
    [profile, loading, persistSession, login, signOut]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
