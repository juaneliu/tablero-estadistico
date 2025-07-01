"use client"

import { useState, useEffect, useCallback } from 'react'
import { showError } from '@/lib/notifications'

export interface DiagnosticoMunicipal {
  id: number
  nombreActividad: string
  municipio: string
  actividad: string
  solicitudUrl?: string
  respuestaUrl?: string
  unidadAdministrativa: string
  evaluacion: number
  observaciones?: string
  acciones?: Array<{
    id: string
    descripcion: string
    urlAccion: string
    fechaLimite: string
    completada: boolean
  }>
  estado: string
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor?: string
}

export function useDiagnosticosMunicipales() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoMunicipal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar diagnósticos - memoizada para evitar re-creaciones innecesarias
  const fetchDiagnosticos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/diagnosticos')
      
      if (!response.ok) {
        throw new Error('Error al cargar diagnósticos')
      }
      
      const data = await response.json()
      setDiagnosticos(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      await showError('Error', `No se pudieron cargar los diagnósticos: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear diagnóstico
  const createDiagnostico = async (diagnostico: Omit<DiagnosticoMunicipal, 'id'>) => {
    try {
      console.log('🪝 Hook createDiagnostico ejecutado con:', diagnostico);
      
      const response = await fetch('/api/diagnosticos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnostico),
      })

      console.log('🌐 Respuesta de la API:', response.status, response.statusText);

      let errorData = null;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch {}
        throw new Error(errorData?.error || 'Error al crear diagnóstico')
      }

      const nuevoDiagnostico = await response.json()
      console.log('✅ Nuevo diagnóstico creado:', nuevoDiagnostico);
      
      setDiagnosticos(prev => [nuevoDiagnostico, ...prev])
      return nuevoDiagnostico
    } catch (err) {
      console.error('💥 Error en hook createDiagnostico:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      // Usar sistema de notificaciones personalizado
      await showError('Error', `No se pudo crear el diagnóstico: ${errorMessage}`)
      throw err
    }
  }

  // Actualizar diagnóstico
  const updateDiagnostico = async (id: number, diagnostico: Partial<DiagnosticoMunicipal>) => {
    try {
      const response = await fetch(`/api/diagnosticos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnostico),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar diagnóstico')
      }

      const diagnosticoActualizado = await response.json()
      setDiagnosticos(prev => 
        prev.map(d => d.id === id ? diagnosticoActualizado : d)
      )
      return diagnosticoActualizado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo actualizar el diagnóstico: ${errorMessage}`)
      throw err
    }
  }

  // Eliminar diagnóstico
  const deleteDiagnostico = async (id: number) => {
    try {
      const response = await fetch(`/api/diagnosticos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar diagnóstico')
      }

      setDiagnosticos(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo eliminar el diagnóstico: ${errorMessage}`)
      throw err
    }
  }

  // Obtener diagnóstico por ID
  const getDiagnosticoById = async (id: number) => {
    try {
      const response = await fetch(`/api/diagnosticos/${id}`)
      
      if (!response.ok) {
        throw new Error('Diagnóstico no encontrado')
      }
      
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      await showError('Error', `No se pudo cargar el diagnóstico: ${errorMessage}`)
      throw err
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDiagnosticos()
  }, [])

  // Calcular estadísticas
  const estadisticas = {
    totalMunicipios: 36, // Total de municipios de Morelos
    total: diagnosticos.length,
    completados: diagnosticos.filter(d => d.estado === 'Completado').length,
    enProceso: diagnosticos.filter(d => d.estado === 'En Proceso').length,
    pendientes: diagnosticos.filter(d => d.estado === 'Pendiente').length,
  }

  return {
    diagnosticos,
    loading,
    error,
    estadisticas,
    fetchDiagnosticos,
    createDiagnostico,
    updateDiagnostico,
    deleteDiagnostico,
    getDiagnosticoById,
  }
}
