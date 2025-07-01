"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, Plus, Trash2, Upload } from "lucide-react"
import { showError, showSuccess, showMissingFieldsError, showUrlValidationError, showLoadingAlert, closeLoadingAlert } from "@/lib/notifications"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"
import { useDiagnosticosMunicipales } from "@/hooks/use-diagnosticos-municipales"
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

// Schema de validación
const formSchema = z.object({
  nombreActividad: z.string().min(2, "El nombre de la actividad debe tener al menos 2 caracteres"),
  municipio: z.string().min(1, "Selecciona un municipio"),
  actividad: z.enum(["Diagnóstico", "Indicador", "Índice"], {
    required_error: "Selecciona un tipo de actividad",
  }),
  solicitudUrl: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // Permitir vacío
      const trimmedVal = val.trim();
      try {
        new URL(trimmedVal);
        return trimmedVal.startsWith('http://') || trimmedVal.startsWith('https://');
      } catch {
        return false;
      }
    }, "Debe ser una URL válida que comience con http:// o https://"),
  respuestaUrl: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // Permitir vacío
      const trimmedVal = val.trim();
      try {
        new URL(trimmedVal);
        return trimmedVal.startsWith('http://') || trimmedVal.startsWith('https://');
      } catch {
        return false;
      }
    }, "Debe ser una URL válida que comience con http:// o https://"),
  unidadAdministrativa: z.string().min(2, "La unidad administrativa debe tener al menos 2 caracteres"),
  evaluacion: z.number().min(0, "La evaluación debe ser mayor o igual a 0").max(100, "La evaluación debe ser menor o igual a 100"),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Accion {
  id: string
  descripcion: string // Ahora será "Invitación", "Exhorto", "Recomendación", "ESAF"
  urlAccion: string   // Antes era "responsable", ahora es URL de Acción (PDF)
  fechaLimite: string
  completada: boolean
}

// Contador para generar IDs únicos de manera consistente
let accionIdCounter = 0
const generateAccionId = (): string => {
  return `accion-${++accionIdCounter}-${Date.now()}`
}

