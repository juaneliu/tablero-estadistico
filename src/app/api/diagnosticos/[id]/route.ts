import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// Función para calcular el estado automáticamente basado en evaluación
function calcularEstadoAutomatico(evaluacion: number): string {
  if (evaluacion === 0) return 'Pendiente'
  if (evaluacion === 100) return 'Completado'
  return 'En Proceso'
}

// GET - Obtener diagnóstico por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const diagnostico = await prisma.diagnosticoMunicipal.findUnique({
      where: { id: parseInt(id) }
    })

    if (!diagnostico) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error('Error obteniendo diagnóstico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar diagnóstico completo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    console.log(`[PUT] Actualizando diagnóstico ID: ${id}`)
    const data = await request.json()
    console.log('[PUT] Datos recibidos:', JSON.stringify(data, null, 2))
    
    // Verificar que el diagnóstico existe
    const diagnosticoExistente = await prisma.diagnosticoMunicipal.findUnique({
      where: { id: parseInt(id) }
    })

    if (!diagnosticoExistente) {
      console.log(`[PUT] Diagnóstico no encontrado: ${id}`)
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      )
    }
    
    // Preparar datos para actualización, usando valores existentes como fallback
    const updateData: any = {
      fechaActualizacion: new Date()
    }
    
    if (data.nombreActividad !== undefined) updateData.nombreActividad = data.nombreActividad
    if (data.municipio !== undefined) updateData.municipio = data.municipio
    if (data.actividad !== undefined) updateData.actividad = data.actividad
    if (data.solicitudUrl !== undefined) updateData.solicitudUrl = data.solicitudUrl || null
    if (data.respuestaUrl !== undefined) updateData.respuestaUrl = data.respuestaUrl || null
    if (data.unidadAdministrativa !== undefined) updateData.unidadAdministrativa = data.unidadAdministrativa
    if (data.evaluacion !== undefined) {
      const evaluacion = parseFloat(data.evaluacion) || 0
      updateData.evaluacion = evaluacion
      // Calcular estado automáticamente basado en evaluación
      updateData.estado = calcularEstadoAutomatico(evaluacion)
    }
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null
    if (data.acciones !== undefined) updateData.acciones = data.acciones || []
    // Remover la línea del estado manual ya que ahora es automático
    
    console.log('[PUT] Datos para actualización:', updateData)
    
    const diagnostico = await prisma.diagnosticoMunicipal.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    console.log(`[PUT] Diagnóstico actualizado exitosamente: ${id}`)
    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error('[PUT] Error actualizando diagnóstico:', error)
    
    if (error instanceof Error) {
      // Error específico de Prisma o validación
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'El diagnóstico que intentas actualizar no existe' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe un diagnóstico con estos datos' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar el diagnóstico' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar diagnóstico parcialmente (especialmente para acciones)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await request.json()
    
    const diagnostico = await prisma.diagnosticoMunicipal.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error('Error actualizando diagnóstico parcialmente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar diagnóstico específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.diagnosticoMunicipal.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando diagnóstico:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
