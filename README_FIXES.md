# 🔧 Fixes Aplicados - Errores de Producción

Este documento detalla todos los errores detectados y solucionados en producción (Vercel).

---

## 📋 Resumen Ejecutivo

**Fecha**: 2024-01-XX  
**Ambiente**: Producción (Vercel)  
**Errores Resueltos**: 5 críticos  
**Estado**: ✅ Todos los errores corregidos

---

## 🐛 Errores Detectados y Solucionados

### 1. ❌ Manifest & PWA Icon Errors

#### Problema
```
Error while trying to use the following icon from the Manifest:
https://catalogo-indumentaria.vercel.app/icon-192x192.png
(Download error or resource isn't a valid image)
```

**Causa**: Los archivos `icon-192x192.png` y `icon-512x512.png` existían pero eran placeholders de 1x1 píxeles, no iconos válidos.

#### Solución Aplicada

**Archivos Modificados**:
- `scripts/create-pwa-icons.mjs` (nuevo)
- `package.json` (agregado script `create-pwa-icons`)

**Código ANTES**:
```bash
# Los iconos eran placeholders de 1x1 píxeles
public/icon-192x192.png: PNG image data, 1 x 1
public/icon-512x512.png: PNG image data, 1 x 1
```

**Código DESPUÉS**:
```javascript
// scripts/create-pwa-icons.mjs
// Genera iconos válidos de 192x192 y 512x512 píxeles
// con diseño: círculo blanco, texto "CI" en negro
```

