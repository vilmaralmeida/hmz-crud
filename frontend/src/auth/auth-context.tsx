import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api, SESSION_STORAGE_KEY, type Session, type User } from "@/lib/api"

type AuthSession = Session & { email: string }

type AuthState = {
  session: AuthSession | null
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = SESSION_STORAGE_KEY

const AuthContext = createContext<AuthState | undefined>(undefined)

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!session) {
      setUser(null)
      return
    }

    let active = true
    api
      .get(session.id)
      .then((data) => {
        if (active) setUser(data)
      })
      .catch(() => {
        if (active) setUser(null)
      })

    return () => {
      active = false
    }
  }, [session])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...result, email }))
    setSession({ ...result, email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, user, isAuthenticated: session !== null, login, logout }),
    [session, user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
