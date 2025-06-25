'use client'

import { useState, useEffect } from 'react'

export type DirectorioOIC = {
  id?: number
  oicNombre: string
  puesto: string
  nombre: string
  correoElectronico: string
  telefono?: string | null
  direccion?: string | null
  entidad: {
    nombre: string
  }
  entesPublicosIds: number[]
  entesPublicos?: Array<{
    id: number
    nombre: string
    ambitoGobierno: string
    poderGobierno: string
  }>
  createdAt?: Date
  updatedAt?: Date
}

export function useDirectorioOIC() {
  const [directorios, setDirectorios] = useState<DirectorioOIC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDirectorios()
  }, [])

  const loadDirectorios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/directorio-oic')
      if (!response.ok) {
        throw new Error('Error al cargar directorio OIC')
      }
      const data = await response.json()
      setDirectorios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar directorio OIC')
      console.error('Error loading directorio OIC:', err)
    } finally {
      setLoading(false)
    }
  }

  const createDirectorio = async (directorio: Omit<DirectorioOIC, 'id' | 'createdAt' | 'updatedAt' | 'entesPublicos'>) => {
    try {
      setError(null)
      const response = await fetch('/api/directorio-oic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directorio),
      })
      
      if (!response.ok) {
        throw new Error('Error al crear registro del directorio OIC')
      }
      
      const nuevoDirectorio = await response.json()
      setDirectorios(prev => [...prev, nuevoDirectorio])
      return nuevoDirectorio
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear registro del directorio OIC'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateDirectorio = async (id: number, directorio: Partial<Omit<DirectorioOIC, 'id' | 'createdAt' | 'updatedAt' | 'entesPublicos'>>) => {
    try {
      setError(null)
      const response = await fetch(`/api/directorio-oic/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directorio),
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar registro del directorio OIC')
      }
      
      const directorioActualizado = await response.json()
      setDirectorios(prev => prev.map(d => d.id === id ? directorioActualizado : d))
      return directorioActualizado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar registro del directorio OIC'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteDirectorio = async (id: number) => {
    try {
      setError(null)
      const response = await fetch(`/api/directorio-oic/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar registro del directorio OIC')
      }
      
      setDirectorios(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar registro del directorio OIC'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getDirectorioById = async (id: number) => {
    try {
      setError(null)
      const response = await fetch(`/api/directorio-oic/${id}`)
      if (!response.ok) {
        throw new Error('Error al obtener registro del directorio OIC')
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener registro del directorio OIC'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getStatistics = async () => {
    try {
      const response = await fetch('/api/directorio-oic/statistics')
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas del directorio OIC')
      }
      return await response.json()
    } catch (err) {
      console.error('Error getting directorio OIC statistics:', err)
      return {
        total: 0,
        porOIC: {},
        porPuesto: {}
      }
    }
  }

  return {
    directorios,
    loading,
    error,
    createDirectorio,
    updateDirectorio,
    deleteDirectorio,
    getDirectorioById,
    getStatistics,
    refetch: loadDirectorios
  }
}
