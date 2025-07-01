"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NotificationOptions {
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  allowOutsideClick?: boolean
}

interface NotificationState extends NotificationOptions {
  id: string
  isVisible: boolean
}

const notificationState: {
  notifications: NotificationState[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationState[]>> | null
} = {
  notifications: [],
  setNotifications: null
}

// Contador para generar IDs únicos de manera consistente
let idCounter = 0
const generateId = (): string => {
  return `notification-${++idCounter}-${Date.now()}`
}

// Hook para manejar notificaciones
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationState[]>([])

  useEffect(() => {
    notificationState.setNotifications = setNotifications
    notificationState.notifications = notifications
  }, [notifications])

  const showNotification = (options: NotificationOptions): Promise<{ isConfirmed: boolean }> => {
    return new Promise((resolve) => {
      const id = generateId()
      const notification: NotificationState = {
        ...options,
        id,
        isVisible: true,
        onConfirm: () => {
          options.onConfirm?.()
          closeNotification(id)
          resolve({ isConfirmed: true })
        },
        onCancel: () => {
          options.onCancel?.()
          closeNotification(id)
          resolve({ isConfirmed: false })
        }
      }

      setNotifications(prev => [...prev, notification])

      // Auto-close for non-interactive notifications
      if (!options.showConfirmButton && !options.showCancelButton && options.type !== 'loading') {
        setTimeout(() => {
          closeNotification(id)
          resolve({ isConfirmed: false })
        }, options.duration || 3000)
      }
    })
  }

  const closeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const closeAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    showNotification,
    closeNotification,
    closeAllNotifications
  }
}

// Funciones globales para usar desde cualquier lugar
export const showSuccess = async (title: string, message?: string): Promise<{ isConfirmed: boolean }> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return { isConfirmed: false }
  }
  
  return new Promise((resolve) => {
    const id = generateId()
    const notification: NotificationState = {
      id,
      title,
      message,
      type: 'success',
      isVisible: true,
      duration: 3000,
      onConfirm: () => resolve({ isConfirmed: true })
    }

    notificationState.setNotifications!(prev => [...prev, notification])
    
    setTimeout(() => {
      notificationState.setNotifications!(prev => prev.filter(n => n.id !== id))
      resolve({ isConfirmed: true })
    }, 3000)
  })
}

export const showError = async (title: string, message?: string): Promise<{ isConfirmed: boolean }> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return { isConfirmed: false }
  }
  
  return new Promise((resolve) => {
    const id = generateId()
    const notification: NotificationState = {
      id,
      title,
      message,
      type: 'error',
      isVisible: true,
      showConfirmButton: true,
      confirmText: 'Entendido',
      onConfirm: () => {
        notificationState.setNotifications!(prev => prev.filter(n => n.id !== id))
        resolve({ isConfirmed: true })
      }
    }

    notificationState.setNotifications!(prev => [...prev, notification])
  })
}

export const showWarning = async (title: string, message?: string): Promise<{ isConfirmed: boolean }> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return { isConfirmed: false }
  }
  
  return new Promise((resolve) => {
    const id = generateId()
    const notification: NotificationState = {
      id,
      title,
      message,
      type: 'warning',
      isVisible: true,
      showConfirmButton: true,
      confirmText: 'Entendido',
      onConfirm: () => {
        notificationState.setNotifications!(prev => prev.filter(n => n.id !== id))
        resolve({ isConfirmed: true })
      }
    }

    notificationState.setNotifications!(prev => [...prev, notification])
  })
}

let loadingNotificationId: string | null = null

export const showLoadingAlert = async (title: string, message?: string): Promise<void> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return
  }
  
  console.log('🔵 Creando loading alert:', title)
  
  // Cerrar cualquier loading alert existente antes de mostrar uno nuevo
  if (loadingNotificationId) {
    console.log('🗑️ Cerrando loading alert existente:', loadingNotificationId)
    notificationState.setNotifications!(prev => prev.filter(n => n.id !== loadingNotificationId))
  }
  
  const id = generateId()
  loadingNotificationId = id
  
  console.log('📝 Nuevo loading alert ID:', id)
  
  const notification: NotificationState = {
    id,
    title,
    message,
    type: 'loading',
    isVisible: true,
    allowOutsideClick: false
  }

  notificationState.setNotifications!(prev => {
    const newState = [...prev, notification]
    console.log('📊 Total notifications después de agregar:', newState.length)
    return newState
  })
}

