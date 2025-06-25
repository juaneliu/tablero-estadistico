import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// GET - Obtener acuerdo por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const acuerdo = await prisma.acuerdoSeguimiento.findUnique({
      where: { id: parseInt(id) }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(acuerdo)
  } catch (error) {
    console.error('Error obteniendo acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar acuerdo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await request.json()
    
    const acuerdo = await prisma.acuerdoSeguimiento.update({
      where: { id: parseInt(id) },
      data: {
        numeroSesion: data.numeroSesion,
        tipoSesion: data.tipoSesion,
        fechaSesion: new Date(data.fechaSesion),
        temaAgenda: data.temaAgenda,
        descripcionAcuerdo: data.descripcionAcuerdo,
        responsable: data.responsable,
        area: data.area,
        fechaCompromiso: new Date(data.fechaCompromiso),
        prioridad: data.prioridad,
        estado: data.estado,
        observaciones: data.observaciones || null,
        fechaActualizacion: new Date()
      }
    })

    return NextResponse.json(acuerdo)
  } catch (error) {
    console.error('Error actualizando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar acuerdo específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.acuerdoSeguimiento.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
