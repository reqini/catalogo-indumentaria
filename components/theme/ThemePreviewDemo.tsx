'use client'

import { useTheme } from '@/lib/theme-context'

export default function ThemePreviewDemo() {
  const { theme } = useTheme()

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
      className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white"
      style={{
        ...styles,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: `'${theme.typography.fontBase}', sans-serif`,
      }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: theme.colors.border,
          padding: `${theme.spacing.spacingMd}px`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md font-bold text-white"
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: `${theme.radius.borderRadiusMd}px`,
              }}
            >
              T
            </div>
            <span
              className="font-bold"
              style={{
                fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
                fontSize: `${theme.typography.fontSizeLg}px`,
                fontWeight: theme.typography.fontWeightBold,
              }}
            >
              Theme Demo
            </span>
          </div>
          <nav className="flex gap-4">
            <a
              href="#"
              className="transition-opacity hover:opacity-80"
              style={{ color: theme.colors.textMuted }}
            >
              Home
            </a>
            <a
              href="#"
              className="transition-opacity hover:opacity-80"
              style={{ color: theme.colors.textMuted }}
            >
              About
            </a>
            <a
              href="#"
              className="transition-opacity hover:opacity-80"
              style={{ color: theme.colors.textMuted }}
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="px-6 py-12 text-center"
        style={{
          paddingTop: `${theme.spacing.spacingXl}px`,
          paddingBottom: `${theme.spacing.spacingXl}px`,
        }}
      >
        <h1
          className="mb-4 font-bold"
          style={{
            fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
            fontSize: `${theme.typography.fontSizeBase * theme.typography.headingScale * 2.5}px`,
            fontWeight: theme.typography.fontWeightBold,
            color: theme.colors.text,
          }}
        >
          Welcome to Theme Builder
        </h1>
        <p
          className="mx-auto mb-6 max-w-2xl"
          style={{
            fontSize: `${theme.typography.fontSizeLg}px`,
            color: theme.colors.textMuted,
            marginBottom: `${theme.spacing.spacingMd}px`,
          }}
        >
          Create beautiful design tokens and see them in action. Customize colors, typography,
          spacing, and more.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: `${theme.radius.borderRadiusMd}px`,
              padding: `${theme.spacing.spacingSm}px ${theme.spacing.spacingLg}px`,
              fontWeight: theme.typography.fontWeightBold,
              boxShadow: theme.shadows.shadowMd,
            }}
          >
            Get Started
          </button>
          <button
            className="px-6 py-3 font-semibold transition-all hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.secondary,
              border: `2px solid ${theme.colors.secondary}`,
              borderRadius: `${theme.radius.borderRadiusMd}px`,
              padding: `${theme.spacing.spacingSm}px ${theme.spacing.spacingLg}px`,
              fontWeight: theme.typography.fontWeightBold,
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Cards Grid */}
      <section
        className="px-6 py-8"
        style={{
          padding: `${theme.spacing.spacingLg}px ${theme.spacing.spacingMd}px`,
        }}
      >
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: `${theme.spacing.spacingMd}px`,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 transition-all hover:scale-105"
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: `${theme.radius.borderRadiusLg}px`,
                padding: `${theme.spacing.spacingLg}px`,
                boxShadow: theme.shadows.shadowMd,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-md font-bold text-white"
                style={{
                  backgroundColor: theme.colors.accent,
                  borderRadius: `${theme.radius.borderRadiusMd}px`,
                  marginBottom: `${theme.spacing.spacingMd}px`,
                }}
              >
                {i}
              </div>
              <h3
                className="mb-2 font-bold"
                style={{
                  fontFamily: `'${theme.typography.fontHeading}', sans-serif`,
                  fontSize: `${theme.typography.fontSizeBase * theme.typography.headingScale}px`,
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.colors.text,
                  marginBottom: `${theme.spacing.spacingSm}px`,
                }}
              >
                Feature {i}
              </h3>
              <p
                className="mb-4"
                style={{
                  fontSize: `${theme.typography.fontSizeBase}px`,
                  color: theme.colors.textMuted,
                  marginBottom: `${theme.spacing.spacingMd}px`,
                }}
              >
                This is a sample card that demonstrates how your theme looks in a real component.
              </p>
              <button
                className="text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  color: theme.colors.primary,
                  fontSize: `${theme.typography.fontSizeSm}px`,
                  fontWeight: theme.typography.fontWeightBold,
                }}
              >
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section
        className="px-6 py-8"
        style={{
          padding: `${theme.spacing.spacingLg}px ${theme.spacing.spacingMd}px`,
          backgroundColor: theme.colors.surface,
        }}
      >
        <div
          className="mx-auto max-w-3xl rounded-lg p-8 text-center"
          style={{
            padding: `${theme.spacing.spacingXl}px`,
            borderRadius: `${theme.radius.borderRadiusLg}px`,
            backgroundColor: theme.colors.background,
            boxShadow: theme.shadows.shadowSm,
          }}
        >
          <p
            className="mb-4 text-lg italic"
            style={{
              fontSize: `${theme.typography.fontSizeLg}px`,
              color: theme.colors.text,
              marginBottom: `${theme.spacing.spacingMd}px`,
            }}
          >
            "This theme builder makes it incredibly easy to create consistent design systems. The
            real-time preview is a game-changer!"
          </p>
          <p
            className="font-semibold"
            style={{
              fontWeight: theme.typography.fontWeightBold,
              color: theme.colors.textMuted,
            }}
          >
            — Design Team Lead
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="mt-8 border-t px-6 py-6 text-center"
        style={{
          borderTopColor: theme.colors.border,
          paddingTop: `${theme.spacing.spacingMd}px`,
          paddingBottom: `${theme.spacing.spacingMd}px`,
          marginTop: `${theme.spacing.spacingLg}px`,
        }}
      >
        <p
          className="text-sm"
          style={{
            fontSize: `${theme.typography.fontSizeSm}px`,
            color: theme.colors.textMuted,
          }}
        >
          © 2025 Theme Builder. Built with Next.js and TypeScript.
        </p>
      </footer>
    </div>
  )
}
