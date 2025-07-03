import React, { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: number
  percentage: number
  color?: string // Made optional since we're using soft greys
  description: string
}

export const StatsCard = memo(function StatsCard({ 
  title, 
  value, 
  percentage, 
  color = "#64748b", 
  description 
}: StatsCardProps) {
  // Memoizar el cálculo de estilos
  const styles = useMemo(() => {
    // Convertir hex a rgba para el fondo
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.1)} 0%, ${hexToRgba(color, 0.05)} 100%)`,
      borderLeft: `4px solid ${color}`
    }
  }, [color])

  // Memoizar el porcentaje formateado
  const formattedPercentage = useMemo(() => percentage.toFixed(1), [percentage])

  return (
    <Card 
      className="glass-card hover:bg-white/95 transition-all duration-200 group hover:shadow-md"
      style={styles}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 tracking-wide truncate pr-2">
          {title}
        </CardTitle>
        <div 
          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-60 group-hover:opacity-80 transition-opacity flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
        <div className="text-lg sm:text-2xl font-semibold tracking-wide text-slate-900">
          {value}
        </div>
        <p className="text-xs text-slate-500 tracking-wide">
          <span 
            className="font-medium"
            style={{ color: color }}
          >
            {formattedPercentage}%
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  )
})
