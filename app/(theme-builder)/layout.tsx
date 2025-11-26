'use client'

import { ThemeProvider } from '@/lib/theme-context'

export default function ThemeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
