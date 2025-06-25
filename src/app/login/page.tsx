'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, Mail, Shield, Building } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  console.log('LoginPage rendered')
  
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    console.log('handleLogin called', { email, password: '***' })
    
    if (!email.trim()) {
      setError('El email es requerido')
      return
    }

    if (!password.trim()) {
      setError('La contraseña es requerida')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Attempting login...')
      await login(email, password)
      console.log('Login successful, redirecting...')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('Enter key pressed')
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-200/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-200/25 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-300/20 via-transparent to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300/40 via-slate-300/40 to-gray-400/40 rounded-full blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-gray-200/60 shadow-lg">
                  <Image
                    src="/img/logo.png"
                    alt="Logo del Sistema"
                    width={120}
                    height={60}
                    className="mx-auto"
                    priority
                  />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-slate-700 bg-clip-text text-transparent">
                Tablero Estadístico
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Sistema de Gestión Gubernamental
            </p>
          </div>
          
          <Card className="bg-white/98 backdrop-blur-md shadow-xl border-gray-200/80 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/30 via-slate-100/30 to-gray-200/30 rounded-full blur-3xl -z-10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-center text-2xl font-bold text-slate-800">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center text-slate-600">Ingresa tus credenciales para acceder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10" onKeyPress={handleKeyPress}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="email@ejemplo.com"
                  disabled={loading}
                  className="h-12 bg-white/90 backdrop-blur-sm border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-600" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    disabled={loading}
                    className="h-12 bg-white/90 backdrop-blur-sm border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-all duration-300 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Button clicked!')
                  handleLogin()
                }}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
              
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block border border-gray-200/60 shadow-sm">
              © 2025 Sistema de Tablero Estadístico
            </p>
            <p className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-1">
              <Building className="h-3 w-3" />
              Plataforma Digital Estatal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
