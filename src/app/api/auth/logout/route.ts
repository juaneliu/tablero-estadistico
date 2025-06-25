import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    })

    // Eliminar cookie de autenticación
    response.cookies.delete('auth-token')

    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en el logout' 
      },
      { status: 500 }
    )
  }
}
