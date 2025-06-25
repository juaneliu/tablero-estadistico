"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'

// Cache simple en memoria
const cache = new Map<string, { data: any; timestamp: number; expiry: number }>()

interface UseOptimizedFetchOptions {
  cacheTime?: number // tiempo en ms para mantener el cache
  staleTime?: number // tiempo en ms antes de considerar los datos obsoletos
  retryAttempts?: number
  retryDelay?: number
}

export function useOptimizedFetch<T>(
  url: string | null,
  options: UseOptimizedFetchOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
    staleTime = 30 * 1000, // 30 segundos por defecto
    retryAttempts = 3,
    retryDelay = 1000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener datos del cache
  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now > cached.expiry) {
      cache.delete(key)
      return null
    }

    return cached
  }, [])

  // Función para establecer datos en cache
  const setCachedData = useCallback((key: string, data: any) => {
    const now = Date.now()
    cache.set(key, {
      data,
      timestamp: now,
      expiry: now + cacheTime
    })
  }, [cacheTime])

  // Función para hacer fetch con reintentos
  const fetchWithRetry = useCallback(async (url: string, attempt = 1): Promise<T> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    } catch (err) {
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        return fetchWithRetry(url, attempt + 1)
      }
      throw err
    }
  }, [retryAttempts, retryDelay])

  // Función principal de fetch
  const fetchData = useCallback(async (url: string, forceRefresh = false) => {
    const cacheKey = url
    
    // Verificar cache si no es refresh forzado
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey)
      if (cached) {
        const now = Date.now()
        const isStale = now - cached.timestamp > staleTime
        
        // Si no está obsoleto, usar datos del cache
        if (!isStale) {
          setData(cached.data)
          setLoading(false)
          setError(null)
          return cached.data
        }
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchWithRetry(url)
      setData(result)
      setCachedData(cacheKey, result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      // Si hay datos en cache (aunque obsoletos), usarlos como fallback
      const cached = getCachedData(cacheKey)
      if (cached) {
        setData(cached.data)
      }
    } finally {
      setLoading(false)
    }
  }, [getCachedData, setCachedData, staleTime, fetchWithRetry])

  // Effect para cargar datos inicial
  useEffect(() => {
    if (url) {
      fetchData(url)
    }
  }, [url, fetchData])

  // Función para refrescar datos
  const refresh = useCallback(() => {
    if (url) {
      return fetchData(url, true)
    }
  }, [url, fetchData])

  // Función para invalidar cache
  const invalidateCache = useCallback(() => {
    if (url) {
      cache.delete(url)
    }
  }, [url])

  // Función para limpiar todo el cache
  const clearAllCache = useCallback(() => {
    cache.clear()
  }, [])

  return useMemo(() => ({
    data,
    loading,
    error,
    refresh,
    invalidateCache,
    clearAllCache
  }), [data, loading, error, refresh, invalidateCache, clearAllCache])
}

// Hook para optimizar múltiples llamadas simultáneas
export function useBatchFetch<T>(urls: string[]) {
  const [data, setData] = useState<Record<string, T>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchBatch = useCallback(async () => {
    if (urls.length === 0) return

    setLoading(true)
    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        return { url, data: result, error: null }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido'
        return { url, data: null, error }
      }
    })

    const results = await Promise.all(promises)
    
    const newData: Record<string, T> = {}
    const newErrors: Record<string, string> = {}

    results.forEach(({ url, data: resultData, error }) => {
      if (error) {
        newErrors[url] = error
      } else {
        newData[url] = resultData
      }
    })

    setData(newData)
    setErrors(newErrors)
    setLoading(false)
  }, [urls])

  useEffect(() => {
    fetchBatch()
  }, [fetchBatch])

  return { data, loading, errors, refresh: fetchBatch }
}
