import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type DirectorioOICData = {
  id?: number
  oicNombre: string
  puesto: string
  nombre: string
  correoElectronico: string
  telefono?: string | null
  direccion?: string | null
  entidad: {
    nombre: string
  }
  entesPublicosIds: number[] // IDs de los entes públicos asociados
  createdAt?: Date
  updatedAt?: Date
}

export type DirectorioOICWithEntes = {
  id: number
  oicNombre: string
  puesto: string
  nombre: string
  correoElectronico: string
  telefono?: string | null
  direccion?: string | null
  entidad: {
    nombre: string
  }
  entesPublicos: Array<{
    id: number
    nombre: string
    ambitoGobierno: string
    poderGobierno: string
  }>
  createdAt: Date
  updatedAt: Date
}

export class DirectorioOICService {
  
  static async getAll(): Promise<DirectorioOICWithEntes[]> {
    try {
      const directorios = await prisma.directorioOIC.findMany({
        include: {
          entesPublicos: {
            include: {
              entePublico: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return directorios.map((directorio: any) => ({
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.entesPublicos.map((ep: any) => ep.entePublico),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching directorio OIC:', error)
      throw new Error('Error al obtener el directorio OIC')
    }
  }

  static async getById(id: number): Promise<DirectorioOICWithEntes | null> {
    try {
      const directorio = await prisma.directorioOIC.findUnique({
        where: { id },
        include: {
          entesPublicos: {
            include: {
              entePublico: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      if (!directorio) return null

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.entesPublicos.map((ep: any) => ep.entePublico),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error fetching directorio OIC by ID:', error)
      throw new Error('Error al obtener el registro del directorio OIC')
    }
  }

  static async create(data: Omit<DirectorioOICData, 'id' | 'createdAt' | 'updatedAt'>): Promise<DirectorioOICWithEntes> {
    try {
      const { entesPublicosIds, ...directorioData } = data

      const directorio = await prisma.directorioOIC.create({
        data: {
          ...directorioData,
          entesPublicos: {
            create: entesPublicosIds.map((enteId: number) => ({
              entePublicoId: enteId
            }))
          }
        },
        include: {
          entesPublicos: {
            include: {
              entePublico: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.entesPublicos.map((ep: any) => ep.entePublico),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error creating directorio OIC:', error)
      throw new Error('Error al crear el registro del directorio OIC')
    }
  }

  static async update(id: number, data: Partial<Omit<DirectorioOICData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DirectorioOICWithEntes> {
    try {
      const { entesPublicosIds, ...directorioData } = data

      // Si se proporcionan nuevos entes públicos, actualizar las relaciones
      if (entesPublicosIds !== undefined) {
        // Eliminar relaciones existentes
        await prisma.directorioOICEnte.deleteMany({
          where: { directorioOICId: id }
        })
        
        // Crear nuevas relaciones
        if (entesPublicosIds.length > 0) {
          await prisma.directorioOICEnte.createMany({
            data: entesPublicosIds.map((enteId: number) => ({
              directorioOICId: id,
              entePublicoId: enteId
            }))
          })
        }
      }

      const directorio = await prisma.directorioOIC.update({
        where: { id },
        data: directorioData,
        include: {
          entesPublicos: {
            include: {
              entePublico: {
                select: {
                  id: true,
                  nombre: true,
                  ambitoGobierno: true,
                  poderGobierno: true
                }
              }
            }
          }
        }
      })

      return {
        id: directorio.id,
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono,
        direccion: directorio.direccion,
        entidad: directorio.entidad as { nombre: string },
        entesPublicos: directorio.entesPublicos.map((ep: any) => ep.entePublico),
        createdAt: directorio.createdAt,
        updatedAt: directorio.updatedAt
      }
    } catch (error) {
      console.error('Error updating directorio OIC:', error)
      throw new Error('Error al actualizar el registro del directorio OIC')
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await prisma.directorioOIC.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting directorio OIC:', error)
      throw new Error('Error al eliminar el registro del directorio OIC')
    }
  }

  static async getStatistics() {
    try {
      const total = await prisma.directorioOIC.count()
      
      const porOIC = await prisma.directorioOIC.groupBy({
        by: ['oicNombre'],
        _count: true
      })

      const porPuesto = await prisma.directorioOIC.groupBy({
        by: ['puesto'],
        _count: true
      })

      return {
        total,
        porOIC: porOIC.reduce((acc: Record<string, number>, item: any) => {
          acc[item.oicNombre] = item._count
          return acc
        }, {}),
        porPuesto: porPuesto.reduce((acc: Record<string, number>, item: any) => {
          acc[item.puesto] = item._count
          return acc
        }, {})
      }
    } catch (error) {
      console.error('Error getting directorio OIC statistics:', error)
      return {
        total: 0,
        porOIC: {},
        porPuesto: {}
      }
    }
  }
}
