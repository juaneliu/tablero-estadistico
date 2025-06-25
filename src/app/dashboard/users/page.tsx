'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProtectedRoute } from '@/components/protected-route'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  User,
  Crown,
  FileText,
  Activity,
  Calendar,
  Download,
  BarChart3,
  Clock,
  AlertCircle
} from 'lucide-react'
import { showConfirm, showSuccess, showError } from '@/lib/notifications'

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

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
      <UsersPageContent />
    </ProtectedRoute>
  )
}

function UsersPageContent() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [activeView, setActiveView] = useState<'usuarios' | 'informes' | 'auditoria'>('usuarios')

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    password: '',
    rol: 'INVITADO' as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO'
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data)
      } else {
        setError(data.error || 'Error al cargar usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.nombre || !formData.apellido || !formData.rol) {
      await showError('Campos requeridos', 'Todos los campos son requeridos')
      return
    }

    if ((formData.rol === 'OPERATIVO' || formData.rol === 'ADMINISTRADOR' || formData.rol === 'SEGUIMIENTO') && !formData.password) {
      await showError('Contraseña requerida', 'Los usuarios OPERATIVO, ADMINISTRADOR y SEGUIMIENTO requieren contraseña')
      return
    }

    setCreateLoading(true)
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        await showSuccess('¡Usuario creado!', 'El usuario ha sido creado exitosamente')
        setFormData({
          email: '',
          nombre: '',
          apellido: '',
          password: '',
          rol: 'INVITADO'
        })
        setShowCreateForm(false)
        fetchUsers()
      } else {
        await showError('Error al crear usuario', data.error || 'Ocurrió un error inesperado')
      }
    } catch (error) {
      await showError('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteUser = async (id: number, email: string) => {
    const confirmed = await showConfirm(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar al usuario ${email}?\n\nEsta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    )

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await showSuccess('¡Usuario eliminado!', 'El usuario ha sido eliminado exitosamente')
          fetchUsers()
        } else {
          const data = await response.json()
          await showError('Error al eliminar usuario', data.error || 'Ocurrió un error inesperado')
        }
      } catch (error) {
        await showError('Error de conexión', 'No se pudo conectar con el servidor')
      }
    }
  }

  const handleToggleUserStatus = async (id: number, currentStatus: boolean, email: string) => {
    const action = currentStatus ? 'desactivar' : 'activar'
    const confirmed = await showConfirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      `¿Estás seguro de que deseas ${action} al usuario ${email}?`,
      `Sí, ${action}`,
      'Cancelar'
    )

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activo: !currentStatus }),
        })

        if (response.ok) {
          await showSuccess(
            `¡Usuario ${action === 'activar' ? 'activado' : 'desactivado'}!`, 
            `El usuario ha sido ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`
          )
          fetchUsers()
        } else {
          const data = await response.json()
          await showError(`Error al ${action} usuario`, data.error || 'Ocurrió un error inesperado')
        }
      } catch (error) {
        await showError('Error de conexión', 'No se pudo conectar con el servidor')
      }
    }
  }

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Crown className="h-4 w-4 text-white" />
      case 'OPERATIVO':
        return <Shield className="h-4 w-4 text-white" />
      case 'SEGUIMIENTO':
        return <Activity className="h-4 w-4 text-white" />
      case 'INVITADO':
        return <User className="h-4 w-4 text-white" />
      default:
        return <User className="h-4 w-4 text-white" />
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'OPERATIVO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'SEGUIMIENTO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'INVITADO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">Administra los usuarios del sistema</p>
          </div>
          <Button 
            onClick={() => {
              setActiveView('usuarios'); // Cambiar a pestaña usuarios
              setShowCreateForm(!showCreateForm);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Sistema de navegación integrado con tarjetas */}
        <div className="space-y-6">
          {/* Navegación con tarjetas elegantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveView('usuarios')}
              className={`group relative p-6 rounded-xl transition-all duration-300 ${
                activeView === 'usuarios'
                  ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 border-2 border-blue-300 dark:border-blue-600 shadow-xl'
                  : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                  activeView === 'usuarios'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-blue-400 group-hover:to-blue-500'
                }`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    activeView === 'usuarios'
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    Usuarios
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    activeView === 'usuarios'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Gestión y administración
                  </p>
                </div>
              </div>
              {activeView === 'usuarios' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-xl"></div>
              )}
            </button>

            <button
              onClick={() => setActiveView('informes')}
              className={`group relative p-6 rounded-xl transition-all duration-300 ${
                activeView === 'informes'
                  ? 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 border-2 border-purple-300 dark:border-purple-600 shadow-xl'
                  : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                  activeView === 'informes'
                    ? 'bg-gradient-to-br from-purple-500 to-violet-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-purple-400 group-hover:to-purple-500'
                }`}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    activeView === 'informes'
                      ? 'text-purple-800 dark:text-purple-200'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                  }`}>
                    Informes
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    activeView === 'informes'
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Reportes y estadísticas
                  </p>
                </div>
              </div>
              {activeView === 'informes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-b-xl"></div>
              )}
            </button>

            <button
              onClick={() => setActiveView('auditoria')}
              className={`group relative p-6 rounded-xl transition-all duration-300 ${
                activeView === 'auditoria'
                  ? 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-2 border-emerald-300 dark:border-emerald-600 shadow-xl'
                  : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
                  activeView === 'auditoria'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-emerald-400 group-hover:to-emerald-500'
                }`}>
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    activeView === 'auditoria'
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                  }`}>
                    Auditoría
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    activeView === 'auditoria'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Seguridad y monitoreo
                  </p>
                </div>
              </div>
              {activeView === 'auditoria' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-b-xl"></div>
              )}
            </button>
          </div>

          {/* Contenido dinámico */}
          <div className="transition-all duration-500 ease-in-out">

        {activeView === 'usuarios' && (
          <>
            {/* Formulario de creación responsive */}
            {showCreateForm && (
              <Card className="mb-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-700 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent font-bold text-lg sm:text-xl">
                      Crear Nuevo Usuario
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                          value={formData.rol}
                          onValueChange={(value: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO') => 
                            setFormData({ ...formData, rol: value })
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
                    </div>

                    {(formData.rol === 'OPERATIVO' || formData.rol === 'ADMINISTRADOR' || formData.rol === 'SEGUIMIENTO') && (
                      <div>
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createLoading} className="w-full sm:w-auto">
                        {createLoading ? 'Creando...' : 'Crear Usuario'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de usuarios */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold text-lg sm:text-xl">
                    Usuarios del Sistema ({users.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
                    <p className="text-red-600 font-medium text-center">{error}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-lg text-slate-600">No hay usuarios registrados</p>
                  </div>
                ) : (
                  <>
                    {/* Vista desktop - tabla */}
                    <div className="hidden lg:block">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-600/60">
                              <th className="text-left font-semibold px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200">
                                Usuario
                              </th>
                              <th className="text-center font-semibold px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 min-w-[120px] text-slate-800 dark:text-slate-200">
                                Rol
                              </th>
                              <th className="text-center font-semibold px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 min-w-[100px] text-slate-800 dark:text-slate-200">
                                Estado
                              </th>
                              <th className="text-center font-semibold px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 min-w-[140px] text-slate-800 dark:text-slate-200">
                                Último Acceso
                              </th>
                              <th className="text-center font-semibold px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 min-w-[100px] text-slate-800 dark:text-slate-200">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id} className="border-b border-slate-100/60 dark:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-4 font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                      <div className={`p-2 rounded-lg shadow-sm ${
                                        user.rol === 'ADMINISTRADOR' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                                        user.rol === 'OPERATIVO' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                        user.rol === 'SEGUIMIENTO' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                                        'bg-gradient-to-br from-slate-400 to-slate-500'
                                      }`}>
                                        {getRoleIcon(user.rol)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-900">
                                        {user.nombre} {user.apellido}
                                      </div>
                                      <div className="text-sm text-slate-600">
                                        {user.email}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Creado: {new Date(user.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <Badge className={`${getRoleBadgeColor(user.rol)} shadow-sm`}>
                                    {user.rol}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  {user.activo ? (
                                    <div className="flex items-center justify-center">
                                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-sm">
                                        <UserCheck className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <div className="p-1 bg-gradient-to-br from-rose-500 to-red-600 rounded-full shadow-sm">
                                        <UserX className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center text-sm text-slate-700">
                                  {user.ultimoAcceso ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <Clock className="h-3 w-3 text-slate-500" />
                                      {new Date(user.ultimoAcceso).toLocaleDateString()}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">Nunca</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleUserStatus(user.id, user.activo, user.email)}
                                      className={`p-2 rounded-lg transition-all duration-200 ${
                                        user.activo 
                                          ? 'hover:bg-amber-50 text-amber-600 hover:text-amber-700' 
                                          : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                      }`}
                                      title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                    >
                                      {user.activo ? (
                                        <UserX className="h-4 w-4" />
                                      ) : (
                                        <UserCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-slate-100">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-slate-200/60">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem className="cursor-pointer">
                                          <Eye className="mr-2 h-4 w-4" />
                                          Ver detalles
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">
                                          <Edit className="mr-2 h-4 w-4" />
                                          Editar usuario
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleToggleUserStatus(user.id, user.activo, user.email)}
                                          className={`cursor-pointer ${user.activo ? 'text-amber-600 focus:text-amber-600' : 'text-emerald-600 focus:text-emerald-600'}`}
                                        >
                                          {user.activo ? (
                                            <>
                                              <UserX className="mr-2 h-4 w-4" />
                                              Desactivar
                                            </>
                                          ) : (
                                            <>
                                              <UserCheck className="mr-2 h-4 w-4" />
                                              Activar
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteUser(user.id, user.email)}
                                          className="text-red-600 focus:text-red-600 cursor-pointer"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Eliminar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Vista móvil y tablet - cards */}
                    <div className="lg:hidden space-y-3">
                      {users.map((user) => (
                        <Card key={user.id} className="bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex-shrink-0">
                                  <div className={`p-2 rounded-lg shadow-sm ${
                                    user.rol === 'ADMINISTRADOR' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                                    user.rol === 'OPERATIVO' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                    user.rol === 'SEGUIMIENTO' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                                    'bg-gradient-to-br from-slate-400 to-slate-500'
                                  }`}>
                                    {getRoleIcon(user.rol)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-slate-900 truncate">
                                    {user.nombre} {user.apellido}
                                  </div>
                                  <div className="text-sm text-slate-600 truncate">
                                    {user.email}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge className={`${getRoleBadgeColor(user.rol)} text-xs`}>
                                      {user.rol}
                                    </Badge>
                                    {user.activo ? (
                                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        Activo
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-xs text-red-600">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Inactivo
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {user.ultimoAcceso ? (
                                      <span>Último acceso: {new Date(user.ultimoAcceso).toLocaleDateString()}</span>
                                    ) : (
                                      <span>Sin acceso registrado</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user.id, user.activo, user.email)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    user.activo 
                                      ? 'hover:bg-amber-50 text-amber-600 hover:text-amber-700' 
                                      : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                  }`}
                                  title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                  {user.activo ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-slate-100">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-slate-200/60">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem className="cursor-pointer">
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar usuario
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleUserStatus(user.id, user.activo, user.email)}
                                      className={`cursor-pointer ${user.activo ? 'text-amber-600 focus:text-amber-600' : 'text-emerald-600 focus:text-emerald-600'}`}
                                    >
                                      {user.activo ? (
                                        <>
                                          <UserX className="mr-2 h-4 w-4" />
                                          Desactivar
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          Activar
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(user.id, user.email)}
                                      className="text-red-600 focus:text-red-600 cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Pestaña de Informes - Funcionalidad Completa */}
        {activeView === 'informes' && (
          <div className="space-y-6">
            {/* Estadísticas de Usuarios */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 via-violet-200/20 to-fuchsia-200/20 dark:from-purple-800/10 dark:via-violet-800/10 dark:to-fuchsia-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700 dark:from-purple-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-bold">
                    Estadísticas de Usuarios
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{users.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {users.filter(u => u.activo).length}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Activos</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {users.filter(u => u.rol === 'ADMINISTRADOR').length}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {users.filter(u => u.rol === 'OPERATIVO').length}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Operativos</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {users.filter(u => u.rol === 'SEGUIMIENTO').length}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Seguimiento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reportes y Exportación */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 via-teal-200/20 to-cyan-200/20 dark:from-emerald-800/10 dark:via-teal-800/10 dark:to-cyan-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                    Reportes y Exportación
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      const csvContent = [
                        ['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Último Acceso', 'Fecha Creación'],
                        ...users.map(user => [
                          user.id,
                          user.nombre,
                          user.apellido,
                          user.email,
                          user.rol,
                          user.activo ? 'Activo' : 'Inactivo',
                          user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleDateString() : 'Sin acceso',
                          new Date(user.createdAt).toLocaleDateString()
                        ])
                      ].map(row => row.join(',')).join('\n')
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
                      a.click()
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar a CSV
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const reportData = {
                        fecha: new Date().toLocaleDateString(),
                        totalUsuarios: users.length,
                        usuariosActivos: users.filter(u => u.activo).length,
                        distribución: {
                          administradores: users.filter(u => u.rol === 'ADMINISTRADOR').length,
                          operativos: users.filter(u => u.rol === 'OPERATIVO').length,
                          seguimiento: users.filter(u => u.rol === 'SEGUIMIENTO').length,
                          invitados: users.filter(u => u.rol === 'INVITADO').length
                        }
                      }
                      
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Reporte JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Actividad */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Análisis de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Usuarios Recientes</h4>
                      <p className="text-2xl font-bold text-blue-700">
                        {users.filter(u => {
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return new Date(u.createdAt) > weekAgo
                        }).length}
                      </p>
                      <p className="text-sm text-blue-600">Últimos 7 días</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Con Acceso Reciente</h4>
                      <p className="text-2xl font-bold text-green-700">
                        {users.filter(u => {
                          if (!u.ultimoAcceso) return false
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return new Date(u.ultimoAcceso) > weekAgo
                        }).length}
                      </p>
                      <p className="text-sm text-green-600">Últimos 7 días</p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-900">Sin Acceso</h4>
                      <p className="text-2xl font-bold text-red-700">
                        {users.filter(u => !u.ultimoAcceso).length}
                      </p>
                      <p className="text-sm text-red-600">Nunca han accedido</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'auditoria' && (
          <div className="space-y-6">
            {/* Resumen de Auditoría */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 via-teal-200/20 to-cyan-200/20 dark:from-emerald-800/10 dark:via-teal-800/10 dark:to-cyan-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent font-bold">
                    Auditoría de Seguridad
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-red-200/60 dark:border-red-800/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                          {users.filter(u => !u.activo).length}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">Usuarios Inactivos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-amber-200/60 dark:border-amber-800/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                          {users.filter(u => !u.ultimoAcceso).length}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Sin Acceso</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {users.filter(u => u.rol === 'ADMINISTRADOR' && u.activo).length}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Admins Activos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                          {users.filter(u => u.activo && u.ultimoAcceso).length}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Usuarios Seguros</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Log de Actividades */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-200/20 via-purple-200/20 to-fuchsia-200/20 dark:from-violet-800/10 dark:via-purple-800/10 dark:to-fuchsia-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-bold">
                    Registro de Actividades
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {users.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-sm ${
                          user.activo 
                            ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300'
                        }`}>
                          {user.activo ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user.nombre} {user.apellido}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.rol}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.ultimoAcceso 
                            ? `Último acceso: ${new Date(user.ultimoAcceso).toLocaleDateString()}`
                            : 'Sin acceso registrado'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Seguridad */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 via-amber-200/20 to-yellow-200/20 dark:from-orange-800/10 dark:via-amber-800/10 dark:to-yellow-800/10 rounded-full blur-3xl -z-10"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-700 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">
                    Alertas de Seguridad
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {users.filter(u => !u.activo).length > 0 && (
                    <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-red-200/60 dark:border-red-800/60 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100">Usuarios Inactivos</h4>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Hay {users.filter(u => !u.activo).length} usuarios inactivos que podrían necesitar revisión.
                      </p>
                    </div>
                  )}
                  
                  {users.filter(u => !u.ultimoAcceso).length > 0 && (
                    <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/60 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">Usuarios Sin Acceso</h4>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        {users.filter(u => !u.ultimoAcceso).length} usuarios nunca han accedido al sistema.
                      </p>
                    </div>
                  )}
                  
                  {users.filter(u => u.rol === 'ADMINISTRADOR').length > 3 && (
                    <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-blue-200/60 dark:border-blue-800/60 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Múltiples Administradores</h4>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Hay {users.filter(u => u.rol === 'ADMINISTRADOR').length} usuarios con rol de administrador. Considera revisar si todos necesitan este nivel de acceso.
                      </p>
                    </div>
                  )}
                  
                  {users.filter(u => !u.activo).length === 0 && users.filter(u => !u.ultimoAcceso).length === 0 && (
                    <div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                          <UserCheck className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Sistema Seguro</h4>
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        No se detectaron problemas de seguridad en la gestión de usuarios.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
