import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET() {
  try {
    const statistics = await EntesService.getStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('API Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Error al cargar estadísticas' },
      { status: 500 }
    )
  }
}
