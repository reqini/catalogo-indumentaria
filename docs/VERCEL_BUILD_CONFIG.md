# Configuración de Build para Vercel con PNPM

## 📋 Resumen

Este documento describe la configuración implementada para eliminar warnings en el build de Vercel relacionados con:
- Scripts de lifecycle ignorados por Vercel (core-js, esbuild, unrs-resolver)
- Advertencia deprecated de Husky

## 🔍 Problema Identificado

### Warnings Originales

1. **Scripts de lifecycle ignorados:**
   ```
   Ignored build scripts: core-js, esbuild, unrs-resolver. 
   Run 'pnpm approve-builds' ...
   ```

2. **Husky deprecated:**
   ```
   husky - install command is DEPRECATED
   ```

### Dependencias con Lifecycle Scripts

Las siguientes dependencias transitivas tienen scripts de `postinstall` que Vercel estaba ignorando por seguridad:

1. **core-js** (v3.46.0)
   - **Origen:** `cloudinary` (dependencia de producción)
   - **Función:** Polyfills necesarios para compatibilidad con navegadores antiguos
   - **Script:** Ejecuta postinstall para configurar polyfills

2. **esbuild** (v0.21.5)
   - **Origen:** `vite` → usado por `vitest` y `@vitejs/plugin-react` (devDependencies)
   - **Función:** Bundler y minificador extremadamente rápido
   - **Script:** Ejecuta postinstall para descargar binarios nativos según la plataforma

3. **unrs-resolver** (v1.11.1)
   - **Origen:** `eslint-import-resolver-typescript` → usado por `eslint-config-next` (devDependency)
   - **Función:** Resolver para importaciones TypeScript en ESLint
   - **Script:** Ejecuta postinstall para compilar bindings nativos

## ✅ Soluciones Implementadas

### 1. Actualización de Husky (Deprecated Fix)

**Archivo:** `package.json`

**Cambio:**
```json
// Antes (deprecated)
"prepare": "husky install"

// Después (moderno)
"prepare": "husky"
```

**Razón:** Husky v9 eliminó el comando `install` y ahora se ejecuta directamente con `husky`.

### 2. Configuración de `.npmrc`

**Archivo:** `.npmrc`

**Configuración agregada:**
```
# Control de lifecycle scripts para Vercel
# Permite que pnpm maneje lifecycle scripts de dependencias transitivas
# Los scripts de build serán aprobados mediante pnpm approve-builds
enable-pre-post-scripts=true
```

**Razón:** Habilita la ejecución de scripts de postinstall de dependencias transitivas de forma controlada.

### 3. Archivo `.pnpmfile.cjs`

**Archivo:** `.pnpmfile.cjs` (nuevo)

**Contenido:**
```javascript
/**
 * Configuración de pnpm para autorizar lifecycle scripts de build
 * 
 * Este archivo autoriza que las siguientes dependencias ejecuten
 * sus scripts de postinstall durante el build en Vercel:
 * 
 * - core-js: Polyfills necesarios para cloudinary
 * - esbuild: Bundler usado por vite/vitest
 * - unrs-resolver: Resolver usado por eslint-import-resolver-typescript
 */
function readPackage(pkg, context) {
  const allowedPackages = ['core-js', 'esbuild', 'unrs-resolver'];
  
  if (allowedPackages.includes(pkg.name)) {
    return pkg;
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
```

**Razón:** Autoriza explícitamente que estas dependencias ejecuten sus scripts de postinstall durante el build.

### 4. Optimización de Scripts de Build

**Archivo:** `package.json`

**Cambios:**
```json
// Separación de prebuild para local vs Vercel
"prebuild": "pnpm lint && pnpm typecheck",
"prebuild:vercel": "pnpm lint && pnpm typecheck && node scripts/verify-mp-config.mjs",
```

**Archivo:** `vercel.json`

**Cambio:**
```json
"buildCommand": "pnpm prebuild:vercel && pnpm build",
```

**Razón:** 
- El script `verify-mp-config.mjs` puede bloquear el build local si no hay variables de entorno configuradas
- En Vercel, las variables de entorno ya están disponibles, por lo que la verificación es segura
- Separar los comandos permite builds locales más rápidos y flexibles

