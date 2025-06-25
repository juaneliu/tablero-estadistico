"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, Plus, Trash2, Upload } from "lucide-react"
import { showError, showSuccess, showConfirm, showUrlValidationError, showLoadingAlert, closeLoadingAlert, forceCloseAllNotifications } from "@/lib/notifications"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SimpleEvaluation } from "@/components/ui/simple-evaluation"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema de validación simplificado
const formSchema = z.object({
  nombreActividad: z.string().min(1, "Requerido"),
  municipio: z.string().min(1, "Requerido"),
  actividad: z.enum(["Diagnóstico", "Indicador", "Índice"]),
  solicitudUrl: z.string().optional(),
  respuestaUrl: z.string().optional(),
  unidadAdministrativa: z.string().min(1, "Requerido"),
  evaluacion: z.number().min(0).max(100),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Accion {
  id: string
  descripcion: string // Ahora será "Invitación", "Exhorto", "Recomendación", "ESAF"
  urlAccion: string   // Antes era "responsable", ahora es URL de Acción (PDF)
  responsable?: string // Para compatibilidad con datos antiguos
  fechaLimite: string
  completada: boolean
}

export default function EditarDiagnosticoPage() {
  const router = useRouter()
  const params = useParams()
  const diagnosticoId = params.id as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acciones, setAcciones] = useState<Accion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [accionCounter, setAccionCounter] = useState(1)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreActividad: "",
      municipio: "",
      actividad: "Diagnóstico",
      solicitudUrl: "",
      respuestaUrl: "",
      unidadAdministrativa: "",
      evaluacion: 0,
      observaciones: "",
    },
  })

  // Cargar datos del diagnóstico
  useEffect(() => {
    const cargarDiagnostico = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/diagnosticos/${diagnosticoId}`)
        
        if (!response.ok) {
          throw new Error('Error al cargar el diagnóstico')
        }
        
        const data = await response.json()
        setDiagnostico(data)
        
        // Rellenar el formulario con valores seguros
        form.reset({
          nombreActividad: data.nombreActividad || "",
          municipio: data.municipio || "",
          actividad: data.actividad || "Diagnóstico",
          solicitudUrl: data.solicitudUrl || "",
          respuestaUrl: data.respuestaUrl || "",
          unidadAdministrativa: data.unidadAdministrativa || "",
          evaluacion: data.evaluacion || 0,
          observaciones: data.observaciones || "",
        })
        
        // Cargar acciones con valores seguros y compatibilidad con datos antiguos
        const accionesSeguras = (data.acciones || []).map((accion: any, index: number) => ({
          id: accion.id || `accion-${index}`,
          descripcion: accion.descripcion || '',
          urlAccion: accion.urlAccion || accion.responsable || '', // Compatibilidad con datos antiguos
          fechaLimite: accion.fechaLimite || '',
          completada: accion.completada || false
        }))
        setAcciones(accionesSeguras)
        setAccionCounter(accionesSeguras.length + 1)
        
      } catch (error) {
        console.error('Error al cargar diagnóstico:', error)
        await showError('Error', 'No se pudo cargar el diagnóstico')
        router.push('/dashboard/diagnosticos')
      } finally {
        setIsLoading(false)
      }
    }

    if (diagnosticoId) {
      cargarDiagnostico()
    }
  }, [diagnosticoId, form, router])

  const agregarAccion = async () => {
    const nuevaAccion: Accion = {
      id: `action_${accionCounter}`,
      descripcion: '',
      urlAccion: '',
      fechaLimite: '',
      completada: false
    }
    setAccionCounter(prev => prev + 1)
    setAcciones(prev => [...prev, nuevaAccion])
  }

  const eliminarAccion = async (id: string) => {
    const accion = acciones.find(a => a.id === id)
    if (!accion) return

    const result = await showConfirm(
      '¿Eliminar acción?',
      `¿Estás seguro de que deseas eliminar esta acción?

Tipo: ${accion.descripcion || 'Sin especificar'}
URL: ${accion.urlAccion || 'Sin especificar'}
Fecha: ${accion.fechaLimite || 'Sin especificar'}

Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    )

    if (result.isConfirmed) {
      setAcciones(prev => prev.filter(accion => accion.id !== id))
      await showSuccess(
        'Acción eliminada',
        'La acción ha sido eliminada exitosamente.'
      )
    }
  }

  const actualizarAccion = (id: string, campo: keyof Accion, valor: string | boolean) => {
    setAcciones(prev => prev.map(accion =>
      accion.id === id ? { ...accion, [campo]: valor } : accion
    ))
  }

  // Función para eliminar el diagnóstico completo
  const eliminarDiagnostico = async () => {
    if (!diagnostico) return

    const result = await showConfirm(
      '¿Eliminar diagnóstico?',
      `¿Estás seguro de que deseas eliminar completamente este diagnóstico?

Diagnóstico: ${diagnostico.nombreActividad}
Municipio: ${diagnostico.municipio}
Actividad: ${diagnostico.actividad}

⚠️ ATENCIÓN: Esta acción eliminará:
• El diagnóstico municipal
• Todas las acciones asociadas
• Todo el historial y datos relacionados

Esta acción NO se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    )

    if (!result.isConfirmed) return

    console.log('🗑️ Iniciando eliminación del diagnóstico...')

    try {
      // Mostrar alerta de carga
      console.log('📱 Mostrando loading alert...')
      await showLoadingAlert(
        'Eliminando diagnóstico...',
        'Por favor espere mientras se elimina la información'
      )

      console.log('🌐 Enviando petición DELETE...')
      const response = await fetch(`/api/diagnosticos/${diagnosticoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Respuesta recibida:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Error al eliminar el diagnóstico')
      }

      console.log('✅ Eliminación exitosa, cerrando loading alert...')
      // Cerrar alerta de carga 
      await closeLoadingAlert()
      
      // Fallback: Si closeLoadingAlert no funciona, forzar cierre
      setTimeout(async () => {
        console.log('🚨 Fallback: Forzando cierre de todas las notificaciones')
        await forceCloseAllNotifications()
      }, 1000)
      
      console.log('🎉 Mostrando mensaje de éxito...')
      await showSuccess(
        '¡Diagnóstico eliminado!',
        `El diagnóstico "${diagnostico.nombreActividad}" del municipio de ${diagnostico.municipio} ha sido eliminado exitosamente.`
      )
      
      console.log('🔄 Redirigiendo al tablero...')
      // Redirigir inmediatamente sin delay
      router.push('/dashboard/diagnosticos?view=tablero')
      
    } catch (error) {
      console.error('💥 Error al eliminar diagnóstico:', error)
      
      console.log('❌ Cerrando loading alert por error...')
      // Asegurar que la alerta de carga se cierre
      await closeLoadingAlert()
      
      await showError(
        'Error al eliminar diagnóstico',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado al eliminar el diagnóstico'
      )
    }
  }

  // Función para validar URL en tiempo real
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return true; // URLs vacías son válidas (opcionales)
    const trimmedUrl = url.trim();
    try {
      new URL(trimmedUrl);
      return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
    } catch {
      return false;
    }
  }

  // Función auxiliar para actualización robusta
  const updateDiagnosticoWithTimeout = async (diagnosticoData: any): Promise<any> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    try {
      const response = await fetch(`/api/diagnosticos/${diagnosticoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticoData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La actualización tardó demasiado tiempo. Por favor intenta nuevamente.')
      }
      
      throw error
    }
  }

  const onSubmit = async (values: FormData) => {
    // Validación adicional de URLs
    const validateUrl = (url: string | undefined, fieldName: string): boolean => {
      if (!url || url.trim() === "") return true; // URLs opcionales
      const trimmedUrl = url.trim();
      try {
        new URL(trimmedUrl);
        return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
      } catch {
        return false;
      }
    }

    // Validar URLs de acciones
    const invalidActionUrls: string[] = []
    acciones.forEach((accion, index) => {
      const urlToValidate = accion.urlAccion || accion.responsable // Compatibilidad con datos antiguos
      if (urlToValidate && !validateUrl(urlToValidate, `URL de Acción #${index + 1}`)) {
        invalidActionUrls.push(`Acción #${index + 1}: ${urlToValidate}`)
      }
    })

    if (invalidActionUrls.length > 0) {
      await showUrlValidationError(invalidActionUrls)
      return
    }

    // Validar acciones
    const accionesIncompletas = acciones.filter(accion => 
      !accion.descripcion || (!accion.urlAccion && !accion.responsable) || !accion.fechaLimite
    )

    if (accionesIncompletas.length > 0) {
      await showError('Acciones incompletas', 'Por favor completa todos los campos de las acciones.')
      return
    }

    setIsSubmitting(true)

    try {
      // Mostrar alerta de carga
      await showLoadingAlert(
        'Actualizando diagnóstico...',
        'Por favor espere mientras se guarda la información'
      )

      // Normalizar acciones antes del envío
      const accionesNormalizadas = acciones.map(accion => ({
        id: accion.id,
        descripcion: accion.descripcion,
        urlAccion: accion.urlAccion || accion.responsable || '', // Migrar responsable a urlAccion
        fechaLimite: accion.fechaLimite,
        completada: accion.completada
      }))

      const diagnosticoData = {
        nombreActividad: values.nombreActividad,
        municipio: values.municipio,
        actividad: values.actividad,
        solicitudUrl: values.solicitudUrl || '',
        respuestaUrl: values.respuestaUrl || '',
        unidadAdministrativa: values.unidadAdministrativa,
        evaluacion: values.evaluacion,
        observaciones: values.observaciones || '',
        acciones: accionesNormalizadas,
        fechaActualizacion: new Date()
      }

      console.log('Enviando datos al servidor:', diagnosticoData)

      // Usar función auxiliar con timeout
      const result = await updateDiagnosticoWithTimeout(diagnosticoData)
      
      console.log('Respuesta del servidor:', result)

      // Actualizar el estado local con los datos devueltos
      setDiagnostico(result)
      
      // Actualizar el formulario con los nuevos datos para reflejar los cambios
      form.reset({
        nombreActividad: result.nombreActividad || "",
        municipio: result.municipio || "",
        actividad: result.actividad || "Diagnóstico",
        solicitudUrl: result.solicitudUrl || "",
        respuestaUrl: result.respuestaUrl || "",
        unidadAdministrativa: result.unidadAdministrativa || "",
        evaluacion: result.evaluacion || 0,
        observaciones: result.observaciones || "",
      })

      // Actualizar acciones también
      const accionesActualizadas = (result.acciones || []).map((accion: any, index: number) => ({
        id: accion.id || `accion-${index}`,
        descripcion: accion.descripcion || '',
        urlAccion: accion.urlAccion || accion.responsable || '',
        fechaLimite: accion.fechaLimite || '',
        completada: accion.completada || false
      }))
      setAcciones(accionesActualizadas)

      // Cerrar alerta de carga antes de mostrar éxito
      await closeLoadingAlert()

      await showSuccess(
        '¡Diagnóstico actualizado!',
        `Se actualizó exitosamente el diagnóstico "${values.nombreActividad}" para el municipio de ${values.municipio}. Los cambios se han aplicado correctamente.`
      )
      
      // Redirigir automáticamente después de 1 segundo
      setTimeout(() => {
        router.push('/dashboard/diagnosticos?view=tablero')
      }, 1000)
      
    } catch (error) {
      console.error('Error al actualizar diagnóstico:', error)
      
      // Asegurar que la alerta de carga se cierre
      await closeLoadingAlert()
      
      await showError(
        'Error al actualizar diagnóstico',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="w-full">
        <ScrollArea className="h-full">
          <div className="flex-1 space-y-4 p-5">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </ScrollArea>
      </main>
    )
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Link 
              href="/dashboard" 
              className="hover:text-slate-800 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/dashboard/diagnosticos" 
              className="hover:text-slate-800 transition-colors duration-200"
            >
              Diagnósticos Municipios
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-slate-800">
              Editar
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Editar diagnóstico municipal
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Modifica la información del diagnóstico y gestiona las acciones asociadas
            </p>
          </div>

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full relative z-10">
              <div className="grid gap-6">
                
                {/* Información básica */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Nombre de Actividad */}
                    <FormField
                      control={form.control}
                      name="nombreActividad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Actividad *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Evaluación de capacidades digitales 2025"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Nombre descriptivo de la actividad a realizar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Municipio y Tipo de Actividad */}
                    <div className="form-grid-fixed">
                      <FormField
                        control={form.control}
                        name="municipio"
                        render={({ field }) => (
                          <FormItem className="form-container-fixed">
                            <FormLabel>Municipio *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="select-trigger-fixed">
                                  <SelectValue placeholder="Selecciona un municipio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent 
                                className="select-content-portal max-h-[200px] overflow-y-auto min-w-[200px]"
                                position="popper"
                                side="bottom"
                                align="start"
                                sideOffset={8}
                                avoidCollisions={false}
                                collisionPadding={0}
                              >
                                {MUNICIPIOS_MORELOS.map((municipio) => (
                                  <SelectItem key={municipio} value={municipio}>
                                    {municipio}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Selecciona el municipio para el diagnóstico
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actividad"
                        render={({ field }) => (
                          <FormItem className="form-container-fixed">
                            <FormLabel>Tipo de Actividad *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="select-trigger-fixed">
                                  <SelectValue placeholder="Selecciona el tipo de actividad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent 
                                className="select-content-portal max-h-[200px] min-w-[200px]"
                                position="popper"
                                side="bottom" 
                                align="start"
                                sideOffset={8}
                                avoidCollisions={false}
                                collisionPadding={0}
                              >
                                <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                                <SelectItem value="Indicador">Indicador</SelectItem>
                                <SelectItem value="Índice">Índice</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Categoría del diagnóstico que se aplicará al municipio seleccionado
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* URLs de archivos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="solicitudUrl"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>URL de Solicitud (PDF)</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://ejemplo.com/solicitud.pdf"
                                  {...field}
                                  className={cn(
                                    "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                    fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                  )}
                                />
                              </FormControl>
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              URL del archivo PDF de solicitud (debe comenzar con http:// o https://)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="respuestaUrl"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>URL de Respuesta (PDF)</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://ejemplo.com/respuesta.pdf"
                                  {...field}
                                  className={cn(
                                    "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                    fieldState.error && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                                  )}
                                />
                              </FormControl>
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              URL del archivo PDF de respuesta (debe comenzar con http:// o https://)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                  </CardContent>
                </Card>

                {/* Evaluación y detalles */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl transition-all duration-500 backdrop-blur-sm relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 via-emerald-200/20 to-teal-200/20 dark:from-green-800/10 dark:via-emerald-800/10 dark:to-teal-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Evaluación y Detalles</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative z-10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="unidadAdministrativa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad Administrativa *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Dirección de Tecnologías de la Información"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Unidad responsable de la implementación del diagnóstico
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="evaluacion"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                Evaluación de Cumplimiento
                              </FormLabel>
                              <FormControl>
                                <SimpleEvaluation
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription className="text-slate-600 dark:text-slate-400">
                                Evalúa el nivel de cumplimiento del diagnóstico municipal (0-100%)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <textarea
                              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Observaciones adicionales sobre el diagnóstico..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comentarios, observaciones o notas adicionales sobre el diagnóstico
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Acciones */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">Acciones</CardTitle>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={agregarAccion}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Acción
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {acciones.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay acciones agregadas. Haz clic en "Agregar Acción" para comenzar.
                      </p>
                    ) : (
                      acciones.map((accion, index) => (
                          <Card key={accion.id} className="p-4 border-dashed">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-sm font-medium">Acción #{index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarAccion(accion.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Tipo de Acción</Label>
                                <Select 
                                  value={accion.descripcion || ''} 
                                  onValueChange={(value) => actualizarAccion(accion.id, 'descripcion', value)}
                                >
                                  <SelectTrigger className="select-trigger-fixed">
                                    <SelectValue placeholder="Selecciona el tipo de acción" />
                                  </SelectTrigger>
                                  <SelectContent 
                                    className="select-content-portal max-h-[200px] min-w-[200px]"
                                    position="popper"
                                    side="bottom" 
                                    align="start"
                                    sideOffset={8}
                                    avoidCollisions={false}
                                    collisionPadding={0}
                                  >
                                    <SelectItem value="Invitación">Invitación</SelectItem>
                                    <SelectItem value="Exhorto">Exhorto</SelectItem>
                                    <SelectItem value="Recomendación">Recomendación</SelectItem>
                                    <SelectItem value="ESAF">ESAF</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <Label className="text-xs">URL de Acción (PDF)</Label>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Input
                                      type="url"
                                      placeholder="https://ejemplo.com/accion.pdf"
                                      value={accion.urlAccion || ''}
                                      onChange={(e) => actualizarAccion(accion.id, 'urlAccion', e.target.value)}
                                      className={cn(
                                        "bg-white border-slate-300 focus:border-slate-500 transition-colors",
                                        accion.urlAccion && !isValidUrl(accion.urlAccion) && "border-red-500 bg-red-50"
                                      )}
                                    />
                                    {accion.urlAccion && !isValidUrl(accion.urlAccion) && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Debe ser una URL válida que comience con http:// o https://
                                      </p>
                                    )}
                                  </div>
                                  <Button type="button" variant="outline" size="icon">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Fecha</Label>
                                <Input
                                  type="date"
                                  value={accion.fechaLimite || ''}
                                  onChange={(e) => actualizarAccion(accion.id, 'fechaLimite', e.target.value)}
                                  className="w-full max-w-[140px]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Estado</Label>
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={accion.completada}
                                    onCheckedChange={(checked) => actualizarAccion(accion.id, 'completada', checked)}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                  />
                                  <span className={cn(
                                    "text-xs font-medium",
                                    accion.completada ? "text-green-600" : "text-gray-500"
                                  )}>
                                    {accion.completada ? "✅ Completada" : "⏳ Pendiente"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                {/* Botón de eliminar a la izquierda */}
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={eliminarDiagnostico}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Diagnóstico
                </Button>

                {/* Botones principales a la derecha */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <Link href="/dashboard/diagnosticos" className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    {isSubmitting ? "Guardando..." : "Actualizar Diagnóstico"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </main>
  )
}
