'use client'

import { TrendingUp, Clock, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react'

interface ImportMetrics {
  productosCreados: number
  tiempoAhorrado: number
  erroresDetectados: number
  calidadPromedio: number
  duplicadosEncontrados: number
}

interface MetricsDisplayProps {
  metrics: ImportMetrics
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="text-green-600" size={24} />
          <span className="text-sm font-medium text-green-800">Productos Creados</span>
        </div>
        <p className="text-3xl font-bold text-green-900">{metrics.productosCreados}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="text-blue-600" size={24} />
          <span className="text-sm font-medium text-blue-800">Tiempo Ahorrado</span>
        </div>
        <p className="text-3xl font-bold text-blue-900">{metrics.tiempoAhorrado} min</p>
        <p className="text-xs text-blue-700 mt-1">vs carga manual</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="text-purple-600" size={24} />
          <span className="text-sm font-medium text-purple-800">Calidad Promedio</span>
        </div>
        <p className="text-3xl font-bold text-purple-900">{metrics.calidadPromedio}/100</p>
        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${metrics.calidadPromedio}%` }}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="text-yellow-600" size={24} />
          <span className="text-sm font-medium text-yellow-800">Errores</span>
        </div>
        <p className="text-3xl font-bold text-yellow-900">{metrics.erroresDetectados}</p>
        <p className="text-xs text-yellow-700 mt-1">detectados y corregidos</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-orange-600" size={24} />
          <span className="text-sm font-medium text-orange-800">Duplicados</span>
        </div>
        <p className="text-3xl font-bold text-orange-900">{metrics.duplicadosEncontrados}</p>
        <p className="text-xs text-orange-700 mt-1">encontrados</p>
      </div>
    </div>
  )
}

