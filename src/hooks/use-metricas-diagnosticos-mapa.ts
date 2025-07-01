"use client"

import { useState, useEffect } from 'react'
import { useDiagnosticosMunicipales, type DiagnosticoMunicipal } from './use-diagnosticos-municipales'

export interface MetricasMunicipioMapa {
  id: string
  name: string
  diagnosticosRegistrados: number
  promedioEvaluacion: number
  diagnosticosCompletados: number
  diagnosticosEnProceso: number
  diagnosticosPendientes: number
  porcentajeCompletado: number
  tiposActividades: string[]
  unidadesAdministrativas: string[]
  ultimaActualizacion?: Date
  // Nuevas métricas del tablero detallado
  accionesTotales: number
  accionesCompletadas: number
  porcentajeAccionesCompletadas: number
  evaluacionPromedio: number
  municipioMejorEvaluado: boolean
  tendenciaEvaluacion: 'mejora' | 'estable' | 'deterioro'
  nivelActividad: 'alto' | 'medio' | 'bajo'
  alertasCalidad: string[]
  tiempoPromedioCompletado: number // días
}

// Lista completa de municipios de Morelos con sus IDs del mapa (corregida según geodata)
const MUNICIPIOS_MORELOS = [
  { id: "17001", name: "Amacuzac" },
  { id: "17002", name: "Atlatlahucan" },
  { id: "17003", name: "Axochiapan" },
  { id: "17004", name: "Ayala" },
  { id: "17005", name: "Coatlán del Río" },
  { id: "17006", name: "Cuautla" },
  { id: "17007", name: "Cuernavaca" },
  { id: "17008", name: "Emiliano Zapata" },
  { id: "17009", name: "Huitzilac" },
  { id: "17010", name: "Jantetelco" },
  { id: "17011", name: "Jiutepec" },
  { id: "17012", name: "Jojutla" },
  { id: "17013", name: "Jonacatepec de Leandro Valle" },
  { id: "17014", name: "Mazatepec" },
  { id: "17015", name: "Miacatlán" },
  { id: "17016", name: "Ocuituco" },
  { id: "17017", name: "Puente de Ixtla" },
  { id: "17018", name: "Temixco" },
  { id: "17019", name: "Tepalcingo" },
  { id: "17020", name: "Tepoztlán" },
  { id: "17021", name: "Tetecala" },
  { id: "17022", name: "Tetela del Volcán" },
  { id: "17023", name: "Tlalnepantla" },
  { id: "17024", name: "Tlaltizapán de Zapata" },
  { id: "17025", name: "Tlaquiltenango" },
  { id: "17026", name: "Tlayacapan" },
  { id: "17027", name: "Totolapan" },
  { id: "17028", name: "Xochitepec" },
  { id: "17029", name: "Yautepec" },
  { id: "17030", name: "Yecapixtla" },
  { id: "17031", name: "Zacatepec" },
  { id: "17032", name: "Zacualpan de Amilpas" },
  { id: "17033", name: "Temoac" },
  { id: "17034", name: "Hueyapan" },
  { id: "17035", name: "Coatetelco" },
  { id: "17036", name: "Xoxocotla" }
]



