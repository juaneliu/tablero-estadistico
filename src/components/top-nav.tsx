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
    roles: ['OPERATIVO', 'ADMINISTRADOR']
  },
  {
    title: "Diagnósticos",
    href: "/dashboard/diagnosticos",
    icon: FileText,
    roles: ['OPERATIVO', 'ADMINISTRADOR']
  },
  {
    title: "Acuerdos",
    href: "/dashboard/acuerdos",
    icon: Calendar,
    roles: ['OPERATIVO', 'ADMINISTRADOR', 'SEGUIMIENTO']
  },
  {
    title: "Directorio",
    href: "/dashboard/directorio", 
    icon: Notebook,
    roles: ['OPERATIVO', 'ADMINISTRADOR']
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
    <div className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 glass-card border-b border-slate-200/50 header-gradient rounded-none">
      <nav className="h-full flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center">
          {/* Menú hamburguesa para móvil */}
          <div className="lg:hidden mr-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-9 md:w-9"
                >
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left">Navegación</SheetTitle>
                  <SheetDescription className="text-left">
                    Accede a las diferentes secciones
                  </SheetDescription>
                </SheetHeader>
                
                {/* User Info en móvil */}
                {user && (
                  <div className="p-4 border-b border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600">
                            {getInitials()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.nombre} {user.apellido}
                        </p>
                        <Badge className={`text-xs mt-1 ${getRoleBadgeColor(user.rol)}`}>
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
                <div className="flex-1 space-y-1 py-4 px-3">
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
                            ? "bg-slate-100/80 text-slate-900 border-l-4 border-slate-400 shadow-sm" 
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
                
                {/* Logout en móvil */}
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
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo y título */}
          <Link
            className="flex items-center text-slate-700 hover:text-slate-900 transition-colors"
            href="https://saem.gob.mx"
            target="_blank"
          >
            <div className="mr-2 md:mr-4 h-[20px] md:h-[28px] flex items-center">
              <Image
                src="/logo-saem.svg"
                alt="SAEM"
                width={80}
                height={20}
                className="md:w-[100px] md:h-[28px] opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide hidden sm:block">
              Plataforma Digital Estatal
            </span>
            <span className="text-xs font-medium tracking-wide sm:hidden">
              SAEM
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-100/80 border border-slate-200/60 hover:bg-slate-200/80 hover:border-slate-300/60 transition-all"
                  variant="ghost"
                  size="icon"
                >
                  <span className="flex h-full w-full items-center justify-center text-slate-600 text-xs font-medium">
                    {getInitials()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {user.nombre} {user.apellido}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getRoleBadgeColor(user.rol)}`}>
                        <span className="flex items-center space-x-1">
                          {getRoleIcon(user.rol)}
                          <span>{user.rol}</span>
                        </span>
                      </Badge>
                    </div>
                    {user.ultimoAcceso && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
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
                
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                
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
              className="h-7 px-3 md:h-8 md:px-4 bg-slate-100/80 border border-slate-200/60 hover:bg-slate-200/80 hover:border-slate-300/60 transition-all text-slate-700 hover:text-slate-900"
              variant="ghost"
              size="sm"
            >
              <span className="text-xs font-medium">Ingresar</span>
            </Button>
          )}
          
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  )
}
