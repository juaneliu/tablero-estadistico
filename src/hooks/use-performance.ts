'use client'

import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  memoryUsage?: number
  renderTime: number
  componentsRendered: number
  lastUpdateTime: number
}

interface UsePerformanceOptions {
  enabled?: boolean
  sampleRate?: number // Para throttling de métricas
}

export const usePerformance = (componentName: string, options: UsePerformanceOptions = {}) => {
  const { enabled = process.env.NODE_ENV === 'development', sampleRate = 1000 } = options
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentsRendered: 0,
    lastUpdateTime: Date.now()
  })
  
  const renderStartTime = useRef<number>(Date.now())
  const renderCount = useRef<number>(0)
  const lastSampleTime = useRef<number>(Date.now())

  // Hook para medir tiempo de render
  useEffect(() => {
    if (!enabled) return

    const startTime = renderStartTime.current
    const endTime = Date.now()
    const renderTime = endTime - startTime
    
    renderCount.current += 1

    // Throttling: solo actualizar métricas cada `sampleRate` ms
    if (endTime - lastSampleTime.current >= sampleRate) {
      const newMetrics: PerformanceMetrics = {
        renderTime,
        componentsRendered: renderCount.current,
        lastUpdateTime: endTime
      }

      // Obtener uso de memoria si está disponible
      if ('memory' in performance) {
        newMetrics.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
      }

      setMetrics(newMetrics)
      lastSampleTime.current = endTime

      // Log de performance en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Performance [${componentName}]:`, {
          renderTime: `${renderTime}ms`,
          totalRenders: renderCount.current,
          avgRenderTime: `${(renderTime / renderCount.current).toFixed(2)}ms`,
          memoryMB: newMetrics.memoryUsage ? `${(newMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
        })
      }
    }
  })

  // Función para marcar el inicio de render
  const markRenderStart = () => {
    if (enabled) {
      renderStartTime.current = Date.now()
    }
  }

  // Función para reportar métricas personalizadas
  const reportCustomMetric = (name: string, value: number, unit = 'ms') => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.log(`📊 Custom Metric [${componentName}] ${name}: ${value}${unit}`)
    }
  }

  // Función para medir tiempo de operaciones específicas
  const measureOperation = async <T>(
    operationName: string, 
    operation: () => Promise<T> | T
  ): Promise<T> => {
    if (!enabled) {
      return await operation()
    }

    const startTime = performance.now()
    try {
      const result = await operation()
      const endTime = performance.now()
      reportCustomMetric(`${operationName} Duration`, endTime - startTime)
      return result
    } catch (error) {
      const endTime = performance.now()
      reportCustomMetric(`${operationName} Error Duration`, endTime - startTime)
      throw error
    }
  }

  return {
    metrics,
    markRenderStart,
    reportCustomMetric,
    measureOperation,
    isEnabled: enabled
  }
}

// Hook para detectar slow renders
export const useSlowRenderDetection = (threshold = 16) => {
  const [slowRenders, setSlowRenders] = useState<Array<{ timestamp: number; duration: number }>>([])
  
  useEffect(() => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.duration > threshold) {
          setSlowRenders(prev => [
            ...prev.slice(-9), // Mantener solo los últimos 10
            { timestamp: entry.startTime, duration: entry.duration }
          ])
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(`🐌 Slow render detected: ${entry.duration.toFixed(2)}ms (threshold: ${threshold}ms)`)
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['measure'] })
    } catch (error) {
      // Performance Observer no soportado
      console.warn('Performance Observer not supported')
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return slowRenders
}

// Hook para monitorear uso de memoria
export const useMemoryMonitor = (intervalMs = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return
    }

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory
      if (memory) {
        const used = memory.usedJSHeapSize
        const total = memory.jsHeapSizeLimit
        setMemoryInfo({
          used,
          total,
          percentage: (used / total) * 100
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return memoryInfo
}
