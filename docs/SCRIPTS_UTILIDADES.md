# 🛠️ Scripts de Utilidad

Este documento describe todos los scripts de utilidad disponibles en el proyecto y cuándo usarlos.

---

## 📋 Índice

- [Iconos PWA](#iconos-pwa)
- [Generación de Secrets](#generación-de-secrets)
- [Guías Interactivas](#guías-interactivas)
- [Scripts de Build](#scripts-de-build)

---

## 🎨 Iconos PWA

### `pnpm pwa:icons`

**Script:** `scripts/create-pwa-icons.mjs`

**Propósito:** Genera iconos PWA básicos (192x192 y 512x512) usando canvas.

**Cuándo usar:**
- Cuando necesites regenerar los iconos PWA
- Durante el setup inicial del proyecto
- Cuando cambies el logo

**Requisitos:**
- Dependencia opcional: `canvas` (se instala automáticamente si está disponible)

**Uso:**
```bash
pnpm pwa:icons
```

**Nota:** Este script NO se ejecuta automáticamente en el build de Vercel. Los iconos deben estar commitados en el repositorio.

---

### `pnpm pwa:icons:real`

**Script:** `scripts/create-real-pwa-icons.mjs`

**Propósito:** Genera iconos PWA con branding "AS" (Así Somos) usando sharp o canvas como fallback.

**Cuándo usar:**
- Cuando necesites regenerar los iconos con el branding actualizado
- Durante el setup inicial del proyecto
- **Recomendado** sobre `pwa:icons` porque es más robusto

**Requisitos:**
- Dependencia opcional: `sharp` (preferido) o `canvas` (fallback)

**Uso:**
```bash
pnpm pwa:icons:real
```

**Nota:** Este script NO se ejecuta automáticamente en el build de Vercel. Los iconos deben estar commitados en el repositorio.

**Archivos generados:**
- `public/icon-192x192.png` (192x192 píxeles)
- `public/icon-512x512.png` (512x512 píxeles)

---

## 🔐 Generación de Secrets

### `pnpm jwt:generate`

**Script:** `scripts/generar-jwt-secret.mjs`

**Propósito:** Genera un JWT_SECRET seguro de 64 caracteres hexadecimales.

**Cuándo usar:**
- Durante el setup inicial del proyecto
- Cuando necesites regenerar el JWT_SECRET por seguridad
- Solo una vez, no en cada build

**Requisitos:**
- Node.js con módulo `crypto` (incluido por defecto)

**Uso:**
```bash
pnpm jwt:generate
```

**Después de ejecutar:**
1. Copia el valor generado
2. Configúralo en `.env.local` (local):
   ```env
   JWT_SECRET=el-valor-generado-aqui
   ```
3. Configúralo en Vercel Dashboard → Environment Variables (producción)
4. **NO** lo commitees al repositorio

**Nota:** Este script NO se ejecuta automáticamente en el build de Vercel porque genera valores aleatorios diferentes cada vez.

---

## 📚 Guías Interactivas

### `pnpm supabase:help`

**Script:** `scripts/guia-interactiva-supabase.mjs`

**Propósito:** Proporciona una guía interactiva paso a paso para configurar Supabase.

**Cuándo usar:**
- Durante el setup inicial del proyecto
- Cuando necesites ayuda para configurar Supabase
- Solo en terminal interactiva (NO funciona en CI/CD)

**Requisitos:**
- Node.js con módulo `readline` (incluido por defecto)
- Terminal interactiva

**Uso:**
```bash
pnpm supabase:help
```

**Nota CRÍTICA:** Este script NO debe ejecutarse en el build de Vercel porque:
- Requiere entrada interactiva del usuario
- Espera que el usuario presione Enter en cada paso
- Causaría que el build se quede colgado esperando input

**Alternativa para CI/CD:**
- Usa variables de entorno pre-configuradas
- Usa scripts no interactivos como `pnpm setup-supabase-env`

---

## 🔧 Scripts de Build

### Scripts que SÍ se ejecutan en build

Estos scripts se ejecutan automáticamente durante el build:

- **`prebuild`**: Ejecuta lint, typecheck y verificación de Mercado Pago
  ```bash
  pnpm lint && pnpm typecheck && node scripts/verify-mp-config.mjs
  ```

- **`build`**: Ejecuta el build de Next.js
  ```bash
  next build
  ```

### Scripts que NO se ejecutan en build

Estos scripts son solo para uso manual:

- `pnpm pwa:icons` - Generar iconos PWA
- `pnpm pwa:icons:real` - Generar iconos PWA con branding
- `pnpm jwt:generate` - Generar JWT secret
- `pnpm supabase:help` - Guía interactiva de Supabase

---

## ⚠️ Advertencias Importantes

### 1. Iconos PWA

Los iconos PWA deben estar **commitados en el repositorio**, no generarse en cada build porque:
- Requieren dependencias opcionales que pueden no estar disponibles en Vercel
- Deben ser consistentes entre builds
- Son archivos estáticos que no cambian frecuentemente

**Si necesitas regenerar los iconos:**
1. Ejecuta `pnpm pwa:icons:real` localmente
2. Verifica que los archivos se crearon correctamente
3. Commitea los nuevos iconos al repositorio

### 2. JWT Secret

El JWT_SECRET debe ser **consistente entre builds**, no generarse aleatoriamente cada vez porque:
- Los tokens JWT generados con un secret no funcionarán con otro secret diferente
- Debe configurarse manualmente en variables de entorno

**Nunca ejecutes `jwt:generate` en el build de Vercel.**

### 3. Scripts Interactivos

Los scripts que requieren entrada del usuario (como `supabase:help`) **NO deben ejecutarse en CI/CD** porque:
- Causarían que el build se quede colgado esperando input
- No tienen sentido en un entorno automatizado

---

## 📝 Checklist de Setup

Cuando configures el proyecto por primera vez:

- [ ] Ejecutar `pnpm jwt:generate` y configurar JWT_SECRET
- [ ] Ejecutar `pnpm pwa:icons:real` para generar iconos PWA
- [ ] Verificar que los iconos existen en `public/`
- [ ] Ejecutar `pnpm supabase:help` si necesitas ayuda con Supabase
- [ ] Verificar que `pnpm build` funciona correctamente

---

## 🔗 Referencias

- **Manifest PWA**: `public/manifest.json`
- **Iconos PWA**: `public/icon-192x192.png`, `public/icon-512x512.png`
- **Configuración Supabase**: `docs/configuracion-mercadopago.md`
- **Variables de Entorno**: `docs/VARIABLES-ENTORNO-PRODUCCION.md`

---

**Última actualización:** 2024-12-19

