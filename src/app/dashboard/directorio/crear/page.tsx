"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, X, ChevronDown, Users2, Building2 } from "lucide-react"
import { showError, showSuccess } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { useDirectorioOIC } from "@/hooks/use-directorio-oic"
import { useEntes } from "@/hooks/use-entes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema de validación
const formSchema = z.object({
  oicNombre: z.string().min(2, "El nombre del OIC debe tener al menos 2 caracteres"),
  entesPublicosIds: z.array(z.number()).min(1, "Debe seleccionar al menos un ente público"),
  puesto: z.string().min(2, "El puesto debe tener al menos 2 caracteres"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  correoElectronico: z.string().email("Debe ser un correo electrónico válido"),
  telefono: z.string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === "") return true; // Campo opcional
      return /^\d{10}$/.test(value); // Solo números y exactamente 10 dígitos
    }, "El teléfono debe contener exactamente 10 dígitos"),
  direccion: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CrearDirectorioPage() {
  const router = useRouter()
  const { createDirectorio, directorios, loading: loadingDirectorio } = useDirectorioOIC()
  const { entes, loading, getEntesConOIC } = useEntes()
  
  const [entesConOIC, setEntesConOIC] = useState<Array<{id: number, nombre: string}>>([])
  const [selectedEntes, setSelectedEntes] = useState<Array<{id: number, nombre: string}>>([])
  const [openOIC, setOpenOIC] = useState(false)
  const [openEntes, setOpenEntes] = useState(false)
  const [loadingOIC, setLoadingOIC] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Refs para los dropdowns
  const oicButtonRef = useRef<HTMLButtonElement>(null)
  const entesButtonRef = useRef<HTMLButtonElement>(null)
  const entesContainerRef = useRef<HTMLDivElement>(null)
  const [oicDropdownPosition, setOicDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [entesDropdownPosition, setEntesDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oicNombre: "",
      entesPublicosIds: [],
      puesto: "",
      nombre: "",
      correoElectronico: "",
      telefono: "",
      direccion: "",
    },
  })

  // Detectar montaje del cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Cargar entes con OIC habilitado
  useEffect(() => {
    const cargarEntesConOIC = async () => {
      try {
        setLoadingOIC(true)
        const entesOIC = await getEntesConOIC()
        
        console.log('🔍 [DirectorioCrear] Entes con OIC obtenidos:', entesOIC)
        console.log('🔍 [DirectorioCrear] Directorios existentes:', directorios)
        
        // Filtrar OICs que ya están registrados en el directorio
        const oicsYaRegistrados = directorios.map(directorio => directorio.oicNombre)
        console.log('🔍 [DirectorioCrear] OICs ya registrados:', oicsYaRegistrados)
        
        const entesOICDisponibles = entesOIC.filter((ente: any) => 
          !oicsYaRegistrados.includes(ente.nombre)
        )
        
        console.log('🔍 [DirectorioCrear] Entes OIC disponibles después del filtro:', entesOICDisponibles)
        
        setEntesConOIC(entesOICDisponibles.map((ente: any) => ({
          id: ente.id,
          nombre: ente.nombre
        })))
      } catch (error) {
        console.error('❌ [DirectorioCrear] Error cargando entes con OIC:', error)
        showError('Error al cargar entes con OIC')
      } finally {
        setLoadingOIC(false)
      }
    }
    
    // Solo cargar si ya tenemos los directorios (para poder filtrar)
    if (!loadingDirectorio) {
      cargarEntesConOIC()
    }
  }, [getEntesConOIC, directorios, loadingDirectorio])

  // Actualizar los IDs de entes seleccionados en el formulario
  useEffect(() => {
    const ids = selectedEntes.map(e => e.id)
    console.log('🔍 [useEffect sync] Sincronizando form con selectedEntes:', ids)
    form.setValue("entesPublicosIds", ids)
  }, [selectedEntes, form])

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Verificar si el click es dentro de un dropdown o su contenedor
      const isInDropdownContainer = target.closest('[data-dropdown-container]')
      const isInDropdownPortal = target.closest('[data-dropdown-portal]')
      
      if (!isInDropdownContainer && !isInDropdownPortal) {
        setOpenOIC(false)
        setOpenEntes(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Función para calcular la posición del dropdown
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement | HTMLDivElement | null>) => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + window.scrollY + 4, // 4px de margen
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }

  // Función para abrir dropdown OIC
  const handleOpenOIC = () => {
    if (oicButtonRef.current) {
      setOicDropdownPosition(calculateDropdownPosition(oicButtonRef))
    }
    setOpenOIC(true)
    setOpenEntes(false)
  }

  // Función para abrir dropdown Entes
  const handleOpenEntes = () => {
    console.log('🔍 [handleOpenEntes] Abriendo dropdown de entes')
    console.log('🔍 [handleOpenEntes] Entes seleccionados al abrir:', selectedEntes.map(e => `${e.id}: ${e.nombre}`))
    
    if (entesContainerRef.current) {
      setEntesDropdownPosition(calculateDropdownPosition(entesContainerRef))
    }
    setOpenEntes(true)
    setOpenOIC(false)
  }

  // Debug: Verificar cuando se cargan los entes
  useEffect(() => {
    console.log('🔍 [useEffect entes] Entes cargados:', entes.length, 'Loading:', loading)
    if (entes.length === 0 && !loading) {
      console.warn('⚠️ No se encontraron entes públicos')
    }
  }, [entes, loading])

  useEffect(() => {
    console.log('🔍 [useEffect entesConOIC] Entes con OIC:', entesConOIC.length, 'Loading:', loadingOIC)
    if (entesConOIC.length === 0 && !loadingOIC) {
      console.warn('⚠️ No se encontraron entes con OIC')
    }
  }, [entesConOIC, loadingOIC])

  // Debug: Verificar cuando cambian los entes seleccionados
  useEffect(() => {
    console.log('🔍 [useEffect selectedEntes] Entes seleccionados cambiaron:', selectedEntes)
  }, [selectedEntes])

  const onSubmit = async (values: FormData) => {
    // Validación personalizada de campos obligatorios
    const missingFields: string[] = []
    
    if (!values.oicNombre || values.oicNombre.trim() === "") {
      missingFields.push("Órgano Interno de Control")
      form.setError("oicNombre", {
        type: "manual",
        message: "El OIC es obligatorio"
      })
    }
    
    if (!values.entesPublicosIds || values.entesPublicosIds.length === 0) {
      missingFields.push("Entes Públicos")
      form.setError("entesPublicosIds", {
        type: "manual",
        message: "Debe seleccionar al menos un ente público"
      })
    }
    
    if (!values.puesto || values.puesto.trim() === "") {
      missingFields.push("Puesto")
      form.setError("puesto", {
        type: "manual",
        message: "El puesto es obligatorio"
      })
    }
    
    if (!values.nombre || values.nombre.trim() === "") {
      missingFields.push("Nombre")
      form.setError("nombre", {
        type: "manual",
        message: "El nombre es obligatorio"
      })
    }
    
    if (!values.correoElectronico || values.correoElectronico.trim() === "") {
      missingFields.push("Correo Electrónico")
      form.setError("correoElectronico", {
        type: "manual",
        message: "El correo electrónico es obligatorio"
      })
    }
    
    // Si hay campos faltantes, mostrar popup
    if (missingFields.length > 0) {
      await showError(
        'Campos obligatorios faltantes',
        `Por favor, complete los siguientes campos:\n\n• ${missingFields.join('\n• ')}`
      )
      return
    }
    
    try {
      // Crear el objeto del registro
      const nuevoRegistro = {
        oicNombre: values.oicNombre,
        entesPublicosIds: values.entesPublicosIds,
        puesto: values.puesto,
        nombre: values.nombre,
        correoElectronico: values.correoElectronico,
        telefono: values.telefono || null,
        direccion: values.direccion || null,
        entidad: { nombre: "Morelos" }, // Estructura de objeto
      }

      // Crear el registro usando el hook
      await createDirectorio(nuevoRegistro)
      
      // Mostrar mensaje de éxito
      await showSuccess(
        '¡Registro creado exitosamente!',
        `El registro del directorio para "${values.nombre}" ha sido creado correctamente.`
      )
      
      // Redirigir a la lista
      router.push('/dashboard/directorio')
      
    } catch (error) {
      console.error('Error al crear registro:', error)
      await showError(
        'Error al crear registro',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      )
    }
  }

  const handleSelectEnte = (ente: {id: number, nombre: string}) => {
    console.log('🔍 [handleSelectEnte] Intentando seleccionar ente:', ente)
    console.log('🔍 [handleSelectEnte] Entes seleccionados antes:', selectedEntes)
    
    // Verificar que el ente no esté ya seleccionado
    const yaSeleccionado = selectedEntes.find(e => e.id === ente.id)
    if (yaSeleccionado) {
      console.warn('⚠️ [handleSelectEnte] Ente ya seleccionado, ignorando:', ente.nombre)
      setOpenEntes(false)
      return
    }
    
    const nuevosEntes = [...selectedEntes, ente]
    setSelectedEntes(nuevosEntes)
    console.log('✅ [handleSelectEnte] Ente agregado. Nuevos entes seleccionados:', nuevosEntes)
    
    setOpenEntes(false)
    // Limpiar error si existe
    if (form.formState.errors.entesPublicosIds) {
      form.clearErrors('entesPublicosIds')
    }
  }

  const handleRemoveEnte = (enteId: number) => {
    console.log('🔍 [handleRemoveEnte] Removiendo ente con ID:', enteId)
    console.log('🔍 [handleRemoveEnte] Entes seleccionados antes:', selectedEntes)
    
    const nuevosEntes = selectedEntes.filter(e => e.id !== enteId)
    setSelectedEntes(nuevosEntes)
    console.log('✅ [handleRemoveEnte] Ente removido. Nuevos entes seleccionados:', nuevosEntes)
  }

  // Función para manejar cambios en el campo OIC
  const handleOICSelect = (enteName: string) => {
    form.setValue("oicNombre", enteName)
    setOpenOIC(false)
    // Limpiar error si existe
    if (form.formState.errors.oicNombre) {
      form.clearErrors('oicNombre')
    }
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto p-4 md:p-8 pt-6">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
            <Link 
              href="/dashboard" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/dashboard/directorio" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Directorio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Crear
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Crear Registro del Directorio OIC
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Agrega un nuevo registro al directorio de Órganos Internos de Control
            </p>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full" />

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full relative z-10">
              
              {/* Contenedor Principal del Formulario */}
              <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
                
                <CardContent className="p-8 space-y-8">
                  {/* Selección de OIC y Entes */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Selección de OIC y Entes Públicos
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Selecciona el Órgano Interno de Control y los entes públicos asociados
                      </p>
                    </div>
                    
                    <div className="md:grid md:grid-cols-2 gap-8">
                      {/* Órgano Interno de Control */}
                      <FormField
                        control={form.control}
                        name="oicNombre"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Órgano Interno de Control <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <div className="relative z-20" data-dropdown-container>
                              <FormControl>
                                <Button
                                  ref={oicButtonRef}
                                  type="button"
                                  variant="outline"
                                  role="combobox"
                                  onClick={handleOpenOIC}
                                  className={cn(
                                    "w-full justify-between h-12 text-left bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300",
                                    !field.value && "text-muted-foreground",
                                    fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                  )}
                                >
                                  <span className="truncate flex-1 text-left mr-2">
                                    {field.value || "Buscar y seleccionar OIC"}
                                  </span>
                                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                                </Button>
                              </FormControl>
                            </div>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Seleccione el ente público que tiene habilitado el Órgano Interno de Control.
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      {/* Entes Públicos */}
                      <FormField
                        control={form.control}
                        name="entesPublicosIds"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Ente(s) Público(s) <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <div className="relative w-full z-20" data-dropdown-container>
                              <div 
                                ref={entesContainerRef}
                                className={cn(
                                  "flex flex-wrap gap-2 p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-600 rounded-lg min-h-[48px] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer",
                                  fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                )}
                                onClick={handleOpenEntes}
                              >
                                {selectedEntes.length > 0 ? (
                                  selectedEntes.map((ente) => (
                                    <div 
                                      key={ente.id} 
                                      className="flex items-center gap-2 bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-md text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-all duration-200"
                                    >
                                      <Building2 className="h-3 w-3" />
                                      <span>{ente.nombre}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveEnte(ente.id)
                                        }}
                                        className="hover:text-red-500 transition-colors duration-200 p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground self-center text-sm pointer-events-none">
                                    Buscar y seleccionar Entes Públicos
                                  </span>
                                )}
                                <div className="ml-auto self-center">
                                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                </div>
                              </div>
                            </div>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Seleccione uno o más Entes Públicos asociados. Solo se muestran entes que no tienen OIC habilitado.
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Datos del Responsable */}
                  <div className="space-y-6 border-t border-slate-200/60 dark:border-slate-600/60 pt-8">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Datos del Responsable
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Información personal del funcionario responsable del OIC
                      </p>
                    </div>
                    
                    <div className="md:grid md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="puesto"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Puesto <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Contralor Interno, Auditor, etc." 
                                {...field} 
                                className={cn(
                                  "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                  fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                )}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Ingrese el puesto o cargo que ocupa.
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Nombre <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre completo del funcionario" 
                                {...field} 
                                className={cn(
                                  "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                  fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                )}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Ingrese su nombre completo.
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="correoElectronico"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Correo Electrónico <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="correo@ejemplo.com" 
                                {...field} 
                                className={cn(
                                  "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                  fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                )}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Ingrese su correo electrónico oficial.
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field, fieldState }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Teléfono (opcional)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="7771234567" 
                                maxLength={10}
                                {...field} 
                                className={cn(
                                  "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                  fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                )}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Ingrese su número de teléfono (10 dígitos).
                            </FormDescription>
                            <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                              {fieldState.error && (
                                <>
                                  <X className="h-4 w-4" />
                                  {fieldState.error.message}
                                </>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="space-y-6 border-t border-slate-200/60 dark:border-slate-600/60 pt-8">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Información de Contacto
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Dirección física del funcionario (opcional)
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                            Dirección (opcional)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Dirección completa" 
                              {...field} 
                              className={cn(
                                "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                              )}
                            />
                          </FormControl>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Ingrese su dirección completa (opcional).
                          </FormDescription>
                          <FormMessage className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                            {fieldState.error && (
                              <>
                                <X className="h-4 w-4" />
                                {fieldState.error.message}
                              </>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    
                    {/* Botón de Crear Registro */}
                    <div className="flex justify-end pt-6 border-t border-slate-200/60 dark:border-slate-600/60">
                      <Button 
                        type="submit" 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                      >
                        Crear Registro
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>

      {/* Portal para dropdown OIC */}
      {isMounted && openOIC && createPortal(
        <div 
          className="fixed inset-0 z-[200]" 
          onClick={() => setOpenOIC(false)}
          data-dropdown-portal
        >
          <div 
            className="absolute bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-[300px] overflow-auto"
            style={{
              top: `${oicDropdownPosition.top}px`,
              left: `${oicDropdownPosition.left}px`,
              width: `${oicDropdownPosition.width}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            data-dropdown-portal
          >
            <div className="p-2">
              {loadingOIC || loadingDirectorio ? (
                <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                  Cargando OIC disponibles...
                </div>
              ) : entesConOIC.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  <div className="text-center">
                    <p className="font-medium mb-2">No hay entes con OIC disponibles para asignar.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Esto puede deberse a que:
                    </p>
                    <ul className="text-sm text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                      <li>• Todos los entes con OIC ya han sido registrados</li>
                      <li>• No existen entes con la opción "Control OIC" habilitada</li>
                    </ul>
                  </div>
                </div>
              ) : (
                entesConOIC.map((ente) => (
                  <button
                    key={ente.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleOICSelect(ente.nombre)
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-800 dark:text-slate-100"
                  >
                    {ente.nombre}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Portal para dropdown Entes */}
      {isMounted && openEntes && createPortal(
        <div 
          className="fixed inset-0 z-[200]" 
          onClick={() => setOpenEntes(false)}
          data-dropdown-portal
        >
          <div 
            className="absolute bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-[300px] overflow-auto"
            style={{
              top: `${entesDropdownPosition.top}px`,
              left: `${entesDropdownPosition.left}px`,
              width: `${entesDropdownPosition.width}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            data-dropdown-portal
          >
            <div className="p-2">
              {loading ? (
                <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                  Cargando entes...
                </div>
              ) : entes.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  No se encontraron entes públicos.
                </div>
              ) : loadingDirectorio ? (
                <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                  Verificando disponibilidad...
                </div>
              ) : (
                (() => {
                  console.log('🔍 [EntesDropdown] === INICIANDO FILTRADO ===')
                  console.log('🔍 [EntesDropdown] Directorios completos:', directorios)
                  
                  // Extraer todos los entes asignados de los directorios existentes
                  const entesYaAsignados = directorios.flatMap(directorio => {
                    console.log('🔍 [EntesDropdown] Procesando directorio:', directorio)
                    console.log('🔍 [EntesDropdown] - OIC:', directorio.oicNombre)
                    console.log('🔍 [EntesDropdown] - entesPublicosIds:', directorio.entesPublicosIds)
                    console.log('🔍 [EntesDropdown] - entesPublicos:', directorio.entesPublicos)
                    
                    // Intentar obtener los IDs de diferentes formas posibles
                    let ids: number[] = []
                    if (directorio.entesPublicosIds) {
                      ids = directorio.entesPublicosIds
                    } else if (directorio.entesPublicos) {
                      ids = directorio.entesPublicos.map((ente: any) => ente.id)
                    }
                    
                    console.log('🔍 [EntesDropdown] - IDs extraídos:', ids)
                    return ids
                  })
                  
                  console.log('🔍 [EntesDropdown] Entes totales:', entes.length)
                  console.log('🔍 [EntesDropdown] Entes seleccionados actualmente:', selectedEntes.map(e => `${e.id}: ${e.nombre}`))
                  console.log('🔍 [EntesDropdown] Entes ya asignados en otros directorios (IDs):', entesYaAsignados)
                  
                  // Filtrar entes paso a paso para mejor debugging
                  const entesSinOIC = entes.filter(ente => !ente.controlOIC)
                  console.log('🔍 [EntesDropdown] Paso 1 - Entes sin OIC:', entesSinOIC.length, entesSinOIC.map(e => `${e.id}: ${e.nombre}`))
                  
                  const entesNoSeleccionados = entesSinOIC.filter(ente => {
                    const yaSeleccionado = selectedEntes.some(selectedEnte => selectedEnte.id === ente.id)
                    if (yaSeleccionado) {
                      console.log(`🚫 [EntesDropdown] Ente ${ente.id}: ${ente.nombre} ya está seleccionado, excluyendo`)
                    }
                    return !yaSeleccionado
                  })
                  console.log('🔍 [EntesDropdown] Paso 2 - Entes no seleccionados:', entesNoSeleccionados.length, entesNoSeleccionados.map(e => `${e.id}: ${e.nombre}`))
                  
                  const entesDisponibles = entesNoSeleccionados.filter(ente => {
                    const yaAsignado = entesYaAsignados.includes(ente.id!)
                    console.log(`🔍 [EntesDropdown] Verificando ente ${ente.id}: ${ente.nombre} - ¿Ya asignado? ${yaAsignado}`)
                    if (yaAsignado) {
                      console.log(`🚫 [EntesDropdown] Ente ${ente.id}: ${ente.nombre} ya está asignado a otro directorio, excluyendo`)
                    }
                    return !yaAsignado
                  })
                  console.log('🔍 [EntesDropdown] Paso 3 - Entes disponibles finales:', entesDisponibles.length, entesDisponibles.map(e => `${e.id}: ${e.nombre}`))
                  console.log('🔍 [EntesDropdown] === FIN FILTRADO ===')
                  
                  if (entesDisponibles.length === 0) {
                    return (
                      <div className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                        {selectedEntes.length > 0 
                          ? "Todos los entes disponibles ya han sido seleccionados o asignados." 
                          : "No hay entes públicos disponibles para asignar."}
                      </div>
                    )
                  }
                  
                  return entesDisponibles.map((ente) => (
                    <button
                      key={ente.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSelectEnte({id: ente.id!, nombre: ente.nombre})
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-100">{ente.nombre}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {ente.ambitoGobierno} - {ente.poderGobierno}
                        </span>
                      </div>
                    </button>
                  ))
                })()
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  )
}
