'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/stats-card'
import { useEntes } from '@/hooks/use-entes'

export function SystemStatistics() {
  const { getSystemStatistics } = useEntes()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getSystemStatistics()
        setStats(data)
      } catch (error) {
        console.error('Error loading system statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [getSystemStatistics])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCard
            key={i}
            title="Cargando..."
            value={0}
            percentage={0}
            color="#cccccc"
            description="..."
          />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statsData = [
    {
      title: "Entes Públicos Conectados al Sistema 1",
      value: stats.sistema1.count,
      percentage: stats.sistema1.percentage,
      color: "#F29888",
      description: "de los sujetos obligados"
    },
    {
      title: "Entes Públicos Conectados al Sistema 2",
      value: stats.sistema2.count,
      percentage: stats.sistema2.percentage,
      color: "#B25FAC",
      description: "de los sujetos obligados"
    },
    {
      title: "Autoridades Resolutoras Conectados al Sistema 3",
      value: stats.sistema3.count,
      percentage: stats.sistema3.percentage,
      color: "#9085DA",
      description: "de los OIC"
    },
    {
      title: "Entes Públicos Conectados al Sistema 6",
      value: stats.sistema6.count,
      percentage: stats.sistema6.percentage,
      color: "#42A5CC",
      description: "de los sujetos obligados"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
