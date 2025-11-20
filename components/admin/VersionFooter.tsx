'use client'

import { useEffect, useState } from 'react'
import { GitBranch, GitCommit, Calendar, Server } from 'lucide-react'

interface VersionInfo {
  version: string
  commit: string
  branch: string
  buildTime: string
  environment: string
}

export default function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        // Intentar obtener información de Vercel
        const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'
        const vercelCommit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local'
        const vercelBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'main'
        const vercelBuildTime = process.env.NEXT_PUBLIC_VERCEL_BUILD_TIME || new Date().toISOString()

        // Obtener versión del package.json si está disponible
        let version = '0.0.0'
        try {
          const pkgResponse = await fetch('/package.json')
          if (pkgResponse.ok) {
            const pkg = await pkgResponse.json()
            version = pkg.version || version
          }
        } catch (e) {
          // Ignorar error, usar versión por defecto
        }

        // Formatear fecha de build
        const buildDate = new Date(vercelBuildTime)
        const formattedDate = buildDate.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        const formattedTime = buildDate.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        })

        // Obtener commit hash corto (7 caracteres)
        const shortCommit = vercelCommit.substring(0, 7)

        // Mapear entorno
        const envMap: Record<string, string> = {
          production: 'PROD',
          preview: 'PREVIEW',
          development: 'DEV',
        }
        const envLabel = envMap[vercelEnv] || vercelEnv.toUpperCase()

        setVersionInfo({
          version,
          commit: shortCommit,
          branch: vercelBranch,
          buildTime: `${formattedDate} ${formattedTime}`,
          environment: envLabel,
        })
      } catch (error) {
        console.error('[VersionFooter] Error loading version info:', error)
        // Fallback con información mínima
        setVersionInfo({
          version: '0.0.0',
          commit: 'unknown',
          branch: 'unknown',
          buildTime: new Date().toLocaleString('es-AR'),
          environment: 'DEV',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadVersionInfo()
  }, [])

  if (isLoading) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
          <span>Cargando información de versión...</span>
        </div>
      </div>
    )
  }

  if (!versionInfo) {
    return null
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-700">v{versionInfo.version}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitCommit size={12} />
          <span className="font-mono">{versionInfo.commit}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitBranch size={12} />
          <span>{versionInfo.branch}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{versionInfo.buildTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Server size={12} />
          <span className={`font-semibold ${
            versionInfo.environment === 'PROD' 
              ? 'text-green-600' 
              : versionInfo.environment === 'PREVIEW'
              ? 'text-yellow-600'
              : 'text-gray-500'
          }`}>
            {versionInfo.environment}
          </span>
        </div>
      </div>
    </div>
  )
}

