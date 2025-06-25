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

export async function GET() {
  try {
    await verifyAdmin()
    
    const users = await AuthService.getUsers()
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('API Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Error al cargar usuarios' },
      { status: error.message === 'No autorizado' || error.message === 'Permisos insuficientes' ? 403 : 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin()
    
    const body = await request.json()
    const { email, nombre, apellido, password, rol } = body

    // Validaciones básicas
    if (!email || !nombre || !apellido || !rol) {
      return NextResponse.json(
        { error: 'Campos requeridos: email, nombre, apellido, rol' },
        { status: 400 }
      )
    }

    if (rol === 'OPERATIVO' || rol === 'SEGUIMIENTO' || rol === 'ADMINISTRADOR') {
      if (!password) {
        return NextResponse.json(
          { error: 'Los usuarios OPERATIVO, SEGUIMIENTO y ADMINISTRADOR requieren contraseña' },
          { status: 400 }
        )
      }
    }

    const newUser = await AuthService.createUser({
      email,
      nombre,
      apellido,
      password,
      rol
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error('API Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: error.message === 'El usuario ya existe' ? 409 : 500 }
    )
  }
}
