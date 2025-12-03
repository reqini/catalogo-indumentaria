'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, CheckCircle, Clock, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DailyReport {
  id: string
  date: string
  executionTime: string
  duration: number
  overallStatus: 'stable' | 'warning' | 'critical'
  userFlow: {
    home: 'ok' | 'fail'
    search: 'ok' | 'fail'
    product: 'ok' | 'fail'
    talles: 'ok' | 'fail'
    colores: 'ok' | 'fail'
    variantes: 'ok' | 'fail'
    cart: 'ok' | 'fail'
    shipping: 'ok' | 'fail'
    checkout: 'ok' | 'fail'
    mercadoPago: 'ok' | 'fail'
    confirmation: 'ok' | 'fail'
  }
  adminFlow: {
    createProduct: 'ok' | 'fail'
    editProduct: 'ok' | 'fail'
    deleteProduct: 'ok' | 'fail'
    multipleImages: 'ok' | 'fail'
    saveToAPI: 'ok' | 'fail'
  }
  errors: Array<{
    severity: 'critical' | 'error' | 'warning'
    message: string
    file?: string
    line?: number
    cause?: string
  }>
  autoFixes: Array<{
    issue: string
    fix: string
    success: boolean
  }>
  recommendations: string[]
  performance: {
    avgLoadTime: number
    apiResponseTime: number
    imageLoadTime: number
  }
  comparison: {
    newErrors: number
    persistentErrors: number
    performanceImprovement: number
  }
}

