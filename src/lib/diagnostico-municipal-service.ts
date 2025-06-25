import { prisma } from './prisma-service'

export interface DiagnosticoMunicipalData {
  nombreActividad: string
  municipio: string
  actividad: string
  solicitudUrl?: string
  respuestaUrl?: string
  unidadAdministrativa: string
  evaluacion: number
  observaciones?: string
  acciones?: Array<{
    id: string
    descripcion: string
    responsable: string
    fechaLimite: string
    completada: boolean
  }>
  estado: string
  creadoPor?: string
}

export class DiagnosticoMunicipalService {
  
  // Obtener todos los diagnósticos
  static async getAll() {
    return await prisma.diagnosticoMunicipal.findMany({
      orderBy: {
        fechaCreacion: 'desc'
      }
    })
  }

  // Obtener diagnóstico por ID
  static async getById(id: number) {
    const diagnostico = await prisma.diagnosticoMunicipal.findUnique({
      where: { id }
    })
    
    if (!diagnostico) {
      throw new Error('Diagnóstico no encontrado')
    }
    
    return diagnostico
  }

  // Crear nuevo diagnóstico
  static async create(data: DiagnosticoMunicipalData) {
    return await prisma.diagnosticoMunicipal.create({
      data: {
        nombreActividad: data.nombreActividad,
        municipio: data.municipio,
        actividad: data.actividad,
        solicitudUrl: data.solicitudUrl || null,
        respuestaUrl: data.respuestaUrl || null,
        unidadAdministrativa: data.unidadAdministrativa,
        evaluacion: data.evaluacion,
        observaciones: data.observaciones || null,
        acciones: data.acciones || [],
        estado: data.estado || 'En Proceso',
        creadoPor: data.creadoPor || null
      }
    })
  }

  // Actualizar diagnóstico
  static async update(id: number, data: Partial<DiagnosticoMunicipalData>) {
    return await prisma.diagnosticoMunicipal.update({
      where: { id },
      data: {
        ...(data.nombreActividad && { nombreActividad: data.nombreActividad }),
        ...(data.municipio && { municipio: data.municipio }),
        ...(data.actividad && { actividad: data.actividad }),
        ...(data.solicitudUrl !== undefined && { solicitudUrl: data.solicitudUrl || null }),
        ...(data.respuestaUrl !== undefined && { respuestaUrl: data.respuestaUrl || null }),
        ...(data.unidadAdministrativa && { unidadAdministrativa: data.unidadAdministrativa }),
        ...(data.evaluacion !== undefined && { evaluacion: data.evaluacion }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones || null }),
        ...(data.acciones && { acciones: data.acciones }),
        ...(data.estado && { estado: data.estado }),
        fechaActualizacion: new Date()
      }
    })
  }

  // Eliminar diagnóstico
  static async delete(id: number) {
    return await prisma.diagnosticoMunicipal.delete({
      where: { id }
    })
  }

  // Obtener estadísticas
  static async getEstadisticas() {
    const diagnosticos = await this.getAll()
    
    return {
      totalMunicipios: 36, // Total de municipios de Morelos
      total: diagnosticos.length,
      completados: diagnosticos.filter(d => d.estado === 'Completado').length,
      enProceso: diagnosticos.filter(d => d.estado === 'En Proceso').length,
      pendientes: diagnosticos.filter(d => d.estado === 'Pendiente').length,
    }
  }

  // Obtener diagnósticos por municipio
  static async getByMunicipio(municipio: string) {
    return await prisma.diagnosticoMunicipal.findMany({
      where: { municipio },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })
  }

  // Obtener diagnósticos por estado
  static async getByEstado(estado: string) {
    return await prisma.diagnosticoMunicipal.findMany({
      where: { estado },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })
  }

  // Eliminar todos los diagnósticos (usar con cuidado)
  static async deleteAll() {
    return await prisma.diagnosticoMunicipal.deleteMany({})
  }
}
