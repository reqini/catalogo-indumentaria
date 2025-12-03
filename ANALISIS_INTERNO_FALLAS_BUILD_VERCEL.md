# 🔍 ANÁLISIS INTERNO – POSIBLES CAUSAS DE FALLA EN BUILDS VERCEL

**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Versión:** Análisis Profundo v1.0

---

## 📋 RESUMEN EJECUTIVO

Análisis técnico completo de posibles causas de fallos intermitentes en builds de Vercel.

---

## ✅ ARCHIVOS AFECTADOS

### Archivos con Fetch en Build Time (Potencialmente Problemáticos):

1. **`app/page.tsx`**
   - ✅ **Cliente-side** (`'use client'`) - NO PROBLEMA
   - `getBanners()` se ejecuta en useEffect (cliente)
   - `getProducts()` se ejecuta en useEffect (cliente)

2. **`app/api/checkout/create-order-simple/route.ts`**
   - ⚠️ **Línea 269**: `fetch` interno a `/api/pago`
   - ⚠️ **Línea 400**: `fetch` interno a `/api/pago`
   - ✅ Son fetch internos, no externos - NO PROBLEMA

3. **Componentes Admin**
   - ✅ Todos usan `'use client'` - NO PROBLEMA
   - Fetch solo en cliente (useEffect)

### Archivos con Hooks Problemáticos:

1. **`app/(ecommerce)/catalogo/CatalogoClient.tsx`**
   - ⚠️ **Línea 59**: `useCallback` con `debounce` (ya corregido a `useMemo`)
   - ⚠️ **Línea 99**: `useEffect` con dependencias incompletas (ya corregido)

---

## ❌ ERRORES SILENCIOSOS DETECTADOS

### 1. Dependencias sin Versión Fija

**Problema:**

- `package.json` usa `^` en todas las dependencias
- Esto permite actualizaciones menores automáticas
- Puede causar builds inconsistentes entre entornos

**Archivos Afectados:**

- `package.json` - Todas las dependencias

**Impacto:** MEDIO

**Solución:**

- Usar versiones exactas o `packageManager` fijo
- Agregar `pnpm-lock.yaml` al repo (ya está)

### 2. Fetch Externos Potenciales

**Problema:**

- No se detectaron fetch externos en build time
- ✅ Todo está en cliente-side o APIs internas

**Impacto:** BAJO

### 3. Google Fonts

**Problema:**

- ✅ Ya corregido - No hay @import en CSS
- ✅ Usa next/font/google correctamente

**Impacto:** RESUELTO

---

## ⚠️ PROBLEMAS DE CACHE

### 1. Cache de Next.js (.next/cache)

**Problema:**

- Vercel puede reusar cache entre builds
- Cache corrupto puede causar builds fallidos

**Solución Aplicada:**

- ✅ `NEXT_IGNORE_CACHE=true` en buildCommand
- ✅ `generateEtags: false` en next.config.js

**Estado:** ✅ RESUELTO

### 2. Cache de pnpm (pnpm-store)

**Problema:**

- Cache de pnpm puede tener dependencias inconsistentes

**Solución:**

- ✅ `--frozen-lockfile` en installCommand
- ✅ `pnpm-lock.yaml` en repo

**Estado:** ✅ RESUELTO

### 3. Cache de Vercel (.vercel/cache)

**Problema:**

- Vercel puede cachear builds anteriores

**Solución:**

- ✅ `ignoreCommand: ""` en vercel.json (no ignora nada)
- ✅ Build siempre limpio

**Estado:** ✅ RESUELTO

---

## ⚠️ DEPENDENCIAS INCONSISTENTES

### 1. Versiones sin Fijar

**Problema:**

- Todas las dependencias usan `^` (permite actualizaciones menores)
- Puede causar builds inconsistentes

**Ejemplo:**

```json
"next": "14.2.5"  // Debería ser exacto o usar packageManager
```

