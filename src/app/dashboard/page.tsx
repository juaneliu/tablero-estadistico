"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  OptimizedProgressChart, 
  OptimizedEstadisticasEntes,
  OptimizedSystemStatistics,
  usePreloadLazyComponents 
} from "@/components/lazy-components"
import { ClassificationList } from "@/components/classification-list"
import { SystemsList } from "@/components/systems-list"
import { DatabaseStatus } from "@/components/database-status"
import { useEffect } from "react"

export default function DashboardPage() {
  const { preloadAll } = usePreloadLazyComponents()
  
  // Precargar componentes lazy cuando se monta el dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadAll().catch(console.error)
    }, 100) // Pequeño delay para permitir que se renderice el contenido inicial
    
    return () => clearTimeout(timer)
  }, [preloadAll])

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
          {/* Header responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Hola, ¡Bienvenido de nuevo! 👋
            </h2>
          </div>

          {/* Info Card responsive */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            <Card className="bg-white shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl leading-relaxed">
                  Visualiza en tiempo real el avance de los Entes Públicos en la interconexión a los siguientes sistemas de la{" "}
                  <strong>Plataforma Digital Estatal</strong>:
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <SystemsList />
              </CardContent>
            </Card>
          </div>

          <DatabaseStatus />

          {/* Estadísticas de Entes */}
          <OptimizedEstadisticasEntes />

          {/* Stats Cards */}
          <OptimizedSystemStatistics />

          {/* Chart and Classification responsive */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7 min-h-[300px] sm:min-h-[400px]">
            <OptimizedProgressChart />
            <ClassificationList />
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}
