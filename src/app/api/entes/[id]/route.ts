import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    const ente = await EntesService.getById(parsedId)
    
    if (!ente) {
      return NextResponse.json(
        { error: 'Ente no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(ente)
  } catch (error) {
    console.error('API Error fetching ente by id:', error)
    return NextResponse.json(
      { error: 'Error al cargar ente público' },
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
    const updatedEnte = await EntesService.update(parsedId, body)
    return NextResponse.json(updatedEnte)
  } catch (error) {
    console.error('API Error updating ente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ente público' },
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
    await EntesService.delete(parsedId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error deleting ente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar ente público' },
      { status: 500 }
    )
  }
}
