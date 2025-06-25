"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema de validación simplificado
const formSchema = z.object({
  nombreActividad: z.string().min(2, "El nombre de la actividad debe tener al menos 2 caracteres"),
  municipio: z.string().min(1, "Selecciona un municipio"),
  actividad: z.enum(["Diagnóstico", "Indicador", "Índice"], {
    required_error: "Selecciona un tipo de actividad",
  }),
  unidadAdministrativa: z.string().min(2, "La unidad administrativa debe tener al menos 2 caracteres"),
  evaluacion: z.number().min(0).max(100),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function DirectCreateDiagnosticoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreActividad: "",
      municipio: "",
      actividad: undefined,
      unidadAdministrativa: "",
      evaluacion: 0,
      observaciones: "",
    },
  })

  const onSubmit = async (values: FormData) => {
    console.log('🔥 DIRECT Submit iniciado con values:', values)
    setMessage("Iniciando...")
    setLoading(true)
    
    try {
      console.log('📊 Preparando datos...')
      const data = {
        nombreActividad: values.nombreActividad,
        municipio: values.municipio,
        actividad: values.actividad,
        unidadAdministrativa: values.unidadAdministrativa,
        evaluacion: values.evaluacion,
        observaciones: values.observaciones || "Creado desde formulario directo",
        acciones: [],
        estado: "En Proceso"
      }
      
      console.log('📡 Llamada DIRECTA a fetch...', data)
      setMessage("Enviando a la API...")
      
      const response = await fetch('/api/diagnosticos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('🌐 Respuesta:', response.status, response.statusText)
      setMessage(`Respuesta: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const resultado = await response.json()
      console.log('✅ Resultado:', resultado)
      setMessage(`¡Éxito! ID: ${resultado.id}`)
      
      // Alert nativo
      alert(`¡Diagnóstico creado! ID: ${resultado.id}`)
      
      // Redireccionar
      setTimeout(() => {
        router.push('/dashboard/diagnosticos?view=tablero')
      }, 1000)
      
    } catch (error) {
      console.error('💥 Error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setMessage(`Error: ${errorMsg}`)
      alert(`Error: ${errorMsg}`)
    } finally {
      console.log('🏁 Finalizando...')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Diagnósticos</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-100 font-medium">Crear (Directo)</span>
      </div>
      
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            🎯 Crear Diagnóstico - Versión Directa
          </CardTitle>
          <p className="text-blue-100">
            Versión con fetch directo, React Hook Form, sin hooks personalizados
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="nombreActividad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Actividad *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Escriba el nombre de la actividad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="municipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipio *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un municipio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MUNICIPIOS_MORELOS.map((mun) => (
                          <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actividad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Actividad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                        <SelectItem value="Indicador">Indicador</SelectItem>
                        <SelectItem value="Índice">Índice</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadAdministrativa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad Administrativa *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Secretaría, Dirección, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evaluacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluación (0-100)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Observaciones adicionales..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
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
                  className="flex-1"
                >
                  {loading ? 'Procesando...' : 'Crear Diagnóstico Directo'}
                </Button>
              </div>
            </form>
          </Form>

          {message && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Estado:</h3>
              <p className="text-blue-800 dark:text-blue-200">{message}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <h3 className="font-bold mb-2">Debug:</h3>
            <pre className="text-xs">
{JSON.stringify({
  values: form.getValues(),
  errors: form.formState.errors,
  isValid: form.formState.isValid,
  loading
}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
