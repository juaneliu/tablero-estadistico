'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useEntes } from '@/hooks/use-entes'

const COLORS = ['#F29888', '#B25FAC', '#9085DA', '#42A5CC', '#F29888']

// Mapeo de colores por ámbito
const AMBITO_COLORS = {
  'Estatal': '#F29888',
  'Municipal': '#B25FAC'
}

export function EstadisticasEntes() {
  const { getStatistics } = useEntes()
  const [stats, setStats] = useState<{
    total: number
    porAmbito: Record<string, number>
    porPoder: Record<string, number>
    porMunicipio: Record<string, number>
  }>({
    total: 0,
    porAmbito: {},
    porPoder: {},
    porMunicipio: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStatistics()
        setStats(data)
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [getStatistics])

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const ambitoData = Object.entries(stats.porAmbito).map(([name, value]) => ({
    name,
    value: value as number
  }))

  const poderData = Object.entries(stats.porPoder).map(([name, value]) => ({
    name,
    value: value as number
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estadísticas principales responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Sujetos obligados registrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: AMBITO_COLORS['Estatal'] }}
              ></div>
              <span className="truncate">Entes Estatales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: AMBITO_COLORS['Estatal'] }}>
              {stats.porAmbito['Estatal'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ámbito estatal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: AMBITO_COLORS['Municipal'] }}
              ></div>
              <span className="truncate">Entes Municipales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: AMBITO_COLORS['Municipal'] }}>
              {stats.porAmbito['Municipal'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ámbito municipal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="flex flex-col bg-white shadow-sm">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-base sm:text-lg">Distribución por Ámbito</CardTitle>
            <CardDescription className="text-sm">
              Distribución de sujetos obligados por ámbito de gobierno
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-2 sm:p-6">
            <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ambitoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      window.innerWidth < 640 
                        ? `${(percent * 100).toFixed(0)}%` 
                        : `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={window.innerWidth < 640 ? "70%" : "80%"}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ambitoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-white shadow-sm">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-base sm:text-lg">Distribución por Poder</CardTitle>
            <CardDescription className="text-sm">
              Distribución de sujetos obligados por poder de gobierno
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-2 sm:p-6">
            <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poderData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 60 : 40}
                  />
                  <YAxis fontSize={window.innerWidth < 640 ? 10 : 12} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {poderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leyenda para móviles en gráfico de ámbito */}
      <div className="block sm:hidden">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {ambitoData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}