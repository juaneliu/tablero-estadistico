import { PrismaClient } from '@prisma/client'

// Tipo para compatibilidad con la interfaz existente
export type EntePublico = {
  id?: number
  nombre: string
  ambitoGobierno: 'Federal' | 'Estatal' | 'Municipal'
  poderGobierno: 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo'
  controlOIC: boolean
  controlTribunal: boolean
  sistema1: boolean
  sistema2: boolean
  sistema3: boolean
  sistema6: boolean
  entidad: {
    nombre: string
  }
  municipio: string | null
  createdAt?: Date
  updatedAt?: Date
}

// Singleton para Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Municipios de Morelos
export const MUNICIPIOS_MORELOS = [
  'Amacuzac',
  'Atlatlahucan',
  'Axochiapan',
  'Ayala',
  'Coatetelco',
  'Coatlán del Río',
  'Cuautla',
  'Cuernavaca',
  'Emiliano Zapata',
  'Hueyapan',
  'Huitzilac',
  'Jantetelco',
  'Jiutepec',
  'Jojutla',
  'Jonacatepec de Leandro Valle',
  'Mazatepec',
  'Miacatlán',
  'Ocuituco',
  'Puente de Ixtla',
  'Temixco',
  'Temoac',
  'Tepalcingo',
  'Tepoztlán',
  'Tetecala',
  'Tetela del Volcán',
  'Tlalnepantla',
  'Tlaltizapán de Zapata',
  'Tlaquiltenango',
  'Tlayacapan',
  'Totolapan',
  'Xochitepec',
  'Xoxocotla',
  'Yautepec',
  'Yecapixtla',
  'Zacatepec',
  'Zacualpan de Amilpas'
]

// Servicio para manejar entes públicos con Prisma
export class EntesService {
  private static isDatabaseConfigured(): boolean {
    const url = process.env.DATABASE_URL
    return url !== undefined && 
           url !== "postgresql://usuario:password@localhost:5432/tablero_estadistico" &&
           !url.includes('usuario:password')
  }

  static async getAll(): Promise<EntePublico[]> {
    try {
      const entes = await prisma.entePublico.findMany({
        orderBy: { nombre: 'asc' }
      })

      return entes.map((ente: any) => ({
        id: ente.id,
        nombre: ente.nombre,
        ambitoGobierno: ente.ambitoGobierno as 'Federal' | 'Estatal' | 'Municipal',
        poderGobierno: ente.poderGobierno as 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo',
        controlOIC: ente.controlOIC,
        controlTribunal: ente.controlTribunal,
        sistema1: ente.sistema1,
        sistema2: ente.sistema2,
        sistema3: ente.sistema3,
        sistema6: ente.sistema6,
        entidad: ente.entidad as { nombre: string },
        municipio: ente.municipio,
        createdAt: ente.createdAt,
        updatedAt: ente.updatedAt
      }))
    } catch (error) {
      console.error('Error connecting to database:', error)
      console.warn('Fallback: Usando datos de ejemplo.')
      return this.getLocalData()
    }
  }

  static async getById(id: number): Promise<EntePublico | null> {
    try {
      const ente = await prisma.entePublico.findUnique({
        where: { id }
      })

      if (!ente) return null

      return {
        id: ente.id,
        nombre: ente.nombre,
        ambitoGobierno: ente.ambitoGobierno as 'Federal' | 'Estatal' | 'Municipal',
        poderGobierno: ente.poderGobierno as 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo',
        controlOIC: ente.controlOIC,
        controlTribunal: ente.controlTribunal,
        sistema1: ente.sistema1,
        sistema2: ente.sistema2,
        sistema3: ente.sistema3,
        sistema6: ente.sistema6,
        entidad: ente.entidad as { nombre: string },
        municipio: ente.municipio,
        createdAt: ente.createdAt,
        updatedAt: ente.updatedAt
      }
    } catch (error) {
      console.error('Error fetching ente:', error)
      const localData = this.getLocalData()
      return localData.find(ente => ente.id === id) || null
    }
  }

