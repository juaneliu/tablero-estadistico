"use client"

import { lazy, Suspense, type ComponentType } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Skeleton components para cargas
const ChartSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const MapSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando mapa interactivo...</p>
          <p className="text-xs text-muted-foreground/70">Esto puede tomar unos segundos</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const TableSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Lazy loaded components
export const LazyProgressChart = lazy(() => 
  import('@/components/progress-chart').then(module => ({
    default: module.ProgressChart
  }))
)

export const LazyMapaMorelos = lazy(() =>
  import('@/components/mapa-morelos').then(module => ({
    default: module.MapaMorelos
  }))
)

export const LazyEstadisticasEntes = lazy(() =>
  import('@/components/estadisticas-entes').then(module => ({
    default: module.EstadisticasEntes
  }))
)

export const LazySystemStatistics = lazy(() =>
  import('@/components/system-statistics').then(module => ({
    default: module.SystemStatistics
  }))
)

// HOC para wrappear componentes lazy con suspense
function withLazySuspense<T extends {}>(
  LazyComponent: ComponentType<T>,
  Skeleton: ComponentType
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<Skeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Componentes optimizados con Suspense
export const OptimizedProgressChart = withLazySuspense(LazyProgressChart, ChartSkeleton)
export const OptimizedMapaMorelos = withLazySuspense(LazyMapaMorelos, MapSkeleton)
export const OptimizedEstadisticasEntes = withLazySuspense(LazyEstadisticasEntes, TableSkeleton)
export const OptimizedSystemStatistics = withLazySuspense(LazySystemStatistics, ChartSkeleton)

// Hook para preload de componentes lazy
export function usePreloadLazyComponents() {
  const preloadProgressChart = () => import('@/components/progress-chart')
  const preloadMapaMorelos = () => import('@/components/mapa-morelos')
  const preloadEstadisticasEntes = () => import('@/components/estadisticas-entes')
  const preloadSystemStatistics = () => import('@/components/system-statistics')

  return {
    preloadProgressChart,
    preloadMapaMorelos,
    preloadEstadisticasEntes,
    preloadSystemStatistics,
    preloadAll: () => Promise.all([
      preloadProgressChart(),
      preloadMapaMorelos(),
      preloadEstadisticasEntes(),
      preloadSystemStatistics()
    ])
  }
}
