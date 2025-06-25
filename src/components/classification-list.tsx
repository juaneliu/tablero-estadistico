"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'
import { useEntes } from '@/hooks/use-entes'

interface ClassificationItem {
  icon: string
  name: string
  count: number
}

interface ClassificationData {
  sujetos: ClassificationItem[]
  organos: ClassificationItem[]
  tribunal: ClassificationItem[]
}

export function ClassificationList() {
  const { getClassificationStatistics } = useEntes()
  const [data, setData] = useState<ClassificationData>({
    sujetos: [],
    organos: [],
    tribunal: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const stats = await getClassificationStatistics()
      setData(stats)
    } catch (error) {
      console.error('Error loading classification data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  useEffect(() => {
    loadData()
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      loadData(true)
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [getClassificationStatistics])

  const handleRefresh = () => {
    loadData(true)
  }

  if (loading) {
    return (
      <Card className="col-span-3 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 tracking-wide">
            Clasificación Entes Públicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl opacity-50 mb-3">📊</div>
            <p className="text-slate-500 text-sm font-medium">Cargando clasificaciones...</p>
            <div className="mt-3 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto mb-1"></div>
                  <div className="h-2 bg-slate-100 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="col-span-3 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 tracking-wide">
            Clasificación Entes Públicos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sujetos Obligados */}
        <div>
          <CardDescription className="text-xs font-medium text-slate-600 mb-2 pb-1 border-b border-slate-200">
            Sujetos Obligados
          </CardDescription>
          <div className="space-y-1">
            {data.sujetos.map((item: ClassificationItem, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-50/50 transition-colors duration-200">
                <div className="flex items-center">
                  <span className="mr-2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Órganos Internos de Control */}
        <div>
          <CardDescription className="text-xs font-medium text-slate-600 mb-2 pb-1 border-b border-slate-200">
            Órganos Internos de Control
          </CardDescription>
          <div className="space-y-1">
            {data.organos.map((item: ClassificationItem, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-green-50/50 transition-colors duration-200">
                <div className="flex items-center">
                  <span className="mr-2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tribunal de Justicia Administrativa */}
        <div>
          <CardDescription className="text-xs font-medium text-slate-600 mb-2 pb-1 border-b border-slate-200">
            Tribunal de Justicia Administrativa
          </CardDescription>
          <div className="space-y-1">
            {data.tribunal.map((item: ClassificationItem, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-purple-50/50 transition-colors duration-200">
                <div className="flex items-center">
                  <span className="mr-2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
