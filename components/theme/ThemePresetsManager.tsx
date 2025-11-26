'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { Save, Trash2, Edit2, Check, X } from 'lucide-react'

export default function ThemePresetsManager() {
  const {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    activePresetId,
    resetTheme,
  } = useTheme()
  const [presetName, setPresetName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleSave = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim())
      setPresetName('')
    }
  }

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      renamePreset(id, editingName.trim())
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Presets Guardados</h3>

      {/* Save Current Theme */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">Guardar theme actual</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Nombre del preset..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetTheme}
        className="mb-4 w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        Resetear a Default
      </button>

      {/* Presets List */}
      {presets.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">
          No hay presets guardados. Guarda tu primer theme arriba.
        </p>
      ) : (
        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                activePresetId === preset.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {editingId === preset.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(preset.id)}
                    className="rounded p-1 text-green-600 transition-colors hover:bg-green-50"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadPreset(preset.id)}
                      className={`rounded px-3 py-1 text-sm transition-colors ${
                        activePresetId === preset.id
                          ? 'bg-blue-600 text-white'
                          : 'border border-blue-600 bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {activePresetId === preset.id ? 'Activo' : 'Aplicar'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(preset.id, preset.name)}
                      className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
