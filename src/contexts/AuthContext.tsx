import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  tenant_id: string
}

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vton_token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('vton_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (t: string, u: AuthUser) => {
    localStorage.setItem('vton_token', t)
    localStorage.setItem('vton_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('vton_token')
    localStorage.removeItem('vton_user')
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
