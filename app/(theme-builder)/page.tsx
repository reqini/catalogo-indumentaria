'use client'

import { useTheme } from '@/lib/theme-context'
import Link from 'next/link'
import { ArrowRight, Code, Palette, Download, Zap, Package } from 'lucide-react'

export default function LandingPage() {
  const { theme, loadPreset, presets } = useTheme()

  const styles = {
    '--color-primary': theme.colors.primary,
    '--color-primary-variant': theme.colors.primaryVariant,
    '--color-secondary': theme.colors.secondary,
    '--color-secondary-soft': theme.colors.secondarySoft,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-border': theme.colors.border,
    '--color-accent': theme.colors.accent,
    '--font-base': `'${theme.typography.fontBase}', sans-serif`,
    '--font-heading': `'${theme.typography.fontHeading}', sans-serif`,
    '--font-size-base': `${theme.typography.fontSizeBase}px`,
    '--font-size-sm': `${theme.typography.fontSizeSm}px`,
    '--font-size-lg': `${theme.typography.fontSizeLg}px`,
    '--font-weight-base': theme.typography.fontWeightBase,
    '--font-weight-bold': theme.typography.fontWeightBold,
    '--spacing-xs': `${theme.spacing.spacingXs}px`,
    '--spacing-sm': `${theme.spacing.spacingSm}px`,
    '--spacing-md': `${theme.spacing.spacingMd}px`,
    '--spacing-lg': `${theme.spacing.spacingLg}px`,
    '--spacing-xl': `${theme.spacing.spacingXl}px`,
    '--radius-sm': `${theme.radius.borderRadiusSm}px`,
    '--radius-md': `${theme.radius.borderRadiusMd}px`,
    '--radius-lg': `${theme.radius.borderRadiusLg}px`,
    '--shadow-sm': theme.shadows.shadowSm,
    '--shadow-md': theme.shadows.shadowMd,
    '--shadow-lg': theme.shadows.shadowLg,
  } as React.CSSProperties

  return (
    <div
      className="min-h-screen"
      style={{
        ...styles,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: `'${theme.typography.fontBase}', sans-serif`,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div
              className="text-xl font-bold"
              style={{
                fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
                color: theme.colors.primary,
              }}
            >
              Theme Builder
            </div>
            <Link
              href="/builder"
              className="rounded-md px-4 py-2 font-semibold text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: `${theme.radius.borderRadiusMd}px`,
              }}
            >
              Abrir Builder
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="mb-6 text-5xl font-bold md:text-6xl"
            style={{
              fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
              fontSize: `${theme.typography.fontSizeBase * theme.typography.headingScale * 3}px`,
              fontWeight: theme.typography.fontWeightBold,
              color: theme.colors.text,
            }}
          >
            Crea Design Tokens Profesionales
          </h1>
          <p
            className="mx-auto mb-8 max-w-2xl text-xl"
            style={{
              fontSize: `${theme.typography.fontSizeLg}px`,
              color: theme.colors.textMuted,
            }}
          >
            Genera, visualiza y exporta themes completos en tiempo real. Perfecto para crear
            sistemas de diseño consistentes.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/builder"
              className="flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: `${theme.radius.borderRadiusLg}px`,
                boxShadow: theme.shadows.shadowMd,
              }}
            >
              Abrir Generador de Temas
              <ArrowRight size={20} />
            </Link>
            {presets.length > 0 && (
              <button
                onClick={() => {
                  if (presets.length > 0) {
                    loadPreset(presets[0].id)
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.secondary,
                  border: `2px solid ${theme.colors.secondary}`,
                  borderRadius: `${theme.radius.borderRadiusLg}px`,
                }}
              >
                Aplicar Theme Actual
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="px-4 py-16 sm:px-6 lg:px-8"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-3xl font-bold"
            style={{
              fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
              color: theme.colors.text,
            }}
          >
            ¿Qué podés exportar?
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code, title: 'CSS Variables', desc: 'Variables CSS listas para usar' },
              { icon: Package, title: 'Tailwind Config', desc: 'Configuración para Tailwind CSS' },
              { icon: Palette, title: 'JSS / MUI', desc: 'Theme para Material-UI' },
              { icon: Download, title: 'JSON', desc: 'Formato JSON completo' },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-lg p-6 transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: `${theme.radius.borderRadiusLg}px`,
                  boxShadow: theme.shadows.shadowMd,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: theme.colors.accent,
                    borderRadius: `${theme.radius.borderRadiusMd}px`,
                  }}
                >
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3
                  className="mb-2 font-bold"
                  style={{
                    fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
                    color: theme.colors.text,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: `${theme.typography.fontSizeSm}px`,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Showcase */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-3xl font-bold"
            style={{
              fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
              color: theme.colors.text,
            }}
          >
            Vista Previa en Tiempo Real
          </h2>
          <div
            className="overflow-hidden rounded-lg border"
            style={{
              borderRadius: `${theme.radius.borderRadiusLg}px`,
              borderColor: theme.colors.border,
              boxShadow: theme.shadows.shadowLg,
            }}
          >
            <div className="p-8" style={{ backgroundColor: theme.colors.surface }}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg p-6"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: `${theme.radius.borderRadiusMd}px`,
                      boxShadow: theme.shadows.shadowSm,
                    }}
                  >
                    <div
                      className="mb-4 h-10 w-10 rounded-md"
                      style={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: `${theme.radius.borderRadiusSm}px`,
                      }}
                    />
                    <h3
                      className="mb-2 font-bold"
                      style={{
                        fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
                        color: theme.colors.text,
                      }}
                    >
                      Card {i}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: `${theme.typography.fontSizeSm}px`,
                      }}
                    >
                      Este es un ejemplo de cómo se ve tu theme aplicado.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 py-20 sm:px-6 lg:px-8"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-6 text-4xl font-bold"
            style={{
              fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
              color: theme.colors.text,
            }}
          >
            ¿Listo para crear tu theme?
          </h2>
          <p
            className="mb-8 text-lg"
            style={{
              color: theme.colors.textMuted,
              fontSize: `${theme.typography.fontSizeLg}px`,
            }}
          >
            Comenzá ahora y creá design tokens profesionales en minutos.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-all hover:opacity-90"
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: `${theme.radius.borderRadiusLg}px`,
              boxShadow: theme.shadows.shadowLg,
            }}
          >
            <Zap size={20} />
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-4 py-8 sm:px-6 lg:px-8"
        style={{ borderTopColor: theme.colors.border }}
      >
        <div className="mx-auto max-w-7xl text-center">
          <p
            className="text-sm"
            style={{
              color: theme.colors.textMuted,
              fontSize: `${theme.typography.fontSizeSm}px`,
            }}
          >
            © 2025 Theme Builder. Construido con Next.js, TypeScript y Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  )
}
