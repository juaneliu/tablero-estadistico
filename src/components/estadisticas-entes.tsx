'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useEntes } from '@/hooks/use-entes'

const COLORS = ['#F29888', '#B25FAC', '#9085DA', '#42A5CC', '#3B82F6']

// Mapeo de colores por ámbito
const AMBITO_COLORS = {
  'Estatal': '#F29888',
  'Municipal': '#B25FAC'
}

// Custom Label para el gráfico de pie que funciona con SSR
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
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
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-base sm:text-xl md:text-2xl font-bold animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Estadísticas principales responsive */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Entes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Sujetos obligados registrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: AMBITO_COLORS['Estatal'] }}
              ></div>
              <span className="truncate">Entes Estatales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: AMBITO_COLORS['Estatal'] }}>
              {stats.porAmbito['Estatal'] || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Dependencias del gobierno estatal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: AMBITO_COLORS['Municipal'] }}
              ></div>
              <span className="truncate">Entes Municipales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: AMBITO_COLORS['Municipal'] }}>
              {stats.porAmbito['Municipal'] || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Ayuntamientos del estado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos responsive */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Gráfico de distribución por ámbito */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Distribución por Ámbito</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Distribución de sujetos obligados por ámbito de gobierno
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ambitoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ambitoData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(AMBITO_COLORS)[index] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Cantidad']}
                    labelFormatter={(label) => `Ámbito ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Leyenda para el gráfico de ámbito */}
            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2 sm:gap-4">
              {ambitoData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 sm:gap-2">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                    style={{ backgroundColor: Object.values(AMBITO_COLORS)[index] || COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs sm:text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de distribución por poder */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Distribución por Poder</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Distribución de sujetos obligados por poder de gobierno
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={poderData} 
                  margin={{ 
                    top: 10, 
                    right: 10, 
                    left: 10, 
                    bottom: 40 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Cantidad']}
                    labelFormatter={(label) => `Poder ${label}`}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
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
    </div>
  )
}