export function useMetricasDiagnosticosMapa() {
  const [metricasMunicipios, setMetricasMunicipios] = useState<MetricasMunicipioMapa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    diagnosticos, 
    loading: diagnosticosLoading, 
    error: diagnosticosError 
  } = useDiagnosticosMunicipales()

  useEffect(() => {
    const calcularMetricasPorMunicipio = () => {
      try {
        setLoading(true)
        
        const metricasCalculadas: MetricasMunicipioMapa[] = MUNICIPIOS_MORELOS.map(municipio => {
          // Función mejorada para matching de nombres de municipios
          const matchMunicipio = (nombreBD: string, nombreMapa: string): boolean => {
            if (!nombreBD || !nombreMapa) return false
            
            const normalizarNombre = (nombre: string) => {
              if (!nombre || typeof nombre !== 'string') return ''
              return nombre.toLowerCase().trim()
                .replace(/\s+/g, ' ')
                .replace(/á|à/g, 'a')
                .replace(/é|è/g, 'e')
                .replace(/í|ì/g, 'i')
                .replace(/ó|ò/g, 'o')
                .replace(/ú|ù/g, 'u')
                .replace(/ñ/g, 'n')
            }
            
            const nombreBDNorm = normalizarNombre(nombreBD)
            const nombreMapaNorm = normalizarNombre(nombreMapa)
            
            if (!nombreBDNorm || !nombreMapaNorm) return false
            
            // 1. Coincidencia exacta
            if (nombreBDNorm === nombreMapaNorm) return true
            
            // 2. Coincidencia con nombre base (sin sufijos como "de X", "del X")
            const nombreBaseBD = nombreBDNorm.split(' de ')[0].split(' del ')[0]
            const nombreBaseMapa = nombreMapaNorm.split(' de ')[0].split(' del ')[0]
            if (nombreBaseBD === nombreBaseMapa) return true
            
            // 3. Coincidencia flexible (contiene)
            if (nombreBDNorm.includes(nombreBaseMapa) || nombreMapaNorm.includes(nombreBDNorm)) return true
            
            // 4. Casos especiales conocidos
            const casosEspeciales = [
              ['jonacatepec', 'jonacatepec de leandro valle'],
              ['tlaltizapan', 'tlaltizapan de zapata'],
              ['zacualpan', 'zacualpan de amilpas'],
              ['tetela', 'tetela del volcan']
            ]
            
            return casosEspeciales.some(([corto, largo]) => 
              (nombreBDNorm === corto && nombreMapaNorm === largo) ||
              (nombreBDNorm === largo && nombreMapaNorm === corto)
            )
          }
          
          // Filtrar diagnósticos por municipio
          const diagnosticosMunicipio = diagnosticos.filter(d => {
            if (!d.municipio) return false
            return matchMunicipio(d.municipio, municipio.name)
          })
          
          const totalDiagnosticos = diagnosticosMunicipio.length
          const completados = diagnosticosMunicipio.filter(d => d.estado === 'Completado').length
          const enProceso = diagnosticosMunicipio.filter(d => d.estado === 'En Proceso').length
          const pendientes = diagnosticosMunicipio.filter(d => d.estado === 'Pendiente').length
          
          // Calcular promedio de evaluación
          const evaluaciones = diagnosticosMunicipio
            .filter(d => d.evaluacion !== undefined && d.evaluacion !== null)
            .map(d => d.evaluacion)
          
          const promedioEvaluacion = evaluaciones.length > 0 
            ? Math.round(evaluaciones.reduce((sum, evaluacion) => sum + evaluacion, 0) / evaluaciones.length)
            : 0


          
          // Calcular porcentaje de completado
          const porcentajeCompletado = totalDiagnosticos > 0 
            ? Math.round((completados / totalDiagnosticos) * 100)
            : 0
          
          // Obtener tipos de actividades únicos
          const tiposActividades = [...new Set(
            diagnosticosMunicipio.map(d => d.actividad).filter(Boolean)
          )]
          
          // Obtener unidades administrativas únicas
          const unidadesAdministrativas = [...new Set(
            diagnosticosMunicipio.map(d => d.unidadAdministrativa).filter(Boolean)
          )]
          
          // Obtener última actualización
          const fechasActualizacion = diagnosticosMunicipio
            .map(d => d.fechaActualizacion)
            .filter(Boolean)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          
          const ultimaActualizacion = fechasActualizacion.length > 0 
            ? new Date(fechasActualizacion[0])
            : undefined

          // Calcular métricas de acciones
          const todasLasAcciones = diagnosticosMunicipio
            .flatMap(d => d.acciones || [])
          
          const accionesTotales = todasLasAcciones.length
          const accionesCompletadas = todasLasAcciones.filter(a => a.completada).length
          const porcentajeAccionesCompletadas = accionesTotales > 0 
            ? Math.round((accionesCompletadas / accionesTotales) * 100)
            : 0

          // Calcular tendencia de evaluación (simplificado)
          const evaluacionesOrdenadas = diagnosticosMunicipio
            .filter(d => d.evaluacion !== undefined)
            .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
            .map(d => d.evaluacion)

          let tendenciaEvaluacion: 'mejora' | 'estable' | 'deterioro' = 'estable'
          if (evaluacionesOrdenadas.length >= 2) {
            const primera = evaluacionesOrdenadas[0]
            const ultima = evaluacionesOrdenadas[evaluacionesOrdenadas.length - 1]
            if (ultima > primera + 5) tendenciaEvaluacion = 'mejora'
            else if (ultima < primera - 5) tendenciaEvaluacion = 'deterioro'
          }

          // Calcular nivel de actividad
          const nivelActividad = totalDiagnosticos >= 5 ? 'alto' : 
                                totalDiagnosticos >= 2 ? 'medio' : 'bajo'

          // Generar alertas de calidad
          const alertasCalidad: string[] = []
          if (promedioEvaluacion < 60 && totalDiagnosticos > 0) {
            alertasCalidad.push('Evaluación baja')
          }
          if (pendientes > completados && totalDiagnosticos > 2) {
            alertasCalidad.push('Muchos pendientes')
          }
          if (porcentajeAccionesCompletadas < 50 && accionesTotales > 0) {
            alertasCalidad.push('Acciones incompletas')
          }

          // Calcular tiempo promedio de completado (días)
          const diagnosticosCompletadosConFechas = diagnosticosMunicipio
            .filter(d => d.estado === 'Completado' && d.fechaCreacion && d.fechaActualizacion)
          
          const tiempoPromedioCompletado = diagnosticosCompletadosConFechas.length > 0
            ? Math.round(
                diagnosticosCompletadosConFechas.reduce((sum, d) => {
                  const inicio = new Date(d.fechaCreacion).getTime()
                  const fin = new Date(d.fechaActualizacion).getTime()
                  return sum + ((fin - inicio) / (1000 * 60 * 60 * 24))
                }, 0) / diagnosticosCompletadosConFechas.length
              )
            : 0

          // Solo usar datos reales, sin datos de prueba
          return {
            id: municipio.id,
            name: municipio.name,
            diagnosticosRegistrados: totalDiagnosticos,
            promedioEvaluacion: promedioEvaluacion,
            diagnosticosCompletados: completados,
            diagnosticosEnProceso: enProceso,
            diagnosticosPendientes: pendientes,
            porcentajeCompletado: porcentajeCompletado,
            tiposActividades: tiposActividades,
            unidadesAdministrativas: unidadesAdministrativas,
            ultimaActualizacion,
            // Nuevas métricas
            accionesTotales: accionesTotales,
            accionesCompletadas: accionesCompletadas,
            porcentajeAccionesCompletadas: porcentajeAccionesCompletadas,
            evaluacionPromedio: promedioEvaluacion,
            municipioMejorEvaluado: false, // Se calculará después
            tendenciaEvaluacion: tendenciaEvaluacion,
            nivelActividad: nivelActividad,
            alertasCalidad: alertasCalidad,
            tiempoPromedioCompletado: tiempoPromedioCompletado
          }
        })

        // Marcar municipios mejor evaluados (top 3)
        const municipiosConDatos = metricasCalculadas
          .filter(m => m.diagnosticosRegistrados > 0)
          .sort((a, b) => b.promedioEvaluacion - a.promedioEvaluacion)
        
        metricasCalculadas.forEach(municipio => {
          municipio.municipioMejorEvaluado = municipiosConDatos
            .slice(0, 3)
            .some(m => m.id === municipio.id)
        })
        
        setMetricasMunicipios(metricasCalculadas)
        setError(null)
      } catch (err) {
        console.error('Error calculating municipality metrics:', err)
        setError('Error al calcular métricas por municipio')
      } finally {
        setLoading(false)
      }
    }

    if (!diagnosticosLoading && !diagnosticosError) {
      calcularMetricasPorMunicipio()
    } else if (diagnosticosError) {
      setError(diagnosticosError)
      setLoading(false)
    }
  }, [diagnosticos, diagnosticosLoading, diagnosticosError])

  // Calcular estadísticas generales
  const estadisticasGenerales = {
    totalMunicipios: MUNICIPIOS_MORELOS.length,
    municipiosConDiagnosticos: metricasMunicipios.filter(m => m.diagnosticosRegistrados > 0).length,
    totalDiagnosticos: metricasMunicipios.reduce((sum, m) => sum + m.diagnosticosRegistrados, 0),
    promedioGeneralEvaluacion: metricasMunicipios.length > 0 
      ? Math.round(metricasMunicipios.reduce((sum, m) => sum + m.promedioEvaluacion, 0) / metricasMunicipios.length)
      : 0,
    porcentajeGeneralCompletado: metricasMunicipios.length > 0
      ? Math.round(metricasMunicipios.reduce((sum, m) => sum + m.porcentajeCompletado, 0) / metricasMunicipios.length)
      : 0,
    municipiosMejorEvaluados: metricasMunicipios
      .filter(m => m.diagnosticosRegistrados > 0)
      .sort((a, b) => b.promedioEvaluacion - a.promedioEvaluacion)
      .slice(0, 5),
    municipiosMasActivos: metricasMunicipios
      .sort((a, b) => b.diagnosticosRegistrados - a.diagnosticosRegistrados)
      .slice(0, 5),
    // Nuevas estadísticas generales
    totalAcciones: metricasMunicipios.reduce((sum, m) => sum + m.accionesTotales, 0),
    totalAccionesCompletadas: metricasMunicipios.reduce((sum, m) => sum + m.accionesCompletadas, 0),
    porcentajeGeneralAccionesCompletadas: (() => {
      const totalAcc = metricasMunicipios.reduce((sum, m) => sum + m.accionesTotales, 0)
      const completadasAcc = metricasMunicipios.reduce((sum, m) => sum + m.accionesCompletadas, 0)
      return totalAcc > 0 ? Math.round((completadasAcc / totalAcc) * 100) : 0
    })(),
    municipiosConAlertas: metricasMunicipios.filter(m => m.alertasCalidad.length > 0).length,
    municipiosEnMejora: metricasMunicipios.filter(m => m.tendenciaEvaluacion === 'mejora').length,
    municipiosEnDeterioro: metricasMunicipios.filter(m => m.tendenciaEvaluacion === 'deterioro').length,
    tiempoPromedioGeneralCompletado: (() => {
      const municipiosConTiempo = metricasMunicipios.filter(m => m.tiempoPromedioCompletado > 0)
      return municipiosConTiempo.length > 0
        ? Math.round(municipiosConTiempo.reduce((sum, m) => sum + m.tiempoPromedioCompletado, 0) / municipiosConTiempo.length)
        : 0
    })(),
    distribucionNivelActividad: {
      alto: metricasMunicipios.filter(m => m.nivelActividad === 'alto').length,
      medio: metricasMunicipios.filter(m => m.nivelActividad === 'medio').length,
      bajo: metricasMunicipios.filter(m => m.nivelActividad === 'bajo').length
    }
  }

  return {
    metricasMunicipios,
    loading: loading || diagnosticosLoading,
    error: error || diagnosticosError,
    estadisticasGenerales,
    refresh: () => {
      // Esta función se puede usar para refrescar los datos si es necesario
      setLoading(true)
    }
  }
}
