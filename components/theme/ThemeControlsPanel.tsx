'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-3 flex w-full items-center justify-between text-left font-semibold text-gray-900 transition-colors hover:text-gray-700"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="space-y-4">{children}</div>}
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}

function ColorInput({ label, value, onChange, hint }: ColorInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  hint?: string
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = 'px',
  hint,
}: NumberInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: string
}

function SelectInput({ label, value, onChange, options, hint }: SelectInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

const GOOGLE_FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
]

export default function ThemeControlsPanel() {
  const { theme, updateTheme } = useTheme()

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Theme Controls</h2>

      <CollapsibleSection title="🎨 Colores">
        <ColorInput
          label="Primary"
          value={theme.colors.primary}
          onChange={(value) => updateTheme({ colors: { primary: value } })}
          hint="Color principal de la marca"
        />
        <ColorInput
          label="Primary Variant"
          value={theme.colors.primaryVariant}
          onChange={(value) => updateTheme({ colors: { primaryVariant: value } })}
          hint="Variante más oscura del primary"
        />
        <ColorInput
          label="Secondary"
          value={theme.colors.secondary}
          onChange={(value) => updateTheme({ colors: { secondary: value } })}
          hint="Color secundario"
        />
        <ColorInput
          label="Secondary Soft"
          value={theme.colors.secondarySoft}
          onChange={(value) => updateTheme({ colors: { secondarySoft: value } })}
          hint="Variante más clara del secondary"
        />
        <ColorInput
          label="Background"
          value={theme.colors.background}
          onChange={(value) => updateTheme({ colors: { background: value } })}
          hint="Color de fondo principal"
        />
        <ColorInput
          label="Surface"
          value={theme.colors.surface}
          onChange={(value) => updateTheme({ colors: { surface: value } })}
          hint="Color de superficie (cards, paneles)"
        />
        <ColorInput
          label="Text"
          value={theme.colors.text}
          onChange={(value) => updateTheme({ colors: { text: value } })}
          hint="Color de texto principal"
        />
        <ColorInput
          label="Text Muted"
          value={theme.colors.textMuted}
          onChange={(value) => updateTheme({ colors: { textMuted: value } })}
          hint="Color de texto secundario"
        />
        <ColorInput
          label="Border"
          value={theme.colors.border}
          onChange={(value) => updateTheme({ colors: { border: value } })}
          hint="Color de bordes"
        />
        <ColorInput
          label="Accent"
          value={theme.colors.accent}
          onChange={(value) => updateTheme({ colors: { accent: value } })}
          hint="Color de acento (tags, badges)"
        />
      </CollapsibleSection>

      <CollapsibleSection title="🔤 Tipografía">
        <SelectInput
          label="Fuente Base"
          value={theme.typography.fontBase}
          onChange={(value) => updateTheme({ typography: { fontBase: value } })}
          options={GOOGLE_FONTS}
          hint="Fuente para texto general"
        />
        <SelectInput
          label="Fuente Títulos"
          value={theme.typography.fontHeading}
          onChange={(value) => updateTheme({ typography: { fontHeading: value } })}
          options={GOOGLE_FONTS}
          hint="Fuente para títulos y headings"
        />
        <NumberInput
          label="Tamaño Base"
          value={theme.typography.fontSizeBase}
          onChange={(value) => updateTheme({ typography: { fontSizeBase: value } })}
          min={12}
          max={24}
          hint="Tamaño de fuente base"
        />
        <NumberInput
          label="Tamaño Pequeño"
          value={theme.typography.fontSizeSm}
          onChange={(value) => updateTheme({ typography: { fontSizeSm: value } })}
          min={10}
          max={18}
          hint="Tamaño de fuente pequeño"
        />
        <NumberInput
          label="Tamaño Grande"
          value={theme.typography.fontSizeLg}
          onChange={(value) => updateTheme({ typography: { fontSizeLg: value } })}
          min={16}
          max={32}
          hint="Tamaño de fuente grande"
        />
        <NumberInput
          label="Escala de Headings"
          value={theme.typography.headingScale}
          onChange={(value) => updateTheme({ typography: { headingScale: value } })}
          min={1.1}
          max={2}
          step={0.05}
          unit="x"
          hint="Factor de escala para títulos (h1-h4)"
        />
        <NumberInput
          label="Peso Base"
          value={theme.typography.fontWeightBase}
          onChange={(value) => updateTheme({ typography: { fontWeightBase: value } })}
          min={300}
          max={500}
          step={100}
          hint="Peso de fuente base (300-500)"
        />
        <NumberInput
          label="Peso Bold"
          value={theme.typography.fontWeightBold}
          onChange={(value) => updateTheme({ typography: { fontWeightBold: value } })}
          min={600}
          max={900}
          step={100}
          hint="Peso de fuente bold (600-900)"
        />
      </CollapsibleSection>

      <CollapsibleSection title="📏 Spacing">
        <NumberInput
          label="XS"
          value={theme.spacing.spacingXs}
          onChange={(value) => updateTheme({ spacing: { spacingXs: value } })}
          min={0}
          max={16}
        />
        <NumberInput
          label="SM"
          value={theme.spacing.spacingSm}
          onChange={(value) => updateTheme({ spacing: { spacingSm: value } })}
          min={0}
          max={32}
        />
        <NumberInput
          label="MD"
          value={theme.spacing.spacingMd}
          onChange={(value) => updateTheme({ spacing: { spacingMd: value } })}
          min={0}
          max={64}
        />
        <NumberInput
          label="LG"
          value={theme.spacing.spacingLg}
          onChange={(value) => updateTheme({ spacing: { spacingLg: value } })}
          min={0}
          max={96}
        />
        <NumberInput
          label="XL"
          value={theme.spacing.spacingXl}
          onChange={(value) => updateTheme({ spacing: { spacingXl: value } })}
          min={0}
          max={128}
        />
      </CollapsibleSection>

      <CollapsibleSection title="🧱 Radius & Shadow">
        <NumberInput
          label="Radius Small"
          value={theme.radius.borderRadiusSm}
          onChange={(value) => updateTheme({ radius: { borderRadiusSm: value } })}
          min={0}
          max={16}
        />
        <NumberInput
          label="Radius Medium"
          value={theme.radius.borderRadiusMd}
          onChange={(value) => updateTheme({ radius: { borderRadiusMd: value } })}
          min={0}
          max={24}
        />
        <NumberInput
          label="Radius Large"
          value={theme.radius.borderRadiusLg}
          onChange={(value) => updateTheme({ radius: { borderRadiusLg: value } })}
          min={0}
          max={32}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Shadow Small</label>
          <input
            type="text"
            value={theme.shadows.shadowSm}
            onChange={(e) => updateTheme({ shadows: { shadowSm: e.target.value } })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0 1px 2px rgba(0,0,0,0.05)"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Shadow Medium</label>
          <input
            type="text"
            value={theme.shadows.shadowMd}
            onChange={(e) => updateTheme({ shadows: { shadowMd: e.target.value } })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0 4px 6px rgba(0,0,0,0.1)"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Shadow Large</label>
          <input
            type="text"
            value={theme.shadows.shadowLg}
            onChange={(e) => updateTheme({ shadows: { shadowLg: e.target.value } })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0 10px 15px rgba(0,0,0,0.1)"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="📱 Breakpoints">
        <NumberInput
          label="Mobile"
          value={theme.breakpoints.bpMobile}
          onChange={(value) => updateTheme({ breakpoints: { bpMobile: value } })}
          min={320}
          max={768}
        />
        <NumberInput
          label="Tablet"
          value={theme.breakpoints.bpTablet}
          onChange={(value) => updateTheme({ breakpoints: { bpTablet: value } })}
          min={640}
          max={1024}
        />
        <NumberInput
          label="Desktop"
          value={theme.breakpoints.bpDesktop}
          onChange={(value) => updateTheme({ breakpoints: { bpDesktop: value } })}
          min={1024}
          max={1920}
        />
      </CollapsibleSection>
    </div>
  )
}
