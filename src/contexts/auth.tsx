import { createContext } from "react"
import { type User } from "@supabase/supabase-js"

export type AuthState = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type AuthContextType = AuthState & {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)