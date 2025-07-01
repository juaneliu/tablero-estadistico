'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Plus, FileText, Building2, MapPin, Calendar, ExternalLink, Edit, BarChart3, Trash2, UserCheck, Clock, CheckCircle2, ChevronDown, ChevronRight, FileCheck, AlertCircle, ExternalLink as LinkIcon, FileDown } from "lucide-react"
import Link from "next/link"
import { DiagnosticoMunicipal } from "@/hooks/use-diagnosticos-municipales"
import { showConfirm, showSuccess, showError } from "@/lib/notifications"
import { useToastContext } from "@/contexts/toast-context"
import { Skeleton, TableSkeleton, MunicipioIconSkeleton } from "@/components/ui/skeleton"
import { usePerformance } from "@/hooks/use-performance"

// Función para obtener color basado en promedio (misma lógica que en mapa-morelos)
const getColorByPromedio = (promedio: number): string => {
  // Validar que promedio es un número válido
  if (typeof promedio !== 'number' || isNaN(promedio)) {
    return "#64748b" // slate-500 - Sin datos
  }
  
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

// Función para normalizar nombres de municipios y obtener la imagen correspondiente
const getMunicipioIcon = (municipio: string): string => {
  if (!municipio) return '/img/municipios/default.gif'
  
  // Normalizar el nombre del municipio para que coincida con los archivos
  const normalized = municipio
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[áä]/g, 'a')
    .replace(/[éë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[óö]/g, 'o')
    .replace(/[úü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '')
  
  // Mapeo específico para casos especiales de Morelos
  const municipioMap: { [key: string]: string } = {
    'cuernavaca': 'cuernavaca.gif',
    'temixco': 'temixco.gif',
    'jiutepec': 'jiutepec.gif',
    'cuautla': 'cuautla.gif',
    'yautepec': 'yautepec.gif',
    'jojutla': 'jojutla.gif',
    'tepoztlan': 'tepoztlan.gif',
    'ayala': 'ayala.gif',
    'tetecala': 'tetecala.gif',
    'xochitepec': 'xochitepec.gif',
    'zacatepec': 'zacatepec.png', // Este es PNG
    'emilianozapata': 'emilianozapata.gif',
    'tlaltizapan': 'tlaltizapan.gif',
    'tlaltizapandezapata': 'tlaltizapan.gif', // Mapear variación del nombre
    'tlayacapan': 'tlayacapan.gif',
    'tlaquiltenango': 'tlaquiltenango.gif',
    'yecapixtla': 'yecapixtla.gif',
    'atlatlahucan': 'atlatlahucan.gif',
    'axochiapan': 'axochiapan.gif',
    'temoac': 'temoac.gif',
    'tepalcingo': 'tepalcingo.gif',
    'jonacatepec': 'jonacatepec.gif',
    'jantetelco': 'jantetelco.gif',
    'amacuzac': 'amacuzac.gif',
    'puentedeixtla': 'puentedeixtla.gif',
    'xoxocotla': 'xoxocotla.gif',
    'coatlandelrio': 'coatlandelrio.gif',
    'mazatepec': 'mazatepec.gif',
    'miacatlan': 'miacatlan.gif',
    'coatetelco': 'coatetelco.gif',
    'tetecaladelvolcan': 'teteladelvolcan.gif',
    'teteladelvolcan': 'teteladelvolcan.gif',
    'ocuituco': 'ocuituco.gif',
    'hueyapan': 'hueyapan.gif',
    'totolapan': 'totolapan.gif',
    'huitzilac': 'huitzilac.gif',
    'tlalnepantla': 'tlalnepantla.gif',
    'zacualpan': 'zacualpan.gif'
  }
  
  const fileName = municipioMap[normalized] || `${normalized}.gif`
  return `/img/municipios/${fileName}`
}

// Componente para mostrar el ícono del municipio
const MunicipioIcon = ({ municipio, className = "h-6 w-6" }: { municipio: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(getMunicipioIcon(municipio))
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const handleError = () => {
    if (!hasError) {
      // Si falla la imagen específica, intentar con la imagen por defecto
      if (!imgSrc.includes('default.gif')) {
        setImgSrc('/img/municipios/default.gif')
        setHasError(false)
        setIsLoading(true)
      } else {
        // Si también falla la imagen por defecto, usar ícono genérico RECTANGULAR
        setHasError(true)
        setIsLoading(false)
      }
    }
  }
  
  const handleLoad = () => {
    setIsLoading(false)
  }
  
  // Si hay error con todas las imágenes, usar ícono genérico RECTANGULAR
  if (hasError) {
    return (
      <div className={`${className} relative overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center rounded-md`}>
        <Building2 className="h-4 w-4 text-slate-600" />
      </div>
    )
  }
  
  return (
    <div className={`${className} relative overflow-hidden border border-slate-300 rounded-md bg-white`}>
      {isLoading && (
        <MunicipioIconSkeleton className={className} />
      )}
      <Image
        src={imgSrc}
        alt={`Escudo de ${municipio}`}
        width={32}
        height={32}
        className={`object-cover w-full h-full transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized // Para permitir archivos .gif
        priority={false} // No es contenido crítico
      />
    </div>
  )
}

interface TableroDiagnosticosProps {
  diagnosticos: DiagnosticoMunicipal[]
  loading: boolean
  onDiagnosticosUpdate?: () => void
}

export default function TableroDiagnosticosClient({
  diagnosticos,
  loading,
  onDiagnosticosUpdate
}: TableroDiagnosticosProps) {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedMunicipio, setSelectedMunicipio] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const { measureOperation, reportCustomMetric } = usePerformance('TableroDiagnosticos')

  // Toast context - siempre llamar el hook
  const toast = useToastContext()

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce del searchTerm para optimizar rendimiento
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Función para expandir/contraer filas - memoizada
  const toggleRowExpansion = useCallback((diagnosticoId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(diagnosticoId)) {
        newSet.delete(diagnosticoId)
      } else {
        newSet.add(diagnosticoId)
      }
      return newSet
    })
  }, [])

  // Componente para mostrar las acciones expandidas
  const AccionesExpandidas = ({ diagnostico }: { diagnostico: DiagnosticoMunicipal }) => {
    const acciones = diagnostico.acciones || []
    const hasPDFs = diagnostico.solicitudUrl || diagnostico.respuestaUrl
    
    return (
      <div className="bg-gray-50 border-t">
        <div className="p-6">
          {/* Grid de 2 columnas para PDFs y Acciones */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sección de Documentos PDF */}
            {hasPDFs && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileDown className="h-5 w-5 mr-2 text-red-600" />
                  Documentos PDF
                </h4>
                <div className="space-y-3">
                  {diagnostico.solicitudUrl && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Solicitud</p>
                            <p className="text-sm text-gray-600">Documento de solicitud</p>
                          </div>
                        </div>
                        <a
                          href={diagnostico.solicitudUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir PDF
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {diagnostico.respuestaUrl && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileDown className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Respuesta</p>
                            <p className="text-sm text-gray-600">Documento de respuesta</p>
                          </div>
                        </div>
                        <a
                          href={diagnostico.respuestaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir PDF
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Acciones */}
            <div className={!hasPDFs ? "lg:col-span-2" : ""}>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                Acciones del Diagnóstico ({acciones.length})
              </h4>
              
              {acciones.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay acciones registradas para este diagnóstico</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acciones.map((accion: any, index: number) => (
                    <div key={accion.id || index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              variant={accion.completada ? "default" : "secondary"}
                              className={accion.completada ? "bg-green-100 text-green-800" : ""}
                            >
                              {accion.completada ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completada
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendiente
                                </>
                              )}
                            </Badge>
                            <Badge variant="outline">
                              {accion.descripcion || 'Sin tipo especificado'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {accion.fechaLimite && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Fecha límite: {new Date(accion.fechaLimite).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {(accion.urlAccion || accion.responsable) && (
                              <div className="flex items-center text-gray-600">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                <a
                                  href={accion.urlAccion || accion.responsable}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  Ver documento de acción
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {accion.completada ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Memoizar datos filtrados para evitar recálculos innecesarios
  const filteredDiagnosticos = useMemo(() => {
    if (!mounted) return []
    
    return diagnosticos.filter(diagnostico => {
      const searchMatch = !debouncedSearchTerm || 
        diagnostico.municipio?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.actividad?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnostico.nombreActividad?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const municipioMatch = !selectedMunicipio || diagnostico.municipio === selectedMunicipio
      const estadoMatch = !selectedEstado || diagnostico.estado === selectedEstado
      
      return searchMatch && municipioMatch && estadoMatch
    })
  }, [mounted, diagnosticos, debouncedSearchTerm, selectedMunicipio, selectedEstado])

  // Memoizar agrupación por municipio
  const diagnosticosPorMunicipio = useMemo(() => {
    if (!mounted) return {}
    
    return filteredDiagnosticos.reduce((acc: any, diagnostico) => {
      const municipio = diagnostico.municipio
      if (!acc[municipio]) {
        acc[municipio] = {
          municipio,
          diagnosticos: [],
          promedioEvaluacion: 0,
          totalAcciones: 0,
          accionesCompletadas: 0
        }
      }
      
      acc[municipio].diagnosticos.push(diagnostico)
      
      // Calcular métricas
      const evaluaciones = acc[municipio].diagnosticos.map((d: any) => d.evaluacion || 0)
      acc[municipio].promedioEvaluacion = evaluaciones.reduce((sum: number, val: number) => sum + val, 0) / evaluaciones.length
      
      acc[municipio].totalAcciones = acc[municipio].diagnosticos.reduce((sum: number, d: any) => 
        sum + (d.acciones?.length || 0), 0)
      acc[municipio].accionesCompletadas = acc[municipio].diagnosticos.reduce((sum: number, d: any) => 
        sum + (d.acciones?.filter((a: any) => a.completada).length || 0), 0)
      
      return acc
    }, {})
  }, [mounted, filteredDiagnosticos])

  const gruposMunicipios = useMemo(() => {
    if (!mounted) return []
    
    return Object.values(diagnosticosPorMunicipio)
      .filter((grupo: any) => grupo && grupo.municipio)
      .sort((a: any, b: any) => a.municipio.localeCompare(b.municipio))
  }, [mounted, diagnosticosPorMunicipio])

  // Memoizar municipios únicos para el filtro
  const municipiosUnicos = useMemo(() => {
    if (!mounted) return []
    return [...new Set(diagnosticos.map(d => d.municipio).filter(Boolean))].sort()
  }, [mounted, diagnosticos])

  // Memoizar estados únicos para el filtro
  const estadosUnicos = useMemo(() => {
    if (!mounted) return []
    return [...new Set(diagnosticos.map(d => d.estado).filter(Boolean))].sort()
  }, [mounted, diagnosticos])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros skeleton */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Tabla skeleton */}
            <TableSkeleton rows={8} columns={6} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar loading mientras el componente se está montando
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros skeleton */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Contenido skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">
                Diagnósticos Municipales
              </CardTitle>
              <p className="text-blue-100 mt-2">
                {filteredDiagnosticos?.length || 0} diagnósticos en {gruposMunicipios?.length || 0} municipios
              </p>
            </div>
            <Link href="/dashboard/diagnosticos/crear">
              <Button variant="secondary" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Diagnóstico
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por municipio, actividad..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value || '')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Municipio</label>
              <select
                value={selectedMunicipio || ''}
                onChange={(e) => setSelectedMunicipio(e.target.value || '')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                <option value="">Todos los municipios</option>
                {(municipiosUnicos || []).map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={selectedEstado || ''}
                onChange={(e) => setSelectedEstado(e.target.value || '')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                <option value="">Todos los estados</option>
                {(estadosUnicos || []).map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnósticos por municipio */}
      <div className="space-y-6">
        {(gruposMunicipios || []).map((grupo: any) => {
          if (!grupo || !grupo.municipio || !Array.isArray(grupo.diagnosticos)) {
            return null
          }

          return (
            <Card key={grupo.municipio} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MunicipioIcon municipio={grupo.municipio} className="h-8 w-8" />
                    <div>
                      <CardTitle className="text-xl text-gray-800">
                        {grupo.municipio}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {grupo.diagnosticos.length} diagnósticos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: getColorByPromedio(grupo.promedioEvaluacion) }}
                      >
                        {Math.round(grupo.promedioEvaluacion)}%
                      </div>
                      <div className="text-xs text-gray-500">Promedio</div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200">
                      {grupo.accionesCompletadas}/{grupo.totalAcciones} acciones
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {grupo.diagnosticos.map((diagnostico: DiagnosticoMunicipal) => {
                    const isExpanded = expandedRows.has(diagnostico.id)
                    const hasAcciones = diagnostico.acciones && diagnostico.acciones.length > 0
                    
                    return (
                      <div key={diagnostico.id}>
                        {/* Fila principal del diagnóstico */}
                        <div 
                          className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => toggleRowExpansion(diagnostico.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                >
                                  {diagnostico.actividad}
                                </Badge>
                                <Badge 
                                  className={
                                    diagnostico.estado === 'Completado' 
                                      ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                                      : diagnostico.estado === 'En Proceso'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                                  }
                                >
                                  {diagnostico.estado}
                                </Badge>
                                {hasAcciones && (
                                  <Badge 
                                    className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                                  >
                                    {diagnostico.acciones?.length || 0} {diagnostico.acciones?.length === 1 ? 'acción' : 'acciones'}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                                {hasAcciones && (
                                  <span className="mr-2">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                  </span>
                                )}
                                {diagnostico.nombreActividad}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {diagnostico.unidadAdministrativa}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  {diagnostico.evaluacion}%
                                </span>
                                <span className="flex items-center">
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  {diagnostico.acciones?.length || 0} acciones
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(diagnostico.fechaCreacion).toLocaleDateString()}
                                </span>
                                {hasAcciones && (
                                  <span className="text-blue-600 text-xs">
                                    Click para {isExpanded ? 'ocultar' : 'ver'} acciones
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: getColorByPromedio(diagnostico.evaluacion) }}
                              >
                                {diagnostico.evaluacion}%
                              </div>
                              <Link 
                                href={`/dashboard/diagnosticos/editar/${diagnostico.id}`}
                                onClick={(e) => e.stopPropagation()} // Evita que se expanda al hacer click en editar
                              >
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                        
                        {/* Fila expandida con acciones */}
                        {isExpanded && <AccionesExpandidas diagnostico={diagnostico} />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!mounted ? (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : (filteredDiagnosticos?.length === 0) ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron diagnósticos
            </h3>
            <p className="text-gray-600 mb-4">
              No hay diagnósticos que coincidan con los filtros seleccionados.
            </p>
            <Link href="/dashboard/diagnosticos/crear">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer diagnóstico
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