export default function SystemReportPage() {
  const searchParams = useSearchParams()
  const [report, setReport] = useState<DailyReport | null>(null)
  const [history, setHistory] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Token requerido')
      setLoading(false)
      return
    }

    fetchReport(token)
    fetchHistory(token)
  }, [searchParams])

  const fetchReport = async (token: string) => {
    try {
      const response = await fetch('/api/admin/daily-report/latest', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error obteniendo reporte')
      }

      const data = await response.json()
      setReport(data.report)
    } catch (err: any) {
      setError(err.message || 'Error cargando reporte')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/daily-report/history?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (err) {
      // Ignorar errores de historial
    }
  }

  const downloadPDF = () => {
    if (!report) return

    // Generar PDF básico (en producción usar librería como jsPDF)
    const content = generateReportText(report)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-diario-${report.date}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateReportText = (report: DailyReport): string => {
    let text = `INFORME AUTOMÁTICO DIARIO – SISTEMA COMPLETO\n\n`
    text += `Fecha: ${report.date}\n`
    text += `Hora de ejecución: ${new Date(report.executionTime).toLocaleString('es-AR')}\n`
    text += `Duración: ${report.duration}ms\n\n`

    text += `Estado general del sistema: ${report.overallStatus.toUpperCase()}\n\n`

    text += `Recorrido de usuario (bot):\n`
    Object.entries(report.userFlow).forEach(([key, value]) => {
      text += `- ${key}: ${value.toUpperCase()}\n`
    })
    text += '\n'

    text += `Recorrido de administrador (bot):\n`
    Object.entries(report.adminFlow).forEach(([key, value]) => {
      text += `- ${key}: ${value.toUpperCase()}\n`
    })
    text += '\n'

    text += `Errores detectados: ${report.errors.length}\n`
    report.errors.forEach((err, index) => {
      text += `${index + 1}. [${err.severity.toUpperCase()}] ${err.message}\n`
      if (err.file) text += `   Archivo: ${err.file}\n`
      if (err.cause) text += `   Causa: ${err.cause}\n`
    })
    text += '\n'

    text += `Autofixes aplicados: ${report.autoFixes.length}\n`
    report.autoFixes.forEach((fix, index) => {
      text += `${index + 1}. ${fix.issue}: ${fix.fix}\n`
    })
    text += '\n'

    text += `Recomendaciones:\n`
    report.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`
    })
    text += '\n'

    text += `Comparativa con el día anterior:\n`
    text += `- Nuevos errores detectados: ${report.comparison.newErrors}\n`
    text += `- Errores persistentes: ${report.comparison.persistentErrors}\n`
    text += `- Mejoras en performance: ${report.comparison.performanceImprovement.toFixed(2)}%\n`

    return text
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando informe diario...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-600">{error || 'No se pudo cargar el reporte'}</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    stable: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  }

  const statusIcons = {
    stable: CheckCircle,
    warning: AlertTriangle,
    critical: AlertTriangle,
  }

  const StatusIcon = statusIcons[report.overallStatus]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-black">Informe Automático Diario</h1>
            <p className="text-gray-600">
              Fecha: {format(new Date(report.date), 'dd/MM/yyyy', { locale: es })}
            </p>
            <p className="text-sm text-gray-500">
              Ejecutado:{' '}
              {format(new Date(report.executionTime), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
            </p>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            <Download size={18} />
            Descargar PDF
          </button>
        </div>

        {/* Estado General */}
        <div className={`mb-8 rounded-lg border-2 p-6 ${statusColors[report.overallStatus]}`}>
          <div className="flex items-center gap-4">
            <StatusIcon size={48} />
            <div>
              <h2 className="mb-1 text-2xl font-bold">
                Sistema{' '}
                {report.overallStatus === 'stable'
                  ? 'Estable'
                  : report.overallStatus === 'warning'
                    ? 'Con Advertencias'
                    : 'Con Fallas Críticas'}
              </h2>
              <p className="text-sm opacity-80">Duración de ejecución: {report.duration}ms</p>
            </div>
          </div>
        </div>

        {/* Recorrido de Usuario */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Recorrido de Usuario (Bot)</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Object.entries(report.userFlow).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full ${
                    value === 'ok' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {value === 'ok' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <p className="text-sm font-semibold capitalize">{key}</p>
                <p className={`text-xs ${value === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {value.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recorrido de Admin */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Recorrido de Administrador (Bot)</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(report.adminFlow).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full ${
                    value === 'ok' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {value === 'ok' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <p className="text-sm font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className={`text-xs ${value === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {value.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Errores Detectados */}
        {report.errors.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-black">
              Errores Detectados ({report.errors.length})
            </h3>
            <div className="space-y-3">
              {report.errors.map((err, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    err.severity === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : err.severity === 'error'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-black">{err.message}</p>
                      {err.file && (
                        <p className="mt-1 text-sm text-gray-600">
                          Archivo: <code className="rounded bg-gray-100 px-1">{err.file}</code>
                          {err.line && `:${err.line}`}
                        </p>
                      )}
                      {err.cause && (
                        <p className="mt-1 text-sm text-gray-600">Causa probable: {err.cause}</p>
                      )}
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        err.severity === 'critical'
                          ? 'bg-red-200 text-red-800'
                          : err.severity === 'error'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {err.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-Fixes */}
        {report.autoFixes.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-black">
              Auto-Fixes Aplicados ({report.autoFixes.length})
            </h3>
            <div className="space-y-2">
              {report.autoFixes.map((fix, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <CheckCircle className="flex-shrink-0 text-green-600" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-black">{fix.issue}</p>
                    <p className="text-sm text-gray-600">{fix.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {report.recommendations.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-black">Recomendaciones</h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Performance */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Performance</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <span className="text-sm text-gray-600">Tiempo promedio de carga</span>
              <p className="text-2xl font-bold text-black">
                {report.performance.avgLoadTime.toFixed(0)}ms
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tiempo de respuesta API</span>
              <p className="text-2xl font-bold text-black">
                {report.performance.apiResponseTime.toFixed(0)}ms
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tiempo de carga de imágenes</span>
              <p className="text-2xl font-bold text-black">
                {report.performance.imageLoadTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>

        {/* Comparativa */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Comparativa con el Día Anterior</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              {report.comparison.newErrors > 0 ? (
                <TrendingUp className="text-red-600" size={24} />
              ) : (
                <CheckCircle className="text-green-600" size={24} />
              )}
              <div>
                <span className="text-sm text-gray-600">Nuevos errores</span>
                <p className="text-xl font-bold text-black">{report.comparison.newErrors}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {report.comparison.persistentErrors > 0 ? (
                <AlertTriangle className="text-yellow-600" size={24} />
              ) : (
                <CheckCircle className="text-green-600" size={24} />
              )}
              <div>
                <span className="text-sm text-gray-600">Errores persistentes</span>
                <p className="text-xl font-bold text-black">{report.comparison.persistentErrors}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {report.comparison.performanceImprovement > 0 ? (
                <TrendingUp className="text-green-600" size={24} />
              ) : (
                <TrendingDown className="text-red-600" size={24} />
              )}
              <div>
                <span className="text-sm text-gray-600">Mejora en performance</span>
                <p className="text-xl font-bold text-black">
                  {report.comparison.performanceImprovement > 0 ? '+' : ''}
                  {report.comparison.performanceImprovement.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-black">Historial (Últimos 7 días)</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        h.overallStatus === 'stable'
                          ? 'bg-green-500'
                          : h.overallStatus === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <span className="font-semibold">
                      {format(new Date(h.date), 'dd/MM/yyyy', { locale: es })}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(h.executionTime), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      h.overallStatus === 'stable'
                        ? 'bg-green-100 text-green-800'
                        : h.overallStatus === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {h.overallStatus.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
