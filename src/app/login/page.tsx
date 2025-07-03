'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, EyeOff, Users, CheckCircle, BarChart3, AlertCircle, Lock, TrendingUp, Activity, FileText, Building2, Clock, Target, Zap, Monitor } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Acceso autorizado' })
        
        // Esperar un poco para mostrar el mensaje
        setTimeout(() => {
          // Forzar una navegación limpia al dashboard
          window.location.href = '/dashboard'
        }, 1200)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error de autenticación' })
      }
    } catch (error) {
      console.error('Error en login:', error)
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Importar fuente Abel */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Abel&display=swap" 
        rel="preload" 
        as="style" 
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Abel&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col">
        {/* Imagen de fondo más visible */}
        <div className="absolute inset-0">
          <Image
            src="/img/cuernavaca_atardecer.jpg"
            alt="Cuernavaca Atardecer"
            fill
            className="object-cover opacity-25 dark:opacity-15"
            priority
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
          {/* Panel izquierdo - Contenido principal */}
          <div className="w-full lg:w-[70%] flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-16 xl:p-20">
            <div className="max-w-4xl mx-auto lg:mx-0">
              {/* Branding - Imagotipo horizontal */}
              <div className="mb-6 sm:mb-8 md:mb-12 text-center lg:text-left">
                <Image
                  src="/img/imagotipo-horizontal-envolvente.png"
                  alt="Sistema Anticorrupción del Estado de Morelos"
                  width={400}
                  height={120}
                  className="object-contain drop-shadow-lg filter mx-auto lg:mx-0 max-w-[280px] sm:max-w-[320px] md:max-w-[400px]"
                />
              </div>

              {/* Título principal */}
              <div className="mb-6 sm:mb-8 md:mb-12 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 md:mb-6 leading-tight">
                  Plataforma de<br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Seguimiento y Control
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Herramienta pública para medir avances, asegurar cumplimiento y fortalecer la transparencia en el estado de Morelos.
                </p>
              </div>

              {/* Métricas destacadas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">154+</div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Entes Públicos</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Bajo seguimiento</div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">36</div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Municipios</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Conectados</div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">24/7</div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Monitoreo</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Tiempo real</div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">100%</div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Seguimiento</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Efectividad</div>
                </div>
              </div>

              {/* Funcionalidades principales - Todas en una fila */}
              <div className="space-y-3 hidden lg:block">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Funcionalidades principales</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/30 dark:border-slate-700/30">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">Análisis en tiempo real</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Métricas y tendencias actualizadas</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/30 dark:border-slate-700/30">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">Diagnósticos</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Evaluación y análisis integral</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/30 dark:border-slate-700/30">
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">Gestión digital</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Documentos y acuerdos centralizados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className="w-full lg:w-[30%] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-200/30 dark:border-slate-700/30">
            <div className="w-full max-w-sm">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
                <CardHeader className="text-center p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl border border-blue-200/20 dark:border-blue-700/20">
                      <Image
                        src="/img/variante-saem-efecto.png"
                        alt="Logo SAEM Efecto"
                        width={32}
                        height={32}
                        className="object-contain sm:w-10 sm:h-10"
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Acceso Seguro
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Ingresa tus credenciales para continuar
                  </p>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0">
                  {message && (
                    <div className={`p-3 rounded-xl mb-4 flex items-center gap-2 ${
                      message.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200' 
                        : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {message.type === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-sm">{message.text}</span>
                        {message.type === 'success' && (
                          <div className="text-xs mt-1 opacity-80">Redirigiendo...</div>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Correo electrónico
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 pl-9 text-sm bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                          placeholder="usuario@saem.gob.mx"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10 pl-9 pr-9 text-sm bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Iniciando sesión...
                        </div>
                      ) : (
                        'Acceder al Sistema'
                      )}
                    </Button>
                  </form>

                  <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistema Anticorrupción del Estado de Morelos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Pie de página con copyright */}
        <footer className="relative z-10 py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 border-t border-slate-200/30 dark:border-slate-700/30 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              © 2025 Unidad de Servicios Tecnológicos - SAEM. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
