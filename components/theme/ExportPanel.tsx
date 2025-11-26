'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import {
  exportToJSON,
  exportToCSSVariables,
  exportToTailwind,
  exportToJSS,
  exportToBootstrap,
  copyToClipboard,
} from '@/lib/theme-exporters'
import { Copy, Check, FileJson, Code, Package, Palette, Layers } from 'lucide-react'

type ExportFormat = 'json' | 'css' | 'tailwind' | 'jss' | 'bootstrap'

interface TabButtonProps {
  format: ExportFormat
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

function TabButton({ format, label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-t-lg px-4 py-2 transition-colors ${
        isActive
          ? 'border-l border-r border-t border-gray-200 bg-white text-blue-600'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

export default function ExportPanel() {
  const { theme } = useTheme()
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('json')
  const [copied, setCopied] = useState(false)

  const getExportContent = () => {
    switch (activeFormat) {
      case 'json':
        return exportToJSON(theme)
      case 'css':
        return exportToCSSVariables(theme)
      case 'tailwind':
        return exportToTailwind(theme)
      case 'jss':
        return exportToJSS(theme)
      case 'bootstrap':
        return exportToBootstrap(theme)
      default:
        return ''
    }
  }

  const handleCopy = async () => {
    const content = getExportContent()
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const content = getExportContent()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Exportar Theme</h3>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-200">
        <TabButton
          format="json"
          label="JSON"
          icon={<FileJson size={16} />}
          isActive={activeFormat === 'json'}
          onClick={() => setActiveFormat('json')}
        />
        <TabButton
          format="css"
          label="CSS Variables"
          icon={<Code size={16} />}
          isActive={activeFormat === 'css'}
          onClick={() => setActiveFormat('css')}
        />
        <TabButton
          format="tailwind"
          label="Tailwind"
          icon={<Package size={16} />}
          isActive={activeFormat === 'tailwind'}
          onClick={() => setActiveFormat('tailwind')}
        />
        <TabButton
          format="jss"
          label="JSS / MUI"
          icon={<Palette size={16} />}
          isActive={activeFormat === 'jss'}
          onClick={() => setActiveFormat('jss')}
        />
        <TabButton
          format="bootstrap"
          label="Bootstrap"
          icon={<Layers size={16} />}
          isActive={activeFormat === 'bootstrap'}
          onClick={() => setActiveFormat('bootstrap')}
        />
      </div>

      {/* Content */}
      <div className="relative">
        <pre className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm">
          <code>{content}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-4 top-4 rounded-md border border-gray-300 bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
          title="Copiar al portapapeles"
        >
          {copied ? (
            <Check size={18} className="text-green-600" />
          ) : (
            <Copy size={18} className="text-gray-600" />
          )}
        </button>
      </div>

      {copied && (
        <p className="mt-2 text-center text-sm text-green-600">¡Copiado al portapapeles!</p>
      )}
    </div>
  )
}
