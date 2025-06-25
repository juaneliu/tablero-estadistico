import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({
        success: false,
        user: null
      })
    }

    const user = await AuthService.verifyToken(token)
    
    return NextResponse.json({
      success: true,
      user
    })
  } catch (error: any) {
    console.error('Me error:', error)
    return NextResponse.json({
      success: false,
      user: null
    })
  }
}
