"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function MapaBasico() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Inicializando...')

  useEffect(() => {
    let root: any = null;
    let isDestroyed = false;

    const createMap = async () => {
      try {
        setStatus('Verificando contenedor...')
        if (!chartRef.current || isDestroyed) {
          return;
        }

        // IMPORTANTE: Limpiar cualquier instancia previa de AmCharts
        if (chartRef.current.children.length > 0) {
          console.log('🧹 Limpiando contenedor previo...');
          chartRef.current.innerHTML = '';
        }

        setStatus('Cargando librerías AmCharts...')
        
        // Función para cargar scripts con timeout
        const loadScriptPromise = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (document.querySelector(`script[src="${src}"]`)) {
              console.log(`✅ Script ya cargado: ${src}`)
              resolve()
              return
            }

            const script = document.createElement('script')
            script.src = src
            script.async = false // Cargar en orden
            
            // Timeout de 10 segundos
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout cargando ${src}`))
            }, 10000)
            
            script.onload = () => {
              clearTimeout(timeout)
              console.log(`✅ Cargado exitosamente: ${src}`)
              resolve()
            }
            
            script.onerror = (error) => {
              clearTimeout(timeout)
              console.error(`❌ Error cargando: ${src}`, error)
              reject(new Error(`Error cargando ${src}`))
            }
            
            document.head.appendChild(script)
          })
        }

        // Cargar scripts secuencialmente con pausa entre cada uno
        const scripts = [
          '/lib/mapa/index.js',
          '/lib/mapa/map.js',
          '/lib/mapa/themes/Animated.js',
          '/lib/mapa/geodata/region/mexico/morLow.js'
        ]

        for (const src of scripts) {
          if (isDestroyed) return;
          console.log(`📦 Cargando ${src}...`)
          await loadScriptPromise(src)
          // Pausa entre scripts
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        if (isDestroyed) return;

        // Pausa adicional para inicialización
        console.log('⏳ Esperando inicialización completa...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (isDestroyed) return;

        setStatus('Verificando disponibilidad de librerías...')
        
        // Verificación detallada
        const libCheck = {
          am5: typeof window.am5,
          am5map: typeof window.am5map,
          am5themes: typeof window.am5themes_Animated,
          geodata: typeof window.am5geodata_region_mexico_morLow
        }

        console.log('🔍 Estado de librerías:', libCheck)

        if (libCheck.am5 === 'undefined') {
          throw new Error('am5 core no está disponible')
        }
        if (libCheck.am5map === 'undefined') {
          throw new Error('am5map no está disponible')
        }
        if (libCheck.geodata === 'undefined') {
          throw new Error('geodata no está disponible')
        }

        // Verificar geodata específicamente
        const geodata = window.am5geodata_region_mexico_morLow
        if (!geodata || !geodata.features || !Array.isArray(geodata.features)) {
          throw new Error('Geodata tiene formato inválido')
        }

        console.log(`✅ Geodata válido: ${geodata.features.length} municipios`)
        
        if (isDestroyed) return;

        setStatus('Creando mapa...')
        
        // Verificar nuevamente que el contenedor esté disponible
        if (!chartRef.current || isDestroyed) {
          console.log('⚠️ Contenedor no disponible al crear mapa');
          return;
        }

        // Limpiar contenedor una vez más antes de crear el root
        chartRef.current.innerHTML = '';

        // Crear el root de AmCharts con verificación adicional
        try {
          root = window.am5.Root.new(chartRef.current)
          console.log('✅ Root creado exitosamente')
        } catch (error) {
          throw new Error(`Error creando Root: ${error instanceof Error ? error.message : 'Unknown'}`)
        }

        if (isDestroyed) {
          if (root) {
            root.dispose();
          }
          return;
        }

        // Aplicar tema si está disponible
        try {
          if (window.am5themes_Animated) {
            root.setThemes([window.am5themes_Animated.new(root)])
            console.log('🎨 Tema aplicado')
          }
        } catch (error) {
          console.warn('Error aplicando tema:', error)
        }

        // Crear el chart del mapa
        let chart: any
        try {
          chart = root.container.children.push(
            window.am5map.MapChart.new(root, {
              panX: "translateX",
              panY: "translateY",
              projection: window.am5map.geoMercator(),
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 10,
              paddingRight: 10
            })
          )
          console.log('✅ Chart creado exitosamente')
        } catch (error) {
          throw new Error(`Error creando Chart: ${error instanceof Error ? error.message : 'Unknown'}`)
        }

        if (isDestroyed) {
          if (root) {
            root.dispose();
          }
          return;
        }

        // Crear serie de polígonos
        let polygonSeries: any
        try {
          polygonSeries = chart.series.push(
            window.am5map.MapPolygonSeries.new(root, {
              geoJSON: geodata
            })
          )
          console.log('✅ Serie de polígonos creada exitosamente')
        } catch (error) {
          throw new Error(`Error creando serie: ${error instanceof Error ? error.message : 'Unknown'}`)
        }

        // Configurar apariencia
        try {
          polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}",
            fill: window.am5.color("#e5e7eb"),
            stroke: window.am5.color("#64748b"),
            strokeWidth: 1
          })

          // Efecto hover
          polygonSeries.mapPolygons.template.states.create("hover", {
            fill: window.am5.color("#3b82f6")
          })

          console.log('✅ Configuración aplicada exitosamente')
        } catch (error) {
          console.warn('Error aplicando configuración:', error)
        }

        // Centrar el mapa
        try {
          chart.goHome()
          console.log('🎯 Mapa centrado')
        } catch (error) {
          console.warn('Error centrando mapa:', error)
        }

        if (!isDestroyed) {
          setStatus('Mapa creado exitosamente')
          setLoading(false)
          console.log('🎉 Mapa completamente inicializado')
        }

      } catch (err) {
        if (!isDestroyed) {
          console.error('❌ Error crítico creando mapa:', err)
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
          setError(errorMessage)
          setLoading(false)
          
          // Log estado de debugging
          console.log('🔍 Estado de window al fallar:')
          console.log('- am5:', typeof window.am5)
          console.log('- am5map:', typeof window.am5map) 
          console.log('- geodata:', typeof window.am5geodata_region_mexico_morLow)
        }
      }
    }

    createMap()

    // Cleanup function mejorada
    return () => {
      console.log('🧹 Iniciando cleanup...');
      isDestroyed = true;
      
      if (root) {
        try {
          root.dispose()
          console.log('✅ Root disposed correctamente')
        } catch (error) {
          console.error('Error durante cleanup del root:', error)
        }
        root = null;
      }
      
      // Limpiar el contenedor DOM
      if (chartRef.current) {
        try {
          chartRef.current.innerHTML = '';
          console.log('✅ Contenedor DOM limpiado')
        } catch (error) {
          console.error('Error limpiando contenedor:', error)
        }
      }
    }
  }, []) // Array de dependencias vacío para que solo se ejecute una vez

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error al cargar el mapa</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className="text-sm font-medium">{status}</span>
          </div>
          
          <div 
            ref={chartRef} 
            className="w-full h-[600px] bg-gray-50 border border-gray-200 rounded"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Declarar tipos globales
declare global {
  interface Window {
    am5: any
    am5map: any
    am5themes_Animated: any
    am5geodata_region_mexico_morLow: any
  }
}