  static async create(ente: Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>): Promise<EntePublico> {
    if (!this.isDatabaseConfigured()) {
      throw new Error('Base de datos no configurada. Por favor configura la variable DATABASE_URL.')
    }

    try {
      const created = await prisma.entePublico.create({
        data: {
          nombre: ente.nombre,
          ambitoGobierno: ente.ambitoGobierno,
          poderGobierno: ente.poderGobierno,
          controlOIC: ente.controlOIC,
          controlTribunal: ente.controlTribunal,
          sistema1: ente.sistema1,
          sistema2: ente.sistema2,
          sistema3: ente.sistema3,
          sistema6: ente.sistema6,
          entidad: ente.entidad,
          municipio: ente.municipio
        }
      })

      return {
        id: created.id,
        nombre: created.nombre,
        ambitoGobierno: created.ambitoGobierno as 'Federal' | 'Estatal' | 'Municipal',
        poderGobierno: created.poderGobierno as 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo',
        controlOIC: created.controlOIC,
        controlTribunal: created.controlTribunal,
        sistema1: created.sistema1,
        sistema2: created.sistema2,
        sistema3: created.sistema3,
        sistema6: created.sistema6,
        entidad: created.entidad as { nombre: string },
        municipio: created.municipio,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      }
    } catch (error) {
      console.error('Error creating ente:', error)
      throw new Error(`Error al crear ente: ${error}`)
    }
  }

