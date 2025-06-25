import { NextResponse } from 'next/server'
import { EntesService } from '@/lib/prisma-service'

export async function GET() {
  try {
    const classificationStatistics = await EntesService.getClassificationStatistics()
    return NextResponse.json(classificationStatistics)
  } catch (error) {
    console.error('API Error fetching classification statistics:', error)
    return NextResponse.json(
      { error: 'Error al cargar estadísticas de clasificación' },
      { status: 500 }
    )
  }
}
