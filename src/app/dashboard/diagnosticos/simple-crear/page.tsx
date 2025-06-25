"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MUNICIPIOS_MORELOS } from "@/lib/prisma-service"

export default function CreateDiagnosticoSimplePage() {
  const router = useRouter()
  const [nombreActividad, setNombreActividad] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [actividad, setActividad] = useState("")
  const [unidadAdministrativa, setUnidadAdministrativa] = useState("")
  const [evaluacion, setEvaluacion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔥 Submit simple iniciado')
    
    setMessage("Iniciando proceso...")
    setLoading(true)
    
    try {
      // Validaciones básicas
      if (!nombreActividad.trim()) {
        throw new Error("Nombre de actividad es obligatorio")
      }
      if (!municipio) {
        throw new Error("Municipio es obligatorio")  
      }
      if (!actividad) {
        throw new Error("Tipo de actividad es obligatorio")
      }
      if (!unidadAdministrativa.trim()) {
        throw new Error("Unidad administrativa es obligatoria")
      }

      console.log('✅ Validaciones pasadas')
      setMessage("Validaciones pasadas, enviando datos...")
      
      const data = {
        nombreActividad: nombreActividad.trim(),
        municipio,
        actividad,
        unidadAdministrativa: unidadAdministrativa.trim(),
        evaluacion,
        observaciones: "Creado desde formulario simple",
        acciones: [],
        estado: "En Proceso"
      }
      
      console.log('📡 Enviando datos:', data)
      setMessage("Enviando a la API...")
      
      const response = await fetch('/api/diagnosticos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('🌐 Respuesta:', response.status, response.statusText)
      setMessage(`Respuesta de la API: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const resultado = await response.json()
      console.log('✅ Resultado:', resultado)
      setMessage(`¡Éxito! Diagnóstico creado con ID: ${resultado.id}`)
      
      // Limpiar formulario
      setNombreActividad("")
      setMunicipio("")
      setActividad("")
      setUnidadAdministrativa("")
      setEvaluacion(0)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/diagnosticos?view=tablero')
      }, 2000)
      
    } catch (error) {
      console.error('💥 Error:', error)
      setMessage(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🧪 Crear Diagnóstico - Versión Simple (Debug)</CardTitle>
            <p className="text-sm text-gray-600">
              Esta es una versión simplificada para debug
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Nombre de Actividad *</Label>
                <Input
                  value={nombreActividad}
                  onChange={(e) => setNombreActividad(e.target.value)}
                  placeholder="Escriba el nombre de la actividad"
                  required
                />
              </div>

              <div>
                <Label>Municipio *</Label>
                <Select value={municipio} onValueChange={setMunicipio} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS_MORELOS.map((mun) => (
                      <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Actividad *</Label>
                <Select value={actividad} onValueChange={setActividad} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                    <SelectItem value="Indicador">Indicador</SelectItem>
                    <SelectItem value="Índice">Índice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Unidad Administrativa *</Label>
                <Input
                  value={unidadAdministrativa}
                  onChange={(e) => setUnidadAdministrativa(e.target.value)}
                  placeholder="Secretaría, Dirección, etc."
                  required
                />
              </div>

              <div>
                <Label>Evaluación (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluacion}
                  onChange={(e) => setEvaluacion(Number(e.target.value))}
                />
              </div>

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
                  {loading ? 'Procesando...' : 'Crear Diagnóstico Simple'}
                </Button>
              </div>
            </form>

            {message && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Estado del proceso:</h3>
                <p className="text-blue-800 dark:text-blue-200">{message}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="font-bold mb-2">Estado del formulario:</h3>
              <pre className="text-xs">
{JSON.stringify({
  nombreActividad,
  municipio,
  actividad,
  unidadAdministrativa,
  evaluacion,
  loading
}, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
