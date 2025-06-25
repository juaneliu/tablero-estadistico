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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Entes Públicos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestiona y administra los entes públicos del estado
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/dashboard/entes/importar" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Importar Datos</span>
                  <span className="sm:hidden">Importar</span>
                </Button>
              </Link>
              <Link href="/dashboard/entes/crear" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Crear Ente Público</span>
                  <span className="sm:hidden">Crear Ente</span>
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
                  ? 'bg-blue-100 border-2 border-blue-300 shadow-xl'
                  : 'bg-white border border-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-500">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    Sujetos Obligados
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {sujetosObligados.length} entes registrados
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('autoridades-resolutoras')}
              className={`p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                activeView === 'autoridades-resolutoras'
                  ? 'bg-emerald-100 border-2 border-emerald-300 shadow-xl'
                  : 'bg-white border border-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-emerald-500">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    Autoridades Resolutoras
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {autoridadesResolutoras.length} autoridades registradas
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Búsqueda */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 h-4 w-4" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por nombre, tipo, nivel, entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={limpiarBusqueda}
              >
                <span className="mr-1">✕</span>
                Limpiar
              </Button>
            )}
          </div>
          
          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="text-sm text-slate-600 px-1">
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
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {ente.sistema2 ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {ente.sistema6 ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mx-auto" />
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
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S2:</span>
                  {ente.sistema2 ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">S6:</span>
                  {ente.sistema6 ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
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
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mx-auto" />
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
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
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