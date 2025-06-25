"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface EvaluationInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function EvaluationInput({ value, onChange, disabled = false, className }: EvaluationInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  // Calcular nivel de cumplimiento con colores
  const evaluationLevel = useMemo(() => {
    if (value >= 90) return { 
      label: 'Excelente', 
      color: 'bg-emerald-500', 
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
      textColor: 'text-emerald-700 dark:text-emerald-300'
    }
    if (value >= 80) return { 
      label: 'Alto', 
      color: 'bg-green-500', 
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      textColor: 'text-green-700 dark:text-green-300'
    }
    if (value >= 60) return { 
      label: 'Medio', 
      color: 'bg-yellow-500', 
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    }
    if (value >= 40) return { 
      label: 'Bajo', 
      color: 'bg-orange-500', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      textColor: 'text-orange-700 dark:text-orange-300'
    }
    if (value > 0) return { 
      label: 'Muy Bajo', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      textColor: 'text-red-700 dark:text-red-300'
    }
    return { 
      label: 'Sin evaluar', 
      color: 'bg-slate-400', 
      bgColor: 'bg-slate-50 dark:bg-slate-900/10',
      textColor: 'text-slate-600 dark:text-slate-400'
    }
  }, [value])

  // Botones de valores predefinidos
  const quickValues = [
    { value: 0, label: '0%', description: 'No cumple' },
    { value: 25, label: '25%', description: 'Básico' },
    { value: 50, label: '50%', description: 'Parcial' },
    { value: 75, label: '75%', description: 'Bueno' },
    { value: 90, label: '90%', description: 'Muy bueno' },
    { value: 100, label: '100%', description: 'Excelente' }
  ]

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    const numValue = parseInt(newValue)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue)
    }
  }, [onChange])

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      setInputValue(value.toString())
    }
  }, [inputValue, value])

  const handleQuickSelect = useCallback((quickValue: number) => {
    setInputValue(quickValue.toString())
    onChange(quickValue)
  }, [onChange])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con nivel actual */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
        evaluationLevel.bgColor
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            evaluationLevel.color
          )} />
          <div>
            <Label className="text-sm font-medium">Nivel de Cumplimiento</Label>
            <p className={cn("text-lg font-semibold", evaluationLevel.textColor)}>
              {evaluationLevel.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}%
          </div>
          <Badge 
            variant="outline" 
            className={cn("border-current", evaluationLevel.textColor)}
          >
            {value}/100
          </Badge>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-600 dark:text-slate-400">
          Progreso Visual
        </Label>
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              evaluationLevel.color
            )}
            style={{ width: `${value}%` }}
          />
          {/* Marcadores de nivel */}
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {[25, 50, 75].map((marker) => (
              <div 
                key={marker}
                className="w-0.5 h-2 bg-white/50 rounded-full"
                style={{ marginLeft: `${marker}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Input manual y controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input numérico */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Valor Específico</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={disabled}
              className="text-center font-mono"
              placeholder="0-100"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(0)}
              disabled={disabled}
              className="px-3"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Incrementos rápidos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Incrementos</Label>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(Math.max(0, value - 10))}
              disabled={disabled || value <= 0}
              className="px-2"
            >
              -10
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(Math.max(0, value - 5))}
              disabled={disabled || value <= 0}
              className="px-2"
            >
              -5
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(Math.min(100, value + 5))}
              disabled={disabled || value >= 100}
              className="px-2"
            >
              +5
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(Math.min(100, value + 10))}
              disabled={disabled || value >= 100}
              className="px-2"
            >
              +10
            </Button>
          </div>
        </div>
      </div>

      {/* Valores predefinidos */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Valores Predefinidos</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickValues.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={value === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickSelect(item.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col h-auto py-2 px-3 text-left",
                value === item.value && evaluationLevel.color
              )}
            >
              <span className="font-semibold">{item.label}</span>
              <span className="text-xs opacity-70">{item.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Descripción informativa */}
      <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
        <p className="mb-1"><strong>Guía de evaluación:</strong></p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>90-100%:</strong> Cumplimiento excelente, supera expectativas</li>
          <li>• <strong>80-89%:</strong> Alto cumplimiento, muy satisfactorio</li>
          <li>• <strong>60-79%:</strong> Cumplimiento medio, aceptable</li>
          <li>• <strong>40-59%:</strong> Bajo cumplimiento, requiere mejoras</li>
          <li>• <strong>0-39%:</strong> Muy bajo cumplimiento, crítico</li>
        </ul>
      </div>
    </div>
  )
}
