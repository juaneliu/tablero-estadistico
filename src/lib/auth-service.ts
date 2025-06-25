import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type Usuario = {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'INVITADO' | 'OPERATIVO' | 'SEGUIMIENTO' | 'ADMINISTRADOR'
  activo: boolean
  ultimoAcceso?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type LoginCredentials = {
  email: string
  password?: string
}

export type CreateUserData = {
  email: string
  nombre: string
  apellido: string
  password?: string
  rol: 'INVITADO' | 'OPERATIVO' | 'SEGUIMIENTO' | 'ADMINISTRADOR'
  activo?: boolean
}

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura'

export class AuthService {
  
  // Crear un nuevo usuario
  static async createUser(userData: CreateUserData): Promise<Usuario> {
    const { email, nombre, apellido, password, rol } = userData

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('El usuario ya existe')
    }

    // Hash de la contraseña si se proporciona
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const user = await prisma.usuario.create({
      data: {
        email,
        nombre,
        apellido,
        password: hashedPassword,
        rol
      }
    })

    return user
  }

  // Autenticar usuario
  static async login(credentials: LoginCredentials): Promise<{ user: Usuario; token: string }> {
    const { email, password } = credentials

    // Buscar usuario por email
    const user = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    if (!user.activo) {
      throw new Error('Usuario desactivado')
    }

    // Si el usuario tiene contraseña, verificarla
    if (user.password) {
      if (!password) {
        throw new Error('Contraseña requerida')
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas')
      }
    } else {
      // Usuario sin contraseña (INVITADO)
      if (user.rol !== 'INVITADO') {
        throw new Error('Este usuario requiere contraseña')
      }
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() }
    })

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
        activo: user.activo,
        ultimoAcceso: user.ultimoAcceso,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    }
  }

  // Verificar token JWT
  static async verifyToken(token: string): Promise<Usuario> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      const user = await prisma.usuario.findUnique({
        where: { id: decoded.userId }
      })

      if (!user || !user.activo) {
        throw new Error('Token inválido')
      }

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
        activo: user.activo,
        ultimoAcceso: user.ultimoAcceso,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    } catch (error) {
      throw new Error('Token inválido')
    }
  }

  // Obtener todos los usuarios
  static async getUsers(): Promise<Usuario[]> {
    const users = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return users.map(user => ({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
      activo: user.activo,
      ultimoAcceso: user.ultimoAcceso,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))
  }

  // Obtener usuario por ID
  static async getUserById(id: number): Promise<Usuario | null> {
    const user = await prisma.usuario.findUnique({
      where: { id }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
      activo: user.activo,
      ultimoAcceso: user.ultimoAcceso,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  // Actualizar usuario
  static async updateUser(id: number, data: Partial<CreateUserData>): Promise<Usuario> {
    const updateData: any = { ...data }

    // Hash de nueva contraseña si se proporciona
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    const user = await prisma.usuario.update({
      where: { id },
      data: updateData
    })

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
      activo: user.activo,
      ultimoAcceso: user.ultimoAcceso,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  // Eliminar usuario
  static async deleteUser(id: number): Promise<void> {
    await prisma.usuario.delete({
      where: { id }
    })
  }

  // Cambiar estado activo/inactivo
  static async toggleUserStatus(id: number): Promise<Usuario> {
    const user = await prisma.usuario.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: { activo: !user.activo }
    })

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,
      rol: updatedUser.rol as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR',
      activo: updatedUser.activo,
      ultimoAcceso: updatedUser.ultimoAcceso,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }
  }
}
