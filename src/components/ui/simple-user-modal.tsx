'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Eye, Edit, User, Shield, Activity, X } from 'lucide-react'
import { showSuccess, showError } from '@/lib/notifications'

type Usuario = {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO'
  activo: boolean
  ultimoAcceso?: Date | null
  createdAt: Date
  updatedAt: Date
}

interface SimpleUserModalProps {
  user: Usuario | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
  mode: 'view' | 'edit'
  onModeChange: (mode: 'view' | 'edit') => void
}

export function SimpleUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdated, 
  mode, 
  onModeChange 
}: SimpleUserModalProps) {
  const [editFormData, setEditFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    rol: 'INVITADO' as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO',
    activo: true,
    password: '',
    changePassword: false
  })

  // Actualizar datos cuando cambie el usuario seleccionado
  useEffect(() => {
    if (user) {
      setEditFormData({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        activo: user.activo,
        password: '',
        changePassword: false
      })
    }
  }, [user])

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'OPERATIVO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SEGUIMIENTO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'INVITADO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleSaveEdit = async () => {
    if (!user) return

    // Validaciones
    if (!editFormData.nombre || !editFormData.apellido || !editFormData.email) {
      await showError('Campos requeridos', 'Nombre, apellido y email son requeridos')
      return
    }

    if (editFormData.changePassword && !editFormData.password) {
      await showError('Contraseña requerida', 'Si deseas cambiar la contraseña, debes ingresar una nueva')
      return
    }

    try {
      // Confirmación si se va a cambiar la contraseña
      if (editFormData.changePassword && editFormData.password) {
        const confirmed = window.confirm(
          `¿Estás seguro de que deseas cambiar la contraseña de ${user.nombre} ${user.apellido}?\n\nEsta acción no se puede deshacer.`
        )

        if (!confirmed) {
          return
        }
      }

      const updateData: any = {
        email: editFormData.email,
        nombre: editFormData.nombre,
        apellido: editFormData.apellido,
        rol: editFormData.rol,
        activo: editFormData.activo
      }

      // Solo incluir contraseña si se marcó para cambiar
      if (editFormData.changePassword && editFormData.password) {
        updateData.password = editFormData.password
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const successMessage = editFormData.changePassword && editFormData.password 
          ? 'Los datos del usuario y su contraseña han sido actualizados exitosamente'
          : 'Los datos del usuario han sido actualizados exitosamente'
        
        await showSuccess('¡Usuario actualizado!', successMessage)
        onClose()
        onUserUpdated()
        onModeChange('view')
      } else {
        const data = await response.json()
        await showError('Error al actualizar usuario', data.error || 'Ocurrió un error inesperado')
      }
    } catch (error) {
      await showError('Error de conexión', 'No se pudo conectar con el servidor')
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <Eye className="h-5 w-5 text-blue-600" />
                Detalles del Usuario
              </>
            ) : (
              <>
                <Edit className="h-5 w-5 text-indigo-600" />
                Editar Usuario
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'Información detallada del usuario'
              : 'Modifica los datos del usuario'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {mode === 'view' ? (
            // Modo vista - compacto
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{user.nombre} {user.apellido}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-all">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol</Label>
                  <div className="mt-1">
                    <Badge className={getRoleBadgeColor(user.rol)}>
                      {user.rol}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={user.activo ? 'secondary' : 'destructive'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Creado</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Último acceso</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.ultimoAcceso 
                      ? new Date(user.ultimoAcceso).toLocaleDateString()
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Modo edición - compacto
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-apellido">Apellido</Label>
                  <Input
                    id="edit-apellido"
                    value={editFormData.apellido}
                    onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-rol">Rol</Label>
                  <Select 
                    value={editFormData.rol} 
                    onValueChange={(value: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO') => 
                      setEditFormData({...editFormData, rol: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVITADO">Invitado</SelectItem>
                      <SelectItem value="OPERATIVO">Operativo</SelectItem>
                      <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                      <SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="user-active"
                    checked={editFormData.activo}
                    onChange={(e) => setEditFormData({...editFormData, activo: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="user-active" className="text-sm">Usuario activo</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="change-password"
                    checked={editFormData.changePassword}
                    onChange={(e) => setEditFormData({
                      ...editFormData, 
                      changePassword: e.target.checked,
                      password: e.target.checked ? editFormData.password : ''
                    })}
                    className="rounded"
                  />
                  <Label htmlFor="change-password" className="text-sm">Cambiar contraseña</Label>
                </div>
                
                {editFormData.changePassword && (
                  <div>
                    <Label htmlFor="edit-password">Nueva contraseña</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                      placeholder="Ingresa la nueva contraseña"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          {mode === 'view' ? (
            <>
              <Button 
                onClick={() => onModeChange('edit')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cerrar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => onModeChange('view')}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Guardar cambios
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 