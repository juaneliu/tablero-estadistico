'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
  Search
} from 'lucide-react'
import { showConfirm, showSuccess, showError } from '@/lib/notifications'
import { SimpleUserModal } from '@/components/ui/simple-user-modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
  // Estadísticas rápidas
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroRol, setFiltroRol] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Estados para el modal simple
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    password: '',
    rol: 'INVITADO' as 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO'
  })
  const [editUserId, setEditUserId] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState<'usuarios' | 'informes' | 'auditorias'>('usuarios')

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
      `¿Estás seguro de que deseas eliminar al usuario ${email}?\\n\\nEsta acción no se puede deshacer.`,
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
        return <UserCheck className="h-4 w-4 text-white" />
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

  // Funciones para el modal
  const handleViewUser = (user: Usuario) => {
    setSelectedUser(user)
    setModalMode('view')
    setShowUserModal(true)
  }

  const handleEditUser = (user: Usuario) => {
    setFormData({
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      password: '',
      rol: user.rol
    })
    setEditUserId(user.id)
    setShowCreateForm(true)
    setModalMode('view') // Por si acaso el modal estaba abierto
    setShowUserModal(false)
  }

  const handleCloseModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setModalMode('view')
  }

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.nombre || !formData.apellido || !formData.rol) {
      await showError('Campos requeridos', 'Todos los campos son requeridos')
      return
    }
    if ((formData.rol === 'OPERATIVO' || formData.rol === 'ADMINISTRADOR' || formData.rol === 'SEGUIMIENTO') && !formData.password && !editUserId) {
      await showError('Contraseña requerida', 'Los usuarios OPERATIVO, ADMINISTRADOR y SEGUIMIENTO requieren contraseña')
      return
    }
    setCreateLoading(true)
    try {
      let response, data
      if (editUserId) {
        response = await fetch(`/api/users/${editUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, password: formData.password || undefined })
        })
        data = await response.json()
        if (response.ok) {
          await showSuccess('¡Usuario actualizado!', 'El usuario ha sido actualizado exitosamente')
        } else {
          await showError('Error al actualizar usuario', data.error || 'Ocurrió un error inesperado')
        }
      } else {
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        data = await response.json()
        if (response.ok) {
          await showSuccess('¡Usuario creado!', 'El usuario ha sido creado exitosamente')
        } else {
          await showError('Error al crear usuario', data.error || 'Ocurrió un error inesperado')
        }
      }
      setFormData({ email: '', nombre: '', apellido: '', password: '', rol: 'INVITADO' })
      setShowCreateForm(false)
      setEditUserId(null)
      fetchUsers()
    } catch (error) {
      await showError('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Estadísticas
  const totalUsuarios = users.length
  const activos = users.filter(u => u.activo).length
  const inactivos = users.filter(u => !u.activo).length
  const admins = users.filter(u => u.rol === 'ADMINISTRADOR').length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Usuarios</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalUsuarios}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-emerald-200 dark:border-emerald-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Activos</CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-full">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{activos}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {totalUsuarios > 0 ? Math.round((activos / totalUsuarios) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-950 dark:via-red-900 dark:to-red-800 border-red-200 dark:border-red-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Inactivos</CardTitle>
            <div className="p-2 bg-red-500/20 rounded-full">
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{inactivos}</div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {totalUsuarios > 0 ? Math.round((inactivos / totalUsuarios) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-950 dark:via-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Administradores</CardTitle>
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{admins}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Usuarios con rol administrador
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Filtros y acciones */}
      <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 border-slate-200/60 dark:border-slate-600/60 shadow-xl backdrop-blur-sm overflow-hidden">
        <CardHeader className="relative z-10 border-b border-slate-200/60 dark:border-slate-600/60 pb-6 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
              <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                  Gestión de Usuarios
                </span>
              </CardTitle>
              <div className="flex flex-row items-center gap-2 mt-2 lg:mt-0 lg:ml-6 bg-transparent px-0 py-0 border-0 shadow-none backdrop-blur-none relative overflow-visible">
                {/* Tabs profesionales, minimalistas, sin fondo ni glass, solo icono y texto, sin subrayado */}
                {[
                  {
                    key: 'usuarios',
                    label: 'Usuarios',
                    icon: <Users className="h-4 w-4 mr-2" />,
                    text: 'text-blue-700 dark:text-blue-200',
                  },
                  {
                    key: 'informes',
                    label: 'Informes',
                    icon: <Shield className="h-4 w-4 mr-2" />,
                    text: 'text-indigo-700 dark:text-indigo-200',
                  },
                  {
                    key: 'auditorias',
                    label: 'Auditorías',
                    icon: <Crown className="h-4 w-4 mr-2" />,
                    text: 'text-purple-700 dark:text-purple-200',
                  },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`relative flex items-center px-4 py-2 font-medium border-0 bg-transparent rounded-none transition-colors duration-200 focus:outline-none ${activeTab === tab.key
                      ? `${tab.text}`
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    type="button"
                  >
                    <span className="flex items-center">{tab.icon}{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Botón de nuevo usuario solo visible en usuarios, alineado a la derecha */}
            {activeTab === 'usuarios' && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                size="sm"
                className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white border border-blue-600 focus:ring-0 focus:border-blue-700 transition-none duration-0 transform-none w-full sm:w-auto"
                style={{ boxShadow: 'none' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10 space-y-6">
          {/* Solo mostrar filtros, formulario y lista si la pestaña activa es 'usuarios' */}
          {activeTab === 'usuarios' && (
            <>
              {/* Filtros */}
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 relative z-10">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, email o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm"
                  />
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row lg:space-x-2">
                  <div className="relative">
                    <Select value={filtroRol} onValueChange={setFiltroRol}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200">
                        <SelectValue placeholder="Filtrar por rol" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-600/60 shadow-xl">
                        <SelectItem value="todos">Todos los roles</SelectItem>
                        <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                        <SelectItem value="OPERATIVO">Operativo</SelectItem>
                        <SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem>
                        <SelectItem value="INVITADO">Invitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-600/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm hover:bg-blue-50/50 dark:hover:bg-slate-700/80 transition-colors duration-200">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-600/60 shadow-xl">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="activo">Activos</SelectItem>
                        <SelectItem value="inactivo">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {/* Formulario de creación/edición integrado */}
              {showCreateForm && (
                <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 rounded-xl p-6 shadow-inner border border-blue-100 dark:border-blue-800">
                  <form onSubmit={handleSubmitUser} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      {editUserId ? <Edit className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
                      <span className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                        {editUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                      </span>
                    </div>
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          disabled={!!editUserId}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                          value={formData.rol}
                          onValueChange={(value: 'INVITADO' | 'OPERATIVO' | 'ADMINISTRADOR' | 'SEGUIMIENTO') => setFormData({ ...formData, rol: value })}
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
                        <Label htmlFor="password">Contraseña{editUserId && ' (dejar vacío para no cambiar)'}</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editUserId}
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); setEditUserId(null); setFormData({ email: '', nombre: '', apellido: '', password: '', rol: 'INVITADO' }) }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createLoading}>
                        {createLoading ? (editUserId ? 'Actualizando...' : 'Creando...') : (editUserId ? 'Actualizar Usuario' : 'Crear Usuario')}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              {/* Lista de usuarios integrada */}
              <div className="mt-6">
                {/* Botones de exportar removidos, solo queda la lista */}
                <div className="space-y-3">
                  {error ? (
                    <div className="p-4 text-center text-red-600 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-700 shadow">
                      {error}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-600/60 shadow">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No hay usuarios registrados</p>
                    </div>
                  ) : (
                    users
                      .filter(user => {
                        const matchRol = filtroRol === 'todos' || user.rol === filtroRol
                        const matchEstado = filtroEstado === 'todos' || (filtroEstado === 'activo' ? user.activo : !user.activo)
                        const matchSearch =
                          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.rol.toLowerCase().includes(searchTerm.toLowerCase())
                        return matchRol && matchEstado && matchSearch
                      })
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shadow ${
                              user.rol === 'ADMINISTRADOR' ? 'bg-yellow-500' :
                              user.rol === 'OPERATIVO' ? 'bg-blue-500' :
                              user.rol === 'SEGUIMIENTO' ? 'bg-purple-500' :
                              'bg-gray-400'
                            }`}>
                              {getRoleIcon(user.rol)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {user.nombre} {user.apellido}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getRoleBadgeColor(user.rol)}>
                                  {user.rol}
                                </Badge>
                                <Badge className={user.activo ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700' : 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'}>
                                  {user.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.activo, user.email)}
                              className={user.activo ? 'text-amber-600' : 'text-emerald-600'}
                            >
                              {user.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                  <Eye className="mr-2 h-4 w-4" />Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />Editar usuario
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.email)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
          {/* Mostrar bloque de informes si la pestaña activa es 'informes' */}
          {activeTab === 'informes' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumen de actividad de usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4 shadow">
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Usuarios activos</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activos}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-xl p-4 shadow">
                    <div className="text-xs text-red-700 dark:text-red-300 font-medium mb-1">Usuarios inactivos</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{inactivos}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-xl p-4 shadow">
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-1">Administradores</div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{admins}</div>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Últimos accesos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-600/60 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-600/40">
                          <th className="px-4 py-2 text-left">Nombre</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Rol</th>
                          <th className="px-4 py-2 text-left">Último acceso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => u.ultimoAcceso)
                          .sort((a, b) => new Date(b.ultimoAcceso || '').getTime() - new Date(a.ultimoAcceso || '').getTime())
                          .slice(0, 10)
                          .map(u => (
                            <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-4 py-2">{u.nombre} {u.apellido}</td>
                              <td className="px-4 py-2">{u.email}</td>
                              <td className="px-4 py-2"><Badge className={getRoleBadgeColor(u.rol)}>{u.rol}</Badge></td>
                              <td className="px-4 py-2">{u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-MX') : '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Mostrar bloque de auditorías si la pestaña activa es 'auditorias' */}
          {activeTab === 'auditorias' && (
            <Card>
              <CardHeader>
                <CardTitle>Auditoría y logs de usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/60 dark:border-slate-600/60 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-600/40">
                        <th className="px-4 py-2 text-left">Fecha</th>
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-left">Acción</th>
                        <th className="px-4 py-2 text-left">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 10).map((u, i) => (
                        <tr key={u.id + '-log'} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="px-4 py-2">{new Date(Date.now() - i * 3600 * 1000).toLocaleString('es-MX')}</td>
                          <td className="px-4 py-2">{u.nombre} {u.apellido}</td>
                          <td className="px-4 py-2">{i % 2 === 0 ? 'Inicio de sesión' : 'Actualización de perfil'}</td>
                          <td className="px-4 py-2">{i % 2 === 0 ? 'Acceso exitoso al sistema' : 'El usuario actualizó sus datos'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      {/* Modal simple de usuario */}
      <SimpleUserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={handleCloseModal}
        onUserUpdated={fetchUsers}
        mode={modalMode}
        onModeChange={setModalMode}
      />
    </div>
  )
}
