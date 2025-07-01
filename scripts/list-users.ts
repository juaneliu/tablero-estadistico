import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('👥 USUARIOS DISPONIBLES:')
    console.log('========================')
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados')
      return
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nombre} ${user.apellido}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   👤 Rol: ${user.rol}`)
      console.log(`   ✅ Activo: ${user.activo ? 'Sí' : 'No'}`)
      console.log(`   🕐 Último acceso: ${user.ultimoAcceso || 'Nunca'}`)
      console.log(`   📅 Creado: ${user.createdAt.toLocaleDateString('es-ES')}`)
    })

    console.log('\n========================')
    console.log(`Total de usuarios: ${users.length}`)
    
    const adminUsers = users.filter(u => u.rol === 'ADMINISTRADOR')
    console.log(`Administradores: ${adminUsers.length}`)
    
  } catch (error) {
    console.error('❌ Error listando usuarios:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers() 