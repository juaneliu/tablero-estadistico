import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// GET - Obtener un seguimiento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seguimientoId = parseInt(id)
    
    if (isNaN(seguimientoId)) {
      return NextResponse.json(
        { error: 'ID de seguimiento inválido' },
        { status: 400 }
      )
    }

    const seguimiento = await prisma.$queryRaw`
      SELECT * FROM seguimientos WHERE id = ${seguimientoId}
    `

    if (!Array.isArray(seguimiento) || seguimiento.length === 0) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(seguimiento[0])
  } catch (error) {
    console.error('Error al obtener seguimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un seguimiento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seguimientoId = parseInt(id)
    
    if (isNaN(seguimientoId)) {
      return NextResponse.json(
        { error: 'ID de seguimiento inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { seguimiento, accion, fechaSeguimiento } = body

    // Validar campos requeridos
    if (!seguimiento || !accion) {
      return NextResponse.json(
        { error: 'Los campos seguimiento y acción son requeridos' },
        { status: 400 }
      )
    }

    const seguimientoActualizado = await prisma.$queryRaw`
      UPDATE seguimientos 
      SET seguimiento = ${seguimiento}, 
          accion = ${accion}, 
          "fechaSeguimiento" = ${fechaSeguimiento ? new Date(fechaSeguimiento) : new Date()},
          "fechaActualizacion" = NOW()
      WHERE id = ${seguimientoId}
      RETURNING *
    `

    if (!Array.isArray(seguimientoActualizado) || seguimientoActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(seguimientoActualizado[0])
  } catch (error) {
    console.error('Error al actualizar seguimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un seguimiento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seguimientoId = parseInt(id)
    
    if (isNaN(seguimientoId)) {
      return NextResponse.json(
        { error: 'ID de seguimiento inválido' },
        { status: 400 }
      )
    }

    const seguimientoEliminado = await prisma.$queryRaw`
      DELETE FROM seguimientos WHERE id = ${seguimientoId} RETURNING *
    `

    if (!Array.isArray(seguimientoEliminado) || seguimientoEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ mensaje: 'Seguimiento eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar seguimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
