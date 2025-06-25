"use client"

import { useState, useEffect } from 'react'

export interface MunicipioMetrica {
  id: string
  name: string
  promedio: number
  entes: number
  sistemas: {
    total: number
    conectados: number
    porcentaje: number
  }
  diagnosticos: {
    total: number
    completados: number
    porcentaje: number
  }
}

export function useMetricasMunicipios() {
  const [municipios, setMunicipios] = useState<MunicipioMetrica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setLoading(true)
        
        // Aquí puedes hacer la llamada real a tu API
        // const response = await fetch('/api/metricas-municipios')
        // const data = await response.json()
        
        // Por ahora, usar datos simulados más completos
        const municipiosData: MunicipioMetrica[] = [
          {
            id: "17031",
            name: "Zacatepec",
            promedio: 85,
            entes: 12,
            sistemas: { total: 6, conectados: 5, porcentaje: 83 },
            diagnosticos: { total: 15, completados: 13, porcentaje: 87 }
          },
          {
            id: "17007",
            name: "Cuernavaca",
            promedio: 92,
            entes: 45,
            sistemas: { total: 6, conectados: 6, porcentaje: 100 },
            diagnosticos: { total: 67, completados: 61, porcentaje: 91 }
          },
          {
            id: "17011",
            name: "Jiutepec",
            promedio: 78,
            entes: 23,
            sistemas: { total: 6, conectados: 4, porcentaje: 67 },
            diagnosticos: { total: 34, completados: 30, porcentaje: 88 }
          },
          {
            id: "17019",
            name: "Temixco",
            promedio: 88,
            entes: 18,
            sistemas: { total: 6, conectados: 5, porcentaje: 83 },
            diagnosticos: { total: 24, completados: 22, porcentaje: 92 }
          },
          {
            id: "17004",
            name: "Cuautla",
            promedio: 74,
            entes: 28,
            sistemas: { total: 6, conectados: 4, porcentaje: 67 },
            diagnosticos: { total: 41, completados: 33, porcentaje: 80 }
          },
          {
            id: "17022",
            name: "Yautepec",
            promedio: 81,
            entes: 19,
            sistemas: { total: 6, conectados: 5, porcentaje: 83 },
            diagnosticos: { total: 26, completados: 21, porcentaje: 81 }
          },
          {
            id: "17006",
            name: "Emiliano Zapata",
            promedio: 66,
            entes: 14,
            sistemas: { total: 6, conectados: 3, porcentaje: 50 },
            diagnosticos: { total: 18, completados: 15, porcentaje: 83 }
          },
          {
            id: "17012",
            name: "Jojutla",
            promedio: 79,
            entes: 16,
            sistemas: { total: 6, conectados: 4, porcentaje: 67 },
            diagnosticos: { total: 22, completados: 20, porcentaje: 91 }
          },
          {
            id: "17023",
            name: "Yecapixtla",
            promedio: 71,
            entes: 11,
            sistemas: { total: 6, conectados: 4, porcentaje: 67 },
            diagnosticos: { total: 15, completados: 11, porcentaje: 73 }
          },
          {
            id: "17027",
            name: "Tlaltizapán",
            promedio: 83,
            entes: 13,
            sistemas: { total: 6, conectados: 5, porcentaje: 83 },
            diagnosticos: { total: 17, completados: 14, porcentaje: 82 }
          }
        ]

        setMunicipios(municipiosData)
        setError(null)
      } catch (err) {
        setError('Error al cargar las métricas de municipios')
        console.error('Error fetching municipios metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetricas()
  }, [])

  const promedioGeneral = municipios.length > 0 
    ? Math.round(municipios.reduce((acc, m) => acc + m.promedio, 0) / municipios.length)
    : 0

  const totalEntes = municipios.reduce((acc, m) => acc + m.entes, 0)

  const totalSistemas = municipios.reduce((acc, m) => acc + m.sistemas.conectados, 0)
  const maxSistemas = municipios.reduce((acc, m) => acc + m.sistemas.total, 0)
  const porcentajeSistemas = maxSistemas > 0 ? Math.round((totalSistemas / maxSistemas) * 100) : 0

  const totalDiagnosticos = municipios.reduce((acc, m) => acc + m.diagnosticos.completados, 0)
  const maxDiagnosticos = municipios.reduce((acc, m) => acc + m.diagnosticos.total, 0)
  const porcentajeDiagnosticos = maxDiagnosticos > 0 ? Math.round((totalDiagnosticos / maxDiagnosticos) * 100) : 0

  return {
    municipios,
    loading,
    error,
    estadisticas: {
      promedioGeneral,
      totalEntes,
      totalMunicipios: municipios.length,
      sistemas: {
        conectados: totalSistemas,
        total: maxSistemas,
        porcentaje: porcentajeSistemas
      },
      diagnosticos: {
        completados: totalDiagnosticos,
        total: maxDiagnosticos,
        porcentaje: porcentajeDiagnosticos
      }
    },
    refresh: () => {
      // Función para refrescar los datos
      setLoading(true)
      // Aquí se podría implementar la lógica de refresh
    }
  }
}
