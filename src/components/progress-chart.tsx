"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { useEntes } from '@/hooks/use-entes'

export function ProgressChart() {
  const { getSystemStatistics } = useEntes()
  const [chartData, setChartData] = useState([
    { name: 'S1', percentage: 0, color: '#F29888' },
    { name: 'S2', percentage: 0, color: '#B25FAC' },
    { name: 'S3', percentage: 0, color: '#9085DA' },
    { name: 'S6', percentage: 0, color: '#42A5CC' }
  ])
  const [loading, setLoading] = useState(true)

  const loadChartData = async () => {
    try {
      setLoading(true)
      
      const stats = await getSystemStatistics()
      
      const newChartData = [
        { name: 'S1', percentage: stats.sistema1.percentage, color: '#F29888' },
        { name: 'S2', percentage: stats.sistema2.percentage, color: '#B25FAC' },
        { name: 'S3', percentage: stats.sistema3.percentage, color: '#9085DA' },
        { name: 'S6', percentage: stats.sistema6.percentage, color: '#42A5CC' }
      ]
      
      setChartData(newChartData)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadChartData()
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      loadChartData()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [getSystemStatistics])

  const [currentDate, setCurrentDate] = useState('')

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  useEffect(() => {
    // Solo establecer la fecha después del montaje para evitar hidratación
    setCurrentDate(getCurrentDate())
  }, [])

  return (
    <Card className="col-span-4 bg-white flex flex-col min-h-[300px] sm:min-h-[400px]">
      <CardHeader className="pb-2 sm:pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 tracking-wide">
              Avance del Trimestre
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-slate-500 tracking-wide">
              {loading ? 'Cargando...' : `Última actualización: ${currentDate || 'Cargando fecha...'}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0 sm:pl-2 flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl opacity-50 mb-2 sm:mb-4">📊</div>
              <p className="text-sm text-muted-foreground">Cargando datos de la gráfica...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ 
                top: 20, 
                right: 10, 
                left: 10, 
                bottom: 5 
              }}>
                <CartesianGrid 
                  strokeDasharray="1 1" 
                  stroke="#e2e8f0" 
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, 'Porcentaje']}
                  labelFormatter={(label) => `Sistema ${label}`}
                />
                <Bar 
                  dataKey="percentage" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