export const closeLoadingAlert = async (): Promise<void> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return
  }
  
  console.log('🔄 Intentando cerrar loading alert, ID actual:', loadingNotificationId)
  
  // Método agresivo: cerrar todos los loading alerts
  notificationState.setNotifications!(prev => {
    const filtered = prev.filter(n => n.type !== 'loading')
    console.log('🧹 Notifications antes:', prev.length, 'después:', filtered.length)
    return filtered
  })
  
  loadingNotificationId = null
  console.log('✅ Loading alert cerrado')
}

// Función de emergencia para cerrar todas las notificaciones
export const forceCloseAllNotifications = async (): Promise<void> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return
  }
  
  console.log('🚨 FORZANDO CIERRE DE TODAS LAS NOTIFICACIONES')
  notificationState.setNotifications!([])
  loadingNotificationId = null
}

export const showConfirm = async (
  title: string, 
  message?: string,
  confirmText: string = 'Confirmar',
  cancelText: string = 'Cancelar'
): Promise<{ isConfirmed: boolean }> => {
  if (!notificationState.setNotifications) {
    console.warn('Notification system not initialized')
    return { isConfirmed: false }
  }
  
  return new Promise((resolve) => {
    const id = generateId()
    const notification: NotificationState = {
      id,
      title,
      message,
      type: 'warning',
      isVisible: true,
      showConfirmButton: true,
      showCancelButton: true,
      confirmText,
      cancelText,
      onConfirm: () => {
        notificationState.setNotifications!(prev => prev.filter(n => n.id !== id))
        resolve({ isConfirmed: true })
      },
      onCancel: () => {
        notificationState.setNotifications!(prev => prev.filter(n => n.id !== id))
        resolve({ isConfirmed: false })
      }
    }

    notificationState.setNotifications!(prev => [...prev, notification])
  })
}

// Componente de notificación individual
function NotificationItem({ notification }: { notification: NotificationState }) {
  const [showCloseButton, setShowCloseButton] = useState(false)

  // Mostrar botón de cerrar después de 5 segundos para loading alerts
  useEffect(() => {
    if (notification.type === 'loading') {
      const timer = setTimeout(() => {
        setShowCloseButton(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.type])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-amber-600" />
      case 'loading':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-6 w-6 text-blue-600" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      case 'warning':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
      case 'loading':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
    }
  }

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (notification.allowOutsideClick !== false && e.target === e.currentTarget) {
      notification.onCancel?.()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <Card className={cn(
        "w-full max-w-md mx-4 shadow-2xl border-2",
        getColorClasses()
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            {getIcon()}
            <span className="flex-1">{notification.title}</span>
            {(notification.type === 'loading' && showCloseButton) && (
              <button
                onClick={() => {
                  console.log('🚨 Usuario forzó el cierre del loading alert')
                  notification.onCancel?.()
                }}
                className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Cerrar (forzar)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notification.message && (
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {notification.message}
            </p>
          )}
          
          {(notification.showConfirmButton || notification.showCancelButton) && (
            <div className="flex gap-2 pt-2">
              {notification.showCancelButton && (
                <Button
                  variant="outline"
                  onClick={notification.onCancel}
                  className="flex-1"
                >
                  {notification.cancelText || 'Cancelar'}
                </Button>
              )}
              {notification.showConfirmButton && (
                <Button
                  onClick={notification.onConfirm}
                  className={cn(
                    "flex-1",
                    notification.type === 'error' && "bg-red-600 hover:bg-red-700",
                    notification.type === 'warning' && "bg-amber-600 hover:bg-amber-700",
                    notification.type === 'success' && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {notification.confirmText || 'Confirmar'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal del sistema de notificaciones
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications } = useNotifications()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      {children}
      {isMounted && notifications.length > 0 && createPortal(
        <div className="notification-container">
          {notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
