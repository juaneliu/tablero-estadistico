import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface DiagnosticoData {
  id: number
  municipio: string
  actividad: string
  evaluacion: number
  estado: string
  fechaCreacion: Date | string
  fechaActualizacion: Date | string
  descripcion?: string
}

export interface EstadisticasData {
  total: number
  completados: number
  enProceso: number
  pendientes: number
  promedioGeneral: number
}

// Función para exportar diagnósticos a Excel
export const exportarDiagnosticosExcel = (
  diagnosticos: DiagnosticoData[], 
  tipo: 'todos' | 'completados' = 'todos'
) => {
  try {
    let datosParaExportar = diagnosticos

    if (tipo === 'completados') {
      datosParaExportar = diagnosticos.filter(d => d.evaluacion === 100)
    }

    // Crear workbook
    const wb = XLSX.utils.book_new()

    // ====== HOJA 1: RESUMEN EJECUTIVO ======
    const resumenData = [
      ['TABLERO ESTADÍSTICO - DIAGNÓSTICOS MUNICIPALES'],
      ['Estado de Morelos'],
      [''],
      ['Fecha de Generación:', new Date().toLocaleDateString('es-MX')],
      ['Período de Análisis:', 'Enero - Junio 2025'],
      ['Tipo de Exportación:', tipo === 'todos' ? 'Todos los Diagnósticos' : 'Solo Completados'],
      [''],
      ['RESUMEN EJECUTIVO'],
      [''],
      ['Métrica', 'Valor', 'Porcentaje'],
      ['Total de Diagnósticos', datosParaExportar.length, '100%'],
      ['Diagnósticos Completados', datosParaExportar.filter(d => d.evaluacion === 100).length, `${((datosParaExportar.filter(d => d.evaluacion === 100).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      ['Diagnósticos en Proceso', datosParaExportar.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length, `${((datosParaExportar.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      ['Diagnósticos Pendientes', datosParaExportar.filter(d => d.evaluacion === 0).length, `${((datosParaExportar.filter(d => d.evaluacion === 0).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      ['Promedio General de Evaluación', `${(datosParaExportar.reduce((sum, d) => sum + d.evaluacion, 0) / datosParaExportar.length).toFixed(2)}%`, ''],
      ['Municipios con Actividad', new Set(datosParaExportar.map(d => d.municipio)).size, '']
    ]

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
    
    // Estilos para el resumen
    wsResumen['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Título principal
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Subtítulo
      { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } }  // Resumen ejecutivo
    ]
    
    wsResumen['!cols'] = [
      { wch: 30 }, // Columna A
      { wch: 20 }, // Columna B
      { wch: 15 }  // Columna C
    ]

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo')

    // ====== HOJA 2: DATOS DETALLADOS ======
    const datosExcel = datosParaExportar.map(diag => ({
      'ID': diag.id,
      'Municipio': diag.municipio,
      'Actividad': diag.actividad,
      'Evaluación (%)': diag.evaluacion,
      'Estado': diag.estado,
      'Fecha Creación': diag.fechaCreacion instanceof Date ? 
        diag.fechaCreacion.toLocaleDateString('es-MX') : 
        new Date(diag.fechaCreacion).toLocaleDateString('es-MX'),
      'Fecha Actualización': diag.fechaActualizacion instanceof Date ? 
        diag.fechaActualizacion.toLocaleDateString('es-MX') : 
        new Date(diag.fechaActualizacion).toLocaleDateString('es-MX'),
      'Descripción': diag.descripcion || 'Sin descripción',
      'Clasificación': diag.evaluacion === 100 ? 'Excelente' : 
                      diag.evaluacion >= 80 ? 'Muy Bueno' :
                      diag.evaluacion >= 60 ? 'Bueno' :
                      diag.evaluacion >= 40 ? 'Regular' : 'Requiere Atención'
    }))

    const ws = XLSX.utils.json_to_sheet(datosExcel)

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Municipio
      { wch: 35 }, // Actividad
      { wch: 12 }, // Evaluación
      { wch: 15 }, // Estado
      { wch: 18 }, // Fecha Creación
      { wch: 18 }, // Fecha Actualización
      { wch: 45 }, // Descripción
      { wch: 18 }  // Clasificación
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Datos Detallados')

    // ====== HOJA 3: ANÁLISIS POR MUNICIPIOS ======
    const municipiosStats = datosParaExportar.reduce((acc, diag) => {
      if (!acc[diag.municipio]) {
        acc[diag.municipio] = { 
          total: 0, 
          completados: 0, 
          enProceso: 0, 
          pendientes: 0, 
          sumaEvaluaciones: 0 
        }
      }
      acc[diag.municipio].total++
      acc[diag.municipio].sumaEvaluaciones += diag.evaluacion
      
      if (diag.evaluacion === 100) acc[diag.municipio].completados++
      else if (diag.evaluacion === 0) acc[diag.municipio].pendientes++
      else acc[diag.municipio].enProceso++
      
      return acc
    }, {} as Record<string, any>)

    const municipiosData = Object.entries(municipiosStats).map(([municipio, stats]) => ({
      'Municipio': municipio,
      'Total Diagnósticos': stats.total,
      'Completados': stats.completados,
      'En Proceso': stats.enProceso,
      'Pendientes': stats.pendientes,
      'Promedio Evaluación (%)': (stats.sumaEvaluaciones / stats.total).toFixed(2),
      'Tasa Completitud (%)': ((stats.completados / stats.total) * 100).toFixed(1),
      'Ranking': '' // Se llenará después del ordenamiento
    })).sort((a, b) => parseFloat(b['Promedio Evaluación (%)']) - parseFloat(a['Promedio Evaluación (%)']))

    // Agregar ranking
    municipiosData.forEach((item, index) => {
      item.Ranking = (index + 1).toString()
    })

    const wsMunicipios = XLSX.utils.json_to_sheet(municipiosData)
    wsMunicipios['!cols'] = [
      { wch: 25 }, // Municipio
      { wch: 18 }, // Total
      { wch: 15 }, // Completados
      { wch: 15 }, // En Proceso
      { wch: 15 }, // Pendientes
      { wch: 20 }, // Promedio
      { wch: 18 }, // Tasa Completitud
      { wch: 10 }  // Ranking
    ]

    XLSX.utils.book_append_sheet(wb, wsMunicipios, 'Análisis por Municipios')

    // ====== HOJA 4: GRÁFICOS Y TENDENCIAS ======
    const tendenciasData = [
      ['ANÁLISIS DE TENDENCIAS Y MÉTRICAS'],
      [''],
      ['Distribución por Estado:'],
      ['Estado', 'Cantidad', 'Porcentaje'],
      ['Completado', datosParaExportar.filter(d => d.evaluacion === 100).length, `${((datosParaExportar.filter(d => d.evaluacion === 100).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      ['En Proceso', datosParaExportar.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length, `${((datosParaExportar.filter(d => d.evaluacion > 0 && d.evaluacion < 100).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      ['Pendiente', datosParaExportar.filter(d => d.evaluacion === 0).length, `${((datosParaExportar.filter(d => d.evaluacion === 0).length / datosParaExportar.length) * 100).toFixed(1)}%`],
      [''],
      ['Distribución por Rango de Evaluación:'],
      ['Rango', 'Cantidad', 'Descripción'],
      ['90-100%', datosParaExportar.filter(d => d.evaluacion >= 90).length, 'Excelente'],
      ['80-89%', datosParaExportar.filter(d => d.evaluacion >= 80 && d.evaluacion < 90).length, 'Muy Bueno'],
      ['70-79%', datosParaExportar.filter(d => d.evaluacion >= 70 && d.evaluacion < 80).length, 'Bueno'],
      ['60-69%', datosParaExportar.filter(d => d.evaluacion >= 60 && d.evaluacion < 70).length, 'Regular'],
      ['< 60%', datosParaExportar.filter(d => d.evaluacion < 60).length, 'Requiere Atención']
    ]

    const wsTendencias = XLSX.utils.aoa_to_sheet(tendenciasData)
    wsTendencias['!cols'] = [
      { wch: 30 }, // Descripción
      { wch: 15 }, // Cantidad
      { wch: 20 }  // Porcentaje/Descripción
    ]

    XLSX.utils.book_append_sheet(wb, wsTendencias, 'Análisis y Tendencias')

    // Descargar archivo
    const nombreArchivo = `diagnosticos_municipales_profesional_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)

    return { success: true, message: `Archivo profesional ${nombreArchivo} descargado exitosamente` }
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return { success: false, message: 'Error al generar el archivo Excel profesional' }
  }
}

// Función para generar PDF de reportes
export const generarReportePDF = async (
  diagnosticos: DiagnosticoData[],
  estadisticas: EstadisticasData,
  tipo: 'ejecutivo' | 'detallado' = 'ejecutivo'
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const fechaActual = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Función para agregar encabezado corporativo
    const agregarEncabezado = (pageNumber: number = 1) => {
      // Fondo del encabezado
      pdf.setFillColor(41, 128, 185) // Azul corporativo
      pdf.rect(0, 0, 210, 35, 'F')
      
      // Logo/Título principal
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TABLERO ESTADÍSTICO', 20, 22)
      
      // Subtítulo
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Diagnósticos Municipales - Estado de Morelos', 20, 30)
      
      // Número de página
      pdf.setFontSize(10)
      pdf.text(`Página ${pageNumber}`, 170, 30)
      
      // Línea decorativa
      pdf.setDrawColor(52, 152, 219)
      pdf.setLineWidth(1)
      pdf.line(20, 37, 190, 37)
    }

    // Función para agregar pie de página
    const agregarPieDePagina = () => {
      pdf.setTextColor(128, 128, 128)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generado el ${fechaActual}`, 20, 285)
      pdf.text('Sistema de Gestión Municipal - Gobierno del Estado de Morelos', 20, 290)
      
      // Línea del pie
      pdf.setDrawColor(200, 200, 200)
      pdf.setLineWidth(0.5)
      pdf.line(20, 280, 190, 280)
    }

    // Primera página
    agregarEncabezado(1)
    
    // Título del reporte
    pdf.setTextColor(41, 128, 185)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    const tituloReporte = tipo === 'ejecutivo' ? 'REPORTE EJECUTIVO' : 'REPORTE DETALLADO'
    pdf.text(tituloReporte, 20, 55)
    
    // Información del reporte
    pdf.setTextColor(70, 70, 70)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Fecha de Generación: ${fechaActual}`, 20, 65)
    pdf.text(`Período de Análisis: Enero - Junio 2025`, 20, 70)
    pdf.text(`Total de Registros Analizados: ${diagnosticos.length}`, 20, 75)

    let yPosition = 90

    // Sección de Resumen Ejecutivo
    pdf.setFillColor(245, 245, 245)
    pdf.rect(15, yPosition - 5, 180, 70, 'F')
    
    pdf.setTextColor(41, 128, 185)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESUMEN EJECUTIVO', 20, yPosition + 5)
    
    // Cuadros de métricas
    const metricas = [
      { label: 'Total Diagnósticos', valor: estadisticas.total, color: [52, 152, 219] },
      { label: 'Completados', valor: estadisticas.completados, color: [46, 204, 113] },
      { label: 'En Proceso', valor: estadisticas.enProceso, color: [241, 196, 15] },
      { label: 'Pendientes', valor: estadisticas.pendientes, color: [231, 76, 60] }
    ]

    let xMetricas = 25
    metricas.forEach((metrica, index) => {
      // Caja de métrica
      pdf.setFillColor(metrica.color[0], metrica.color[1], metrica.color[2])
      pdf.rect(xMetricas, yPosition + 15, 35, 25, 'F')
      
      // Valor
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text(metrica.valor.toString(), xMetricas + 17.5, yPosition + 25, { align: 'center' })
      
      // Label
      pdf.setTextColor(70, 70, 70)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(metrica.label, xMetricas + 17.5, yPosition + 45, { align: 'center' })
      
      xMetricas += 42
    })

    yPosition += 80

    // Análisis de Desempeño
    pdf.setTextColor(41, 128, 185)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ANÁLISIS DE DESEMPEÑO', 20, yPosition)
    yPosition += 10

    const porcentajeCompletados = ((estadisticas.completados / estadisticas.total) * 100).toFixed(1)
    const porcentajeEnProceso = ((estadisticas.enProceso / estadisticas.total) * 100).toFixed(1)
    
    pdf.setTextColor(70, 70, 70)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    const analisisTexto = [
      `• Tasa de Completitud: ${porcentajeCompletados}% de los diagnósticos han sido finalizados`,
      `• Diagnósticos en Desarrollo: ${porcentajeEnProceso}% se encuentran en proceso de elaboración`,
      `• Promedio General de Evaluación: ${estadisticas.promedioGeneral.toFixed(1)}%`,
      `• Municipios con Actividad Registrada: ${new Set(diagnosticos.map(d => d.municipio)).size}`,
    ]
    
    analisisTexto.forEach((texto, index) => {
      pdf.text(texto, 25, yPosition + (index * 8))
    })
    
    yPosition += 40

    if (tipo === 'detallado') {
      // Análisis por Municipios
      pdf.setTextColor(41, 128, 185)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ANÁLISIS POR MUNICIPIOS', 20, yPosition)
      yPosition += 15

      // Crear tabla de municipios
      const municipiosData = diagnosticos.reduce((acc, diag) => {
        if (!acc[diag.municipio]) {
          acc[diag.municipio] = { total: 0, sumEval: 0, completados: 0 }
        }
        acc[diag.municipio].total++
        acc[diag.municipio].sumEval += diag.evaluacion
        if (diag.evaluacion === 100) acc[diag.municipio].completados++
        return acc
      }, {} as Record<string, { total: number, sumEval: number, completados: number }>)

      // Encabezados de tabla con estilo
      pdf.setFillColor(41, 128, 185)
      pdf.rect(20, yPosition, 170, 10, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('MUNICIPIO', 25, yPosition + 7)
      pdf.text('TOTAL', 85, yPosition + 7)
      pdf.text('COMPLETADOS', 115, yPosition + 7)
      pdf.text('PROMEDIO', 155, yPosition + 7)
      yPosition += 12

      // Datos de municipios con alternancia de colores
      let rowIndex = 0
      Object.entries(municipiosData).forEach(([municipio, datos]) => {
        if (yPosition > 250) {
          pdf.addPage()
          agregarEncabezado(2)
          yPosition = 50
        }
        
        // Fila alternativa
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(249, 249, 249)
          pdf.rect(20, yPosition - 2, 170, 8, 'F')
        }
        
        pdf.setTextColor(70, 70, 70)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        
        const promedio = (datos.sumEval / datos.total).toFixed(1)
        
        pdf.text(municipio.substring(0, 25), 25, yPosition + 3)
        pdf.text(datos.total.toString(), 90, yPosition + 3)
        pdf.text(datos.completados.toString(), 125, yPosition + 3)
        pdf.text(`${promedio}%`, 160, yPosition + 3)
        
        yPosition += 8
        rowIndex++
      })

      yPosition += 10

      // Recomendaciones
      if (yPosition > 230) {
        pdf.addPage()
        agregarEncabezado(3)
        yPosition = 50
      }

      pdf.setTextColor(41, 128, 185)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RECOMENDACIONES', 20, yPosition)
      yPosition += 15

      const recomendaciones = [
        'Priorizar el seguimiento de diagnósticos pendientes para mejorar la tasa de completitud',
        'Establecer metas trimestrales para mantener el ritmo de avance en los procesos',
        'Implementar reuniones de seguimiento periódicas con los municipios de menor desempeño',
        'Considerar la asignación de recursos adicionales para municipios con evaluaciones por debajo del 50%'
      ]

      pdf.setTextColor(70, 70, 70)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      recomendaciones.forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, 160)
        pdf.text(lines, 25, yPosition)
        yPosition += lines.length * 6 + 5
      })
    }

    // Agregar pie de página a todas las páginas
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      agregarPieDePagina()
    }

    // Descargar PDF
    const nombreArchivo = `reporte_${tipo}_profesional_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(nombreArchivo)

    return { success: true, message: `Reporte ${nombreArchivo} generado exitosamente` }
  } catch (error) {
    console.error('Error al generar PDF:', error)
    return { success: false, message: 'Error al generar el reporte PDF' }
  }
}

// Función para filtrar por trimestre
export const filtrarPorTrimestre = (diagnosticos: DiagnosticoData[], trimestre: string, año: number = 2025) => {
  const rangosTrimetres = {
    'Q1': { inicio: new Date(año, 0, 1), fin: new Date(año, 2, 31) },
    'Q2': { inicio: new Date(año, 3, 1), fin: new Date(año, 5, 30) },
    'Q3': { inicio: new Date(año, 6, 1), fin: new Date(año, 8, 30) },
    'Q4': { inicio: new Date(año, 9, 1), fin: new Date(año, 11, 31) }
  }

  const rango = rangosTrimetres[trimestre as keyof typeof rangosTrimetres]
  if (!rango) return diagnosticos

  return diagnosticos.filter(diag => {
    const fechaCreacion = diag.fechaCreacion instanceof Date ? 
      diag.fechaCreacion : 
      new Date(diag.fechaCreacion)
    return fechaCreacion >= rango.inicio && fechaCreacion <= rango.fin
  })
}

// Función para filtrar por municipio
export const filtrarPorMunicipio = (diagnosticos: DiagnosticoData[], municipio: string) => {
  if (!municipio || municipio === 'todos') return diagnosticos
  return diagnosticos.filter(diag => 
    diag.municipio.toLowerCase().includes(municipio.toLowerCase())
  )
}

// Función para filtrar por rango de evaluación
export const filtrarPorEvaluacion = (diagnosticos: DiagnosticoData[], minimo: number, maximo: number) => {
  return diagnosticos.filter(diag => 
    diag.evaluacion >= minimo && diag.evaluacion <= maximo
  )
}

// Función para obtener municipios únicos
export const obtenerMunicipiosUnicos = (diagnosticos: DiagnosticoData[]) => {
  const municipios = [...new Set(diagnosticos.map(diag => diag.municipio))]
  return municipios.sort()
}

// Función para calcular estadísticas
export const calcularEstadisticas = (diagnosticos: DiagnosticoData[]): EstadisticasData => {
  const total = diagnosticos.length
  const completados = diagnosticos.filter(d => d.evaluacion === 100).length
  const pendientes = diagnosticos.filter(d => d.evaluacion === 0).length
  const enProceso = total - completados - pendientes
  const promedioGeneral = total > 0 ? diagnosticos.reduce((sum, d) => sum + d.evaluacion, 0) / total : 0

  return {
    total,
    completados,
    enProceso,
    pendientes,
    promedioGeneral
  }
}

// Función para análisis de tendencias
export const analizarTendencias = (diagnosticos: DiagnosticoData[]) => {
  // Agrupar por mes
  const diagnosticosPorMes = diagnosticos.reduce((acc, diag) => {
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

  // Calcular promedios por mes
  const tendencias = Object.entries(diagnosticosPorMes).map(([mes, datos]) => ({
    mes,
    total: datos.total,
    promedio: datos.sumaEvaluaciones / datos.total
  })).sort((a, b) => a.mes.localeCompare(b.mes))

  return tendencias
}

// Función para comparativas entre municipios
export const generarComparativas = (diagnosticos: DiagnosticoData[]) => {
  const datosPorMunicipio = diagnosticos.reduce((acc, diag) => {
    if (!acc[diag.municipio]) {
      acc[diag.municipio] = { total: 0, sumaEvaluaciones: 0, completados: 0 }
    }
    
    acc[diag.municipio].total++
    acc[diag.municipio].sumaEvaluaciones += diag.evaluacion
    if (diag.evaluacion === 100) acc[diag.municipio].completados++
    
    return acc
  }, {} as Record<string, { total: number, sumaEvaluaciones: number, completados: number }>)

  const comparativas = Object.entries(datosPorMunicipio).map(([municipio, datos]) => ({
    municipio,
    totalDiagnosticos: datos.total,
    promedioEvaluacion: datos.sumaEvaluaciones / datos.total,
    diagnosticosCompletados: datos.completados,
    porcentajeCompletados: (datos.completados / datos.total) * 100
  })).sort((a, b) => b.promedioEvaluacion - a.promedioEvaluacion)

  return comparativas
}
