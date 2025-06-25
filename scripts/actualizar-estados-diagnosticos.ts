// Script para actualizar los estados de todos los diagnósticos existentes
// basado en su evaluación

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Función para calcular el estado automáticamente basado en evaluación
function calcularEstadoAutomatico(evaluacion: number): string {
  if (evaluacion === 0) return 'Pendiente'
  if (evaluacion === 100) return 'Completado'
  return 'En Proceso'
}

async function actualizarEstadosDiagnosticos() {
  try {
    console.log('🔄 Iniciando actualización de estados de diagnósticos...')
    
    // Obtener todos los diagnósticos
    const diagnosticos = await prisma.diagnosticoMunicipal.findMany({
      select: {
        id: true,
        evaluacion: true,
        estado: true,
        municipio: true
      }
    })
    
    console.log(`📊 Encontrados ${diagnosticos.length} diagnósticos`)
    
    let actualizados = 0
    let sinCambios = 0
    
    // Actualizar cada diagnóstico
    for (const diagnostico of diagnosticos) {
      const estadoNuevo = calcularEstadoAutomatico(diagnostico.evaluacion)
      
      if (diagnostico.estado !== estadoNuevo) {
        await prisma.diagnosticoMunicipal.update({
          where: { id: diagnostico.id },
          data: { 
            estado: estadoNuevo,
            fechaActualizacion: new Date()
          }
        })
        
        console.log(`✅ ${diagnostico.municipio} (ID: ${diagnostico.id}): ${diagnostico.estado} → ${estadoNuevo} (evaluación: ${diagnostico.evaluacion})`)
        actualizados++
      } else {
        sinCambios++
      }
    }
    
    console.log('\n📈 Resumen de la actualización:')
    console.log(`✅ Diagnósticos actualizados: ${actualizados}`)
    console.log(`⚪ Sin cambios: ${sinCambios}`)
    console.log(`📊 Total procesados: ${diagnosticos.length}`)
    
    // Mostrar estadísticas finales
    const estadisticasFinales = await prisma.diagnosticoMunicipal.groupBy({
      by: ['estado'],
      _count: {
        id: true
      }
    })
    
    console.log('\n📊 Estados finales:')
    estadisticasFinales.forEach(stat => {
      console.log(`  ${stat.estado}: ${stat._count.id} diagnósticos`)
    })
    
  } catch (error) {
    console.error('❌ Error actualizando estados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
actualizarEstadosDiagnosticos()
