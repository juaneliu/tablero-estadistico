"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp, BarChart3, Loader2, RefreshCw, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMetricasDiagnosticosMapa, type MetricasMunicipioMapa } from "@/hooks/use-metricas-diagnosticos-mapa"

// Importar AmCharts solo si estamos en el cliente
declare global {
  interface Window {
    am5: any
    am5map: any
    am5themes_Animated: any
    am5geodata_region_mexico_morLow: any
    amChartsLoading?: boolean
    amChartsLoaded?: boolean
  }
}

const getColorByPromedio = (promedio: number): string => {
  if (promedio >= 95) return "#047857" // emerald-700 - Excelente
  if (promedio >= 90) return "#059669" // emerald-600 - Muy bueno
  if (promedio >= 85) return "#10b981" // emerald-500 - Bueno
  if (promedio >= 80) return "#34d399" // emerald-400 - Bueno
  if (promedio >= 75) return "#6ee7b7" // emerald-300 - Aceptable
  if (promedio >= 70) return "#f59e0b" // amber-500 - Regular
  if (promedio >= 65) return "#d97706" // amber-600 - Bajo
  if (promedio >= 60) return "#c2410c" // orange-600 - Muy bajo
  if (promedio >= 50) return "#dc2626" // red-600 - Crítico
  if (promedio > 0) return "#991b1b" // red-700 - Muy crítico
  return "#64748b" // slate-500 - Sin datos
}

const getStatusLabel = (promedio: number, diagnosticos: number): string => {
  if (diagnosticos === 0) return "Sin diagnósticos"
  if (promedio >= 95) return "Excelente"
  if (promedio >= 90) return "Muy Bueno"
  if (promedio >= 85) return "Bueno"
  if (promedio >= 80) return "Aceptable"
  if (promedio >= 75) return "Regular+"
  if (promedio >= 70) return "Regular"
  if (promedio >= 65) return "Bajo"
  if (promedio >= 60) return "Muy Bajo"
  if (promedio >= 50) return "Crítico"
  return "Muy Crítico"
}

// Hook personalizado para manejo de hidratación
function useIsomorphicLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const isClient = typeof window !== 'undefined'
  const useLayoutEffect = isClient ? React.useLayoutEffect : React.useEffect
  return useLayoutEffect(effect, deps)
}

