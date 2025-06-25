import { NextResponse } from 'next/server'
import { DirectorioOICService } from '@/lib/directorio-oic-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    const directorio = await DirectorioOICService.getById(parsedId)
    
    if (!directorio) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(directorio)
  } catch (error) {
    console.error('API Error fetching directorio OIC by id:', error)
    return NextResponse.json(
      { error: 'Error al cargar registro del directorio OIC' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    const body = await request.json()
    const directorioActualizado = await DirectorioOICService.update(parsedId, body)
    return NextResponse.json(directorioActualizado)
  } catch (error) {
    console.error('API Error updating directorio OIC:', error)
    return NextResponse.json(
      { error: 'Error al actualizar registro del directorio OIC' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    await DirectorioOICService.delete(parsedId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error deleting directorio OIC:', error)
    return NextResponse.json(
      { error: 'Error al eliminar registro del directorio OIC' },
      { status: 500 }
    )
  }
}
