'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Download,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ImportLog {
  id: string
  fecha: string
  estado: 'success' | 'partial' | 'error'
  productosCreados: number
  productosFallidos: number
  totalProductos: number
  tiempoProcesamiento: number
  errores: Array<{
    tipo: string
    mensaje: string
    fila?: number
  }>
  metadata?: {
    formato?: string
    fuente?: string
  }
}

export default function ImportStatusPage() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/import-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      } else {
        // Cargar desde localStorage como fallback
        const localLogs = localStorage.getItem('import_logs')
        if (localLogs) {
          try {
            const parsed = JSON.parse(localLogs)
            setLogs(
              parsed.map((log: any) => ({
                id: log.id,
                fecha: log.fecha,
                estado: log.contexto?.productosExitosos
                  ? log.contexto.productosExitosos > 0
                    ? 'success'
                    : 'error'
                  : 'error',
                productosCreados: log.contexto?.productosExitosos || 0,
                productosFallidos: log.errores?.length || 0,
                totalProductos: log.contexto?.totalProductos || 0,
                tiempoProcesamiento: 0,
                errores: log.errores || [],
              }))
            )
          } catch {
            setLogs([])
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (estado: ImportLog['estado']) => {
    switch (estado) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300'
    }
  }

  const getStatusIcon = (estado: ImportLog['estado']) => {
    switch (estado) {
      case 'success':
        return CheckCircle
      case 'partial':
        return AlertTriangle
      case 'error':
        return XCircle
    }
  }

  const downloadLog = (log: ImportLog) => {
    const content =
      `REPORTE DE IMPORTACIÓN\n\n` +
      `ID: ${log.id}\n` +
      `Fecha: ${format(new Date(log.fecha), 'dd/MM/yyyy HH:mm:ss', { locale: es })}\n` +
      `Estado: ${log.estado.toUpperCase()}\n` +
      `Productos creados: ${log.productosCreados}\n` +
      `Productos fallidos: ${log.productosFallidos}\n` +
      `Total: ${log.totalProductos}\n` +
      `Tiempo: ${log.tiempoProcesamiento}ms\n\n` +
      `Errores:\n${log.errores.map((e, i) => `${i + 1}. [${e.tipo}] ${e.mensaje}${e.fila ? ` (Fila ${e.fila})` : ''}`).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `import-log-${log.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando historial de importaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-black">Estado de Importaciones</h1>
            <p className="text-gray-600">Historial de cargas masivas de productos</p>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Estadísticas generales */}
        {logs.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Total Importaciones</p>
                  <p className="text-2xl font-bold text-black">{logs.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Exitosas</p>
                  <p className="text-2xl font-bold text-black">
                    {logs.filter((l) => l.estado === 'success').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Parciales</p>
                  <p className="text-2xl font-bold text-black">
                    {logs.filter((l) => l.estado === 'partial').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Fallidas</p>
                  <p className="text-2xl font-bold text-black">
                    {logs.filter((l) => l.estado === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de logs */}
        {logs.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No hay importaciones registradas aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const StatusIcon = getStatusIcon(log.estado)
              return (
                <div
                  key={log.id}
                  className={`rounded-lg border-2 bg-white p-6 shadow ${getStatusColor(log.estado)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <StatusIcon size={32} />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-4">
                          <h3 className="text-lg font-bold">
                            Importación del{' '}
                            {format(new Date(log.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              log.estado === 'success'
                                ? 'bg-green-200 text-green-800'
                                : log.estado === 'partial'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {log.estado === 'success'
                              ? '🟢 Todo OK'
                              : log.estado === 'partial'
                                ? '🟡 Carga Parcial'
                                : '🔴 Error Crítico'}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-sm text-gray-600">Productos creados</p>
                            <p className="text-xl font-bold text-black">{log.productosCreados}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Productos fallidos</p>
                            <p className="text-xl font-bold text-red-600">
                              {log.productosFallidos}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total procesados</p>
                            <p className="text-xl font-bold text-black">{log.totalProductos}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tiempo</p>
                            <p className="text-xl font-bold text-black">
                              {log.tiempoProcesamiento}ms
                            </p>
                          </div>
                        </div>

                        {log.errores.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm font-semibold">Errores detectados:</p>
                            <ul className="space-y-1">
                              {log.errores.slice(0, 5).map((err, idx) => (
                                <li key={idx} className="text-sm">
                                  • {err.mensaje}
                                  {err.fila && ` (Fila ${err.fila})`}
                                </li>
                              ))}
                              {log.errores.length > 5 && (
                                <li className="text-sm text-gray-500">
                                  ... y {log.errores.length - 5} error(es) más
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => downloadLog(log)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                      title="Descargar reporte"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