// Componente que solo se renderiza en el cliente - mejorado para evitar hydration issues
function ClientOnlyMapContainer({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Durante la hidratación, siempre mostrar el fallback para evitar mismatches
  if (!hasMounted) {
    return <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-slate-50 rounded-lg">
      {fallback || (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Cargando mapa...</p>
        </div>
      )}
    </div>
  }

  return (
    <div suppressHydrationWarning className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
      {children}
    </div>
  )
}

// Componente para métricas dinámicas que maneja hidratación
function MetricasDinamicas({ metricas }: { metricas: MetricasMunicipioMapa[] | null }) {
  const [hasMounted, setHasMounted] = useState(false)
  
  // Morelos tiene oficialmente 36 municipios
  const TOTAL_MUNICIPIOS_MORELOS = 36

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Estado inicial consistente - valores por defecto durante hidratación
  const totalConDiagnosticos = hasMounted && metricas ? 
    metricas.filter(m => m.diagnosticosRegistrados > 0).length : 0
  
  const totalRegistros = hasMounted && metricas ? 
    metricas.reduce((sum, m) => sum + m.diagnosticosRegistrados, 0) : 0
  
  // Calcular promedio general como promedio de promedios municipales (incluye municipios sin diagnósticos)
  const promedioGeneral = hasMounted && metricas ? (() => {
    if (metricas.length === 0) return 0
    
    // Promedio simple de todos los promedios municipales (incluye 0s de municipios sin diagnósticos)
    const sumaPromedios = metricas.reduce((sum, m) => sum + m.promedioEvaluacion, 0)
    const promedio = sumaPromedios / metricas.length
    
    return promedio
  })() : 0

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Total Municipios</p>
            <p className="text-2xl font-bold">{TOTAL_MUNICIPIOS_MORELOS}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <Calendar className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">Con Diagnósticos</p>
            <p className="text-2xl font-bold">{totalConDiagnosticos}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm text-purple-600 font-medium">Diagnósticos registrados</p>
            <p className="text-2xl font-bold text-purple-800">{totalRegistros}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-sm text-muted-foreground">Promedio General</p>
            <p className="text-2xl font-bold">{promedioGeneral.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function MapaMorelos() {
  // Estados del componente - inicializados consistentemente
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)

  // Referencias y flags
  const chartDivRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const isMountedRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Hook para datos
  const { metricasMunicipios: metricas, loading: loadingMetricas, error: errorMetricas, refresh } = useMetricasDiagnosticosMapa()

  // Debug de métricas (optimizado)
  useEffect(() => {
    if (!loadingMetricas && metricas) {
      console.log(`📊 [MapaMorelos] ${metricas.length} métricas municipales cargadas`)
    }
  }, [metricas, loadingMetricas])

  // Detectar montaje en el cliente - solo una vez
  useEffect(() => {
    isMountedRef.current = true
    console.log('🌐 [MapaMorelos] Componente montado en el cliente')
    
    return () => {
      isMountedRef.current = false
      console.log('🔄 [MapaMorelos] Componente desmontado')
    }
  }, [])

  // Callback ref para el contenedor del mapa
  const chartRefCallback = useCallback((element: HTMLDivElement | null) => {
    chartDivRef.current = element
    console.log('🔗 [chartRefCallback] Elemento asignado:', !!element)
  }, [])

  // Función para limpiar completamente el mapa
  const cleanupMap = useCallback(() => {
    console.log('🧹 [cleanupMap] Iniciando limpieza...')
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    if (rootRef.current) {
      try {
        rootRef.current.dispose()
        rootRef.current = null
        console.log('✅ [cleanupMap] Root de AmCharts limpiado')
      } catch (err) {
        console.warn('⚠️ [cleanupMap] Error al limpiar Root:', err)
      }
    }
    
    if (chartDivRef.current) {
      try {
        chartDivRef.current.innerHTML = ''
        console.log('✅ [cleanupMap] Contenedor DOM limpiado')
      } catch (err) {
        console.warn('⚠️ [cleanupMap] Error al limpiar contenedor:', err)
      }
    }
    
    isInitializedRef.current = false
  }, [])

  // Función para buscar datos de un municipio
  const obtenerDatosMunicipio = useCallback((nombreMunicipio: string): MetricasMunicipioMapa | null => {
    if (!metricas || metricas.length === 0) return null
    
    const matchNombre = (nombre1: string, nombre2: string): boolean => {
      const n1 = nombre1.toLowerCase().trim()
      const n2 = nombre2.toLowerCase().trim()
      
      if (n1 === n2) return true
      
      const sufijos = [' de zapata', ' de leandro valle', ' del volcán', ' del río']
      let n1_sin_sufijo = n1
      let n2_sin_sufijo = n2
      
      sufijos.forEach(sufijo => {
        n1_sin_sufijo = n1_sin_sufijo.replace(sufijo, '')
        n2_sin_sufijo = n2_sin_sufijo.replace(sufijo, '')
      })
      
      if (n1_sin_sufijo === n2_sin_sufijo) return true
      
      return n1.includes(n2) || n2.includes(n1)
    }
    
    return metricas.find((metrica: MetricasMunicipioMapa) => 
      matchNombre(metrica.name, nombreMunicipio)
    ) || null
  }, [metricas])

  // Función para verificar si las librerías están disponibles - mejorada
  const areLibrariesReady = useCallback(() => {
    const isReady = !!(
      typeof window !== 'undefined' && 
      window.am5 && 
      window.am5map && 
      window.am5themes_Animated && 
      window.am5geodata_region_mexico_morLow
    )
    
    if (!isReady) {
      console.log('⚠️ [areLibrariesReady] Librerías no disponibles:', {
        am5: !!window?.am5,
        am5map: !!window?.am5map,
        am5themes_Animated: !!window?.am5themes_Animated,
        am5geodata_region_mexico_morLow: !!window?.am5geodata_region_mexico_morLow
      })
    }
    
    return isReady
  }, [])

  // Función para esperar a que las librerías estén listas
  const waitForLibraries = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (areLibrariesReady()) {
        console.log('✅ [waitForLibraries] Librerías ya disponibles')
        resolve(true)
        return
      }

      // Verificar si las librerías se están cargando
      if (typeof window !== 'undefined' && window.amChartsLoading) {
        console.log('⏳ [waitForLibraries] Esperando carga de AmCharts...')
        
        const checkInterval = setInterval(() => {
          if (areLibrariesReady() || window.amChartsLoaded) {
            clearInterval(checkInterval)
            console.log('✅ [waitForLibraries] Librerías disponibles después de espera')
            resolve(areLibrariesReady())
          }
        }, 100)
        
        // Timeout después de 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval)
          console.warn('⚠️ [waitForLibraries] Timeout esperando librerías')
          resolve(false)
        }, 10000)
      } else {
        console.warn('⚠️ [waitForLibraries] AmCharts no se está cargando')
        resolve(false)
      }
    })
  }, [areLibrariesReady])

  // Función para cargar scripts de AmCharts - ahora solo espera a que estén listas
  const loadAmChartsLibraries = useCallback((): Promise<void> => {
    console.log('📦 [loadAmChartsLibraries] Esperando librerías del layout...')
    
    return waitForLibraries().then((ready) => {
      if (ready) {
        console.log('🎉 [loadAmChartsLibraries] Librerías listas desde el layout')
        return Promise.resolve()
      } else {
        console.error('❌ [loadAmChartsLibraries] Librerías no disponibles')
        return Promise.reject(new Error('Librerías AmCharts no disponibles'))
      }
    })
  }, [waitForLibraries])

  // Función principal para inicializar el mapa
  const initializeMap = useCallback(() => {
    console.log('🗺️ [initializeMap] === INICIO SIMPLIFICADO ===')
    console.log('📊 [initializeMap] Métricas disponibles:', {
      metricas: !!metricas,
      cantidad: metricas?.length || 0,
      loading: loadingMetricas
    })
    
    if (!isMountedRef.current || isInitializedRef.current) {
      console.log('⚠️ [initializeMap] Componente no montado o ya inicializado')
      return false
    }

    if (!chartDivRef.current) {
      console.error('❌ [initializeMap] chartDivRef.current es null')
      
      if (initAttempts < 5) {
        const delay = 500 * (initAttempts + 1)
        console.log(`🔄 [initializeMap] Reintentando en ${delay}ms`)
        
        setInitAttempts(prev => prev + 1)
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            initializeMap()
          }
        }, delay)
        return false
      } else {
        setError('No se pudo obtener la referencia del contenedor del mapa')
        setLoading(false)
        return false
      }
    }

    if (!areLibrariesReady()) {
      console.error('❌ [initializeMap] Librerías AmCharts no disponibles')
      setError('Librerías AmCharts no disponibles')
      setLoading(false)
      return false
    }

    try {
      cleanupMap()

      console.log('🔄 [initializeMap] Creando Root de AmCharts...')
      rootRef.current = window.am5.Root.new(chartDivRef.current)
      
      if (window.am5themes_Animated) {
        rootRef.current.setThemes([window.am5themes_Animated.new(rootRef.current)])
      }

      const chart = rootRef.current.container.children.push(
        window.am5map.MapChart.new(rootRef.current, {
          panX: "none",
          panY: "none",
          wheelX: "none",
          wheelY: "none",
          projection: window.am5map.geoMercator()
        })
      )

      const polygonSeries = chart.series.push(
        window.am5map.MapPolygonSeries.new(rootRef.current, {
          geoJSON: window.am5geodata_region_mexico_morLow
        })
      )

      polygonSeries.mapPolygons.template.setAll({
        fill: window.am5.color("#e5e7eb"),
        stroke: window.am5.color("#64748b"),
        strokeWidth: 1,
        interactive: true,
        tooltipText: "{name}"
      })

      // Estado hover
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: window.am5.color("#1e40af"),
        stroke: window.am5.color("#1e3a8a"),
        strokeWidth: 2
      })

      polygonSeries.mapPolygons.template.on("click", function(ev: any) {
        const municipioNombre = ev.target.dataItem?.dataContext?.name
        if (municipioNombre) {
          setMunicipioSeleccionado(municipioNombre)
        }
      })

      // Aplicar datos con timing correcto
      setTimeout(() => {        
        if (metricas && metricas.length > 0) {
          let municipiosConDatos = 0
          
          polygonSeries.mapPolygons.each((polygon: any) => {
            const municipioNombre = polygon.dataItem?.dataContext?.name
            if (municipioNombre) {
              const datos = obtenerDatosMunicipio(municipioNombre)
              if (datos) {
                municipiosConDatos++
                const color = getColorByPromedio(datos.promedioEvaluacion)
                polygon.set("fill", window.am5.color(color))
                
                // Tooltip con 6 datos clave (sin iconos)
                const tooltipText = `${municipioNombre}
Promedio: ${datos.promedioEvaluacion.toFixed(1)}%
Diagnósticos: ${datos.diagnosticosRegistrados}
Acciones: ${datos.accionesTotales}
Completadas: ${datos.accionesCompletadas}/${datos.accionesTotales}
Estado: ${getStatusLabel(datos.promedioEvaluacion, datos.diagnosticosRegistrados)}`
                
                polygon.set("tooltipText", tooltipText)
                
              } else {
                // Sin datos
                polygon.set("fill", window.am5.color("#64748b"))
                polygon.set("tooltipText", `${municipioNombre}\nSin datos disponibles`)
              }
            }
          })
          
          // Forzar refresh visual
          polygonSeries.markDirtyValues()
          if (chart.appear) {
            chart.appear(1000, 100)
          }
          
          console.log(`✅ [MapaMorelos] Tooltips y colores aplicados a ${municipiosConDatos} municipios`)
        }
      }, 1000)
      

      isInitializedRef.current = true
      setLoading(false)
      setError(null)
      console.log('🎉 [initializeMap] Mapa inicializado exitosamente')
      return true

    } catch (error: any) {
      console.error('❌ [initializeMap] Error durante inicialización:', error)
      setError(`Error al inicializar el mapa: ${error.message}`)
      setLoading(false)
      return false
    }
  }, [areLibrariesReady, metricas, initAttempts, obtenerDatosMunicipio, cleanupMap])

  // Efecto simple para inicializar cuando esté todo listo
  useEffect(() => {
    console.log('🔄 [useEffect] Estado:', {
      loadingMetricas,
      metricasDisponibles: !!metricas,
      cantidadMetricas: metricas?.length || 0
    })

    if (loadingMetricas) {
      console.log('⏳ [useEffect] Esperando métricas...')
      return
    }

    // Solo inicializar si las métricas están listas
    const timer = setTimeout(() => {
      if (areLibrariesReady()) {
        console.log('🎉 [useEffect] Iniciando mapa con métricas disponibles')
        initializeMap()
      } else {
        console.log('📦 [useEffect] Cargando librerías...')
        loadAmChartsLibraries()
          .then(() => {
            if (isMountedRef.current) {
              setTimeout(() => initializeMap(), 500)
            }
          })
          .catch((err) => {
            console.error('❌ [useEffect] Error cargando librerías:', err)
            setError(`Error cargando librerías: ${err.message}`)
            setLoading(false)
          })
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      cleanupMap()
    }
  }, [loadingMetricas, metricas, areLibrariesReady, loadAmChartsLibraries, initializeMap, cleanupMap])

  // Función para reintentar
  const handleRetry = useCallback(() => {
    setError(null)
    setLoading(true)
    setInitAttempts(0)
    isInitializedRef.current = false
    setTimeout(() => initializeMap(), 100)
  }, [initializeMap])

  // Obtener datos del municipio seleccionado
  const datosMunicipioSeleccionado = municipioSeleccionado ? obtenerDatosMunicipio(municipioSeleccionado) : null

  // Loading state para métricas
  if (loadingMetricas) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Diagnósticos Municipales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Cargando métricas...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state para métricas
  if (errorMetricas) {
    console.error('❌ [MapaMorelos] Error en métricas:', errorMetricas)
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Diagnósticos Municipales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Error al cargar datos</h3>
                  <p className="text-gray-600 mb-4">{errorMetricas}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recargar página
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta principal del mapa */}
      <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
              Mapa de Diagnósticos Municipales
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {error && (
            <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error en el mapa</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Layout del mapa con métricas al lado derecho */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mapa - 3 columnas */}
            <div className="lg:col-span-3">
              <ClientOnlyMapContainer
                fallback={
                  <div className="w-full h-[600px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Preparando mapa...</span>
                    </div>
                  </div>
                }
              >
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Cargando mapa...</span>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    ref={chartRefCallback}
                    id="mapa-container"
                    className="w-full h-[600px] border border-gray-200 rounded-lg bg-gray-50"
                    style={{ minHeight: '600px' }}
                  />
                </div>
              </ClientOnlyMapContainer>
            </div>

            {/* Métricas - 1 columna al lado derecho */}
            <div className="lg:col-span-1 space-y-4">
              <MetricasDinamicas metricas={metricas} />
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#047857" }}></div>
                <span className="font-medium">95%+ Excelente</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#059669" }}></div>
                <span className="font-medium">90-95% Muy Bueno</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#10b981" }}></div>
                <span className="font-medium">85-90% Bueno</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#f59e0b" }}></div>
                <span className="font-medium">70-80% Regular</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#dc2626" }}></div>
                <span className="font-medium">50-70% Crítico</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: "#64748b" }}></div>
                <span className="font-medium">Sin datos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del municipio seleccionado */}
      <div suppressHydrationWarning>
        {municipioSeleccionado && datosMunicipioSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {municipioSeleccionado}
              <Badge 
                variant="outline"
                className="ml-auto"
                style={{ 
                  backgroundColor: getColorByPromedio(datosMunicipioSeleccionado.promedioEvaluacion) + '20',
                  borderColor: getColorByPromedio(datosMunicipioSeleccionado.promedioEvaluacion),
                  color: getColorByPromedio(datosMunicipioSeleccionado.promedioEvaluacion)
                }}
              >
                {getStatusLabel(datosMunicipioSeleccionado.promedioEvaluacion, datosMunicipioSeleccionado.diagnosticosRegistrados)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Diagnósticos</p>
                  <p className="text-2xl font-bold text-purple-800">{datosMunicipioSeleccionado.diagnosticosRegistrados}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Promedio Cumplimiento</p>
                  <p className="text-2xl font-bold text-green-800">{datosMunicipioSeleccionado.promedioEvaluacion.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Acciones</p>
                  <p className="text-2xl font-bold text-blue-800">{datosMunicipioSeleccionado.accionesTotales}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Users className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Acciones Completadas</p>
                  <p className="text-2xl font-bold text-emerald-800">{datosMunicipioSeleccionado.accionesCompletadas}</p>
                </div>
              </div>
            </div>
            
            {/* Barra de progreso de acciones */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Progreso de Acciones</h4>
                <span className="text-sm font-semibold text-gray-600">
                  {datosMunicipioSeleccionado.accionesTotales > 0 
                    ? `${Math.round((datosMunicipioSeleccionado.accionesCompletadas / datosMunicipioSeleccionado.accionesTotales) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: datosMunicipioSeleccionado.accionesTotales > 0 
                      ? `${(datosMunicipioSeleccionado.accionesCompletadas / datosMunicipioSeleccionado.accionesTotales) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{datosMunicipioSeleccionado.accionesCompletadas} completadas</span>
                <span>{datosMunicipioSeleccionado.accionesTotales - datosMunicipioSeleccionado.accionesCompletadas} pendientes</span>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
