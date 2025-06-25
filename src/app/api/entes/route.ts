import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET() {
  try {
    const entes = await EntesService.getAll()
    return NextResponse.json(entes)
  } catch (error) {
    console.error('API Error fetching entes:', error)
    return NextResponse.json(
      { error: 'Error al cargar entes públicos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newEnte = await EntesService.create(body)
    return NextResponse.json(newEnte, { status: 201 })
  } catch (error) {
    console.error('API Error creating ente:', error)
    return NextResponse.json(
      { error: 'Error al crear ente público' },
      { status: 500 }
    )
  }
}
