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
    title: "Tablero Estatal",
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

  // Filtrar elementos de navegación basado en permisos
  const getFilteredItems = () => {
    if (!user) {
      // Usuario no autenticado - solo mostrar Tablero Estatal
      return [
        {
          title: "Tablero Estatal",
          href: "/dashboard",
          icon: LayoutDashboard,
        }
      ]
    }
    
    const allowedItems = [
      {
        title: "Tablero Estatal",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Entes Públicos", 
        href: "/dashboard/entes",
        icon: Users,
        roles: ['OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Directorio",
        href: "/dashboard/directorio", 
        icon: Notebook,
        roles: ['OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Diagnósticos Municipios",
        href: "/dashboard/diagnosticos",
        icon: FileText,
        roles: ['OPERATIVO', 'ADMINISTRADOR']
      },
      {
        title: "Acuerdos y Seguimientos",
        href: "/dashboard/acuerdos",
        icon: Calendar,
        roles: ['OPERATIVO', 'ADMINISTRADOR']
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
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-card border-r border-slate-200/50 z-40 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <UserCircle className="h-8 w-8 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.rol}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-1 py-6 px-3">
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
                    ? "bg-slate-100/80 text-slate-900 border-l-3 border-slate-400 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/60"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-4 w-4 transition-colors",
                  isActive ? "text-slate-700" : "text-slate-500 group-hover:text-slate-700"
                )} />
                <span className="tracking-wide">{item.title}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Solo mostrar botón de cerrar sesión si hay usuario autenticado */}
        {user && (
          <div className="border-t border-slate-200/50 p-3">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-500 hover:text-slate-700 hover:bg-slate-50/60"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="tracking-wide">Cerrar Sesión</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
