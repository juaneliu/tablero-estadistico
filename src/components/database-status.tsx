'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database, Settings, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

export function DatabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verificar si la base de datos está configurada
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/database-status')
        const { isConfigured } = await response.json()
        setIsConfigured(isConfigured)
      } catch (error) {
        // Si no hay API de estado, usar verificación básica de env
        const configured = process.env.DATABASE_URL !== undefined && 
                         !process.env.DATABASE_URL?.includes('usuario:password')
        setIsConfigured(configured)
      }
      setIsChecking(false)
    }

    checkDatabase()
  }, [])

  if (isChecking) {
    return (
      <Card className="mb-4 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-lg backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-800/10 dark:to-indigo-800/10 rounded-full blur-2xl -z-10"></div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Database className="h-4 w-4 text-white animate-pulse" />
            </div>
            <span className="font-medium">Verificando conexión a la base de datos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConfigured) {
    return null
  }

  return (
    <Card className="mb-4 bg-gradient-to-br from-white via-amber-50 to-orange-50 dark:from-slate-900 dark:via-amber-900/20 dark:to-orange-900/20 border-amber-200/60 dark:border-amber-600/40 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 via-orange-200/30 to-yellow-200/30 dark:from-amber-800/20 dark:via-orange-800/20 dark:to-yellow-800/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/20 dark:from-orange-800/10 dark:to-amber-800/10 rounded-full blur-2xl -z-10"></div>
      
      <CardHeader className="pb-3 relative z-10 border-b border-amber-200/40 dark:border-amber-600/40">
        <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
            Base de Datos No Configurada
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-amber-700 dark:text-amber-300 relative z-10">
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Tu base de datos PostgreSQL no está configurada. Actualmente se muestran datos de ejemplo.
          </p>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-amber-200/60 dark:border-amber-600/40 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Configuración rápida:</p>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>Ejecuta: <code className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded text-xs font-mono border border-amber-200 dark:border-amber-700">./setup-database.sh</code></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>O sigue las instrucciones en <code className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded text-xs font-mono border border-amber-200 dark:border-amber-700">CONFIGURACION_DATABASE.md</code></span>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-100/70 to-orange-100/70 dark:from-amber-900/30 dark:to-orange-900/30 backdrop-blur-sm rounded-lg border border-amber-200/40 dark:border-amber-600/40">
            <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <Database className="h-3 w-3 text-white" />
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Una vez configurada, reinicia el servidor para ver tus datos reales.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
