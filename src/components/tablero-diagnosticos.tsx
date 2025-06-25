'use client'

import dynamic from 'next/dynamic'
import { DiagnosticoMunicipal } from "@/hooks/use-diagnosticos-municipales"

// Componente dinámico que solo se carga en el cliente
const TableroDiagnosticosClient = dynamic(() => import('./tablero-diagnosticos-client'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">Diagnósticos Municipales</h1>
        <div className="mt-4 animate-pulse">
          <div className="h-4 bg-blue-300 rounded w-1/3"></div>
        </div>
      </div>
      <div className="grid gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface TableroDiagnosticosProps {
  diagnosticos: DiagnosticoMunicipal[]
  loading: boolean
  onDiagnosticosUpdate?: () => void
}

export function TableroDiagnosticos(props: TableroDiagnosticosProps) {
  return <TableroDiagnosticosClient {...props} />
}