**Solución Recomendada:**

- Agregar `packageManager: "pnpm@9.1.4"` en package.json
- Considerar usar versiones exactas para dependencias críticas

**Impacto:** MEDIO

### 2. Dependencias Opcionales Faltantes

**Problema:**

- `xlsx` es opcional pero se usa en código
- Si no está instalado, causa error en runtime

**Archivos Afectados:**

- `components/admin/BulkImportTabs.tsx`

**Solución:**

- ✅ Ya tiene manejo de error cuando no está disponible
- ⚠️ Debería estar en `optionalDependencies` o documentado

**Impacto:** BAJO

---

## ⚠️ APIs EXTERNAS FALLANDO

### 1. Google Fonts

**Estado:** ✅ RESUELTO

- No hay fetch externo a Google Fonts
- Usa next/font/google (descarga local)

### 2. Supabase

**Estado:** ⚠️ POTENCIAL PROBLEMA

- Si Supabase está caído durante build, puede fallar
- Pero las APIs solo se llaman en runtime, no en build

**Impacto:** BAJO (solo afecta runtime, no build)

### 3. Mercado Pago

**Estado:** ✅ NO PROBLEMA

- Solo se usa en runtime (checkout)
- No afecta build

---

## ⚠️ INCOMPATIBILIDADES PNPM

### 1. Versión de pnpm

**Problema:**

- No hay `packageManager` especificado en package.json
- Vercel puede usar diferentes versiones de pnpm

**Solución:**

- Agregar `"packageManager": "pnpm@9.1.4"` en package.json

**Impacto:** MEDIO

### 2. pnpm-lock.yaml

**Estado:** ✅ OK

- `pnpm-lock.yaml` está en repo
- `--frozen-lockfile` en installCommand

---

## ⚠️ SCRIPTS QUE ROMPEN BUILD

### 1. prebuild

**Estado:** ✅ OK

- Script pre-build-check.mjs funciona correctamente
- No bloquea builds válidos

### 2. prebuild:vercel

**Estado:** ✅ OK

- Mismo script que prebuild
- Configurado correctamente

---

## ⚠️ RUTAS CON SSR ACCIDENTAL

### 1. Páginas con 'use client'

**Estado:** ✅ OK

- Todas las páginas principales usan `'use client'`
- No hay SSR accidental

### 2. API Routes

**Estado:** ✅ OK

- API routes son server-side por diseño
- No causan problemas en build

---

## ⚠️ FETCH EN BUILD-TIME BLOQUEADOS

### 1. Fetch Externos

**Estado:** ✅ NO DETECTADOS

- No hay fetch externos en build time
- Todo está en cliente o APIs internas

### 2. Fetch Internos

**Estado:** ✅ OK

- Fetch internos no causan problemas
- Solo se ejecutan en runtime

---

## ⚠️ FUENTES EXTERNAS INSEGURAS

### 1. Google Fonts

**Estado:** ✅ RESUELTO

- No hay @import de Google Fonts
- Usa next/font/google correctamente

### 2. Otras Fuentes

**Estado:** ✅ OK

- No hay otras fuentes externas

---

## 📊 RESUMEN DE PROBLEMAS

### Críticos:

- ❌ Ninguno detectado

### Medios:

- ⚠️ Dependencias sin versión fija (usar packageManager)
- ⚠️ Falta packageManager en package.json

### Bajos:

- ⚠️ xlsx es opcional pero usado (ya manejado)

### Resueltos:

- ✅ Google Fonts
- ✅ Cache
- ✅ Hooks problemáticos
- ✅ Fetch en build time

---

## 🎯 RECOMENDACIONES

1. **Agregar packageManager** en package.json
2. **Considerar versiones exactas** para dependencias críticas
3. **Documentar dependencias opcionales** (xlsx)
4. **Mantener pre-build-check** actualizado
5. **Monitorear builds** en Vercel Dashboard

---

**Análisis completado.** ✅
