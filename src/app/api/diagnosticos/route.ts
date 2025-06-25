import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

// Función para calcular el estado automáticamente basado en evaluación
function calcularEstadoAutomatico(evaluacion: number): string {
  if (evaluacion === 0) return 'Pendiente'
  if (evaluacion === 100) return 'Completado'
  return 'En Proceso'
}

// GET - Obtener todos los diagnósticos
export async function GET() {
  try {
    const diagnosticos = await prisma.diagnosticoMunicipal.findMany({
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    return NextResponse.json(diagnosticos)
  } catch (error) {
    console.error('Error obteniendo diagnósticos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo diagnóstico
export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Validación de campos requeridos
    const requiredFields = [
      'nombreActividad',
      'municipio',
      'actividad',
      'unidadAdministrativa',
      'evaluacion'
    ];
    const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0)
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    const evaluacion = parseFloat(data.evaluacion)
    const diagnostico = await prisma.diagnosticoMunicipal.create({
      data: {
        nombreActividad: data.nombreActividad,
        municipio: data.municipio,
        actividad: data.actividad,
        solicitudUrl: data.solicitudUrl || null,
        respuestaUrl: data.respuestaUrl || null,
        unidadAdministrativa: data.unidadAdministrativa,
        evaluacion: evaluacion,
        observaciones: data.observaciones || null,
        acciones: data.acciones || [],
        estado: calcularEstadoAutomatico(evaluacion), // Estado automático basado en evaluación
        creadoPor: data.creadoPor || null
      }
    })

    return NextResponse.json(diagnostico, { status: 201 })
  } catch (error: any) {
    console.error('Error creando diagnóstico:', error)
    // Mostrar el mensaje real del error en desarrollo
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      { error: isDev && error?.message ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar diagnóstico
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
