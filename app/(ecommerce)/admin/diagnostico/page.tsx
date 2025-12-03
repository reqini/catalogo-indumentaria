'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DiagnosticData {
  status: string
  timestamp: string
  environment: string
  supabase: {
    enabled: boolean
    url: {
      present: boolean
      value: string | null
      valid: boolean
    }
    anonKey: {
      present: boolean
      value: string | null
      valid: boolean
    }
    serviceKey: {
      present: boolean
      value: string | null
      valid: boolean
    }
    connection?: string
  }
  issues: string[]
  solutions: string[]
  nextSteps: string[]
}

export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnostic = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/diagnostico-supabase')
      if (!response.ok) {
        throw new Error('Error al obtener diagnóstico')
      }
      const diagnosticData = await response.json()
      setData(diagnosticData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar diagnóstico')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostic()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando diagnóstico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="mb-2 text-xl font-bold text-red-900">Error</h2>
          <p className="mb-4 text-red-700">{error}</p>
          <button
            onClick={fetchDiagnostic}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const isOk = data.status === 'ok'

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Diagnóstico de Supabase</h1>
            <p className="mt-2 text-gray-600">
              Última verificación: {new Date(data.timestamp).toLocaleString('es-AR')}
            </p>
          </div>
          <button
            onClick={fetchDiagnostic}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        {/* Status Card */}
        <div
          className={`mb-6 rounded-lg p-6 ${
            isOk ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isOk ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : (
              <AlertTriangle className="text-red-600" size={32} />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {isOk ? '✅ Todo Correcto' : '❌ Problemas Detectados'}
              </h2>
              <p className="text-gray-700">
                {isOk
                  ? 'Supabase está correctamente configurado'
                  : `Se encontraron ${data.issues.length} problema(s)`}
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Configuration */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold text-black">Configuración de Supabase</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">Supabase Habilitado:</span>
              <span className={data.supabase.enabled ? 'text-green-600' : 'text-red-600'}>
                {data.supabase.enabled ? '✅ Sí' : '❌ No'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_URL:</span>
              <div className="text-right">
                {data.supabase.url.present ? (
                  <>
                    <span
                      className={data.supabase.url.valid ? 'text-green-600' : 'text-yellow-600'}
                    >
                      {data.supabase.url.valid ? '✅ Presente' : '⚠️ Formato incorrecto'}
                    </span>
                    <p className="text-xs text-gray-500">{data.supabase.url.value}</p>
                  </>
                ) : (
                  <span className="text-red-600">❌ No configurada</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <div className="text-right">
                {data.supabase.anonKey.present ? (
                  <>
                    <span
                      className={data.supabase.anonKey.valid ? 'text-green-600' : 'text-yellow-600'}
                    >
                      {data.supabase.anonKey.valid ? '✅ Presente' : '⚠️ Formato incorrecto'}
                    </span>
                    <p className="text-xs text-gray-500">{data.supabase.anonKey.value}</p>
                  </>
                ) : (
                  <span className="text-red-600">❌ No configurada</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">SUPABASE_SERVICE_ROLE_KEY:</span>
              <div className="text-right">
                {data.supabase.serviceKey.present ? (
                  <>
                    <span
                      className={
                        data.supabase.serviceKey.valid ? 'text-green-600' : 'text-yellow-600'
                      }
                    >
                      {data.supabase.serviceKey.valid ? '✅ Presente' : '⚠️ Formato incorrecto'}
                    </span>
                    <p className="text-xs text-gray-500">{data.supabase.serviceKey.value}</p>
                  </>
                ) : (
                  <span className="text-yellow-600">⚠️ No configurada (opcional)</span>
                )}
              </div>
            </div>

            {data.supabase.connection && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Conexión:</strong>{' '}
                  {data.supabase.connection === 'ok' ? '✅ Exitosa' : '❌ Fallida'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Issues */}
        {data.issues.length > 0 && (
          <div className="mb-6 rounded-lg bg-red-50 p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-red-900">Problemas Detectados</h3>
            <ul className="list-disc space-y-2 pl-5">
              {data.issues.map((issue, index) => (
                <li key={index} className="text-red-800">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solutions */}
        {data.solutions.length > 0 && (
          <div className="mb-6 rounded-lg bg-blue-50 p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-blue-900">Soluciones</h3>
            <div className="space-y-4">
              {data.solutions.map((solution, index) => (
                <div key={index} className="rounded-lg bg-white p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{solution}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {data.nextSteps.length > 0 && (
          <div className="mb-6 rounded-lg bg-yellow-50 p-6 shadow">
            <h3 className="mb-4 text-xl font-bold text-yellow-900">Próximos Pasos</h3>
            <ol className="list-decimal space-y-2 pl-5">
              {data.nextSteps.map((step, index) => (
                <li key={index} className="text-yellow-900">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Help Links */}
        <div className="rounded-lg bg-gray-100 p-6">
          <h3 className="mb-4 text-xl font-bold text-black">Recursos de Ayuda</h3>
          <div className="space-y-2">
            <Link
              href="/SOLUCION_ERROR_SISTEMA_NO_CONFIGURADO.md"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={16} />
              Guía Completa de Solución
            </Link>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={16} />
              Dashboard de Supabase
            </a>
            <Link
              href="/admin/productos"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={16} />
              Volver a Productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
