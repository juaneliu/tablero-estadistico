'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { DiagnosticoData, EstadisticasData } from '@/lib/informes-service'

export interface FiltrosInformes {
  trimestre: string
  año: number
  municipio: string
  evaluacionMin: number
  evaluacionMax: number
  fechaInicio?: Date
  fechaFin?: Date
}

export const useInformes = (diagnosticosOriginales: DiagnosticoData[]) => {
  const [isClient, setIsClient] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosInformes>({
    trimestre: 'todos',
    año: 2025,
    municipio: 'todos',
    evaluacionMin: 0,
    evaluacionMax: 100
  })
  
  const [vistaPersonalizada, setVistaPersonalizada] = useState<{
    nombre: string
    metricas: string[]
    filtros: FiltrosInformes
  } | null>(null)

  // Detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrar diagnósticos basado en los filtros activos
  const diagnosticosFiltrados = useMemo(() => {
    let resultado = [...diagnosticosOriginales]

    // Filtro por trimestre
    if (filtros.trimestre && filtros.trimestre !== 'todos') {
      const rangosTrimetres = {
        'Q1': { inicio: new Date(filtros.año, 0, 1), fin: new Date(filtros.año, 2, 31) },
        'Q2': { inicio: new Date(filtros.año, 3, 1), fin: new Date(filtros.año, 5, 30) },
        'Q3': { inicio: new Date(filtros.año, 6, 1), fin: new Date(filtros.año, 8, 30) },
        'Q4': { inicio: new Date(filtros.año, 9, 1), fin: new Date(filtros.año, 11, 31) }
      }
      
      const rango = rangosTrimetres[filtros.trimestre as keyof typeof rangosTrimetres]
      if (rango) {
        resultado = resultado.filter(diag => {
          const fechaCreacion = diag.fechaCreacion instanceof Date ? 
            diag.fechaCreacion : 
            new Date(diag.fechaCreacion)
          return fechaCreacion >= rango.inicio && fechaCreacion <= rango.fin
        })
      }
    }

    // Filtro por municipio
    if (filtros.municipio && filtros.municipio !== 'todos') {
      resultado = resultado.filter(diag => 
        diag.municipio.toLowerCase().includes(filtros.municipio.toLowerCase())
      )
    }

    // Filtro por rango de evaluación
    resultado = resultado.filter(diag => 
      diag.evaluacion >= filtros.evaluacionMin && 
      diag.evaluacion <= filtros.evaluacionMax
    )

    // Filtro por rango de fechas personalizado
    if (filtros.fechaInicio) {
      resultado = resultado.filter(diag => {
        const fechaCreacion = diag.fechaCreacion instanceof Date ? 
          diag.fechaCreacion : 
          new Date(diag.fechaCreacion)
        return fechaCreacion >= filtros.fechaInicio!
      })
    }
    
    if (filtros.fechaFin) {
      resultado = resultado.filter(diag => {
        const fechaCreacion = diag.fechaCreacion instanceof Date ? 
          diag.fechaCreacion : 
          new Date(diag.fechaCreacion)
        return fechaCreacion <= filtros.fechaFin!
      })
    }

    return resultado
  }, [diagnosticosOriginales, filtros])

  // Calcular estadísticas de los diagnósticos filtrados
  const estadisticasFiltradas = useMemo((): EstadisticasData => {
    const total = diagnosticosFiltrados.length
    const completados = diagnosticosFiltrados.filter(d => d.evaluacion === 100).length
    const pendientes = diagnosticosFiltrados.filter(d => d.evaluacion === 0).length
    const enProceso = total - completados - pendientes
    const promedioGeneral = total > 0 ? 
      diagnosticosFiltrados.reduce((sum, d) => sum + d.evaluacion, 0) / total : 0

    return {
      total,
      completados,
      enProceso,
      pendientes,
      promedioGeneral
    }
  }, [diagnosticosFiltrados])

  // Obtener municipios únicos para el filtro
  const municipiosUnicos = useMemo(() => {
    const municipios = [...new Set(diagnosticosOriginales.map(diag => diag.municipio))]
    return municipios.sort()
  }, [diagnosticosOriginales])

  // Funciones para actualizar filtros
  const actualizarFiltro = useCallback((campo: keyof FiltrosInformes, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }, [])

  const resetearFiltros = useCallback(() => {
    setFiltros({
      trimestre: 'todos',
      año: 2025,
      municipio: 'todos',
      evaluacionMin: 0,
      evaluacionMax: 100
    })
  }, [])

  // Aplicar filtros predefinidos
  const aplicarFiltroTrimestre = useCallback((trimestre: string) => {
    setFiltros(prev => ({ ...prev, trimestre }))
  }, [])

  const aplicarFiltroMunicipio = useCallback((municipio: string) => {
    setFiltros(prev => ({ ...prev, municipio }))
  }, [])

  const aplicarFiltroEvaluacion = useCallback((min: number, max: number) => {
    setFiltros(prev => ({ ...prev, evaluacionMin: min, evaluacionMax: max }))
  }, [])

  // Funciones para análisis avanzado
  const obtenerTendencias = useMemo(() => {
    const diagnosticosPorMes = diagnosticosFiltrados.reduce((acc, diag) => {
      const fecha = diag.fechaCreacion instanceof Date ? 
        diag.fechaCreacion : 
        new Date(diag.fechaCreacion)
      const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!acc[mesAño]) {
        acc[mesAño] = { total: 0, sumaEvaluaciones: 0 }
      }
      
      acc[mesAño].total++
      acc[mesAño].sumaEvaluaciones += diag.evaluacion
      
      return acc
    }, {} as Record<string, { total: number, sumaEvaluaciones: number }>)

    return Object.entries(diagnosticosPorMes).map(([mes, datos]) => ({
      mes,
      total: datos.total,
      promedio: datos.sumaEvaluaciones / datos.total
    })).sort((a, b) => a.mes.localeCompare(b.mes))
  }, [diagnosticosFiltrados])

  const obtenerComparativas = useMemo(() => {
    const datosPorMunicipio = diagnosticosFiltrados.reduce((acc, diag) => {
      if (!acc[diag.municipio]) {
        acc[diag.municipio] = { total: 0, sumaEvaluaciones: 0, completados: 0 }
      }
      
      acc[diag.municipio].total++
      acc[diag.municipio].sumaEvaluaciones += diag.evaluacion
      if (diag.evaluacion === 100) acc[diag.municipio].completados++
      
      return acc
    }, {} as Record<string, { total: number, sumaEvaluaciones: number, completados: number }>)

    return Object.entries(datosPorMunicipio).map(([municipio, datos]) => ({
      municipio,
      totalDiagnosticos: datos.total,
      promedioEvaluacion: datos.total > 0 ? datos.sumaEvaluaciones / datos.total : 0,
      diagnosticosCompletados: datos.completados,
      porcentajeCompletados: datos.total > 0 ? (datos.completados / datos.total) * 100 : 0
    })).sort((a, b) => b.promedioEvaluacion - a.promedioEvaluacion)
  }, [diagnosticosFiltrados])

  // Funciones para vistas personalizadas
  const guardarVistaPersonalizada = useCallback((nombre: string, metricas: string[]) => {
    const nuevaVista = {
      nombre,
      metricas,
      filtros: { ...filtros }
    }
    setVistaPersonalizada(nuevaVista)
    
    // Guardar en localStorage solo si estamos en el cliente
    if (isClient && typeof window !== 'undefined') {
      const vistasGuardadas = JSON.parse(localStorage.getItem('vistasPersonalizadas') || '[]')
      vistasGuardadas.push(nuevaVista)
      localStorage.setItem('vistasPersonalizadas', JSON.stringify(vistasGuardadas))
    }
  }, [filtros, isClient])

  const cargarVistaPersonalizada = useCallback((vista: typeof vistaPersonalizada) => {
    if (vista) {
      setFiltros(vista.filtros)
      setVistaPersonalizada(vista)
    }
  }, [])

  const obtenerVistasGuardadas = useCallback(() => {
    if (!isClient || typeof window === 'undefined') {
      return []
    }
    try {
      return JSON.parse(localStorage.getItem('vistasPersonalizadas') || '[]')
    } catch (error) {
      console.error('Error al cargar vistas guardadas:', error)
      return []
    }
  }, [isClient])

  return {
    // Datos filtrados
    diagnosticosFiltrados,
    estadisticasFiltradas,
    
    // Filtros y estado
    filtros,
    municipiosUnicos,
    
    // Funciones de filtros
    actualizarFiltro,
    resetearFiltros,
    aplicarFiltroTrimestre,
    aplicarFiltroMunicipio,
    aplicarFiltroEvaluacion,
    
    // Análisis avanzado
    tendencias: obtenerTendencias,
    comparativas: obtenerComparativas,
    
    // Vistas personalizadas
    vistaPersonalizada,
    guardarVistaPersonalizada,
    cargarVistaPersonalizada,
    obtenerVistasGuardadas
  }
}
