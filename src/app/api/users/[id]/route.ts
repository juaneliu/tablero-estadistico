import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { cookies } from 'next/headers'

// Middleware para verificar permisos de administrador
async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    throw new Error('No autorizado')
  }

  const user = await AuthService.verifyToken(token)
  if (user.rol !== 'ADMINISTRADOR') {
    throw new Error('Permisos insuficientes')
  }

  return user
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    
    const { id } = await params
    const userId = parseInt(id)
    const user = await AuthService.getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('API Error fetching user by id:', error)
    return NextResponse.json(
      { error: error.message || 'Error al cargar usuario' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    
    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()
    
    const updatedUser = await AuthService.updateUser(userId, body)
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('API Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    
    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()
    
    // Para actualizaciones parciales como cambiar solo el estado activo
    const updatedUser = await AuthService.updateUser(userId, body)
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('API Error patching user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado del usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    
    const { id } = await params
    const userId = parseInt(id)
    
    await AuthService.deleteUser(userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