  static async update(id: number, ente: Partial<Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EntePublico> {
    if (!this.isDatabaseConfigured()) {
      throw new Error('Base de datos no configurada.')
    }

    try {
      const updated = await prisma.entePublico.update({
        where: { id },
        data: {
          ...(ente.nombre && { nombre: ente.nombre }),
          ...(ente.ambitoGobierno && { ambitoGobierno: ente.ambitoGobierno }),
          ...(ente.poderGobierno && { poderGobierno: ente.poderGobierno }),
          ...(ente.controlOIC !== undefined && { controlOIC: ente.controlOIC }),
          ...(ente.controlTribunal !== undefined && { controlTribunal: ente.controlTribunal }),
          ...(ente.sistema1 !== undefined && { sistema1: ente.sistema1 }),
          ...(ente.sistema2 !== undefined && { sistema2: ente.sistema2 }),
          ...(ente.sistema3 !== undefined && { sistema3: ente.sistema3 }),
          ...(ente.sistema6 !== undefined && { sistema6: ente.sistema6 }),
          ...(ente.entidad && { entidad: ente.entidad }),
          ...(ente.municipio !== undefined && { municipio: ente.municipio })
        }
      })

      return {
        id: updated.id,
        nombre: updated.nombre,
        ambitoGobierno: updated.ambitoGobierno as 'Federal' | 'Estatal' | 'Municipal',
        poderGobierno: updated.poderGobierno as 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo',
        controlOIC: updated.controlOIC,
        controlTribunal: updated.controlTribunal,
        sistema1: updated.sistema1,
        sistema2: updated.sistema2,
        sistema3: updated.sistema3,
        sistema6: updated.sistema6,
        entidad: updated.entidad as { nombre: string },
        municipio: updated.municipio,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      }
    } catch (error) {
      console.error('Error updating ente:', error)
      throw new Error(`Error al actualizar ente: ${error}`)
    }
  }

  static async delete(id: number): Promise<void> {
    if (!this.isDatabaseConfigured()) {
      throw new Error('Base de datos no configurada.')
    }

    try {
      await prisma.entePublico.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting ente:', error)
      throw new Error(`Error al eliminar ente: ${error}`)
    }
  }

  static async importBulk(entes: Omit<EntePublico, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    if (!this.isDatabaseConfigured()) {
      throw new Error('Base de datos no configurada.')
    }

    try {
      await prisma.entePublico.createMany({
        data: entes.map(ente => ({
          nombre: ente.nombre,
          ambitoGobierno: ente.ambitoGobierno,
          poderGobierno: ente.poderGobierno,
          controlOIC: ente.controlOIC,
          controlTribunal: ente.controlTribunal,
          sistema1: ente.sistema1,
          sistema2: ente.sistema2,
          sistema3: ente.sistema3,
          sistema6: ente.sistema6,
          entidad: ente.entidad,
          municipio: ente.municipio
        })),
        skipDuplicates: true
      })
    } catch (error) {
      console.error('Error importing entes:', error)
      throw new Error(`Error al importar entes: ${error}`)
    }
  }

  // Métodos de estadísticas
  static async getStatistics() {
    let data: EntePublico[]

    if (!this.isDatabaseConfigured()) {
      data = this.getLocalData()
    } else {
      try {
        data = await this.getAll()
      } catch (error) {
        console.error('Error fetching statistics:', error)
        data = this.getLocalData()
      }
    }

    // Filtrar solo Sujetos Obligados (entes sin OIC)
    const sujetosObligados = data.filter(ente => !ente.controlOIC)
    
    const total = sujetosObligados.length
    const porAmbito = sujetosObligados.reduce((acc: Record<string, number>, ente) => {
      acc[ente.ambitoGobierno] = (acc[ente.ambitoGobierno] || 0) + 1
      return acc
    }, {})

    const porPoder = sujetosObligados.reduce((acc: Record<string, number>, ente) => {
      acc[ente.poderGobierno] = (acc[ente.poderGobierno] || 0) + 1
      return acc
    }, {})

    const porMunicipio = sujetosObligados.reduce((acc: Record<string, number>, ente) => {
      if (ente.municipio) {
        acc[ente.municipio] = (acc[ente.municipio] || 0) + 1
      }
      return acc
    }, {})

    return {
      total,
      porAmbito,
      porPoder,
      porMunicipio
    }
  }

  static async getEntesConOIC(): Promise<EntePublico[]> {
    try {
      const entes = await prisma.entePublico.findMany({
        where: { controlOIC: true },
        orderBy: { nombre: 'asc' }
      })

      return entes.map((ente: any) => ({
        id: ente.id,
        nombre: ente.nombre,
        ambitoGobierno: ente.ambitoGobierno as 'Federal' | 'Estatal' | 'Municipal',
        poderGobierno: ente.poderGobierno as 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Autónomo',
        controlOIC: ente.controlOIC,
        controlTribunal: ente.controlTribunal,
        sistema1: ente.sistema1,
        sistema2: ente.sistema2,
        sistema3: ente.sistema3,
        sistema6: ente.sistema6,
        entidad: ente.entidad as { nombre: string },
        municipio: ente.municipio,
        createdAt: ente.createdAt,
        updatedAt: ente.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching entes con OIC:', error)
      console.warn('Fallback: Usando datos de ejemplo filtrados.')
      return this.getLocalData().filter(ente => ente.controlOIC)
    }
  }

  // Métodos de estadísticas de sistemas
  static async getSystemStatistics() {
    let data: EntePublico[]

    if (!this.isDatabaseConfigured()) {
      data = this.getLocalData()
    } else {
      try {
        data = await this.getAll()
      } catch (error) {
        console.error('Error fetching system statistics:', error)
        data = this.getLocalData()
      }
    }

    // Filtrar solo Sujetos Obligados (entes sin OIC)
    const sujetosObligados = data.filter(ente => !ente.controlOIC)
    
    // Filtrar solo Autoridades Resolutoras (entes con OIC)
    const autoridadesResolutoras = data.filter(ente => ente.controlOIC)

    // Calcular estadísticas para cada sistema
    const sistema1Count = sujetosObligados.filter(ente => ente.sistema1).length
    const sistema2Count = sujetosObligados.filter(ente => ente.sistema2).length
    const sistema3Count = autoridadesResolutoras.filter(ente => ente.sistema3).length
    const sistema6Count = sujetosObligados.filter(ente => ente.sistema6).length

    const sujetosObligadosTotal = sujetosObligados.length
    const autoridadesResolutorasTotal = autoridadesResolutoras.length

    return {
      sistema1: {
        count: sistema1Count,
        percentage: sujetosObligadosTotal > 0 ? (sistema1Count / sujetosObligadosTotal) * 100 : 0,
        total: sujetosObligadosTotal
      },
      sistema2: {
        count: sistema2Count,
        percentage: sujetosObligadosTotal > 0 ? (sistema2Count / sujetosObligadosTotal) * 100 : 0,
        total: sujetosObligadosTotal
      },
      sistema3: {
        count: sistema3Count,
        percentage: autoridadesResolutorasTotal > 0 ? (sistema3Count / autoridadesResolutorasTotal) * 100 : 0,
        total: autoridadesResolutorasTotal
      },
      sistema6: {
        count: sistema6Count,
        percentage: sujetosObligadosTotal > 0 ? (sistema6Count / sujetosObligadosTotal) * 100 : 0,
        total: sujetosObligadosTotal
      }
    }
  }

  // Métodos de estadísticas de clasificación
  static async getClassificationStatistics() {
    let data: EntePublico[]

    if (!this.isDatabaseConfigured()) {
      data = this.getLocalData()
    } else {
      try {
        data = await this.getAll()
      } catch (error) {
        console.error('Error fetching classification statistics:', error)
        data = this.getLocalData()
      }
    }

    // Filtrar solo Sujetos Obligados (entes sin OIC)
    const sujetosObligados = data.filter(ente => !ente.controlOIC)
    
    // Filtrar solo Autoridades Resolutoras (entes con OIC)
    const autoridadesResolutoras = data.filter(ente => ente.controlOIC)
    
    // Filtrar Tribunal (entes con control de tribunal)
    const tribunal = data.filter(ente => ente.controlTribunal)

    // Calcular clasificaciones específicas para Sujetos Obligados
    const ejecutivoEstatal = sujetosObligados.filter(ente => 
      ente.ambitoGobierno === 'Estatal' && ente.poderGobierno === 'Ejecutivo'
    ).length

    const judicialEstatal = sujetosObligados.filter(ente => 
      ente.ambitoGobierno === 'Estatal' && ente.poderGobierno === 'Judicial'
    ).length

    const legislativoEstatal = sujetosObligados.filter(ente => 
      ente.ambitoGobierno === 'Estatal' && ente.poderGobierno === 'Legislativo'
    ).length

    const autonomoEstatal = sujetosObligados.filter(ente => 
      ente.ambitoGobierno === 'Estatal' && ente.poderGobierno === 'Autónomo'
    ).length

    const ejecutivoMunicipal = sujetosObligados.filter(ente => 
      ente.ambitoGobierno === 'Municipal' && ente.poderGobierno === 'Ejecutivo'
    ).length

    // Calcular OIC (Autoridades Resolutoras)
    const oicEstatales = autoridadesResolutoras.filter(ente => 
      ente.ambitoGobierno === 'Estatal'
    ).length

    const oicMunicipales = autoridadesResolutoras.filter(ente => 
      ente.ambitoGobierno === 'Municipal'
    ).length

    return {
      sujetos: [
        { icon: "/icons/ejecutivo.svg", name: "Ejecutivo Estatal", count: ejecutivoEstatal },
        { icon: "/icons/judicial.svg", name: "Judicial Estatal", count: judicialEstatal },
        { icon: "/icons/legislativo.svg", name: "Legislativo Estatal", count: legislativoEstatal },
        { icon: "/icons/autonomo.svg", name: "Autónomo Estatal", count: autonomoEstatal },
        { icon: "/icons/ejecutivo_municipal.svg", name: "Ejecutivo Municipal", count: ejecutivoMunicipal },
      ],
      organos: [
        { icon: "/icons/oice.svg", name: "OICE Órganos Internos de Control Estatales", count: oicEstatales },
        { icon: "/icons/oicm.svg", name: "OICM Órganos Internos de Control Municipales", count: oicMunicipales },
      ],
      tribunal: [
        { icon: "/icons/tribunalja.svg", name: "Tribunal de Justicia Administrativa", count: tribunal.length },
      ]
    }
  }

  private static getLocalData(): EntePublico[] {
    return [
      {
        id: 1,
        nombre: "AEROPUERTO DE CUERNAVACA S.A. DE C.V.",
        ambitoGobierno: "Estatal",
        poderGobierno: "Ejecutivo",
        controlOIC: false,
        controlTribunal: false,
        sistema1: false,
        sistema2: true,
        sistema3: false,
        sistema6: false,
        entidad: { nombre: "Morelos" },
        municipio: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        nombre: "CENTRO DE CONCILIACIÓN LABORAL DEL ESTADO DE MORELOS",
        ambitoGobierno: "Estatal", 
        poderGobierno: "Ejecutivo",
        controlOIC: false,
        controlTribunal: false,
        sistema1: false,
        sistema2: true,
        sistema3: false,
        sistema6: false,
        entidad: { nombre: "Morelos" },
        municipio: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        nombre: "H. AYUNTAMIENTO DE CUERNAVACA",
        ambitoGobierno: "Municipal",
        poderGobierno: "Ejecutivo",
        controlOIC: false,
        controlTribunal: false,
        sistema1: true,
        sistema2: false,
        sistema3: false,
        sistema6: true,
        entidad: { nombre: "Morelos" },
        municipio: "Cuernavaca",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
}
