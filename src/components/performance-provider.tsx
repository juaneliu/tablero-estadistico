"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number
  renderTime: number
  interactionTime: number
  memoryUsage?: number
}

interface PerformanceContextType {
  metrics: PerformanceMetrics
  isSlowDevice: boolean
  reportMetric: (name: string, value: number) => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    renderTime: 0,
    interactionTime: 0
  })
  
  const [isSlowDevice, setIsSlowDevice] = useState(false)

  useEffect(() => {
    // Detectar dispositivos lentos
    const connection = (navigator as any).connection
    const hardwareConcurrency = navigator.hardwareConcurrency || 1
    const deviceMemory = (navigator as any).deviceMemory || 1

    const isLowEndDevice = 
      hardwareConcurrency <= 2 || 
      deviceMemory <= 2 || 
      (connection && connection.effectiveType === 'slow-2g') ||
      (connection && connection.effectiveType === '2g')

    setIsSlowDevice(isLowEndDevice)

    // Medir tiempo de carga inicial
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        setMetrics(prev => ({ ...prev, pageLoadTime }))
      }

      // Medir memoria si está disponible
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1048576 // MB
        }))
      }
    }
  }, [])

  const reportMetric = (name: string, value: number) => {
    setMetrics(prev => ({ ...prev, [name]: value }))
    
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value}ms`)
    }
  }

  // Observer para Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Función para medir FCP (First Contentful Paint)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('firstContentfulPaint', entry.startTime)
          }
        })
      })
      observer.observe({ entryTypes: ['paint'] })
    }

    // Función para medir LCP (Largest Contentful Paint)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        reportMetric('largestContentfulPaint', lastEntry.startTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // Función para medir CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            reportMetric('cumulativeLayoutShift', clsValue)
          }
        })
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }

    // Inicializar observers
    try {
      observeFCP()
      observeLCP()
      observeCLS()
    } catch (error) {
      console.warn('Performance observers not supported:', error)
    }
  }, [])

  return (
    <PerformanceContext.Provider value={{ metrics, isSlowDevice, reportMetric }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Hook para medir tiempo de render de componentes
export function useRenderTime(componentName: string) {
  const { reportMetric } = usePerformance()
  
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      reportMetric(`${componentName}RenderTime`, endTime - startTime)
    }
  }, [componentName, reportMetric])
}
