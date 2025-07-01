'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Download, 
  Search, 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  XCircle
} from "lucide-react"
import { showError, showSuccess, showConfirm } from "@/lib/notifications"
import { useEntes } from "@/hooks/use-entes"
import { ProtectedRoute } from "@/components/protected-route"
import { DatabaseStatus } from "@/components/database-status"

export default function EntesPage() {
  return (
    <ProtectedRoute allowedRoles={['OPERATIVO', 'ADMINISTRADOR']}>
      <EntesPageContent />
    </ProtectedRoute>
  )
}

function EntesPageContent() {
  const { entes, loading, error, deleteEnte } = useEntes()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeView, setActiveView] = useState('sujetos-obligados')
  
  // Función para filtrar entes según el término de búsqueda
  const filtrarEntes = (entes: any[]) => {
    if (!searchTerm.trim()) return entes
    
    const termino = searchTerm.toLowerCase().trim()
    return entes.filter(ente => 
      ente.nombre.toLowerCase().includes(termino) ||
      ente.poderGobierno.toLowerCase().includes(termino) ||
      ente.ambitoGobierno.toLowerCase().includes(termino) ||
      ente.entidad.nombre.toLowerCase().includes(termino) ||
      (ente.municipio && ente.municipio.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar entes según su tipo y luego aplicar búsqueda
  const sujetosObligados = filtrarEntes(entes.filter(ente => !ente.controlOIC))
  const autoridadesResolutoras = filtrarEntes(entes.filter(ente => ente.controlOIC))

  const limpiarBusqueda = () => {
    setSearchTerm("")
  }

  const handleEliminarEnte = async (id: number, nombre: string) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el ente público:\n\n"${nombre}"`
    )

    if (result.isConfirmed) {
      try {
        await deleteEnte(id)
        await showSuccess(
          '¡Eliminado!',
          'El ente público ha sido eliminado exitosamente.'
        )
      } catch (error) {
        console.error('Error eliminando ente:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        await showError('Error', `No se pudo eliminar el ente: ${errorMessage}`)
      }
    }
  }

  if (loading) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Entes Públicos
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gestiona y administra los entes públicos del estado
                </p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⏳</span>
                  </div>
                  <p className="text-lg">Cargando entes públicos...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    )
  }

  if (error) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Entes Públicos</h2>
                <p className="text-muted-foreground">
                  Gestiona y administra los entes públicos del estado
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    )
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header responsive */}
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Entes Públicos
              </h2>
              <p className="text-muted-foreground">
                Gestiona y administra los entes públicos del estado
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/entes/importar">
                <Button variant="outline" className="bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg">
                  <Download className="mr-2 h-4 w-4" />
                  Importar Datos
                </Button>
              </Link>
              <Link href="/dashboard/entes/crear">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Ente Público
                </Button>
              </Link>
            </div>
          </div>
          
          <DatabaseStatus />
          
          {/* Navegación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setActiveView('sujetos-obligados')}
              className={`p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                activeView === 'sujetos-obligados'
                  ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10 border-2 border-blue-300/60 dark:border-blue-600/60 shadow-xl backdrop-blur-sm'
                  : 'bg-gradient-to-br from-white/70 via-slate-50/60 to-gray-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 border border-slate-200/60 dark:border-slate-600/60 shadow-lg backdrop-blur-sm'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Sujetos Obligados
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {sujetosObligados.length} entes registrados
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('autoridades-resolutoras')}
              className={`p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                activeView === 'autoridades-resolutoras'
                  ? 'bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 dark:from-green-900/20 dark:via-emerald-900/15 dark:to-teal-900/10 border-2 border-green-300/60 dark:border-green-600/60 shadow-xl backdrop-blur-sm'
                  : 'bg-gradient-to-br from-white/70 via-slate-50/60 to-gray-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 border border-slate-200/60 dark:border-slate-600/60 shadow-lg backdrop-blur-sm'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-sm sm:text-base bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Autoridades Resolutoras
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {autoridadesResolutoras.length} autoridades registradas
                  </p>
                </div>
              </div>
            </button>
          </div>
          
          {/* Bloque de búsqueda */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/70 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar entes por nombre, poder, ámbito, entidad o municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarBusqueda}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm"
              >
                Limpiar
              </Button>
            )}
          </div>
          
          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="text-sm text-slate-600 dark:text-slate-400 px-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 dark:border-slate-600/60">
              {sujetosObligados.length + autoridadesResolutoras.length > 0 ? (
                <>
                  Mostrando {sujetosObligados.length + autoridadesResolutoras.length} resultado(s) para "{searchTerm}"
                </>
              ) : (
                <>
                  No se encontraron resultados para "{searchTerm}"
                </>
              )}
            </div>
          )}

          {/* Contenido */}
          <div className="transition-all duration-500 ease-in-out">
            {activeView === 'sujetos-obligados' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sujetos Obligados ({sujetosObligados.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sujetosObligados.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No hay sujetos obligados registrados aún.</p>
                    </div>
                  ) : (
                    <TablaSujetosObligados entes={sujetosObligados} onEliminar={handleEliminarEnte} />
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'autoridades-resolutoras' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Autoridades Resolutoras ({autoridadesResolutoras.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {autoridadesResolutoras.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No hay autoridades resolutoras registradas aún.</p>
                    </div>
                  ) : (
                    <TablaAutoridadesResolutoras entes={autoridadesResolutoras} onEliminar={handleEliminarEnte} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}

// Componente para la tabla de Sujetos Obligados - Responsive
const TablaSujetosObligados = ({ entes, onEliminar }: { entes: any[], onEliminar: (id: number, nombre: string) => void }) => (
  <>
    {/* Vista desktop */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left font-semibold px-4 py-4">Nombre</th>
            <th className="text-center font-semibold px-4 py-4">Tipo</th>
            <th className="text-center font-semibold px-4 py-4">Nivel</th>
            <th className="text-center font-semibold px-4 py-4">S1</th>
            <th className="text-center font-semibold px-4 py-4">S2</th>
            <th className="text-center font-semibold px-4 py-4">S6</th>
            <th className="text-center font-semibold px-4 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entes.map((ente) => (
            <tr key={ente.id} className="border-b">
              <td className="px-4 py-4">
                <div>
                  <div className="font-semibold">{ente.nombre}</div>
                  {ente.municipio && (
                    <div className="text-sm text-slate-600">{ente.municipio}</div>
                  )}
                  <div className="text-xs text-slate-500">{ente.entidad.nombre}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-center text-sm">{ente.poderGobierno}</td>
              <td className="px-4 py-4 text-center text-sm">{ente.ambitoGobierno}</td>
              <td className="px-4 py-4 text-center">
                {ente.sistema1 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {ente.sistema2 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {ente.sistema6 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/entes/editar/${ente.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onEliminar(ente.id!, ente.nombre)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vista móvil */}
    <div className="lg:hidden space-y-3">
      {entes.map((ente) => (
        <Card key={ente.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{ente.nombre}</div>
              {ente.municipio && (
                <div className="text-sm text-slate-600 truncate">{ente.municipio}</div>
              )}
              <div className="text-xs text-slate-500 mt-1">{ente.entidad.nombre}</div>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-xs">
                  <span className="font-medium">Tipo:</span> {ente.poderGobierno}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Nivel:</span> {ente.ambitoGobierno}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S1:</span>
                  {ente.sistema1 ? (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                      <XCircle className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S2:</span>
                  {ente.sistema2 ? (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                      <XCircle className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S6:</span>
                  {ente.sistema6 ? (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                      <XCircle className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/entes/editar/${ente.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/entes/editar/${ente.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEliminar(ente.id!, ente.nombre)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </>
)

// Componente para la tabla de Autoridades Resolutoras - Responsive
const TablaAutoridadesResolutoras = ({ entes, onEliminar }: { entes: any[], onEliminar: (id: number, nombre: string) => void }) => (
  <>
    {/* Vista desktop */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left font-semibold px-4 py-4">Nombre</th>
            <th className="text-center font-semibold px-4 py-4">Tipo</th>
            <th className="text-center font-semibold px-4 py-4">Nivel</th>
            <th className="text-center font-semibold px-4 py-4">S3</th>
            <th className="text-center font-semibold px-4 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entes.map((ente) => (
            <tr key={ente.id} className="border-b">
              <td className="px-4 py-4">
                <div>
                  <div className="font-semibold">{ente.nombre}</div>
                  {ente.municipio && (
                    <div className="text-sm text-slate-600">{ente.municipio}</div>
                  )}
                  <div className="text-xs text-slate-500">{ente.entidad.nombre}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-center text-sm">{ente.poderGobierno}</td>
              <td className="px-4 py-4 text-center text-sm">{ente.ambitoGobierno}</td>
              <td className="px-4 py-4 text-center">
                {ente.sistema3 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-full">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-full">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/entes/editar/${ente.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onEliminar(ente.id!, ente.nombre)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vista móvil */}
    <div className="lg:hidden space-y-3">
      {entes.map((ente) => (
        <Card key={ente.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{ente.nombre}</div>
              {ente.municipio && (
                <div className="text-sm text-slate-600 truncate">{ente.municipio}</div>
              )}
              <div className="text-xs text-slate-500 mt-1">{ente.entidad.nombre}</div>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-xs">
                  <span className="font-medium">Tipo:</span> {ente.poderGobierno}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Nivel:</span> {ente.ambitoGobierno}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S3:</span>
                  {ente.sistema3 ? (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-300 rounded-full">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-100 to-rose-100 border border-red-300 rounded-full">
                      <XCircle className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/entes/editar/${ente.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/entes/editar/${ente.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEliminar(ente.id!, ente.nombre)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </>
) 