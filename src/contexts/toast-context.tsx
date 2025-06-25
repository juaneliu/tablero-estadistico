'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast, ToastContainer, Toast } from '@/components/ui/toast'

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
  success: (title: string, message?: string, options?: Partial<Toast>) => string
  error: (title: string, message?: string, options?: Partial<Toast>) => string
  warning: (title: string, message?: string, options?: Partial<Toast>) => string
  info: (title: string, message?: string, options?: Partial<Toast>) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext debe usarse dentro de ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [mounted, setMounted] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Solo renderizar en el cliente para evitar hydration issues
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  )
}
