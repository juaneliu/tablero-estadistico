"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEntes } from "@/hooks/use-entes"
import { showSuccess, showError } from "@/lib/notifications"

export default function ImportarDatosPage() {
  const router = useRouter()
  const { importBulkEntes } = useEntes()
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      if (!Array.isArray(jsonData)) {
        throw new Error('El archivo debe contener un array de entes públicos')
      }

      // Validar estructura de datos
      const firstItem = jsonData[0]
      if (!firstItem || !firstItem.nombre || !firstItem.entidad) {
        throw new Error('Estructura de datos inválida. Verifica que el JSON tenga la estructura correcta.')
      }

      await importBulkEntes(jsonData)
      
      await showSuccess(
        '¡Importación exitosa!',
        `Se importaron ${jsonData.length} entes públicos correctamente.`
      )
      
      router.push('/dashboard/entes')
      
    } catch (error) {
      console.error('Error importing data:', error)
      await showError(
        'Error en la importación',
        error instanceof Error ? error.message : 'Error al procesar el archivo'
      )
    } finally {
      setLoading(false)
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
              Importar Datos
            </span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Importar Datos
              </h2>
              <p className="text-sm text-muted-foreground">
                Importa entes públicos desde un archivo JSON
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full" />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Formulario de importación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar archivo JSON
                </CardTitle>
                <CardDescription>
                  Selecciona un archivo JSON con la estructura correcta de entes públicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Arrastra un archivo JSON aquí o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button 
                        variant="outline" 
                        disabled={loading}
                        asChild
                      >
                        <span className="cursor-pointer">
                          {loading ? 'Importando...' : 'Seleccionar archivo'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información sobre el formato */}
            <Card>
              <CardHeader>
                <CardTitle>Formato esperado</CardTitle>
                <CardDescription>
                  El archivo JSON debe tener la siguiente estructura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto">
{`[
  {
    "id": 4716,
    "nombre": "AEROPUERTO DE CUERNAVACA S.A. DE C.V.",
    "ambitoGobierno": "Estatal",
    "poderGobierno": "Ejecutivo", 
    "controlOIC": false,
    "controlTribunal": false,
    "sistema1": false,
    "sistema2": true,
    "sistema3": false,
    "sistema6": false,
    "entidad": {
      "nombre": "Morelos"
    },
    "municipio": null
  }
]`}
                </pre>
                
                <div className="mt-4 space-y-2 text-sm">
                  <h4 className="font-semibold">Campos requeridos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><code>nombre</code>: Nombre del ente público</li>
                    <li><code>ambitoGobierno</code>: &quot;Federal&quot;, &quot;Estatal&quot; o &quot;Municipal&quot;</li>
                    <li><code>poderGobierno</code>: &quot;Ejecutivo&quot;, &quot;Legislativo&quot; o &quot;Judicial&quot;</li>
                    <li><code>entidad</code>: Objeto con la propiedad &quot;nombre&quot;</li>
                    <li><code>sistema1, sistema2, sistema3, sistema6</code>: Boolean</li>
                    <li><code>controlOIC, controlTribunal</code>: Boolean</li>
                    <li><code>municipio</code>: String o null</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}
