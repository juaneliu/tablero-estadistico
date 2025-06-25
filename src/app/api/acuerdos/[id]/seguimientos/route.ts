import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// GET - Obtener seguimientos de un acuerdo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const acuerdoId = parseInt(id)
    
    if (isNaN(acuerdoId)) {
      return NextResponse.json(
        { error: 'ID de acuerdo inválido' },
        { status: 400 }
      )
    }

    // Verificar que el acuerdo existe
    const acuerdo = await prisma.acuerdoSeguimiento.findUnique({
      where: { id: acuerdoId }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    // Obtener los seguimientos del acuerdo
    const seguimientos = await prisma.$queryRaw`
      SELECT * FROM seguimientos WHERE "acuerdoId" = ${acuerdoId} ORDER BY "fechaSeguimiento" DESC
    `

    return NextResponse.json(seguimientos)
  } catch (error) {
    console.error('Error al obtener seguimientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo seguimiento para un acuerdo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const acuerdoId = parseInt(id)
    
    if (isNaN(acuerdoId)) {
      return NextResponse.json(
        { error: 'ID de acuerdo inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { seguimiento, accion, fechaSeguimiento, creadoPor } = body

    // Validar campos requeridos
    if (!seguimiento || !accion) {
      return NextResponse.json(
        { error: 'Los campos seguimiento y acción son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el acuerdo existe
    const acuerdo = await prisma.acuerdoSeguimiento.findUnique({
      where: { id: acuerdoId }
    })

    if (!acuerdo) {
      return NextResponse.json(
        { error: 'Acuerdo no encontrado' },
        { status: 404 }
      )
    }

    // Crear el seguimiento usando query cruda
    const nuevoSeguimiento = await prisma.$queryRaw`
      INSERT INTO seguimientos ("acuerdoId", seguimiento, accion, "fechaSeguimiento", "creadoPor", "fechaCreacion", "fechaActualizacion")
      VALUES (${acuerdoId}, ${seguimiento}, ${accion}, ${fechaSeguimiento ? new Date(fechaSeguimiento) : new Date()}, ${creadoPor}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(nuevoSeguimiento, { status: 201 })
  } catch (error) {
    console.error('Error al crear seguimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
