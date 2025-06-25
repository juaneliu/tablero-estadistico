import { NextResponse } from 'next/server'
import { DirectorioOICService } from '@/lib/directorio-oic-service'

export async function GET() {
  try {
    const statistics = await DirectorioOICService.getStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('API Error fetching directorio OIC statistics:', error)
    return NextResponse.json(
      { error: 'Error al cargar estadísticas del directorio OIC' },
      { status: 500 }
    )
  }
}
