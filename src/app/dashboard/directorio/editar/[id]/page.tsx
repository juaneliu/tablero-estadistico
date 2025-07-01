'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, X, ArrowLeft, Users2, Building2 } from 'lucide-react'
import { useDirectorioOIC, type DirectorioOIC } from '@/hooks/use-directorio-oic'
import { useEntes } from '@/hooks/use-entes'
import { cn } from '@/lib/utils'
import { showSuccess, showError } from '@/lib/notifications'

export default function EditarDirectorioPage() {
  const router = useRouter()
  const params = useParams()
  const directorioId = parseInt(params.id as string)
  
  const { updateDirectorio, getDirectorioById, loading: directorioLoading } = useDirectorioOIC()
  const { entes, loading: entesLoading, getEntesConOIC } = useEntes()
  
  const [loading, setLoading] = useState(false)
  const [directorioActual, setDirectorioActual] = useState<DirectorioOIC | null>(null)
  const [entesConOIC, setEntesConOIC] = useState<Array<{id: number, nombre: string}>>([])
  const [loadingOIC, setLoadingOIC] = useState(true)
  const [formData, setFormData] = useState({
    oicNombre: '',
    puesto: '',
    nombre: '',
    correoElectronico: '',
    telefono: '',
    direccion: '',
    entidad: {
      nombre: ''
    },
    entesPublicosIds: [] as number[]
  })
  
  const [openOIC, setOpenOIC] = useState(false)
  const [openEntes, setOpenEntes] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar entes con OIC habilitado
  useEffect(() => {
    const cargarEntesConOIC = async () => {
      try {
        setLoadingOIC(true)
        const entesOIC = await getEntesConOIC()
        setEntesConOIC(entesOIC.map((ente: any) => ({
          id: ente.id,
          nombre: ente.nombre
        })))
      } catch (error) {
        console.error('Error cargando entes con OIC:', error)
      } finally {
        setLoadingOIC(false)
      }
    }
    
    cargarEntesConOIC()
  }, [getEntesConOIC])

  useEffect(() => {
    if (directorioId) {
      loadDirectorio()
    }
  }, [directorioId])

  const loadDirectorio = async () => {
    try {
      const directorio = await getDirectorioById(directorioId)
      setDirectorioActual(directorio)
      
      setFormData({
        oicNombre: directorio.oicNombre,
        puesto: directorio.puesto,
        nombre: directorio.nombre,
        correoElectronico: directorio.correoElectronico,
        telefono: directorio.telefono || '',
        direccion: directorio.direccion || '',
        entidad: directorio.entidad,
        entesPublicosIds: directorio.entesPublicos?.map((e: any) => e.id) || []
      })
    } catch (error) {
      console.error('Error al cargar directorio:', error)
      await showError('Error', 'No se pudo cargar el registro del directorio')
      router.push('/dashboard/directorio')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.oicNombre.trim()) {
      newErrors.oicNombre = 'El tipo de OIC es requerido'
    }
    if (!formData.puesto.trim()) {
      newErrors.puesto = 'El puesto es requerido'
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'El correo electrónico no es válido'
    }
    if (!formData.entidad.nombre.trim()) {
      newErrors.entidad = 'La entidad es requerida'
    }
    if (formData.entesPublicosIds.length === 0) {
      newErrors.entesPublicos = 'Debe seleccionar al menos un ente público'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      await updateDirectorio(directorioId, formData)
      
      await showSuccess('¡Éxito!', 'Registro actualizado correctamente')
      
      router.push('/dashboard/directorio')
    } catch (error) {
      console.error('Error al actualizar directorio:', error)
      await showError('Error', 'No se pudo actualizar el registro')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleEntidadChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      entidad: {
        nombre: value
      }
    }))
    
    if (errors.entidad) {
      setErrors(prev => ({
        ...prev,
        entidad: ''
      }))
    }
  }

  const handleEnteToggle = (enteId: number) => {
    setFormData(prev => ({
      ...prev,
      entesPublicosIds: prev.entesPublicosIds.includes(enteId)
        ? prev.entesPublicosIds.filter(id => id !== enteId)
        : [...prev.entesPublicosIds, enteId]
    }))
    
    if (errors.entesPublicos) {
      setErrors(prev => ({
        ...prev,
        entesPublicos: ''
      }))
    }
  }

  const removeEnte = (enteId: number) => {
    setFormData(prev => ({
      ...prev,
      entesPublicosIds: prev.entesPublicosIds.filter(id => id !== enteId)
    }))
  }

  const getSelectedEntes = () => {
    return entes.filter(ente => ente.id && formData.entesPublicosIds.includes(ente.id))
  }

  if (directorioLoading || entesLoading || !directorioActual) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="container mx-auto p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-96">
            <Card className="p-8 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Cargando información del directorio
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Por favor espera mientras obtenemos los datos...
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto p-4 md:p-8 pt-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/directorio')}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Editar Registro del Directorio OIC
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Modifica la información del registro seleccionado en el directorio
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Información del Directorio
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Completa todos los campos requeridos para actualizar el registro del directorio OIC
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tipo de OIC */}
              <div className="space-y-3">
                <Label htmlFor="oicNombre" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Tipo de OIC <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Popover open={openOIC} onOpenChange={setOpenOIC}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openOIC}
                      className={cn(
                        "w-full justify-between h-12 text-left bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300",
                        !formData.oicNombre && "text-muted-foreground",
                        errors.oicNombre && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                      )}
                    >
                      {formData.oicNombre || "Selecciona un tipo de OIC"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 shadow-xl">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar tipo de OIC..." 
                        className="border-none focus:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingOIC ? "Cargando..." : "No se encontraron entes con OIC habilitado."}
                        </CommandEmpty>
                        <CommandGroup>
                          {entesConOIC.map((ente) => (
                            <CommandItem
                              key={ente.id}
                              value={ente.nombre}
                              onSelect={() => {
                                handleInputChange('oicNombre', ente.nombre)
                                setOpenOIC(false)
                              }}
                              className="hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-blue-600",
                                  formData.oicNombre === ente.nombre ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {ente.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.oicNombre && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.oicNombre}
                  </p>
                )}
              </div>

              {/* Puesto */}
              <div className="space-y-3">
                <Label htmlFor="puesto" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Puesto <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Input
                  id="puesto"
                  value={formData.puesto}
                  onChange={(e) => handleInputChange('puesto', e.target.value)}
                  placeholder="Ej: Contralor Interno, Auditor, etc."
                  className={cn(
                    "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                    errors.puesto && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                  )}
                />
                {errors.puesto && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.puesto}
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-3">
                <Label htmlFor="nombre" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Nombre Completo <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre completo del funcionario"
                  className={cn(
                    "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                    errors.nombre && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                  )}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-3">
                <Label htmlFor="correoElectronico" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Correo Electrónico <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Input
                  id="correoElectronico"
                  type="email"
                  value={formData.correoElectronico}
                  onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={cn(
                    "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                    errors.correoElectronico && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                  )}
                />
                {errors.correoElectronico && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.correoElectronico}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-3">
                <Label htmlFor="telefono" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Número de teléfono"
                  className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-3">
                <Label htmlFor="direccion" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección física"
                  className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                />
              </div>

              {/* Entidad */}
              <div className="space-y-3">
                <Label htmlFor="entidad" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Entidad <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Input
                  id="entidad"
                  value={formData.entidad.nombre}
                  onChange={(e) => handleEntidadChange(e.target.value)}
                  placeholder="Nombre de la entidad"
                  className={cn(
                    "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                    errors.entidad && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                  )}
                />
                {errors.entidad && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.entidad}
                  </p>
                )}
              </div>

              {/* Entes Públicos */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Entes Públicos Asociados <span className="text-red-500 font-bold text-lg ml-1">*</span>
                </Label>
                <Popover open={openEntes} onOpenChange={setOpenEntes}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openEntes}
                      className={cn(
                        "w-full justify-between h-12 text-left bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300",
                        formData.entesPublicosIds.length === 0 && "text-muted-foreground",
                        errors.entesPublicos && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                      )}
                    >
                      {formData.entesPublicosIds.length > 0
                        ? `${formData.entesPublicosIds.length} ente(s) seleccionado(s)`
                        : "Selecciona entes públicos"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 shadow-xl">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar entes públicos..." 
                        className="border-none focus:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>No se encontraron entes públicos.</CommandEmpty>
                        <CommandGroup>
                          {entes.map((ente) => (
                            <CommandItem
                              key={ente.id}
                              value={ente.nombre}
                              onSelect={() => ente.id && handleEnteToggle(ente.id)}
                              className="hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-blue-600",
                                  ente.id && formData.entesPublicosIds.includes(ente.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-slate-800 dark:text-slate-100">{ente.nombre}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {ente.ambitoGobierno} - {ente.poderGobierno}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Entes seleccionados */}
                {getSelectedEntes().length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-4 bg-blue-50/50 dark:bg-slate-700/30 rounded-lg border border-blue-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                    {getSelectedEntes().map((ente) => (
                      <Badge 
                        key={ente.id} 
                        variant="secondary" 
                        className="flex items-center gap-2 bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-600 transition-all duration-200 px-3 py-1.5"
                      >
                        <Building2 className="h-3 w-3" />
                        {ente.nombre}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1"
                          onClick={() => ente.id && removeEnte(ente.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {errors.entesPublicos && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.entesPublicos}
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200/60 dark:border-slate-600/60">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Registro'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/directorio')}
                  disabled={loading}
                  className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 text-slate-700 dark:text-slate-200"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