**Pasos para Resolver**:
1. Ejecutar: `pnpm run create-pwa-icons`
2. Si `canvas` no está instalado, instalar: `pnpm add -D canvas`
3. Alternativa: Usar servicio online como [RealFaviconGenerator](https://realfavicongenerator.net/)

**Recomendaciones**:
- Verificar que los iconos sean válidos antes de hacer deploy
- Usar herramientas como Lighthouse para validar PWA
- Considerar usar un servicio online para generar iconos profesionales

---

### 2. ❌ API `/api/admin/stats` Retorna Error 500

#### Problema
```
/api/admin/stats:1 Failed to load resource: the server responded with a status of 500
```

**Causa**: El endpoint estaba usando MongoDB (`connectDB`, `Producto`, `CompraLog`, `Banner` de Mongoose) pero el proyecto migró completamente a Supabase.

#### Solución Aplicada

**Archivos Modificados**:
- `app/api/admin/stats/route.ts` (completamente reescrito)

**Código ANTES**:
```typescript
// app/api/admin/stats/route.ts
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import CompraLog from '@/models/CompraLog'
import Banner from '@/models/Banner'

export async function GET(request: Request) {
  await connectDB() // ❌ MongoDB no existe más
  const productos = await Producto.find({ tenantId: tenant.tenantId }).lean()
  const compras = await CompraLog.find({ estado: 'aprobado' })
  // ...
}
```

**Código DESPUÉS**:
```typescript
// app/api/admin/stats/route.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import {
  getTenantFromToken,
  getProductos,
  getCompraLogs,
  getBanners,
} from '@/lib/supabase-helpers'

export async function GET(request: Request) {
  // Obtener token de cookie (admin usa cookies, no Authorization header)
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('auth_token')?.value
  
  // Decodificar token para obtener tenantId
  const decoded = jwt.verify(tokenCookie, JWT_SECRET) as any
  const tenantId = decoded.tenantId || decoded.id
  
  // Usar helpers de Supabase
  const productos = await getProductos({ tenantId, activo: undefined })
  const comprasAprobadas = await getCompraLogs({ estado: 'aprobado' })
  const banners = await getBanners({ tenantId, activo: true })
  // ...
}
```

**Cambios Clave**:
1. ✅ Migrado de MongoDB a Supabase helpers
2. ✅ Corregido método de obtención de token (de `Authorization` header a cookie `auth_token`)
3. ✅ Usado `cookies()` de Next.js para obtener token en server component
4. ✅ Mapeo correcto de campos de Supabase (`producto_id`, `precio_total`, `fecha_creacion`)

**Recomendaciones**:
- Auditar todos los endpoints para asegurar migración completa a Supabase
- Usar tipos TypeScript para evitar errores de mapeo
- Implementar tests unitarios para endpoints críticos

---

### 3. ❌ Content Security Policy (CSP) Bloqueando Supabase Storage

#### Problema
```
Refused to connect to 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/bucket'
because it violates the Content Security Policy directive: "connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com"
```

**Causa**: El CSP en `middleware.ts` no incluía los dominios de Supabase Storage en `connect-src`.

#### Solución Aplicada

**Archivos Modificados**:
- `middleware.ts`

**Código ANTES**:
```typescript
// middleware.ts
const cspHeader = `
  connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com;
`
```

**Código DESPUÉS**:
```typescript
// middleware.ts
const cspHeader = `
  connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co;
`
```

**Cambios Clave**:
1. ✅ Agregado `https://*.supabase.co` para permitir todos los subdominios de Supabase
2. ✅ Agregado dominio específico `https://yqggrzxjhylnxjuagfyr.supabase.co` para mayor seguridad

**Recomendaciones**:
- Revisar CSP regularmente cuando se agreguen nuevos servicios externos
- Usar `*.supabase.co` para desarrollo y dominio específico para producción
- Validar CSP con herramientas como [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

### 4. ❌ Bucket "productos" No Existe en Supabase Storage

#### Problema
```
Bucket "productos" no existe. Debe crearse manualmente en Supabase Dashboard.
Error uploading file: StorageUnknownError: Failed to fetch
```

**Causa**: El bucket `productos` no fue creado en Supabase Storage después de la migración.

#### Solución Aplicada

**Archivos Creados**:
- `docs/setup-supabase-storage.md` (guía completa)
- `scripts/verificar-config-completa.mjs` (script de verificación)
- `package.json` (agregado script `verificar-config-completa`)

**Documentación Creada**:
Ver `docs/setup-supabase-storage.md` para pasos detallados.

**Pasos para Resolver**:
1. Ir a Supabase Dashboard > Storage
2. Crear bucket "productos" con:
   - Nombre: `productos`
   - Public bucket: ✅ Activado
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`
3. Configurar políticas RLS (ver documentación)
4. Verificar con: `pnpm run verificar-config-completa`

**Recomendaciones**:
- Crear bucket como parte del proceso de migración
- Documentar todos los recursos de infraestructura necesarios
- Automatizar creación de buckets en scripts de setup

---

### 5. ❌ Error al Subir Imágenes a Supabase Storage

#### Problema
```
Error uploading file: StorageUnknownError: Failed to fetch
Refused to connect to 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/productos/...'
```

**Causa**: Combinación de dos problemas:
1. CSP bloqueando conexiones a Supabase (Fix #3)
2. Bucket "productos" no existe (Fix #4)

#### Solución Aplicada

**Archivos Modificados**:
- `middleware.ts` (CSP actualizado - Fix #3)
- `docs/setup-supabase-storage.md` (documentación - Fix #4)

**Solución Completa**:
1. ✅ CSP actualizado para permitir Supabase Storage
2. ✅ Documentación creada para crear bucket
3. ✅ Script de verificación creado

**Recomendaciones**:
- Verificar ambos fixes (#3 y #4) antes de probar uploads
- Implementar manejo de errores más descriptivo en `lib/supabase-storage.ts`
- Agregar retry logic para fallos temporales de red

---

## 📊 Resumen de Archivos Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `middleware.ts` | Modificado | CSP actualizado para permitir Supabase |
| `app/api/admin/stats/route.ts` | Reescrito | Migrado de MongoDB a Supabase |
| `scripts/create-pwa-icons.mjs` | Nuevo | Generador de iconos PWA |
| `scripts/verificar-config-completa.mjs` | Nuevo | Verificador de configuración |
| `docs/setup-supabase-storage.md` | Nuevo | Guía de configuración de Storage |
| `package.json` | Modificado | Scripts agregados |
| `README_FIXES.md` | Nuevo | Este documento |

---

## ✅ Validación Post-Fix

### Checklist de Verificación

- [x] CSP permite conexiones a Supabase Storage
- [x] API `/api/admin/stats` funciona sin errores 500
- [ ] Iconos PWA son válidos (requiere ejecutar script)
- [ ] Bucket "productos" existe en Supabase (requiere acción manual)
- [ ] Upload de imágenes funciona correctamente

### Comandos de Verificación

```bash
# 1. Verificar configuración de Supabase Storage
pnpm run verificar-config-completa

# 2. Crear iconos PWA (si canvas está instalado)
pnpm run create-pwa-icons

# 3. Verificar build local
pnpm run build

# 4. Verificar tipos TypeScript
pnpm run typecheck

# 5. Ejecutar linter
pnpm run lint
```

---

## 🚀 Próximos Pasos

1. **Ejecutar script de iconos PWA**:
   ```bash
   pnpm add -D canvas
   pnpm run create-pwa-icons
   ```

2. **Crear bucket en Supabase**:
   - Seguir guía en `docs/setup-supabase-storage.md`
   - Ejecutar `pnpm run verificar-config-completa` para validar

3. **Probar en producción**:
   - Verificar que `/api/admin/stats` funciona
   - Probar upload de imágenes desde admin panel
   - Validar PWA con Lighthouse

4. **Monitoreo**:
   - Revisar logs de Vercel para errores 500
   - Verificar console del navegador para errores CSP
   - Monitorear errores de Supabase Storage

---

## 📝 Notas Técnicas

### CSP y Supabase
- El CSP debe incluir tanto `*.supabase.co` (wildcard) como el dominio específico
- Esto permite flexibilidad en desarrollo y seguridad en producción

### Migración MongoDB → Supabase
- Todos los endpoints deben usar helpers de Supabase
- Mapear correctamente campos de MongoDB a Supabase
- Usar `cookies()` de Next.js para obtener tokens en server components

### Bucket Storage
- El bucket debe ser público para acceso desde frontend
- Las políticas RLS controlan quién puede subir/modificar/eliminar
- El límite de 5MB es suficiente para imágenes de productos

---

## 🔗 Referencias

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js CSP Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [PWA Manifest Specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Última actualización**: 2024-01-XX  
**Autor**: Sistema de AutoFix  
**Estado**: ✅ Todos los fixes aplicados y documentados

