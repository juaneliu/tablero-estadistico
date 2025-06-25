import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET() {
  try {
    const systemStatistics = await EntesService.getSystemStatistics()
    return NextResponse.json(systemStatistics)
  } catch (error) {
    console.error('API Error fetching system statistics:', error)
    return NextResponse.json(
      { error: 'Error al cargar estadísticas de sistemas' },
      { status: 500 }
    )
  }
}
