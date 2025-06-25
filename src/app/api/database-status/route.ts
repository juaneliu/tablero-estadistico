import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-service'

export async function GET() {
  try {
    // Intentar una consulta simple a la base de datos
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      isConfigured: true,
      status: 'connected'
    })
  } catch (error) {
    // La base de datos no está configurada o no responde
    return NextResponse.json({ 
      isConfigured: false,
      status: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error : 'Database connection failed'
    })
  }
}
