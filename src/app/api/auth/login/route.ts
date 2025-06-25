import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await AuthService.login({ email, password })
    
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login exitoso'
    })

    // Establecer cookie con el token
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 horas
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error en el login' 
      },
      { status: 401 }
    )
  }
}