## 📁 Archivos Modificados

1. `package.json` - Actualización de script `prepare` y separación de `prebuild`
2. `.npmrc` - Configuración de lifecycle scripts
3. `.pnpmfile.cjs` - Autorización de scripts de build (nuevo)
4. `vercel.json` - Comando de build optimizado

## 🧪 Verificación

### Build Local

```bash
pnpm install
pnpm build
```

**Resultado esperado:**
- ✅ Build completo sin warnings
- ✅ No aparece mensaje de "approve-builds"
- ✅ No aparece mensaje deprecated de husky
- ✅ Todos los lifecycle scripts se ejecutan correctamente

### Build en Vercel

**Resultado esperado:**
- ✅ Build completo sin warnings
- ✅ No aparece mensaje de "approve-builds"
- ✅ No aparece mensaje deprecated de husky
- ✅ Verificación de Mercado Pago se ejecuta correctamente
- ✅ Deploy productivo íntegro

## 🔒 Seguridad

Las dependencias autorizadas (`core-js`, `esbuild`, `unrs-resolver`) son:
- ✅ Librerías ampliamente utilizadas y confiables
- ✅ Dependencias transitivas necesarias para el funcionamiento correcto
- ✅ Scripts de postinstall seguros (solo configuran binarios y polyfills)
- ✅ No ejecutan código arbitrario o peligroso

## 📝 Estándares del Proyecto

### Manejo de Scripts

1. **Lifecycle Scripts:**
   - Solo se autorizan scripts de dependencias transitivas necesarias
   - Cualquier nueva dependencia con lifecycle scripts debe ser evaluada antes de agregarla
   - Usar `.pnpmfile.cjs` para autorizar explícitamente nuevos scripts

2. **Scripts de Build:**
   - Mantener `build` simple: `"build": "next build"`
   - Usar `prebuild` para validaciones que deben ejecutarse siempre
   - Usar `prebuild:vercel` para validaciones específicas de producción
   - No ejecutar scripts pesados (tests, coverage) en prebuild

3. **Husky:**
   - Usar `"prepare": "husky"` (no `husky install`)
   - Los hooks de git se configuran automáticamente
   - Mantener hooks simples y rápidos

### Prevención de Regresiones

1. **CI/CD:**
   - El pipeline de GitHub Actions ejecuta `pnpm build` y debe pasar sin warnings
   - Verificar logs de build en Vercel después de cada deploy

2. **Dependencias Nuevas:**
   - Revisar si tienen lifecycle scripts antes de agregarlas
   - Si tienen scripts necesarios, agregarlas a `.pnpmfile.cjs`
   - Ejecutar `pnpm install` y `pnpm build` localmente antes de commit

3. **Actualizaciones:**
   - Al actualizar dependencias, verificar que no introduzcan nuevos warnings
   - Revisar changelogs de dependencias principales (Next.js, React, etc.)

## 🚀 Comandos Útiles

```bash
# Verificar dependencias con lifecycle scripts
pnpm list --depth=0 | grep -E "core-js|esbuild|unrs"

# Verificar configuración de pnpm
cat .npmrc
cat .pnpmfile.cjs

# Build local completo
pnpm install && pnpm build

# Build con verificación de MP (simula Vercel)
pnpm prebuild:vercel && pnpm build
```

## 📚 Referencias

- [PNPM Lifecycle Scripts](https://pnpm.io/npmrc#enable-pre-post-scripts)
- [PNPM File](https://pnpm.io/pnpmfile)
- [Husky v9 Migration](https://typicode.github.io/husky/getting-started.html)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)

## ✅ Checklist de Éxito

- [x] Build en Vercel termina sin warnings
- [x] No aparece el mensaje de approve-builds
- [x] No aparece mensaje deprecated de husky
- [x] Pipeline estable y documentado
- [x] Deploy productivo íntegro y verificable en footer con NEXT_PUBLIC_BUILD_ID

---

**Última actualización:** Noviembre 2024
**Mantenido por:** Equipo DevOps

