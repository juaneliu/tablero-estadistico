'use client'

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Crown,
  UserCircle,
  Clock,
  Menu,
  LayoutDashboard,
  Users,
  Notebook,
  FileText,
  Calendar,
  Activity
} from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
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
    title: "Diagnósticos",
    href: "/dashboard/diagnosticos",
    icon: FileText,
    roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
  },
  {
    title: "Acuerdos",
    href: "/dashboard/acuerdos",
    icon: Calendar,
    roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']
  },
  {
    title: "Directorio",
    href: "/dashboard/directorio", 
    icon: Notebook,
    roles: ['INVITADO', 'OPERATIVO', 'ADMINISTRADOR']
  },
  {
    title: "Usuarios",
    href: "/dashboard/users", 
    icon: UserCircle,
    roles: ['ADMINISTRADOR']
  },
]

export function TopNav() {
  const { user, logout, hasPermission } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    setIsOpen(false)
  }

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Crown className="h-3 w-3" />
      case 'OPERATIVO':
        return <Shield className="h-3 w-3" />
      case 'SEGUIMIENTO':
        return <Activity className="h-3 w-3" />
      case 'INVITADO':
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/50 dark:to-amber-900/50 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700/50'
      case 'OPERATIVO':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50'
      case 'SEGUIMIENTO':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 dark:from-purple-900/50 dark:to-violet-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50'
      case 'INVITADO':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/50 dark:to-slate-900/50 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50'
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
    }
  }

  const getAvatarColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg border border-yellow-400/60 hover:from-yellow-600 hover:to-amber-700 hover:border-yellow-500/80'
      case 'OPERATIVO':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border border-blue-400/60 hover:from-blue-600 hover:to-indigo-700 hover:border-blue-500/80'
      case 'SEGUIMIENTO':
        return 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg border border-purple-400/60 hover:from-purple-600 hover:to-violet-700 hover:border-purple-500/80'
      case 'INVITADO':
        return 'bg-gradient-to-br from-gray-500 to-slate-600 shadow-lg border border-gray-400/60 hover:from-gray-600 hover:to-slate-700 hover:border-gray-500/80'
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border border-blue-400/60 hover:from-blue-600 hover:to-indigo-700 hover:border-blue-500/80'
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
  }

  const getFilteredItems = () => {
    if (!user) {
      return [navItems[0]] // Solo plataforma SAEM
    }
    return navItems.filter(item => hasPermission(item.roles))
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-white/80 via-blue-50/70 to-indigo-50/60 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-indigo-950/60 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg rounded-none">
      <nav className="h-full flex items-center justify-between px-2 sm:px-3 md:px-6">
        <div className="flex items-center">
          {/* Menú hamburguesa para móvil */}
          <div className="lg:hidden mr-1 sm:mr-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                >
                  <Menu className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-700/60">
                <SheetHeader className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80">
                  <SheetTitle className="text-left text-slate-800 dark:text-slate-100 font-semibold">Menú</SheetTitle>
                  <SheetDescription className="text-left text-slate-600 dark:text-slate-400">
                    Accede a las diferentes secciones
                  </SheetDescription>
                </SheetHeader>
                
                {/* User Info en móvil */}
                {user && user.rol !== 'INVITADO' && (
                  <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getAvatarColor(user.rol).replace('hover:', '').replace('border', '').trim()}`}>
                          <span className="text-xs font-medium text-white">
                            {getInitials()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {user.nombre} {user.apellido}
                        </p>
                        <Badge className={`text-xs mt-1 ${getRoleBadgeColor(user.rol)} shadow-sm`}>
                          <span className="flex items-center space-x-1">
                            {getRoleIcon(user.rol)}
                            <span>{user.rol}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navegación móvil */}
                <div className="flex-1 space-y-1 py-4 px-3 bg-gradient-to-b from-white/40 to-slate-50/40 dark:from-slate-800/40 dark:to-slate-700/40">
                  {filteredItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 w-full",
                          isActive 
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500 shadow-sm" 
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/60 dark:hover:from-slate-700/60 dark:hover:to-slate-600/60"
                        )}
                      >
                        <Icon className={cn(
                          "mr-3 h-4 w-4 transition-colors",
                          isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                        )} />
                        <span className="tracking-wide">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
                
                {/* Logout en móvil */}
                {user && user.rol !== 'INVITADO' && (
                  <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-3 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-700/60">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50/60 hover:to-red-50/40 dark:hover:from-red-900/20 dark:hover:to-red-900/10 group transition-colors duration-300 ease-out border border-transparent hover:border-red-100/50 dark:hover:border-red-800/50"
                    >
                      <LogOut className="mr-3 h-4 w-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
                      <span className="tracking-wide group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Cerrar Sesión</span>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo y título */}
          <Link
            className="flex items-center text-slate-700 hover:text-slate-900 transition-colors"
            href="/"
          >
            <div className="mr-1 sm:mr-2 md:mr-4 h-[16px] sm:h-[20px] md:h-[28px] flex items-center">
              <Image
                src="/logo-saem.svg"
                alt="SAEM"
                width={80}
                height={20}
                className="w-[60px] h-[16px] sm:w-[80px] sm:h-[20px] md:w-[100px] md:h-[28px] opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm font-medium tracking-wide hidden md:block">
              Plataforma de Seguimiento, Ejecución y Evaluación del Sistema Anticorrupción del Estado de Morelos
            </span>
            <span className="text-[10px] sm:text-xs font-medium tracking-wide hidden sm:block md:hidden">
              Plataforma SAEM
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {user && user.rol !== 'INVITADO' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full transition-all ${getAvatarColor(user?.rol || '')}`}
                  variant="ghost"
                  size="icon"
                >
                  <span className="flex h-full w-full items-center justify-center text-white text-[10px] sm:text-xs font-medium">
                    {getInitials()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/60 dark:border-slate-700/60">
                <DropdownMenuLabel className="font-normal bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-700/60 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${getAvatarColor(user.rol).replace('hover:', '').replace('border', '').replace('shadow-lg', 'shadow-sm').trim()}`}>
                        <span className="text-[8px] font-medium text-white">
                          {getInitials()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.nombre} {user.apellido}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getRoleBadgeColor(user.rol)} shadow-sm`}>
                        <span className="flex items-center space-x-1">
                          {getRoleIcon(user.rol)}
                          <span>{user.rol}</span>
                        </span>
                      </Badge>
                    </div>
                    {user.ultimoAcceso && (
                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          Último acceso: {user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Sin registro'}
                        </span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {user.rol === 'ADMINISTRADOR' && (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/users')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Gestión de Usuarios</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              className="h-6 px-2 sm:h-7 sm:px-3 md:h-8 md:px-4 bg-slate-100/80 border border-slate-200/60 hover:bg-slate-200/80 hover:border-slate-300/60 transition-all text-slate-700 hover:text-slate-900"
              variant="ghost"
              size="sm"
            >
              <span className="text-[10px] sm:text-xs font-medium">Ingresar</span>
            </Button>
          )}
          
          {/* <div className="hidden md:block">
            <ThemeToggle />
          </div> */}
        </div>
      </nav>
    </div>
  )
}
