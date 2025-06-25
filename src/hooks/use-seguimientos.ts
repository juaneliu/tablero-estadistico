"use client"

import { useState, useEffect } from 'react'
import { showError, showSuccess } from '@/lib/notifications'

export interface Seguimiento {
  id: number
  acuerdoId: number
  seguimiento: string
  accion: string
  fechaSeguimiento: Date
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor?: string
}

export function useSeguimientos(acuerdoId?: number) {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar seguimientos de un acuerdo específico
  const fetchSeguimientos = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/acuerdos/${id}/seguimientos`)
      
      if (!response.ok) {
        throw new Error('Error al cargar seguimientos')
      }
      
      const data = await response.json()
      setSeguimientos(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      await showError('Error', `No se pudieron cargar los seguimientos: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo seguimiento
  const createSeguimiento = async (acuerdoId: number, seguimientoData: {
    seguimiento: string
    accion: string
    fechaSeguimiento?: Date
  }) => {
    try {
      const response = await fetch(`/api/acuerdos/${acuerdoId}/seguimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...seguimientoData,
          fechaSeguimiento: seguimientoData.fechaSeguimiento || new Date()
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear seguimiento')
      }

      const nuevoSeguimiento = await response.json()
      setSeguimientos(prev => [...prev, nuevoSeguimiento])
      
      await showSuccess(
        '✅ Seguimiento agregado',
        'El seguimiento se ha agregado exitosamente al acuerdo.'
      )
      
      return nuevoSeguimiento
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo crear el seguimiento: ${errorMessage}`)
      throw err
    }
  }

  // Actualizar seguimiento
  const updateSeguimiento = async (id: number, seguimientoData: Partial<Seguimiento>) => {
    try {
      const response = await fetch(`/api/seguimientos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seguimientoData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar seguimiento')
      }

      const seguimientoActualizado = await response.json()
      setSeguimientos(prev => 
        prev.map(s => s.id === id ? seguimientoActualizado : s)
      )
      
      await showSuccess(
        '✅ Seguimiento actualizado',
        'El seguimiento se ha actualizado exitosamente.'
      )
      
      return seguimientoActualizado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo actualizar el seguimiento: ${errorMessage}`)
      throw err
    }
  }

  // Eliminar seguimiento
  const deleteSeguimiento = async (id: number) => {
    try {
      const response = await fetch(`/api/seguimientos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar seguimiento')
      }

      setSeguimientos(prev => prev.filter(s => s.id !== id))
      
      await showSuccess(
        '✅ Seguimiento eliminado',
        'El seguimiento se ha eliminado exitosamente.'
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo eliminar el seguimiento: ${errorMessage}`)
      throw err
    }
  }

  // Cargar seguimientos automáticamente si se proporciona acuerdoId
  useEffect(() => {
    if (acuerdoId) {
      fetchSeguimientos(acuerdoId)
    }
  }, [acuerdoId])

  return {
    seguimientos,
    loading,
    error,
    fetchSeguimientos,
    createSeguimiento,
    updateSeguimiento,
    deleteSeguimiento,
  }
}
