"use client"

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isInstalled: boolean
  isUpdating: boolean
  hasUpdate: boolean
  error: string | null
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isInstalled: false,
    isUpdating: false,
    hasUpdate: false,
    error: null
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, error: 'Service Worker no soportado' }))
      return
    }

    const registerSW = async () => {
      try {
        setState(prev => ({ ...prev, isUpdating: true }))

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('[SW] Registrado exitosamente:', registration.scope)

        setState(prev => ({
          ...prev,
          isInstalled: true,
          isUpdating: false,
          error: null
        }))

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          if (newWorker) {
            setState(prev => ({ ...prev, hasUpdate: true }))
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] Nueva versión disponible')
                setState(prev => ({ ...prev, hasUpdate: true }))
              }
            })
          }
        })

        // Escuchar mensajes del SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW] Mensaje recibido:', event.data)
        })

        // Limpiar cache periódicamente (cada 30 minutos)
        setInterval(() => {
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAN_CACHE' })
          }
        }, 30 * 60 * 1000)

      } catch (error) {
        console.error('[SW] Error al registrar:', error)
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }))
      }
    }

    registerSW()
  }, [])

  const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return false

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        
        // Si hay un worker esperando, activarlo
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('[SW] Error al actualizar:', error)
      return false
    }
  }

  const reloadPage = () => {
    window.location.reload()
  }

  return {
    ...state,
    updateServiceWorker,
    reloadPage
  }
}

// Hook para manejar el estado offline/online
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      if (!online) {
        setWasOffline(true)
      }
    }

    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return {
    isOnline,
    wasOffline,
    resetWasOffline: () => setWasOffline(false)
  }
}
