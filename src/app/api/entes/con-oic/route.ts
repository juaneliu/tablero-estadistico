import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET() {
  try {
    const entesConOIC = await EntesService.getEntesConOIC()
    return NextResponse.json(entesConOIC)
  } catch (error) {
    console.error('API Error fetching entes con OIC:', error)
    return NextResponse.json(
      { error: 'Error al obtener entes con OIC' },
      { status: 500 }
    )
  }
}
