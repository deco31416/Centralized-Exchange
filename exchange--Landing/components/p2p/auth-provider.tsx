"use client"

import type * as React from "react"
import { createContext, useState, useEffect } from "react"

type User = {
  id: string
  name: string
  email: string
  username?: string
  avatar?: string
  verified: boolean
  orders: number
  completion: number
} | null

interface AuthContextType {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Mapea el perfil de `/api/auth/me` (GET /auth/me/profile) al tipo User del contexto.
 * Garantiza compatibilidad con los componentes P2P que usan user.name, user.verified, etc.
 */
function mapProfileToUser(profile: Record<string, unknown>): User {
  const email = typeof profile.email === "string" ? profile.email : ""
  const username = typeof profile.username === "string" ? profile.username : undefined
  const firstName = typeof profile.firstName === "string" ? profile.firstName : undefined
  return {
    id: (typeof profile.userId === "string" ? profile.userId : "") ||
        (typeof profile.id === "string" ? profile.id : ""),
    name: username ?? firstName ?? email.split("@")[0] ?? "",
    email,
    username,
    avatar: typeof profile.avatar === "string" ? profile.avatar : undefined,
    // status 'active' indica cuenta verificada (me/profile no expone is_email_verified)
    verified: profile.status === "active",
    orders: typeof profile.orders === "number" ? profile.orders : 0,
    completion: typeof profile.completion === "number" ? profile.completion : 0,
  }
}

/**
 * Mapea el objeto user del response de login (`UserResponseDto`) al tipo User.
 */
function mapLoginUserToUser(loginUser: Record<string, unknown>): User {
  const email = typeof loginUser.email === "string" ? loginUser.email : ""
  return {
    id: typeof loginUser.id === "string" ? loginUser.id : "",
    name: email.split("@")[0] ?? "",
    email,
    verified: loginUser.is_email_verified === true,
    orders: 0,
    completion: 0,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restaurar sesión desde cookie HttpOnly a través del BFF (server-side)
    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (res.ok) {
          const profile = await res.json()
          setUser(mapProfileToUser(profile))
        }
      } catch {
        // No hay sesión activa — comportamiento esperado
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.success && data.user) {
        setUser(mapLoginUserToUser(data.user as Record<string, unknown>))
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Registro real contra micro-auth.
   * Firma compatible con p2p/register-modal que pasa (name, email, password).
   * El campo `name` se ignora porque el DTO de micro-auth no lo requiere,
   * pero se preserva la firma para no romper el componente existente.
   */
  const register = async (_name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })
      return res.ok
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // Ignorado intencionalmente
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
