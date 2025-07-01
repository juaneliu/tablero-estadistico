import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Verificar si ya existe un usuario administrador
    const existingAdmin = await prisma.usuario.findFirst({
      where: { rol: 'ADMINISTRADOR' }
    })

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:', existingAdmin.email)
      return
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.usuario.create({
      data: {
        email: 'admin@saem.gob.mx',
        nombre: 'Administrador',
        apellido: 'Sistema',
        password: hashedPassword,
        rol: 'ADMINISTRADOR',
        activo: true
      }
    })

    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Contraseña: admin123')
    console.log('👤 Rol:', adminUser.rol)
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 