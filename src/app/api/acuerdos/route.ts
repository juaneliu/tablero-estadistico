import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// GET - Obtener todos los acuerdos
export async function GET() {
  try {
    const acuerdos = await prisma.acuerdoSeguimiento.findMany({
      include: {
        seguimientos: {
          orderBy: {
            fechaSeguimiento: 'desc'
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    return NextResponse.json(acuerdos)
  } catch (error) {
    console.error('Error obteniendo acuerdos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo acuerdo
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const acuerdo = await prisma.acuerdoSeguimiento.create({
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
        estado: data.estado || 'Pendiente',
        observaciones: data.observaciones || null,
        creadoPor: data.creadoPor || null
      }
    })

    return NextResponse.json(acuerdo, { status: 201 })
  } catch (error) {
    console.error('Error creando acuerdo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar acuerdo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

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
