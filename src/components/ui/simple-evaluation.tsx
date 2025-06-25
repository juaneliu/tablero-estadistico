"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SimpleEvaluationProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function SimpleEvaluation({ value, onChange, className }: SimpleEvaluationProps) {
  // Función simple para determinar el nivel
  const getLevel = (val: number) => {
    if (val >= 80) return { label: 'Alto', color: 'bg-green-100 text-green-800 border-green-200' }
    if (val >= 60) return { label: 'Medio', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    if (val > 0) return { label: 'Bajo', color: 'bg-red-100 text-red-800 border-red-200' }
    return { label: 'Sin evaluar', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  const level = getLevel(value)

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input y slider en la misma línea */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="range"
            min="0"
            max="100"
            step="5"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-20 text-center"
          />
          <span className="text-sm text-slate-600">%</span>
        </div>
      </div>

      {/* Badge con el nivel */}
      <div className="flex justify-between items-center">
        <Badge variant="outline" className={level.color}>
          {level.label}
        </Badge>
        <div className="text-sm text-slate-500">
          {value}/100
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
