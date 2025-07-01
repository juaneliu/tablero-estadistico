'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('🔒 [ProtectedRoute] No user found, redirecting to:', redirectTo)
      // Usar replace para evitar problemas con el historial
      router.replace(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!allowedRoles.includes(user.rol)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol: {user.rol}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 