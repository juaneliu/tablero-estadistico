'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react"

interface DiagnosticoMunicipio {
  id: string
  nombre: string
  region: string
  estado: 'completado' | 'en_proceso' | 'pendiente'
  fechaInicio?: string
  fechaCompletado?: string
  progreso: number
  tiposDiagnostico: string[]
}

export function DiagnosticosList() {
  const [isClient, setIsClient] = useState(false)
  const [diagnosticosMunicipios, setDiagnosticosMunicipios] = useState<DiagnosticoMunicipio[]>([])

  // Detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar y procesar diagnósticos del localStorage solo en el cliente
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    try {
      const diagnosticosGuardados = localStorage.getItem('diagnosticos-municipales')
      if (diagnosticosGuardados) {
        const diagnosticos = JSON.parse(diagnosticosGuardados)
        
        // Convertir los diagnósticos a formato de municipio
        const municipiosMap = new Map<string, DiagnosticoMunicipio>()
        
        diagnosticos.forEach((diag: any) => {
          if (!municipiosMap.has(diag.municipio)) {
            municipiosMap.set(diag.municipio, {
              id: diag.municipio,
              nombre: diag.municipio,
              region: 'Morelos', // Todos son de Morelos
              estado: diag.estado,
              fechaInicio: diag.fechaCreacion,
              fechaCompletado: diag.estado === 'completado' ? diag.fechaCreacion : undefined,
              progreso: diag.estado === 'completado' ? 100 : diag.estado === 'en_proceso' ? 50 : 0,
              tiposDiagnostico: [diag.actividad]
            })
          } else {
            // Si ya existe, agregar el tipo de diagnóstico
            const existing = municipiosMap.get(diag.municipio)!
            if (!existing.tiposDiagnostico.includes(diag.actividad)) {
              existing.tiposDiagnostico.push(diag.actividad)
            }
          }
        })
        
        setDiagnosticosMunicipios(Array.from(municipiosMap.values()))
      }
    } catch (error) {
      console.error('Error al cargar diagnósticos del localStorage:', error)
    }
  }, [isClient])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'en_proceso':
        return <Badge className="bg-yellow-100 text-yellow-800">En Proceso</Badge>
      case 'pendiente':
        return <Badge className="bg-red-100 text-red-800">Pendiente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'en_proceso':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'pendiente':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No disponible'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Mostrar loader durante la hidratación
  if (!isClient) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Diagnósticos por Municipio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Cargando diagnósticos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Diagnósticos por Municipio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {diagnosticosMunicipios.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                No hay diagnósticos por municipio registrados
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Los diagnósticos aparecerán aquí una vez que se registren a través del formulario de creación. 
                Cada municipio tendrá su propia tarjeta con información detallada del progreso.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>36 municipios</strong> de Morelos disponibles para diagnóstico
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>0 diagnósticos</strong> completados hasta ahora
                </p>
              </div>
            </div>
          ) : (
            diagnosticosMunicipios.map((diagnostico) => (
            <div
              key={diagnostico.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {getEstadoIcon(diagnostico.estado)}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium truncate">{diagnostico.nombre}</span>
                    <Badge variant="outline" className="text-xs w-fit">
                      {diagnostico.region}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {diagnostico.estado === 'completado' && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Completado: {formatearFecha(diagnostico.fechaCompletado)}</span>
                      </div>
                    )}
                    {diagnostico.estado === 'en_proceso' && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                        <span>Progreso: {diagnostico.progreso}%</span>
                      </div>
                    )}
                    {diagnostico.tiposDiagnostico.length > 0 && (
                      <span className="whitespace-nowrap">
                        {diagnostico.tiposDiagnostico.length} tipo{diagnostico.tiposDiagnostico.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end sm:justify-center gap-2">
                {getEstadoBadge(diagnostico.estado)}
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
