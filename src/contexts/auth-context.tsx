'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type User = {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR'
  activo: boolean
  ultimoAcceso?: Date | null
  createdAt: Date
  updatedAt: Date
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  hasPermission: (requiredRole: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setUser(data.user)
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Incluso si hay error en el servidor, limpiar estado local
      setUser(null)
    }
  }

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.rol)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
