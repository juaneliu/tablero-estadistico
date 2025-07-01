import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setPasswords() {
  try {
    console.log('🔐 ESTABLECIENDO CONTRASEÑAS PARA USUARIOS:')
    console.log('==========================================')
    
    // Contraseñas por defecto
    const defaultPasswords = {
      'admin@tablero.gob.mx': 'admin123',
      'juan.landa@saem.gob.mx': 'juan123',
      'operativo@tablero.gob.mx': 'operativo123',
      'vladimir.orihuela@saem.gob.mx': 'vladimir123',
      'seguimiento@saem.gob.mx': 'seguimiento123'
    }

    for (const [email, password] of Object.entries(defaultPasswords)) {
      const hashedPassword = await bcrypt.hash(password, 12)
      
      const user = await prisma.usuario.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log(`✅ ${user.nombre} ${user.apellido} (${email})`)
      console.log(`   🔐 Contraseña: ${password}`)
      console.log()
    }

    console.log('==========================================')
    console.log('🎉 CONTRASEÑAS ESTABLECIDAS CORRECTAMENTE')
    console.log()
    console.log('📋 CREDENCIALES PARA LOGIN:')
    console.log('---------------------------')
    
    for (const [email, password] of Object.entries(defaultPasswords)) {
      const user = await prisma.usuario.findUnique({ where: { email } })
      if (user) {
        console.log(`👤 ${user.rol}: ${email} / ${password}`)
      }
    }
    
    console.log()
    console.log('📝 NOTA: El usuario invitado@tablero.gob.mx no requiere contraseña')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setPasswords() 