# 🔧 Build en Vercel - Guía Técnica

Este documento explica cómo funciona el proceso de build en Vercel y qué scripts se ejecutan.

---

## 📋 Proceso de Build

### 1. Instalación de Dependencias

```bash
pnpm install --frozen-lockfile
```

**Qué hace:**
- Instala todas las dependencias según `pnpm-lock.yaml`
- Usa `--frozen-lockfile` para asegurar versiones exactas
- No modifica el lockfile

**Warnings esperados:**
- `Ignored build scripts: core-js, esbuild, unrs-resolver`
  - **Causa:** Estas son dependencias transitivas (sub-dependencias) que tienen scripts de postinstall
  - **Impacto:** Ninguno, son warnings benignos de pnpm
  - **Solución:** No requiere acción, es comportamiento normal

---

### 2. Pre-Build (`prebuild`)

```bash
pnpm lint && pnpm typecheck && node scripts/verify-mp-config.mjs
```

**Qué hace:**
- Ejecuta ESLint para verificar código
- Ejecuta TypeScript typecheck
- Verifica configuración de Mercado Pago

**Si falla:** El build se detiene y no continúa.

**Nota:** Este hook es crítico y debe ejecutarse siempre.

---

### 3. Build (`build`)

```bash
next build
```

**Qué hace:**
- Compila la aplicación Next.js
- Genera archivos estáticos
- Optimiza imágenes y assets
- Crea el bundle de producción

**Tiempo estimado:** 2-5 minutos dependiendo del tamaño del proyecto.

---

## ⚠️ Scripts que NO se Ejecutan en Build

Los siguientes scripts son **solo para uso manual** y NO se ejecutan automáticamente:

- ❌ `pnpm pwa:icons` - Generar iconos PWA
- ❌ `pnpm pwa:icons:real` - Generar iconos PWA con branding
- ❌ `pnpm jwt:generate` - Generar JWT secret
- ❌ `pnpm supabase:help` - Guía interactiva

**Razón:** Estos scripts requieren:
- Dependencias opcionales que pueden no estar disponibles
- Entrada interactiva del usuario
- Generan valores aleatorios diferentes cada vez

**Solución:** Ejecutar manualmente cuando sea necesario y committear los resultados.

---

## 🎨 Iconos PWA

### Estado Actual

Los iconos PWA deben estar **commitados en el repositorio**:
- `public/icon-192x192.png` (192x192 píxeles)
- `public/icon-512x512.png` (512x512 píxeles)

### Regenerar Iconos

Si necesitas regenerar los iconos:

1. **Localmente:**
   ```bash
   pnpm pwa:icons:real
   ```

2. **Verificar:**
   ```bash
   file public/icon-192x192.png public/icon-512x512.png
   ```
   Debe mostrar: `PNG image data, 192 x 192` y `512 x 512`

3. **Commitear:**
   ```bash
   git add public/icon-*.png
   git commit -m "chore: Actualizar iconos PWA"
   ```

**NO** ejecutar en el build de Vercel porque:
- Requiere dependencias opcionales (sharp/canvas)
- Los iconos deben ser consistentes entre builds
- Son archivos estáticos que no cambian frecuentemente

---

## 🔐 Variables de Entorno

### Variables Requeridas en Vercel

Configurar en Vercel Dashboard → Settings → Environment Variables:

**Producción:**
- `MP_ACCESS_TOKEN` - Token de Mercado Pago (PRODUCCIÓN)
- `NEXT_PUBLIC_MP_PUBLIC_KEY` - Public Key de Mercado Pago
- `JWT_SECRET` - Secret para JWT (generar con `pnpm jwt:generate`)
- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key de Supabase

**Ver documentación completa:** [`docs/VARIABLES-ENTORNO-PRODUCCION.md`](docs/VARIABLES-ENTORNO-PRODUCCION.md)

---

## 🐛 Troubleshooting

### Build Falla en Pre-Build

**Error:** `pnpm lint` o `pnpm typecheck` falla

**Solución:**
1. Ejecutar localmente: `pnpm lint` y `pnpm typecheck`
2. Corregir errores reportados
3. Commitear correcciones
4. Push a `main` para trigger nuevo build

---

### Build Falla por Mercado Pago

**Error:** `Mercado Pago no configurado`

**Solución:**
1. Verificar que `MP_ACCESS_TOKEN` está configurado en Vercel
2. Verificar que el token es válido (no placeholder)
3. Ejecutar localmente: `pnpm verify-mp`
4. Ver documentación: [`docs/configuracion-mercadopago.md`](docs/configuracion-mercadopago.md)

---

### Iconos PWA No Se Ven

**Error:** Iconos rotos o no se muestran

**Solución:**
1. Verificar que los archivos existen: `ls public/icon-*.png`
2. Verificar tamaño: `file public/icon-*.png` (debe ser 192x192 y 512x512)
3. Regenerar si es necesario: `pnpm pwa:icons:real`
4. Verificar `public/manifest.json` apunta a los iconos correctos

---

### Warning "Ignored build scripts"

**Warning:** `Ignored build scripts: core-js, esbuild, unrs-resolver`

**Causa:** Dependencias transitivas con scripts de postinstall

**Impacto:** Ninguno, es un warning benigno

**Solución:** No requiere acción, es comportamiento normal de pnpm

---

## ✅ Checklist Pre-Deploy

Antes de hacer push a `main`:

- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm build` funciona localmente
- [ ] Iconos PWA existen y tienen tamaño correcto
- [ ] Variables de entorno configuradas en Vercel
- [ ] `pnpm verify-mp` pasa (si aplica)

---

## 📚 Referencias

- **Scripts de Utilidad**: [`docs/SCRIPTS_UTILIDADES.md`](docs/SCRIPTS_UTILIDADES.md)
- **Deploy Automático**: [`docs/DEPLOY_AUTOMATICO.md`](docs/DEPLOY_AUTOMATICO.md)
- **Variables de Entorno**: [`docs/VARIABLES-ENTORNO-PRODUCCION.md`](docs/VARIABLES-ENTORNO-PRODUCCION.md)
- **Configuración Mercado Pago**: [`docs/configuracion-mercadopago.md`](docs/configuracion-mercadopago.md)

---

**Última actualización:** 2024-12-19

