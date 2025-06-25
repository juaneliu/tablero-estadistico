'use client'

import React from 'react'
import { X, FileText } from 'lucide-react'
import { AcuerdoSeguimiento } from '@/hooks/use-acuerdos-seguimiento'

interface ModalExportacionProps {
  isOpen: boolean
  onClose: () => void
  acuerdos: AcuerdoSeguimiento[]
}

export function ModalExportacion({ isOpen, onClose, acuerdos }: ModalExportacionProps) {
  if (!isOpen) return null

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Crear elemento de notificación
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-all duration-300 transform translate-x-full`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(full)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const exportToExcel = async (data: AcuerdoSeguimiento[], filtroTipo: string) => {
    try {
      const XLSX = await import('xlsx')
      
      // Agrupar por sesión para numeración consecutiva
      const sessionGroups = data.reduce((groups, acuerdo) => {
        const sessionKey = `${acuerdo.numeroSesion}_${acuerdo.tipoSesion}_${acuerdo.fechaSesion}`
        if (!groups[sessionKey]) {
          groups[sessionKey] = []
        }
        groups[sessionKey].push(acuerdo)
        return groups
      }, {} as Record<string, typeof data>)

      // Formatear datos para Excel con numeración por sesión
      const excelData: any[] = []
      Object.values(sessionGroups).forEach(sessionAcuerdos => {
        sessionAcuerdos.forEach((acuerdo, sessionIndex) => {
          excelData.push({
            'Número': `Acuerdo ${(sessionIndex + 1).toString().padStart(2, '0')}`,
            'Sesión': `${acuerdo.tipoSesion} ${acuerdo.numeroSesion}`,
            'Fecha Sesión': new Date(acuerdo.fechaSesion).toLocaleDateString('es-MX'),
            'Tema': acuerdo.temaAgenda,
            'Descripción': acuerdo.descripcionAcuerdo,
            'Responsable': acuerdo.responsable,
            'Área': acuerdo.area,
            'Estado/Prioridad': `${acuerdo.estado} - ${acuerdo.prioridad}`,
            'Fecha Compromiso': new Date(acuerdo.fechaCompromiso).toLocaleDateString('es-MX'),
            'Observaciones': acuerdo.observaciones || 'Sin observaciones',
            'Total Seguimientos': acuerdo.seguimientos?.length || 0,
            'Último Seguimiento': acuerdo.seguimientos && acuerdo.seguimientos.length > 0 
              ? new Date(acuerdo.seguimientos[0].fechaSeguimiento).toLocaleDateString('es-MX')
              : 'Sin seguimientos'
          })
        })
      })

      // Crear hoja principal de acuerdos
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Número
        { wch: 20 }, // Sesión
        { wch: 12 }, // Fecha Sesión
        { wch: 30 }, // Tema
        { wch: 40 }, // Descripción
        { wch: 20 }, // Responsable
        { wch: 15 }, // Área
        { wch: 20 }, // Estado/Prioridad
        { wch: 15 }, // Fecha Compromiso
        { wch: 30 }, // Observaciones
        { wch: 15 }, // Total Seguimientos
        { wch: 15 }  // Último Seguimiento
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Acuerdos')

      // Crear hoja detallada de seguimientos
      const seguimientosDetalle: any[] = []
      Object.values(sessionGroups).forEach(sessionAcuerdos => {
        sessionAcuerdos.forEach((acuerdo, sessionIndex) => {
          if (acuerdo.seguimientos && acuerdo.seguimientos.length > 0) {
            acuerdo.seguimientos.forEach(seg => {
              seguimientosDetalle.push({
                'Número Acuerdo': `Acuerdo ${(sessionIndex + 1).toString().padStart(2, '0')}`,
                'Acuerdo ID': acuerdo.id,
                'Sesión': `${acuerdo.tipoSesion} ${acuerdo.numeroSesion}`,
                'Tema Acuerdo': acuerdo.temaAgenda,
                'Fecha Seguimiento': new Date(seg.fechaSeguimiento).toLocaleDateString('es-MX'),
                'Descripción Seguimiento': seg.seguimiento,
                'Acción Realizada': seg.accion,
                'Creado Por': seg.creadoPor || 'Sistema'
              })
            })
          }
        })
      })

      if (seguimientosDetalle.length > 0) {
        const wsSeguimientos = XLSX.utils.json_to_sheet(seguimientosDetalle)
        const colWidthsSeg = [
          { wch: 12 }, // Número Acuerdo
          { wch: 10 }, // ID
          { wch: 20 }, // Sesión
          { wch: 30 }, // Tema
          { wch: 12 }, // Fecha
          { wch: 40 }, // Descripción
          { wch: 30 }, // Acción
          { wch: 15 }  // Creado por
        ]
        wsSeguimientos['!cols'] = colWidthsSeg
        XLSX.utils.book_append_sheet(wb, wsSeguimientos, 'Seguimientos Detalle')
      }
      
      // Generar archivo
      const fileName = `acuerdos_${filtroTipo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      showNotification(`✓ Excel generado: ${fileName}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showNotification(`Error al generar archivo Excel: ${errorMessage}`, 'error')
      console.error('Error en exportación Excel:', error)
    }
  }

  const exportToPDF = async (data: AcuerdoSeguimiento[], filtroTipo: string) => {
    try {
      const { jsPDF } = await import('jspdf')
      
      // Agrupar por sesión para numeración consecutiva
      const sessionGroups = data.reduce((groups, acuerdo) => {
        const sessionKey = `${acuerdo.numeroSesion}_${acuerdo.tipoSesion}_${acuerdo.fechaSesion}`
        if (!groups[sessionKey]) {
          groups[sessionKey] = []
        }
        groups[sessionKey].push(acuerdo)
        return groups
      }, {} as Record<string, typeof data>)
      
      // Intentar cargar autoTable, si falla usar versión simple
      let autoTable = null
      try {
        const autoTableModule = await import('jspdf-autotable')
        autoTable = autoTableModule.default
      } catch (e) {
        console.warn('autoTable no disponible, usando versión simple')
      }

      const doc = new jsPDF({
        orientation: autoTable ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      if (autoTable) {
        // Versión con tablas si autoTable está disponible
        // Título
        doc.setFontSize(16)
        doc.text(`Reporte de ${filtroTipo}`, 14, 15)
        
        // Fecha de generación
        doc.setFontSize(10)
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 14, 22)
        
        // Resumen de seguimientos
        const totalSeguimientos = data.reduce((total, acuerdo) => total + (acuerdo.seguimientos?.length || 0), 0)
        doc.text(`Total de seguimientos incluidos: ${totalSeguimientos}`, 14, 28)
        
        // Datos para la tabla con numeración por sesión
        const tableData: string[][] = []
        Object.values(sessionGroups).forEach(sessionAcuerdos => {
          sessionAcuerdos.forEach((acuerdo, sessionIndex) => {
            tableData.push([
              `Acuerdo ${(sessionIndex + 1).toString().padStart(2, '0')}`,
              `${acuerdo.tipoSesion} ${acuerdo.numeroSesion}`,
              new Date(acuerdo.fechaSesion).toLocaleDateString('es-MX'),
              acuerdo.temaAgenda.substring(0, 25) + (acuerdo.temaAgenda.length > 25 ? '...' : ''),
              acuerdo.responsable,
              acuerdo.area,
              `${acuerdo.estado} - ${acuerdo.prioridad}`,
              new Date(acuerdo.fechaCompromiso).toLocaleDateString('es-MX'),
              `${acuerdo.seguimientos?.length || 0} seg.`
            ])
          })
        })

        // Generar tabla principal
        autoTable(doc, {
          head: [['N°', 'Sesión', 'F. Sesión', 'Tema', 'Responsable', 'Área', 'Estado/Prioridad', 'F. Compromiso', 'Seguimientos']],
          body: tableData,
          startY: 35,
          styles: { fontSize: 7 },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 }
        })
        
        // Seguimientos en páginas adicionales
        if (data.some(a => a.seguimientos && a.seguimientos.length > 0)) {
          doc.addPage()
          doc.setFontSize(14)
          doc.text('Detalle de Seguimientos', 14, 15)
          
          let startY = 25
          
          Object.values(sessionGroups).forEach(sessionAcuerdos => {
            sessionAcuerdos.forEach((acuerdo, sessionIndex) => {
              if (acuerdo.seguimientos && acuerdo.seguimientos.length > 0) {
                doc.setFontSize(10)
                doc.setFont('helvetica', 'bold')
                doc.text(`Acuerdo ${(sessionIndex + 1).toString().padStart(2, '0')} - ${acuerdo.tipoSesion} ${acuerdo.numeroSesion} - ${acuerdo.temaAgenda.substring(0, 50)}...`, 14, startY)
                doc.setFont('helvetica', 'normal')
                startY += 8
              
                const seguimientosData: string[][] = acuerdo.seguimientos.map(seg => [
                  new Date(seg.fechaSeguimiento).toLocaleDateString('es-MX'),
                  seg.seguimiento.substring(0, 80) + (seg.seguimiento.length > 80 ? '...' : ''),
                  seg.accion.substring(0, 60) + (seg.accion.length > 60 ? '...' : ''),
                  seg.creadoPor || 'Sistema'
                ])
                
                autoTable(doc, {
                  head: [['Fecha', 'Seguimiento', 'Acción', 'Creado por']],
                  body: seguimientosData,
                  startY: startY,
                  styles: { fontSize: 8 },
                  headStyles: { fillColor: [100, 116, 139], textColor: 255 },
                  margin: { left: 14 }
                })
                
                startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : startY + 50
                
                if (startY > 250) {
                  doc.addPage()
                  startY = 20
                }
              }
            })
          })
        }
      } else {
        // Versión simple sin autoTable - fallback
        let yPosition = 20
        const lineHeight = 6
        const pageHeight = 280
        
        doc.setFontSize(16)
        doc.text(`Reporte de ${filtroTipo}`, 20, yPosition)
        yPosition += lineHeight * 2
        
        doc.setFontSize(10)
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 20, yPosition)
        yPosition += lineHeight * 2
        
        const totalSeguimientos = data.reduce((total, acuerdo) => total + (acuerdo.seguimientos?.length || 0), 0)
        doc.text(`Total de seguimientos: ${totalSeguimientos}`, 20, yPosition)
        yPosition += lineHeight * 2
        
        doc.setFontSize(8)
        
        Object.values(sessionGroups).forEach(sessionAcuerdos => {
          sessionAcuerdos.forEach((acuerdo, sessionIndex) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage()
              yPosition = 20
            }
            
            doc.setFont('helvetica', 'bold')
            doc.text(`Acuerdo ${(sessionIndex + 1).toString().padStart(2, '0')} - ${acuerdo.tipoSesion} ${acuerdo.numeroSesion}`, 20, yPosition)
            yPosition += lineHeight
            
            doc.setFont('helvetica', 'normal')
            doc.text(`Tema: ${acuerdo.temaAgenda.substring(0, 80)}`, 20, yPosition)
            yPosition += lineHeight
            
            doc.text(`Responsable: ${acuerdo.responsable} | Área: ${acuerdo.area}`, 20, yPosition)
            yPosition += lineHeight
            
            doc.text(`Estado: ${acuerdo.estado} | Prioridad: ${acuerdo.prioridad}`, 20, yPosition)
            yPosition += lineHeight
            
            doc.text(`Fecha Compromiso: ${new Date(acuerdo.fechaCompromiso).toLocaleDateString('es-MX')}`, 20, yPosition)
            yPosition += lineHeight
            
            if (acuerdo.observaciones) {
              doc.text(`Observaciones: ${acuerdo.observaciones.substring(0, 80)}`, 20, yPosition)
              yPosition += lineHeight
            }
            
            if (acuerdo.seguimientos && acuerdo.seguimientos.length > 0) {
              doc.setFont('helvetica', 'bold')
              doc.text(`Seguimientos (${acuerdo.seguimientos.length}):`, 25, yPosition)
              yPosition += lineHeight
              
              doc.setFont('helvetica', 'normal')
              acuerdo.seguimientos.forEach((seg, segIndex) => {
                if (yPosition > pageHeight - 20) {
                  doc.addPage()
                  yPosition = 20
                }
                
                doc.text(`  ${segIndex + 1}. ${new Date(seg.fechaSeguimiento).toLocaleDateString('es-MX')}`, 30, yPosition)
                yPosition += lineHeight
                doc.text(`     ${seg.seguimiento.substring(0, 70)}`, 30, yPosition)
                yPosition += lineHeight
                doc.text(`     Acción: ${seg.accion.substring(0, 60)}`, 30, yPosition)
                yPosition += lineHeight
              })
            } else {
              doc.text('Sin seguimientos registrados', 25, yPosition)
              yPosition += lineHeight
            }
            
            yPosition += lineHeight
          })
        })
      }
      
      const fileName = `acuerdos_${filtroTipo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      showNotification(`✓ PDF generado: ${fileName}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showNotification(`Error al generar archivo PDF: ${errorMessage}`, 'error')
      console.error('PDF Error:', error)
    }
  }

  const handleExport = async (tipo: 'todos' | 'completados' | 'en-progreso' | 'vencidos', formato: 'excel' | 'pdf') => {
    let dataToExport: AcuerdoSeguimiento[] = []
    let filtroTipo = ''

    switch (tipo) {
      case 'todos':
        dataToExport = acuerdos
        filtroTipo = 'Todos los acuerdos'
        break
      case 'completados':
        dataToExport = acuerdos.filter(a => a.estado === 'Completado')
        filtroTipo = 'Acuerdos completados'
        break
      case 'en-progreso':
        dataToExport = acuerdos.filter(a => a.estado === 'En progreso')
        filtroTipo = 'Acuerdos en progreso'
        break
      case 'vencidos':
        dataToExport = acuerdos.filter(a => {
          const hoy = new Date()
          const compromiso = new Date(a.fechaCompromiso)
          return compromiso < hoy && a.estado !== 'Completado'
        })
        filtroTipo = 'Acuerdos vencidos'
        break
    }

    if (dataToExport.length === 0) {
      showNotification(`No hay ${filtroTipo.toLowerCase()} para exportar`, 'error')
      return
    }

    if (formato === 'excel') {
      await exportToExcel(dataToExport, filtroTipo)
    } else {
      await exportToPDF(dataToExport, filtroTipo)
    }

    onClose()
  }

  const opciones = [
    { 
      key: 'todos' as const, 
      label: 'Todos los acuerdos', 
      count: acuerdos.length 
    },
    { 
      key: 'completados' as const, 
      label: 'Completados', 
      count: acuerdos.filter(a => a.estado === 'Completado').length 
    },
    { 
      key: 'en-progreso' as const, 
      label: 'En progreso', 
      count: acuerdos.filter(a => a.estado === 'En progreso').length 
    },
    { 
      key: 'vencidos' as const, 
      label: 'Vencidos', 
      count: acuerdos.filter(a => {
        const hoy = new Date()
        const compromiso = new Date(a.fechaCompromiso)
        return compromiso < hoy && a.estado !== 'Completado'
      }).length
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Exportar Acuerdos
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Selecciona el tipo de datos y formato
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            {/* Tipo de datos */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                Tipo de datos
              </label>
              <div className="space-y-2">
                {opciones.map((option) => (
                  <div key={option.key} className="flex items-center justify-between py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-md">
                    <div className="flex-1">
                      <span className="text-sm text-slate-900 dark:text-slate-100">{option.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({option.count})</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => await handleExport(option.key, 'excel')}
                        disabled={option.count === 0}
                        className="px-3 py-1 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      >
                        Excel
                      </button>
                      <button
                        onClick={async () => await handleExport(option.key, 'pdf')}
                        disabled={option.count === 0}
                        className="px-3 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-medium mb-1">Contenido del archivo:</p>
                  <ul className="space-y-0.5">
                    <li>• Información completa de cada acuerdo</li>
                    <li>• Datos de sesión y responsables</li>
                    <li>• Estados, prioridades y fechas</li>
                    <li>• Observaciones disponibles</li>
                    <li>• <strong>Seguimientos completos con fechas y acciones</strong></li>
                    <li>• Excel: Hoja adicional con detalle de seguimientos</li>
                    <li>• PDF: Páginas extra con seguimientos detallados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
