'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  MessageSquare,
  Activity,
  Save,
  X,
  Clock
} from "lucide-react"
import { useSeguimientos, type Seguimiento } from "@/hooks/use-seguimientos"
import { showConfirm, showError } from "@/lib/notifications"
import { useAuth } from "@/contexts/auth-context"

interface SeguimientosListProps {
  acuerdoId: number
  acuerdoTema: string
}

export function SeguimientosList({ acuerdoId, acuerdoTema }: SeguimientosListProps) {
  const { user } = useAuth()
  const { 
    seguimientos, 
    loading, 
    createSeguimiento, 
    updateSeguimiento, 
    deleteSeguimiento 
  } = useSeguimientos(acuerdoId)
  
  // Verificar si el usuario puede editar/eliminar
  const canEdit = user?.rol !== 'INVITADO'
  
  const [showForm, setShowForm] = useState(false)
  const [editingSeguimiento, setEditingSeguimiento] = useState<Seguimiento | null>(null)
  const [formData, setFormData] = useState({
    seguimiento: '',
    accion: '',
    fechaSeguimiento: new Date().toISOString().split('T')[0]
  })

  const resetForm = () => {
    setFormData({
      seguimiento: '',
      accion: '',
      fechaSeguimiento: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
    setEditingSeguimiento(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSeguimiento) {
        await updateSeguimiento(editingSeguimiento.id, {
          seguimiento: formData.seguimiento,
          accion: formData.accion,
          fechaSeguimiento: new Date(formData.fechaSeguimiento)
        })
      } else {
        await createSeguimiento(acuerdoId, {
          seguimiento: formData.seguimiento,
          accion: formData.accion,
          fechaSeguimiento: new Date(formData.fechaSeguimiento)
        })
      }
      resetForm()
    } catch (error) {
      console.error('Error al guardar seguimiento:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      await showError('Error', `No se pudo guardar el seguimiento: ${errorMessage}`)
    }
  }

  const handleEdit = (seguimiento: Seguimiento) => {
    setEditingSeguimiento(seguimiento)
    setFormData({
      seguimiento: seguimiento.seguimiento,
      accion: seguimiento.accion,
      fechaSeguimiento: new Date(seguimiento.fechaSeguimiento).toISOString().split('T')[0]
    })
    setShowForm(true)
  }

  const handleDelete = async (seguimiento: Seguimiento) => {
    const result = await showConfirm(
      '¿Estás seguro?',
      `Se eliminará el seguimiento:\n\n"${seguimiento.seguimiento}"`
    )

    if (result.isConfirmed) {
      try {
        await deleteSeguimiento(seguimiento.id)
      } catch (error) {
        console.error('Error eliminando seguimiento:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        await showError('Error', `No se pudo eliminar el seguimiento: ${errorMessage}`)
      }
    }
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Seguimientos del Acuerdo
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {acuerdoTema}
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Seguimiento
          </Button>
        )}
      </div>

      {/* Form para agregar/editar seguimiento */}
      {showForm && canEdit && (
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/50 dark:to-indigo-950/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {editingSeguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seguimiento">Seguimiento</Label>
                  <Input
                    id="seguimiento"
                    value={formData.seguimiento}
                    onChange={(e) => setFormData({ ...formData, seguimiento: e.target.value })}
                    placeholder="Descripción del seguimiento..."
                    required
                    className="bg-white/70 dark:bg-slate-800/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaSeguimiento">Fecha de Seguimiento</Label>
                  <Input
                    id="fechaSeguimiento"
                    type="date"
                    value={formData.fechaSeguimiento}
                    onChange={(e) => setFormData({ ...formData, fechaSeguimiento: e.target.value })}
                    required
                    className="bg-white/70 dark:bg-slate-800/70"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accion">Acción</Label>
                <Input
                  id="accion"
                  value={formData.accion}
                  onChange={(e) => setFormData({ ...formData, accion: e.target.value })}
                  placeholder="Acción realizada o por realizar..."
                  required
                  className="bg-white/70 dark:bg-slate-800/70"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-200 dark:border-slate-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingSeguimiento ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de seguimientos */}
      <div className="space-y-3">
        {loading ? (
          <Card key="loading-skeleton" className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <div key="skeleton-title" className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div key="skeleton-subtitle" className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : seguimientos.length === 0 ? (
          <Card key="empty-state" className="border-dashed border-slate-300 dark:border-slate-600">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Sin seguimientos aún
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                {canEdit ? 'Agrega el primer seguimiento para este acuerdo' : 'No hay seguimientos registrados para este acuerdo'}
              </p>
              {canEdit && (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Seguimiento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          seguimientos.map((seguimiento, index) => (
            <Card 
              key={`seguimiento-${seguimiento.id}-${index}`} 
              className="border-slate-200/60 dark:border-slate-600/60 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/20 shadow-sm transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatFecha(seguimiento.fechaSeguimiento)}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatFecha(seguimiento.fechaCreacion)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {seguimiento.seguimiento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Activity className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {seguimiento.accion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(seguimiento)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(seguimiento)}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
