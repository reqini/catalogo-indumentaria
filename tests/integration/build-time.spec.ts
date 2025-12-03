import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Tests de integración para verificar que no haya problemas en build time
 */

describe('Build Time Checks', () => {
  describe('Google Fonts', () => {
    it('no debe tener @import de Google Fonts en CSS', () => {
      const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf-8')
      expect(globalsCss).not.toContain("@import url('https://fonts.googleapis.com")
    })

    it('debe usar next/font/google en lib/fonts.ts', () => {
      const fontsTs = readFileSync(join(process.cwd(), 'lib/fonts.ts'), 'utf-8')
      expect(fontsTs).toContain('next/font/google')
    })
  })

  describe('Configuración', () => {
    it('debe tener packageManager en package.json', () => {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
      expect(packageJson.packageManager).toBeDefined()
    })

    it('debe tener pnpm-lock.yaml', () => {
      expect(existsSync(join(process.cwd(), 'pnpm-lock.yaml'))).toBe(true)
    })

    it('debe tener forceSwcTransforms en next.config.js', () => {
      const nextConfig = readFileSync(join(process.cwd(), 'next.config.js'), 'utf-8')
      expect(nextConfig).toContain('forceSwcTransforms')
    })

    it('debe tener NEXT_IGNORE_CACHE en vercel.json buildCommand', () => {
      const vercelJson = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf-8'))
      expect(vercelJson.buildCommand).toContain('NEXT_IGNORE_CACHE')
    })
  })

  describe('Dependencias Críticas', () => {
    it('debe tener next instalado', () => {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      expect(allDeps.next).toBeDefined()
    })

    it('debe tener react instalado', () => {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      expect(allDeps.react).toBeDefined()
    })

    it('debe tener react-dom instalado', () => {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      expect(allDeps['react-dom']).toBeDefined()
    })
  })
})
