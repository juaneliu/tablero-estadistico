'use client'

import { useState, useEffect, useCallback } from 'react'

export type EntePublico = {
  id?: number
  nombre: string
  ambitoGobierno: 'Federal' | 'Estatal' | 'Municipal'
  poderGobierno: 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo'
  controlOIC: boolean
  controlTribunal: boolean
  sistema1: boolean
  sistema2: boolean
  sistema3: boolean
  sistema6: boolean
  entidad: {
    nombre: string
  }
  municipio: string | null
  createdAt?: Date
  updatedAt?: Date
}

export function useEntes() {
  const [entes, setEntes] = useState<EntePublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEntes()
  }, [])

  const loadEntes = useCallback(async () => {
    try {
      console.log('🔄 [useEntes] Cargando entes...')
      setLoading(true)
      setError(null)
      const response = await fetch('/api/entes')
      if (!response.ok) {
        throw new Error('Error al cargar entes')
      }
      const data = await response.json()
      console.log('✅ [useEntes] Entes cargados:', data.length, data)
      setEntes(data)
    } catch (err) {
      console.error('❌ [useEntes] Error loading entes:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar entes')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEnte = async (ente: Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const response = await fetch('/api/entes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ente),
      })
      
      if (!response.ok) {
        throw new Error('Error al crear ente')
      }
      
      const newEnte = await response.json()
      setEntes(prev => [...prev, newEnte])
      return newEnte
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ente'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateEnte = async (id: number, ente: Partial<Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null)
      const response = await fetch(`/api/entes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ente),
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar ente')
      }
      
      const updatedEnte = await response.json()
      setEntes(prev => prev.map(e => e.id === id ? updatedEnte : e))
      return updatedEnte
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar ente'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteEnte = async (id: number) => {
    try {
      setError(null)
      const response = await fetch(`/api/entes/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar ente')
      }
      
      setEntes(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar ente'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const importBulkEntes = async (entesToImport: Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      setError(null)
      setLoading(true)
      
      // Crear cada ente individualmente (se puede optimizar con un endpoint bulk)
      for (const ente of entesToImport) {
        await createEnte(ente)
      }
      
      await loadEntes() // Recargar después de la importación
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al importar entes'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getEntesConOIC = useCallback(async () => {
    try {
      console.log('🔄 [useEntes] Obteniendo entes con OIC...')
      const response = await fetch('/api/entes/con-oic')
      if (!response.ok) {
        throw new Error('Error al obtener entes con OIC')
      }
      const data = await response.json()
      console.log('✅ [useEntes] Entes con OIC obtenidos:', data.length, data)
      return data
    } catch (err) {
      console.error('❌ [useEntes] Error getting entes con OIC:', err)
      return []
    }
  }, [])

  const getStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/entes/statistics')
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas')
      }
      return await response.json()
    } catch (err) {
      console.error('Error getting statistics:', err)
      return {
        total: 0,
        porAmbito: {},
        porPoder: {},
        porMunicipio: {}
      }
    }
  }, [])

  const getSystemStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/entes/system-statistics')
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas de sistemas')
      }
      return await response.json()
    } catch (err) {
      console.error('Error getting system statistics:', err)
      return {
        sistema1: { count: 0, percentage: 0, total: 0 },
        sistema2: { count: 0, percentage: 0, total: 0 },
        sistema3: { count: 0, percentage: 0, total: 0 },
        sistema6: { count: 0, percentage: 0, total: 0 }
      }
    }
  }, [])

  const getClassificationStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/entes/classification-statistics')
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas de clasificación')
      }
      return await response.json()
    } catch (err) {
      console.error('Error getting classification statistics:', err)
      return {
        sujetos: [],
        organos: [],
        tribunal: []
      }
    }
  }, [])

  return {
    entes,
    loading,
    error,
    createEnte,
    updateEnte,
    deleteEnte,
    importBulkEntes,
    getEntesConOIC,
    getStatistics,
    getSystemStatistics,
    getClassificationStatistics,
    refetch: loadEntes
  }
}