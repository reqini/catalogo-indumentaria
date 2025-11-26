export interface ThemeTokens {
  colors: {
    primary: string
    primaryVariant: string
    secondary: string
    secondarySoft: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
  }
  typography: {
    fontBase: string
    fontHeading: string
    fontSizeBase: number
    fontSizeSm: number
    fontSizeLg: number
    headingScale: number
    fontWeightBase: number
    fontWeightBold: number
  }
  spacing: {
    spacingXs: number
    spacingSm: number
    spacingMd: number
    spacingLg: number
    spacingXl: number
  }
  radius: {
    borderRadiusSm: number
    borderRadiusMd: number
    borderRadiusLg: number
  }
  shadows: {
    shadowSm: string
    shadowMd: string
    shadowLg: string
  }
  breakpoints: {
    bpMobile: number
    bpTablet: number
    bpDesktop: number
  }
}

export interface ThemePreset {
  id: string
  name: string
  theme: ThemeTokens
  createdAt: string
}

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: '#3b82f6',
    primaryVariant: '#2563eb',
    secondary: '#8b5cf6',
    secondarySoft: '#a78bfa',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#06b6d4',
  },
  typography: {
    fontBase: 'Inter',
    fontHeading: 'Inter',
    fontSizeBase: 16,
    fontSizeSm: 14,
    fontSizeLg: 18,
    headingScale: 1.25,
    fontWeightBase: 400,
    fontWeightBold: 700,
  },
  spacing: {
    spacingXs: 4,
    spacingSm: 8,
    spacingMd: 16,
    spacingLg: 24,
    spacingXl: 32,
  },
  radius: {
    borderRadiusSm: 4,
    borderRadiusMd: 8,
    borderRadiusLg: 12,
  },
  shadows: {
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    bpMobile: 640,
    bpTablet: 768,
    bpDesktop: 1024,
  },
}
