"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, Plus } from "lucide-react"
import { showError, showSuccess } from "@/lib/notifications"
import { useEntes } from "@/hooks/use-entes"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  ambitoGobierno: z.enum(["Estatal", "Federal", "Municipal"], {
    required_error: "Selecciona un ámbito de gobierno",
  }),
  poderGobierno: z.enum(["Ejecutivo", "Judicial", "Legislativo", "Autónomo"], {
    required_error: "Selecciona un poder de gobierno", 
  }),
  controlOIC: z.boolean(),
  controlTribunal: z.boolean(),
  sistema1: z.boolean(),
  sistema2: z.boolean(),
  sistema3: z.boolean(),
  sistema6: z.boolean(),
  municipio: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CrearEntePage() {
  const router = useRouter()
  const { createEnte } = useEntes()
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      ambitoGobierno: undefined,
      poderGobierno: undefined,
      controlOIC: false,
      controlTribunal: false,
      sistema1: false,
      sistema2: false,
      sistema3: false,
      sistema6: false,
      municipio: "",
    },
  })

  const watchControlOIC = form.watch("controlOIC")
  const watchControlTribunal = form.watch("controlTribunal")
  const watchAmbitoGobierno = form.watch("ambitoGobierno")

  // Lógica para habilitar/deshabilitar sistemas
  const isSistema3Available = watchControlOIC || watchControlTribunal
  const areOtrosSistemasDisabled = watchControlOIC

  const onSubmit = async (values: FormData) => {
    console.log("Datos del formulario:", values)
    
    // Validación personalizada de campos obligatorios
    const missingFields: string[] = []
    
    if (!values.nombre || values.nombre.trim() === "") {
      missingFields.push("Nombre")
      form.setError("nombre", {
        type: "manual",
        message: "El nombre es obligatorio"
      })
    }
    
    if (!values.ambitoGobierno) {
      missingFields.push("Ámbito de Gobierno")
      form.setError("ambitoGobierno", {
        type: "manual", 
        message: "El ámbito de gobierno es obligatorio"
      })
    }
    
    if (!values.poderGobierno) {
      missingFields.push("Poder de Gobierno")
      form.setError("poderGobierno", {
        type: "manual",
        message: "El poder de gobierno es obligatorio"
      })
    }
    
    // Validación adicional para campos relacionados
    if (values.ambitoGobierno === "Municipal" && !values.municipio) {
      missingFields.push("Municipio")
      form.setError("municipio", {
        type: "manual",
        message: "El municipio es requerido para el ámbito Municipal"
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
      // Crear el objeto del ente público con la nueva estructura
      const nuevoEnte = {
        nombre: values.nombre,
        ambitoGobierno: values.ambitoGobierno,
        poderGobierno: values.poderGobierno,
        controlOIC: values.controlOIC,
        controlTribunal: values.controlTribunal,
        sistema1: values.sistema1,
        sistema2: values.sistema2,
        sistema3: values.sistema3,
        sistema6: values.sistema6,
        entidad: { nombre: "Morelos" }, // Estructura de objeto
        municipio: values.ambitoGobierno === "Municipal" ? values.municipio || null : null,
      }

      // Crear el ente usando el hook
      await createEnte(nuevoEnte)
      
      // Mostrar mensaje de éxito
      await showSuccess(
        '¡Ente creado exitosamente!',
        `El ente público "${values.nombre}" ha sido registrado correctamente.`
      )
      
      // Redirigir a la lista de entes
      router.push('/dashboard/entes')
      
    } catch (error) {
      console.error('Error al crear ente:', error)
      await showError(
        'Error al crear ente',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      )
    }
  }

  return (
    <main className="w-full">
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-5">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
            <Link 
              href="/dashboard" 
              className="overflow-hidden text-ellipsis whitespace-nowrap hover:text-foreground"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href="/dashboard/entes" 
              className="overflow-hidden text-ellipsis whitespace-nowrap hover:text-foreground"
            >
              Entes Públicos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground pointer-events-none">
              Crear
            </span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Crear ente público
              </h2>
              <p className="text-sm text-muted-foreground">
                Agrega un nuevo ente público
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full" />

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
              {/* Bloque del formulario con estilo */}
              <div className="p-6 bg-gradient-to-br from-white/70 via-slate-50/60 to-blue-50/40 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/40 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-lg">
                
                {/* Campo de nombre */}
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Nombre: <span className="text-red-500 font-bold text-lg ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre del Ente Público" 
                            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 ${fieldState.error ? "field-error error-shake" : ""}`}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Primera fila: Ámbito de Gobierno y Poder de Gobierno */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="ambitoGobierno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Ámbito de Gobierno: <span className="text-red-500 font-bold text-lg ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 ${fieldState.error ? "field-error error-shake" : ""}`}>
                              <SelectValue placeholder="Selecciona un ámbito" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Estatal">Estatal</SelectItem>
                            <SelectItem value="Federal">Federal</SelectItem>
                            <SelectItem value="Municipal">Municipal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="poderGobierno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                          Poder de Gobierno: <span className="text-red-500 font-bold text-lg ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 ${fieldState.error ? "field-error error-shake" : ""}`}>
                              <SelectValue placeholder="Selecciona un poder" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ejecutivo">Ejecutivo</SelectItem>
                            <SelectItem value="Judicial">Judicial</SelectItem>
                            <SelectItem value="Legislativo">Legislativo</SelectItem>
                            <SelectItem value="Autónomo">Autónomo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Segunda fila: Órgano Interno de Control y Tribunal de Justicia Administrativa */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="controlOIC"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Órgano Interno de Control</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Al activar el OIC, solo el sistema S3 estará disponible.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="controlTribunal"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Tribunal de Justicia Administrativa</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Al activar el TJA, podrás activar o desactivar todos los sistemas.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tercera fila: Sistemas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <FormField
                    control={form.control}
                    name="sistema1"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 1</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Deshabilitado si el OIC está activado.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={areOtrosSistemasDisabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema2"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 2</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Deshabilitado si el OIC está activado.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={areOtrosSistemasDisabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema3"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-blue-300/60 bg-gradient-to-r from-blue-50/80 to-cyan-50/60 dark:from-blue-900/20 dark:to-cyan-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 3</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Disponible si se activa OIC o TJA.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isSistema3Available}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema6"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 shadow-sm ${
                        field.value 
                          ? 'border-green-300/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/15'
                          : 'border-slate-200/50 bg-white/50 dark:bg-slate-800/50'
                      } backdrop-blur-sm`}>
                        <div className="space-y-0.5 flex-1 mr-3">
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">Sistema 6</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Deshabilitado si el OIC está activado.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={areOtrosSistemasDisabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campo de municipio */}
                {watchAmbitoGobierno === "Municipal" && (
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold">
                            Municipio: <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 shadow-sm ${fieldState.error ? "field-error error-shake" : ""}`}>
                                <SelectValue placeholder="Selecciona un municipio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MUNICIPIOS_MORELOS.map((municipio) => (
                                <SelectItem key={municipio} value={municipio}>
                                  {municipio}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Botón de crear integrado */}
                <div className="flex justify-end pt-4 border-t border-slate-200/60 dark:border-slate-600/60">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg px-8 py-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 active:bg-gradient-to-r active:from-blue-600 active:to-indigo-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Ente Público
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
