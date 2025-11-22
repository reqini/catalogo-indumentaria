# Solución Definitiva - Build Vercel y Producción

## 🎯 Objetivo

Resolver de forma permanente los problemas de build en Vercel y garantizar despliegues productivos estables.

## ✅ Cambios Implementados

### 1. `.vercelignore` - Configuración Correcta

**Problema:** Scripts críticos eran eliminados del deployment.

**Solución:** Solo ignorar scripts específicos de desarrollo/tests, NO scripts críticos.

**Scripts Críticos Permitidos:**
- ✅ `verify-mp-config.mjs` - Verificación Mercado Pago
- ✅ `create-pwa-icons.mjs` - Generación íconos PWA
- ✅ `create-real-pwa-icons.mjs` - Generación íconos PWA reales
- ✅ `verificar-produccion.mjs` - Verificación producción
- ✅ `generar-jwt-secret.mjs` - Generación JWT secrets

**Scripts Ignorados (solo desarrollo/tests):**
- ❌ `scripts/*.sh` - Scripts de shell
- ❌ `scripts/test-*.mjs` - Scripts de test
- ❌ `scripts/seed*.mjs` - Scripts de seed
- ❌ `scripts/migrate-*.mjs` - Scripts de migración
- ❌ Scripts específicos de desarrollo listados explícitamente

### 2. `vercel.json` - Configuración Estable

```json
{
  "buildCommand": "pnpm prebuild:vercel && pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "env": {
    "NODE_ENV": "production",
    "VERCEL_ALLOW_RUN_SCRIPTS": "core-js esbuild unrs-resolver"
  }
}
```

**Características:**
- Build command optimizado
- Lifecycle scripts autorizados
- Instalación con lockfile congelado

### 3. `package.json` - Scripts de Build

```json
{
  "build": "next build",
  "build:vercel": "next build",
  "prebuild": "pnpm lint && pnpm typecheck",
  "prebuild:vercel": "pnpm lint && pnpm typecheck"
}
```

**Nota:** `verify-mp-config.mjs` removido de prebuild para evitar errores si el script no está disponible.

### 4. Variables de Entorno Requeridas en Vercel

**Críticas para Producción:**
```
NEXT_PUBLIC_SUPABASE_URL=https://yqggrzxjhylnxjuagfyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
MP_ACCESS_TOKEN=tu_access_token
NEXT_PUBLIC_MP_PUBLIC_KEY=tu_public_key
JWT_SECRET=tu_jwt_secret
MONGODB_URI=tu_mongodb_uri
```

**Configuración en Vercel:**
1. Ir a Project Settings → Environment Variables
2. Agregar todas las variables requeridas
3. Asegurar que estén disponibles para Production, Preview y Development

### 5. Supabase Storage - Bucket "productos"

**Configuración Requerida:**
1. Crear bucket `productos` en Supabase Dashboard
2. Configurar políticas RLS:
   - INSERT: Permitir para usuarios autenticados
   - SELECT: Permitir público (para lectura de imágenes)
   - UPDATE: Permitir para usuarios autenticados
   - DELETE: Permitir para usuarios autenticados

**Verificación:**
```bash
# Verificar que el bucket existe
curl -X GET \
  'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/bucket' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

### 6. Build ID y Versionado

**Configuración en `next.config.js`:**
```javascript
env: {
  NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA 
    ? `${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}-${Date.now()}`
    : `dev-${Date.now()}`,
}
```

**Display en Footer:**
- Muestra versión del commit
- Muestra fecha de build
- Muestra build ID único

## 🧪 QA Completo

### Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Build local
pnpm build

# 3. Verificar que no hay warnings
# Debe completar sin errores relacionados con scripts faltantes

# 4. Verificar scripts críticos disponibles
ls -la scripts/ | grep -E "verify-mp-config|create-pwa-icons|create-real-pwa-icons"
```

### Preview Deployment

1. Push a branch diferente de `main`
2. Verificar que Vercel crea preview deployment
3. Verificar logs de build:
   - ✅ No debe eliminar scripts críticos
   - ✅ Build debe completar exitosamente
   - ✅ No debe haber warnings de lifecycle scripts

### Production Deployment

