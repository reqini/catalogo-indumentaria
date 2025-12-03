'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

interface SystemStatus {
  overall: 'stable' | 'warning' | 'critical'
  kpis: {
    avgApiLatency: number
    checkoutFailures: number
    imageUploadFailures: number
    mercadoPagoFailures: number
    productsWithErrors: number
  }
  virtualUsers: {
    active: boolean
    lastRun: string
    lastResult: 'passed' | 'failed' | 'unknown'
  }
  lastQA: {
    timestamp: string
    status: 'stable' | 'unstable' | 'failed'
    totalTests: number
    passedTests: number
    failedTests: number
  }
  lastAutoRepair: {
    timestamp: string
    repaired: boolean
    message: string
  }
  recentAlerts: Array<{
    id: string
    severity: string
    message: string
    timestamp: string
  }>
}

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/system-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching system status:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatus()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando estado del sistema...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-600">No se pudo cargar el estado del sistema</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    stable: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    unstable: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  }

  const statusIcons = {
    stable: CheckCircle,
    warning: AlertTriangle,
    critical: AlertTriangle,
  }

  const StatusIcon = statusIcons[status.overall]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-black">Estado del Sistema</h1>
            <p className="text-gray-600">Monitoreo en tiempo real de la plataforma</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={18} />
            Actualizar
          </button>
        </div>

        {/* Estado General */}
        <div className={`mb-8 rounded-lg border-2 p-6 ${statusColors[status.overall]}`}>
          <div className="flex items-center gap-4">
            <StatusIcon size={48} />
            <div>
              <h2 className="mb-1 text-2xl font-bold">
                Sistema{' '}
                {status.overall === 'stable'
                  ? 'Estable'
                  : status.overall === 'warning'
                    ? 'Con Avisos'
                    : 'Con Errores Críticos'}
              </h2>
              <p className="text-sm opacity-80">
                Última actualización: {new Date().toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        {/* KPIs Técnicos */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Latencia API</span>
              <Activity size={20} className="text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-black">{status.kpis.avgApiLatency}ms</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Fallas Checkout</span>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-black">{status.kpis.checkoutFailures}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Fallas Imágenes</span>
              <AlertTriangle size={20} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-black">{status.kpis.imageUploadFailures}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Fallas MP</span>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-black">{status.kpis.mercadoPagoFailures}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Productos con Errores</span>
              <AlertTriangle size={20} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-black">{status.kpis.productsWithErrors}</p>
          </div>
        </div>

        {/* Usuarios Virtuales */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Usuarios Virtuales</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <span className="text-sm text-gray-600">Estado</span>
              <p className="text-lg font-semibold">
                {status.virtualUsers.active ? '🟢 Activo' : '🔴 Inactivo'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Última Ejecución</span>
              <p className="text-lg font-semibold">
                {new Date(status.virtualUsers.lastRun).toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Resultado</span>
              <p className="text-lg font-semibold">
                {status.virtualUsers.lastResult === 'passed'
                  ? '✅ Pasó'
                  : status.virtualUsers.lastResult === 'failed'
                    ? '❌ Falló'
                    : '❓ Desconocido'}
              </p>
            </div>
          </div>
        </div>

        {/* Último QA */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Último QA Automatizado</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <span className="text-sm text-gray-600">Estado</span>
              <p className={`text-lg font-semibold ${statusColors[status.lastQA.status]}`}>
                {status.lastQA.status === 'stable'
                  ? '🟢 Estable'
                  : status.lastQA.status === 'unstable'
                    ? '🟡 Inestable'
                    : '🔴 Falló'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Tests</span>
              <p className="text-lg font-semibold">{status.lastQA.totalTests}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Exitosos</span>
              <p className="text-lg font-semibold text-green-600">{status.lastQA.passedTests}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Fallidos</span>
              <p className="text-lg font-semibold text-red-600">{status.lastQA.failedTests}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            <Clock size={16} className="mr-1 inline" />
            {new Date(status.lastQA.timestamp).toLocaleString('es-AR')}
          </p>
        </div>

        {/* Última Auto-Reparación */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Última Auto-Reparación</h3>
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-lg font-semibold ${status.lastAutoRepair.repaired ? 'text-green-600' : 'text-gray-600'}`}
              >
                {status.lastAutoRepair.repaired ? '✅ Reparado' : '❌ No se pudo reparar'}
              </p>
              <p className="mt-1 text-sm text-gray-600">{status.lastAutoRepair.message}</p>
            </div>
            <p className="text-sm text-gray-500">
              <Clock size={16} className="mr-1 inline" />
              {new Date(status.lastAutoRepair.timestamp).toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        {/* Alertas Recientes */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Alertas Recientes</h3>
          {status.recentAlerts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay alertas recientes</p>
          ) : (
            <div className="space-y-3">
              {status.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.severity === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : alert.severity === 'error'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-black">{alert.message}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {new Date(alert.timestamp).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        alert.severity === 'critical'
                          ? 'bg-red-200 text-red-800'
                          : alert.severity === 'error'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
