"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Notebook, LogOut, UserCircle, FileText, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const items: NavItem[] = [
  {
    title: "Plataforma SAEM",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Entes Públicos", 
    href: "/dashboard/entes",
    icon: Users,
  },
  {
    title: "Directorio",
    href: "/dashboard/directorio", 
    icon: Notebook,
  },
  {
    title: "Diagnósticos Municipios",
    href: "/dashboard/diagnosticos",
    icon: FileText,
  },
  {
    title: "Acuerdos y Seguimientos",
    href: "/dashboard/acuerdos",
    icon: Calendar,
  },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasPermission } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getAvatarColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg'
      case 'OPERATIVO':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
      case 'SEGUIMIENTO':
        return 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'
      case 'INVITADO':
        return 'bg-gradient-to-br from-gray-500 to-slate-600 shadow-lg'
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'text-yellow-700 dark:text-yellow-300 font-semibold'
      case 'OPERATIVO':
        return 'text-blue-700 dark:text-blue-300 font-semibold'
      case 'SEGUIMIENTO':
        return 'text-purple-700 dark:text-purple-300 font-semibold'
      case 'INVITADO':
        return 'text-gray-700 dark:text-gray-300 font-semibold'
      default:
        return 'text-gray-700 dark:text-gray-300 font-semibold'
    }
  }

  // Filtrar elementos de navegación basado en permisos
  const getFilteredItems = () => {
    if (!user) {
      // Usuario no autenticado - solo mostrar Plataforma SAEM
      return [
        {
          title: "Plataforma SAEM",
          href: "/dashboard",
          icon: LayoutDashboard,
        }
      ]
    }
    
    const allowedItems = [
      {
        title: "Plataforma SAEM",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']
      },
      {
        title: "Entes Públicos", 
        href: "/dashboard/entes",
        icon: Users,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Directorio",
        href: "/dashboard/directorio", 
        icon: Notebook,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Diagnósticos Municipios",
        href: "/dashboard/diagnosticos",
        icon: FileText,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Acuerdos y Seguimientos",
        href: "/dashboard/acuerdos",
        icon: Calendar,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']
      },
      {
        title: "Usuarios",
        href: "/dashboard/users", 
        icon: UserCircle,
        roles: ['ADMINISTRADOR']
      },
    ]

    return allowedItems.filter(item => hasPermission(item.roles))
  }

  const filteredItems = getFilteredItems()

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-700/60 z-40 hidden lg:block shadow-lg">
      <div className="flex flex-col h-full">
        {/* User Info */}
        {user && user.rol !== 'INVITADO' && (
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-700/60">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(user.rol)}`}>
                  <span className="text-sm font-bold text-white">
                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className={`text-xs truncate ${getRoleBadgeColor(user.rol)}`}>
                  {user.rol}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-1 py-6 px-3 bg-gradient-to-b from-white/40 to-slate-50/40 dark:from-slate-800/40 dark:to-slate-700/40">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500 shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/60 dark:hover:from-slate-700/60 dark:hover:to-slate-600/60"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )} />
                <span className="tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Solo mostrar botón de cerrar sesión si hay usuario autenticado y no es INVITADO */}
        {user && user.rol !== 'INVITADO' && (
          <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-3 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-700/60">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50/60 hover:to-red-50/40 dark:hover:from-red-900/20 dark:hover:to-red-900/10 group transition-colors duration-300 ease-out border border-transparent hover:border-red-100/50 dark:hover:border-red-800/50"
            >
              <LogOut className="mr-3 h-4 w-4 flex-shrink-0 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
              <span className="tracking-wide whitespace-nowrap group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Cerrar Sesión</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
