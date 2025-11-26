import { ThemeTokens } from '@/types/theme'

export function exportToJSON(theme: ThemeTokens): string {
  return JSON.stringify(theme, null, 2)
}

export function exportToCSSVariables(theme: ThemeTokens): string {
  const cssVars: string[] = []

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`  --color-${key}: ${value};`)
  })

  // Typography
  cssVars.push(`  --font-base: '${theme.typography.fontBase}', sans-serif;`)
  cssVars.push(`  --font-heading: '${theme.typography.fontHeading}', sans-serif;`)
  cssVars.push(`  --font-size-base: ${theme.typography.fontSizeBase}px;`)
  cssVars.push(`  --font-size-sm: ${theme.typography.fontSizeSm}px;`)
  cssVars.push(`  --font-size-lg: ${theme.typography.fontSizeLg}px;`)
  cssVars.push(`  --font-weight-base: ${theme.typography.fontWeightBase};`)
  cssVars.push(`  --font-weight-bold: ${theme.typography.fontWeightBold};`)

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key.replace('spacing', '').toLowerCase()}: ${value}px;`)
  })

  // Radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key.replace('borderRadius', '').toLowerCase()}: ${value}px;`)
  })

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key.replace('shadow', '').toLowerCase()}: ${value};`)
  })

  // Breakpoints
  Object.entries(theme.breakpoints).forEach(([key, value]) => {
    cssVars.push(`  --breakpoint-${key.replace('bp', '').toLowerCase()}: ${value}px;`)
  })

  return `:root {\n${cssVars.join('\n')}\n}`
}

export function exportToTailwind(theme: ThemeTokens): string {
  const config: string[] = []
  config.push('module.exports = {')
  config.push('  theme: {')
  config.push('    extend: {')
  config.push('      colors: {')

  Object.entries(theme.colors).forEach(([key, value]) => {
    const tailwindKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    config.push(`        '${tailwindKey}': '${value}',`)
  })

  config.push('      },')
  config.push('      fontFamily: {')
  config.push(`        'base': ['${theme.typography.fontBase}', 'sans-serif'],`)
  config.push(`        'heading': ['${theme.typography.fontHeading}', 'sans-serif'],`)
  config.push('      },')
  config.push('      fontSize: {')
  config.push(`        'base': '${theme.typography.fontSizeBase}px',`)
  config.push(`        'sm': '${theme.typography.fontSizeSm}px',`)
  config.push(`        'lg': '${theme.typography.fontSizeLg}px',`)
  config.push('      },')
  config.push('      spacing: {')

  Object.entries(theme.spacing).forEach(([key, value]) => {
    const tailwindKey = key.replace('spacing', '').toLowerCase()
    config.push(`        '${tailwindKey}': '${value}px',`)
  })

  config.push('      },')
  config.push('      borderRadius: {')
  config.push(`        'sm': '${theme.radius.borderRadiusSm}px',`)
  config.push(`        'md': '${theme.radius.borderRadiusMd}px',`)
  config.push(`        'lg': '${theme.radius.borderRadiusLg}px',`)
  config.push('      },')
  config.push('      boxShadow: {')
  config.push(`        'sm': '${theme.shadows.shadowSm}',`)
  config.push(`        'md': '${theme.shadows.shadowMd}',`)
  config.push(`        'lg': '${theme.shadows.shadowLg}',`)
  config.push('      },')
  config.push('      screens: {')
  config.push(`        'mobile': '${theme.breakpoints.bpMobile}px',`)
  config.push(`        'tablet': '${theme.breakpoints.bpTablet}px',`)
  config.push(`        'desktop': '${theme.breakpoints.bpDesktop}px',`)
  config.push('      },')
  config.push('    },')
  config.push('  },')
  config.push('}')

  return config.join('\n')
}

export function exportToJSS(theme: ThemeTokens): string {
  const jss: string[] = []
  jss.push('const theme = {')
  jss.push('  palette: {')

  Object.entries(theme.colors).forEach(([key, value]) => {
    const jssKey = key.charAt(0).toLowerCase() + key.slice(1).replace(/([A-Z])/g, '$1')
    jss.push(`    ${jssKey}: '${value}',`)
  })

  jss.push('  },')
  jss.push('  typography: {')
  jss.push(`    fontFamily: '${theme.typography.fontBase}', sans-serif,`)
  jss.push(`    fontFamilyHeading: '${theme.typography.fontHeading}', sans-serif,`)
  jss.push(`    fontSize: ${theme.typography.fontSizeBase},`)
  jss.push(`    fontSizeSm: ${theme.typography.fontSizeSm},`)
  jss.push(`    fontSizeLg: ${theme.typography.fontSizeLg},`)
  jss.push(`    fontWeight: ${theme.typography.fontWeightBase},`)
  jss.push(`    fontWeightBold: ${theme.typography.fontWeightBold},`)
  jss.push('  },')
  jss.push('  spacing: {')

  Object.entries(theme.spacing).forEach(([key, value]) => {
    const jssKey =
      key.replace('spacing', '').charAt(0).toLowerCase() + key.replace('spacing', '').slice(1)
    jss.push(`    ${jssKey}: ${value},`)
  })

  jss.push('  },')
  jss.push('  shape: {')
  jss.push(`    borderRadius: ${theme.radius.borderRadiusMd},`)
  jss.push('  },')
  jss.push('  shadows: [')

  Object.values(theme.shadows).forEach((shadow) => {
    jss.push(`    '${shadow}',`)
  })

  jss.push('  ],')
  jss.push('  breakpoints: {')
  jss.push(`    mobile: ${theme.breakpoints.bpMobile},`)
  jss.push(`    tablet: ${theme.breakpoints.bpTablet},`)
  jss.push(`    desktop: ${theme.breakpoints.bpDesktop},`)
  jss.push('  },')
  jss.push('}')
  jss.push('')
  jss.push('export default theme')

  return jss.join('\n')
}

export function exportToBootstrap(theme: ThemeTokens): string {
  const scss: string[] = []
  scss.push('// Bootstrap Theme Variables')
  scss.push('')

  Object.entries(theme.colors).forEach(([key, value]) => {
    const bootstrapKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    scss.push(`$${bootstrapKey}: ${value};`)
  })

  scss.push('')
  scss.push('// Typography')
  scss.push(`$font-family-base: '${theme.typography.fontBase}', sans-serif;`)
  scss.push(`$font-size-base: ${theme.typography.fontSizeBase}px;`)
  scss.push(`$font-weight-base: ${theme.typography.fontWeightBase};`)
  scss.push(`$font-weight-bold: ${theme.typography.fontWeightBold};`)

  scss.push('')
  scss.push('// Spacing')
  Object.entries(theme.spacing).forEach(([key, value]) => {
    const bootstrapKey = key.replace('spacing', '').toLowerCase()
    scss.push(`$spacer-${bootstrapKey}: ${value}px;`)
  })

  scss.push('')
  scss.push('// Border Radius')
  scss.push(`$border-radius-sm: ${theme.radius.borderRadiusSm}px;`)
  scss.push(`$border-radius: ${theme.radius.borderRadiusMd}px;`)
  scss.push(`$border-radius-lg: ${theme.radius.borderRadiusLg}px;`)

  scss.push('')
  scss.push('// Box Shadow')
  scss.push(`$box-shadow-sm: ${theme.shadows.shadowSm};`)
  scss.push(`$box-shadow: ${theme.shadows.shadowMd};`)
  scss.push(`$box-shadow-lg: ${theme.shadows.shadowLg};`)

  return scss.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
