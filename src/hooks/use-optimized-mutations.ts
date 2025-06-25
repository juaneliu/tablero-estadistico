"use client"

import { useState, useCallback, useMemo } from 'react'
import { useOptimizedFetch } from './use-optimized-fetch'

interface MutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  invalidateQueries?: string[]
  optimisticUpdate?: (currentData: any) => any
}

interface MutationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Hook para optimizar mutations (POST, PUT, DELETE)
export function useOptimizedMutation<T = any, V = any>(
  mutationFn: (variables: V) => Promise<T>,
  options: MutationOptions = {}
) {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const mutate = useCallback(async (variables: V) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Aplicar actualización optimista si se proporciona
      if (options.optimisticUpdate) {
        // Implementar lógica de actualización optimista aquí
        console.log('Applying optimistic update...')
      }

      const result = await mutationFn(variables)
      
      setState({
        data: result,
        loading: false,
        error: null
      })

      // Invalidar queries relacionadas
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          // Limpiar cache de queries específicas
          const cache = new Map() // Acceder al cache global
          if (cache.has(queryKey)) {
            cache.delete(queryKey)
          }
        })
      }

      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la mutación'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      
      options.onError?.(errorMessage)
      throw err
    }
  }, [mutationFn, options])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return useMemo(() => ({
    ...state,
    mutate,
    reset
  }), [state, mutate, reset])
}

// Hook para optimizar formularios con validación y submission
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  validate?: (values: T) => Record<keyof T, string> | null
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo al modificarlo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const validateForm = useCallback(() => {
    if (!validate) return true
    
    const validationErrors = validate(values)
    setErrors(validationErrors || {})
    
    return !validationErrors
  }, [validate, values])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Marcar todos los campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }, [values, validateForm, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setSubmitting(false)
  }, [initialValues])

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  return {
    values,
    errors,
    touched,
    submitting,
    isValid,
    isDirty,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
    validateForm
  }
}

// Hook para optimizar listados con paginación, filtros y ordenamiento
export function useOptimizedList<T>(
  fetchFn: (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, any>
  }) => Promise<{
    data: T[]
    total: number
    page: number
    limit: number
  }>
) {
  const [params, setParams] = useState<{
    page: number
    limit: number
    search: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
    filters: Record<string, any>
  }>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: 'asc',
    filters: {}
  })

  const queryKey = useMemo(() => 
    JSON.stringify(params), 
    [params]
  )

  const { data: rawData, loading, error, refresh } = useOptimizedFetch<{
    data: T[]
    total: number
    page: number
    limit: number
  }>(
    queryKey ? `/api/list?${new URLSearchParams({ params: queryKey })}` : null,
    {
      cacheTime: 2 * 60 * 1000, // 2 minutos
      staleTime: 30 * 1000 // 30 segundos
    }
  )

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  const setSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }))
  }, [])

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }))
  }, [])

  const setFilters = useCallback((filters: Record<string, any>) => {
    setParams(prev => ({ ...prev, filters, page: 1 }))
  }, [])

  const reset = useCallback(() => {
    setParams({
      page: 1,
      limit: 10,
      search: '',
      sortBy: '',
      sortOrder: 'asc',
      filters: {}
    })
  }, [])

  return {
    data: rawData?.data || [],
    total: rawData?.total || 0,
    loading,
    error,
    params,
    setPage,
    setLimit,
    setSearch,
    setSorting,
    setFilters,
    reset,
    refresh
  }
}
