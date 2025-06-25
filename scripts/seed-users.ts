import { AuthService } from '../src/lib/auth-service'

async function createDefaultUsers() {
  console.log('🌱 Creando usuarios por defecto...')

  try {
    // Usuario Invitado (sin contraseña)
    const invitado = await AuthService.createUser({
      email: 'invitado@tablero.gob.mx',
      nombre: 'Usuario',
      apellido: 'Invitado',
      rol: 'INVITADO'
    })
    console.log('✅ Usuario Invitado creado:', invitado.email)

    // Usuario Operativo
    const operativo = await AuthService.createUser({
      email: 'operativo@tablero.gob.mx',
      nombre: 'Usuario',
      apellido: 'Operativo',
      password: 'operativo123',
      rol: 'OPERATIVO'
    })
    console.log('✅ Usuario Operativo creado:', operativo.email)

    // Usuario Administrador
    const admin = await AuthService.createUser({
      email: 'admin@tablero.gob.mx',
      nombre: 'Usuario',
      apellido: 'Administrador',
      password: 'admin123',
      rol: 'ADMINISTRADOR'
    })
    console.log('✅ Usuario Administrador creado:', admin.email)

    console.log('\n🎉 Usuarios creados exitosamente!')
    console.log('\n📋 Credenciales de acceso:')
    console.log('1. Invitado: invitado@tablero.gob.mx (sin contraseña)')
    console.log('2. Operativo: operativo@tablero.gob.mx / operativo123')
    console.log('3. Administrador: admin@tablero.gob.mx / admin123')

  } catch (error: any) {
    if (error.message === 'El usuario ya existe') {
      console.log('ℹ️ Los usuarios ya existen en la base de datos')
    } else {
      console.error('❌ Error creando usuarios:', error.message)
    }
  }
}

createDefaultUsers()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