export default function CrearDiagnosticoPage() {
  const router = useRouter()
  const { createDiagnostico } = useDiagnosticosMunicipales()
  const [acciones, setAcciones] = useState<Accion[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreActividad: "",
      municipio: "",
      actividad: undefined, // Revertir a undefined pero manejar en el Select
      solicitudUrl: "",
      respuestaUrl: "",
      unidadAdministrativa: "",
      evaluacion: 0,
      observaciones: "",
    },
  })

  // Sincronizar el estado del formulario (ya no necesario para municipios múltiples)
  // Eliminado el useEffect anterior

  // Función para limpiar errores cuando el usuario comience a escribir
  const clearFieldError = (fieldName: keyof FormData) => {
    if (form.formState.errors[fieldName]) {
      form.clearErrors(fieldName)
    }
  }

  const agregarAccion = () => {
    const nuevaAccion: Accion = {
      id: generateAccionId(),
      descripcion: '',
      urlAccion: '',
      fechaLimite: '',
      completada: false
    }
    setAcciones(prev => [...prev, nuevaAccion])
  }

  const eliminarAccion = (id: string) => {
    setAcciones(prev => prev.filter(accion => accion.id !== id))
  }

  const actualizarAccion = (id: string, campo: keyof Accion, valor: string | boolean) => {
    setAcciones(prev => prev.map(accion =>
      accion.id === id ? { ...accion, [campo]: valor } : accion
    ))
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

  const onSubmit = async (values: FormData) => {
    // Validación de campos obligatorios
    const missingFields: string[] = []
    const errors: { field: keyof FormData; message: string }[] = []
    
    // Validar Nombre de Actividad
    if (!values.nombreActividad || values.nombreActividad.trim() === "") {
      missingFields.push("Nombre de Actividad")
      form.setError("nombreActividad", {
        type: "manual",
        message: "El nombre de la actividad es obligatorio"
      })
    }
    
    // Validar Municipio
    if (!values.municipio || values.municipio.trim() === "") {
      missingFields.push("Municipio")
      form.setError("municipio", {
        type: "manual",
        message: "Selecciona un municipio"
      })
    }
    
    // Validar Tipo de Actividad
    if (!values.actividad) {
      missingFields.push("Tipo de Actividad")
      form.setError("actividad", {
        type: "manual",
        message: "El tipo de actividad es obligatorio"
      })
    }
    
    // Validar Unidad Administrativa
    if (!values.unidadAdministrativa || values.unidadAdministrativa.trim() === "") {
      missingFields.push("Unidad Administrativa")
      form.setError("unidadAdministrativa", {
        type: "manual",
        message: "La unidad administrativa es obligatoria"
      })
    }

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

    // Validar URL de solicitud
    if (values.solicitudUrl && !validateUrl(values.solicitudUrl, "URL de Solicitud")) {
      form.setError("solicitudUrl", {
        type: "manual",
        message: "La URL de solicitud debe ser válida y comenzar con http:// o https://"
      })
    }

    // Validar URL de respuesta
    if (values.respuestaUrl && !validateUrl(values.respuestaUrl, "URL de Respuesta")) {
      form.setError("respuestaUrl", {
        type: "manual",
        message: "La URL de respuesta debe ser válida y comenzar con http:// o https://"
      })
    }

    // Validar URLs de acciones
    const invalidActionUrls: string[] = []
    acciones.forEach((accion, index) => {
      if (accion.urlAccion && !validateUrl(accion.urlAccion, `URL de Acción #${index + 1}`)) {
        invalidActionUrls.push(`Acción #${index + 1}: ${accion.urlAccion}`)
      }
    })

    if (invalidActionUrls.length > 0) {
      await showUrlValidationError(invalidActionUrls)
      return
    }

    // Si hay campos faltantes, mostrar errores y popup
    if (missingFields.length > 0) {
      // Mostrar alerta con los campos faltantes
      await showMissingFieldsError(missingFields)
      
      // Hacer scroll al primer campo con error
      const firstErrorField = document.querySelector('.text-red-500, [data-invalid="true"]') as HTMLElement
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
      return
    }

    // Verificar si hay errores de URL en los campos del formulario
    const formState = form.formState
    if (formState.errors.solicitudUrl || formState.errors.respuestaUrl) {
      await showError(
        'URLs Inválidas',
        'Por favor, corrija las URLs antes de continuar. Las URLs deben comenzar con http:// o https://'
      )
      return
    }
    setLoading(true)

    try {
      // Mostrar loading alert
      await showLoadingAlert('Creando diagnóstico...', 'Por favor espere mientras se crea el diagnóstico')

      // Crear el objeto diagnóstico
      const now = new Date().toISOString()
      
      // Calcular estado automáticamente basado en evaluación
      const calcularEstado = (evaluacion: number): string => {
        if (evaluacion === 0) return 'Pendiente'
        if (evaluacion === 100) return 'Completado'
        return 'En Proceso'
      }
      
      const diagnosticoData = {
        nombreActividad: values.nombreActividad,
        municipio: values.municipio,
        actividad: values.actividad,
        solicitudUrl: values.solicitudUrl || '',
        respuestaUrl: values.respuestaUrl || '',
        unidadAdministrativa: values.unidadAdministrativa,
        evaluacion: values.evaluacion,
        observaciones: values.observaciones || '',
        acciones: acciones,
        estado: calcularEstado(values.evaluacion), // Estado automático basado en evaluación
        fechaCreacion: new Date(now),
        fechaActualizacion: new Date(now)
      }

      // Crear diagnóstico usando la API
      const resultado = await createDiagnostico(diagnosticoData)
      
      // Cerrar loading alert
      await closeLoadingAlert()

      // Mostrar mensaje de éxito
      await showSuccess(
        '¡Diagnóstico creado!',
        `El diagnóstico municipal para ${values.municipio} ha sido creado exitosamente.`
      )
      
                      // Redirigir a la Vista Detallada
      router.push('/dashboard/diagnosticos?view=tablero')
      
    } catch (error) {
      console.error('💥 Error al crear diagnósticos:', error)
      
      // Cerrar loading alert si está abierto
      await closeLoadingAlert()
      
      // El error ya se muestra en el hook, no necesitamos mostrarlo aquí de nuevo
    } finally {
      setLoading(false)
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
              href="/dashboard/diagnosticos" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Diagnósticos Municipios
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Crear
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Crear diagnóstico municipal
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Crea diagnósticos para los municipios de Morelos
            </p>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full" />

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full relative z-10">
              <div className="grid gap-6">
                
                {/* Información básica */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl transition-all duration-500 backdrop-blur-sm relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-indigo-200/20 to-purple-200/20 dark:from-blue-800/10 dark:via-indigo-800/10 dark:to-purple-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative z-10 space-y-4">
                    
                    {/* Nombre de Actividad - MOVIDO AL PRIMER LUGAR */}
                    <FormField
                      control={form.control}
                      name="nombreActividad"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                            Nombre de Actividad <span className="text-red-500 font-bold text-lg ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Evaluación de capacidades digitales 2025"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                clearFieldError('nombreActividad')
                              }}
                              className={cn(
                                "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                fieldState.error && "!border-red-500 !bg-red-50 dark:!bg-red-900/30 ring-2 ring-red-200"
                              )}
                            />
                          </FormControl>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Nombre descriptivo de la actividad a realizar
                          </FormDescription>
                          <FormMessage className="text-red-600 font-medium" />
                        </FormItem>
                      )}
                    />

                    {/* Municipio y Tipo de Actividad - AL MISMO NIVEL HORIZONTAL */}
                    <div className="form-grid-fixed">
                      {/* Selección de Municipio */}
                      <FormField
                        control={form.control}
                        name="municipio"
                        render={({ field, fieldState }) => (
                          <FormItem className="form-container-fixed">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Municipio <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value)
                                clearFieldError('municipio')
                              }} 
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger className={cn(
                                  "select-trigger-fixed border-2",
                                  fieldState.error && "!border-red-500 !bg-red-50 dark:!bg-red-900/30 ring-2 ring-red-200"
                                )}>
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
                              Selecciona el municipio para crear el diagnóstico
                            </FormDescription>
                            <FormMessage className="text-red-600 font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* Tipo de Actividad */}
                      <FormField
                        control={form.control}
                        name="actividad"
                        render={({ field, fieldState }) => (
                          <FormItem className="form-container-fixed">
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Tipo de Actividad <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value)
                                clearFieldError('actividad')
                              }} 
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger className={cn(
                                  "select-trigger-fixed border-2",
                                  fieldState.error && "!border-red-500 !bg-red-50 dark:!bg-red-900/30 ring-2 ring-red-200"
                                )}>
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
                            <FormMessage className="text-red-600 font-medium" />
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
                                  onChange={(e) => {
                                    field.onChange(e)
                                    clearFieldError('solicitudUrl')
                                  }}
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
                                  onChange={(e) => {
                                    field.onChange(e)
                                    clearFieldError('respuestaUrl')
                                  }}
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

                {/* Acciones */}
                <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl transition-all duration-500 backdrop-blur-sm relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-pink-200/20 dark:from-indigo-800/10 dark:via-purple-800/10 dark:to-pink-800/10 rounded-full blur-3xl -z-10"></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Acciones</CardTitle>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={agregarAccion}
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Acción
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative z-10 space-y-4">
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
                                value={accion.descripcion} 
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
                                    value={accion.urlAccion}
                                    onChange={(e) => actualizarAccion(accion.id, 'urlAccion', e.target.value)}
                                    className={cn(
                                      "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                      accion.urlAccion && !isValidUrl(accion.urlAccion) && "border-red-500 bg-red-50/50 dark:bg-red-900/20"
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
                                value={accion.fechaLimite}
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
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-200">
                              Unidad Administrativa <span className="text-red-500 font-bold text-lg ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Dirección de Tecnologías"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  clearFieldError('unidadAdministrativa')
                                }}
                                className={cn(
                                  "h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300",
                                  fieldState.error && "!border-red-500 !bg-red-50 dark:!bg-red-900/30 ring-2 ring-red-200"
                                )}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                              Especifica la unidad administrativa responsable
                            </FormDescription>
                            <FormMessage className="text-red-600 font-medium" />
                          </FormItem>
                        )}
                      />

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

                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full p-3 border rounded-md resize-none h-20"
                              placeholder="Observaciones generales para todos los municipios..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>

              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-2 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/diagnosticos')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "min-w-[180px]",
                    loading && "cursor-not-allowed opacity-70"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creando...
                    </div>
                  ) : (
                    'Crear Diagnóstico'
                  )}
                </Button>
              </div>


            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}
