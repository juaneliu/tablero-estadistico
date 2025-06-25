import { NextResponse } from 'next/server'
import { DirectorioOICService } from '@/lib/directorio-oic-service'

export async function GET() {
  try {
    const directorios = await DirectorioOICService.getAll()
    return NextResponse.json(directorios)
  } catch (error) {
    console.error('API Error fetching directorio OIC:', error)
    return NextResponse.json(
      { error: 'Error al cargar el directorio OIC' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nuevoDirectorio = await DirectorioOICService.create(body)
    return NextResponse.json(nuevoDirectorio)
  } catch (error) {
    console.error('API Error creating directorio OIC:', error)
    return NextResponse.json(
      { error: 'Error al crear registro del directorio OIC' },
      { status: 500 }
    )
  }
}
