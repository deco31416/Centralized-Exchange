/**
 * 📋 Hooks para gestión de usuarios en el admin panel
 */
'use client'

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  username?: string
  status: string
  roles: string[]
  created_at: string
  email_verified?: boolean
  sms_otp_enabled?: boolean
  totp_enabled?: boolean
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AdminsResponse {
  admins: User[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AdminDetail extends User {
  first_name?: string
  last_name?: string
  phone?: string
  org_id?: string
  permissions?: string[]
  last_login?: string
  login_count?: number
  primary_email?: string
  failed_login_attempts?: number
  locked_until?: Date | null
}

export interface AdminActivity {
  id: string
  action: string
  timestamp: string
  ip_address?: string
  user_agent?: string
  target?: string
  metadata?: Record<string, any>
}

/**
 * Hook para obtener lista de usuarios
 */
export function useUsers(filters?: {
  page?: number
  limit?: number
  status?: string
  role?: string
  search?: string
}) {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.page) params.set('page', filters.page.toString())
        if (filters?.limit) params.set('limit', filters.limit.toString())
        if (filters?.status) params.set('status', filters.status)
        if (filters?.role) params.set('role', filters.role)
        if (filters?.search) params.set('search', filters.search)

        const queryString = params.toString()
        const url = `/api/users${queryString ? '?' + queryString : ''}`

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filters?.page, filters?.limit, filters?.status, filters?.role, filters?.search])

  return { data, loading, error }
}

/**
 * Hook para obtener lista de admins
 */
export function useAdmins(filters?: {
  page?: number
  limit?: number
}) {
  const [data, setData] = useState<AdminsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.page) params.set('page', filters.page.toString())
        if (filters?.limit) params.set('limit', filters.limit.toString())

        const queryString = params.toString()
        const url = `/api/admins${queryString ? '?' + queryString : ''}`

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch admins')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [filters?.page, filters?.limit])

  return { data, loading, error }
}

/**
 * Hook para obtener detalles de un usuario
 */
export function useUser(userId: string | null) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setData(null)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/users/${userId}`)
        
        if (!response.ok) {
          throw new Error('User not found')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { data, loading, error }
}

/**
 * Hook para obtener detalles completos de un administrador
 */
export function useAdminDetail(adminId: string | null) {
  const [data, setData] = useState<AdminDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminId) {
      setData(null)
      return
    }

    const fetchAdminDetail = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admins/${adminId}`)
        
        if (!response.ok) {
          throw new Error('Admin not found')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminDetail()
  }, [adminId])

  const refetch = () => {
    if (adminId) {
      setData(null)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * Hook para obtener actividad reciente de un administrador
 */
export function useAdminActivity(adminId: string | null, limit: number = 20) {
  const [data, setData] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminId) {
      setData([])
      return
    }

    const fetchActivity = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admins/${adminId}/activity?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity')
        }

        const result = await response.json()
        setData(result.activities || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [adminId, limit])

  return { data, loading, error }
}
