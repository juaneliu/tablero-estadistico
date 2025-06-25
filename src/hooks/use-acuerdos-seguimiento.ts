"use client"

import { useState, useEffect } from 'react'
import { showError } from '@/lib/notifications'

export interface AcuerdoSeguimiento {
  id?: number
  numeroSesion: string
  tipoSesion: string
  fechaSesion: string
  temaAgenda: string
  descripcionAcuerdo: string
  responsable: string
  area: string
  fechaCompromiso: string
  prioridad: string
  estado: string
  observaciones?: string
  fechaCreacion?: Date
  fechaActualizacion?: Date
  creadoPor?: string
  seguimientos?: {
    id: number
    acuerdoId: number
    seguimiento: string
    accion: string
    fechaSeguimiento: Date
    fechaCreacion: Date
    fechaActualizacion: Date
    creadoPor?: string
  }[]
}

export function useAcuerdosSeguimiento() {
  const [acuerdos, setAcuerdos] = useState<AcuerdoSeguimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar acuerdos
  const fetchAcuerdos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/acuerdos')
      
      if (!response.ok) {
        throw new Error('Error al cargar acuerdos')
      }
      
      const data = await response.json()
      setAcuerdos(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      await showError('Error', `No se pudieron cargar los acuerdos: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Crear acuerdo
  const createAcuerdo = async (acuerdo: Omit<AcuerdoSeguimiento, 'id'>) => {
    try {
      const response = await fetch('/api/acuerdos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acuerdo),
      })

      if (!response.ok) {
        throw new Error('Error al crear acuerdo')
      }

      const nuevoAcuerdo = await response.json()
      setAcuerdos(prev => [nuevoAcuerdo, ...prev])
      return nuevoAcuerdo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo crear el acuerdo: ${errorMessage}`)
      throw err
    }
  }

  // Actualizar acuerdo
  const updateAcuerdo = async (id: number, acuerdo: Partial<AcuerdoSeguimiento>) => {
    try {
      const response = await fetch(`/api/acuerdos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acuerdo),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar acuerdo')
      }

      const acuerdoActualizado = await response.json()
      setAcuerdos(prev => 
        prev.map(a => a.id === id ? acuerdoActualizado : a)
      )
      return acuerdoActualizado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo actualizar el acuerdo: ${errorMessage}`)
      throw err
    }
  }

  // Eliminar acuerdo
  const deleteAcuerdo = async (id: number) => {
    try {
      const response = await fetch(`/api/acuerdos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar acuerdo')
      }

      setAcuerdos(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo eliminar el acuerdo: ${errorMessage}`)
      throw err
    }
  }

  // Obtener acuerdo por ID
  const getAcuerdoById = async (id: number) => {
    try {
      const response = await fetch(`/api/acuerdos/${id}`)
      
      if (!response.ok) {
        throw new Error('Acuerdo no encontrado')
      }
      
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo cargar el acuerdo: ${errorMessage}`)
      throw err
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAcuerdos()
  }, [])

  // Calcular estadísticas
  const estadisticas = {
    total: acuerdos.length,
    pendientes: acuerdos.filter(a => a.estado === 'Pendiente').length,
    enProgreso: acuerdos.filter(a => a.estado === 'En progreso').length,
    completados: acuerdos.filter(a => a.estado === 'Completado').length,
    cancelados: acuerdos.filter(a => a.estado === 'Cancelado').length,
    enRevision: acuerdos.filter(a => a.estado === 'En revisión').length,
    prioridadAlta: acuerdos.filter(a => a.prioridad === 'Alta').length,
    prioridadMedia: acuerdos.filter(a => a.prioridad === 'Media').length,
    prioridadBaja: acuerdos.filter(a => a.prioridad === 'Baja').length,
  }

  return {
    acuerdos,
    loading,
    error,
    estadisticas,
    fetchAcuerdos,
    createAcuerdo,
    updateAcuerdo,
    deleteAcuerdo,
    getAcuerdoById,
  }
}
