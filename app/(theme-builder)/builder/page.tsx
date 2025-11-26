'use client'

import ThemeControlsPanel from '@/components/theme/ThemeControlsPanel'
import ThemePreviewDemo from '@/components/theme/ThemePreviewDemo'
import ThemePresetsManager from '@/components/theme/ThemePresetsManager'
import ExportPanel from '@/components/theme/ExportPanel'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Volver a Landing</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Theme Builder</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Controls */}
          <div className="space-y-6 lg:col-span-1">
            <ThemeControlsPanel />
            <ThemePresetsManager />
          </div>

          {/* Right Column - Preview and Export */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Vista Previa</h2>
              <div
                className="overflow-hidden rounded-lg border border-gray-200"
                style={{ height: '600px' }}
              >
                <ThemePreviewDemo />
              </div>
            </div>
            <ExportPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