1. Push a `main`
2. Verificar deploy automático en Vercel
3. Verificar funcionalidad:
   - ✅ Upload de imágenes a Supabase Storage
   - ✅ Mercado Pago checkout funcional
   - ✅ PWA icons y manifest funcionando
   - ✅ Build ID visible en footer

## 🔍 Verificación Post-Deploy

### 1. Upload de Imágenes

**Test Manual:**
1. Ir a `/admin`
2. Crear/editar producto
3. Subir imagen
4. Verificar que:
   - ✅ Imagen se sube a Supabase Storage
   - ✅ URL generada es válida (empieza con `https://yqggrzxjhylnxjuagfyr.supabase.co`)
   - ✅ Imagen se muestra correctamente

### 2. Mercado Pago

**Test Manual:**
1. Agregar producto al carrito
2. Ir a checkout
3. Verificar que:
   - ✅ No aparece error "MP_ACCESS_TOKEN no encontrado"
   - ✅ Checkout de Mercado Pago se carga correctamente
   - ✅ Pago se procesa exitosamente

### 3. PWA Icons y Manifest

**Test Manual:**
1. Verificar que existen íconos en `/public`:
   - `icon-192x192.png`
   - `icon-512x512.png`
2. Verificar `manifest.json`:
   - ✅ Contiene referencias correctas a íconos
   - ✅ Icons apuntan a rutas correctas
3. Verificar en DevTools → Application → Manifest:
   - ✅ Manifest se carga correctamente
   - ✅ Icons se muestran correctamente

### 4. Build ID en Footer

**Test Manual:**
1. Ir a cualquier página del sitio
2. Scroll hasta footer
3. Verificar que muestra:
   - ✅ Versión del commit (7 caracteres)
   - ✅ Fecha de build
   - ✅ Build ID (en producción)

## 🚨 Troubleshooting

### Error: "Scripts eliminados en .vercelignore"

**Solución:**
1. Verificar que `.vercelignore` NO excluye scripts críticos
2. Verificar que scripts críticos están en la lista de permitidos
3. Hacer push y verificar logs de build

### Error: "Bucket productos no existe"

**Solución:**
1. Ir a Supabase Dashboard → Storage
2. Crear bucket `productos`
3. Configurar políticas RLS
4. Verificar que bucket es público para lectura

### Error: "MP_ACCESS_TOKEN no encontrado"

**Solución:**
1. Verificar que `MP_ACCESS_TOKEN` está configurado en Vercel
2. Verificar que está disponible para Production
3. Verificar formato del token (debe empezar con `APP_USR-` o `TEST-`)

### Error: "StorageUnknownError: Failed to fetch"

**Solución:**
1. Verificar CSP en `vercel.json` y `next.config.js`
2. Asegurar que `connect-src` incluye `https://*.supabase.co`
3. Verificar que `img-src` incluye `https://*.supabase.co`

## 📋 Checklist Pre-Deploy

- [ ] `.vercelignore` configurado correctamente
- [ ] `vercel.json` tiene build command correcto
- [ ] Variables de entorno configuradas en Vercel
- [ ] Bucket `productos` existe en Supabase
- [ ] Políticas RLS configuradas en Supabase
- [ ] Build local funciona sin errores
- [ ] Scripts críticos disponibles
- [ ] PWA icons generados y en `/public`
- [ ] `manifest.json` configurado correctamente

## 📋 Checklist Post-Deploy

- [ ] Build en Vercel completa sin warnings
- [ ] No se eliminan scripts críticos
- [ ] Upload de imágenes funciona
- [ ] Mercado Pago checkout funciona
- [ ] PWA icons y manifest funcionan
- [ ] Build ID visible en footer
- [ ] Preview y Production sincronizados

## 🔒 Prevención de Regresiones

1. **NO modificar `.vercelignore`** sin revisar impacto en scripts críticos
2. **NO remover scripts críticos** de la lista de permitidos
3. **NO cambiar build command** sin verificar compatibilidad
4. **Siempre verificar** que variables de entorno están configuradas antes de deploy
5. **Documentar cambios** en este archivo cuando se modifique configuración

## 📚 Referencias

- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [Supabase Storage Setup](https://supabase.com/docs/guides/storage)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [PNPM Lifecycle Scripts](https://pnpm.io/npmrc#enable-pre-post-scripts)

---

**Última actualización:** Noviembre 2024
**Mantenido por:** Equipo DevOps

