"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ [SimpleConfirm] Botón Confirmar presionado')
    onConfirm()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('❌ [SimpleConfirm] Botón Cancelar presionado')
    onCancel()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('🖱️ [SimpleConfirm] Click en backdrop')
      onCancel()
    }
  }

  if (!isMounted || !isOpen) {
    return null
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ zIndex: 9999 }}
    >
      <Card 
        className="w-full max-w-md mx-4 shadow-2xl border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <span className="flex-1">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {message}
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              type="button"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              type="button"
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

// Hook para usar el modal de confirmación
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
  }>({
    title: '',
    message: ''
  })

  const [resolveRef, setResolveRef] = useState<{
    resolve: (value: { isConfirmed: boolean }) => void
  } | null>(null)

  const showConfirm = (
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<{ isConfirmed: boolean }> => {
    return new Promise((resolve) => {
      console.log('🔔 [SimpleConfirm] Mostrando confirmación:', title)
      setConfig({ title, message, confirmText, cancelText })
      setResolveRef({ resolve })
      setIsOpen(true)
    })
  }

  const handleConfirm = () => {
    console.log('✅ [SimpleConfirm] Confirmado')
    setIsOpen(false)
    resolveRef?.resolve({ isConfirmed: true })
    setResolveRef(null)
  }

  const handleCancel = () => {
    console.log('❌ [SimpleConfirm] Cancelado')
    setIsOpen(false)
    resolveRef?.resolve({ isConfirmed: false })
    setResolveRef(null)
  }

  const ConfirmComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return {
    showConfirm,
    ConfirmComponent
  }
} 