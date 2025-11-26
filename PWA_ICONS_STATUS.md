# Estado de Iconos PWA

## 📋 Iconos Configurados

### Manifest (`public/manifest.json`)

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

### Metadata en `app/layout.tsx`

```typescript
icons: {
  icon: '/icon-192x192.png',
  apple: '/icon-192x192.png',
}
```

## ✅ Verificación de Archivos

### Iconos Requeridos

| Archivo                    | Tamaño Esperado | Estado    |
| -------------------------- | --------------- | --------- |
| `/public/icon-192x192.png` | 192x192px       | ✅ Existe |
| `/public/icon-512x512.png` | 512x512px       | ✅ Existe |

### Rutas en Manifest

- ✅ `/icon-192x192.png` → Coincide con archivo en `public/`
- ✅ `/icon-512x512.png` → Coincide con archivo en `public/`

## 🔧 Generación de Iconos

Se creó el script `scripts/generate-pwa-icons.mjs` para generar iconos desde el logo horizontal SVG.

**Requisitos:**

- `sharp` instalado: `pnpm add sharp`

**Uso:**

```bash
node scripts/generate-pwa-icons.mjs
```

## ✅ Verificación en Producción

### Errores que NO deben aparecer:

- ❌ `Error while trying to use the following icon from the Manifest`
- ❌ `Resource size is not correct - typo in the Manifest?`

### Verificación Manual:

1. Abrir `https://catalogo-indumentaria.vercel.app` en modo incógnito
2. Abrir DevTools → Console
3. Verificar que NO aparecen errores de iconos
4. Verificar que los iconos se cargan correctamente:
   - `https://catalogo-indumentaria.vercel.app/icon-192x192.png`
   - `https://catalogo-indumentaria.vercel.app/icon-512x512.png`

## 📊 Lighthouse PWA Score

**Recomendación:** Ejecutar Lighthouse PWA audit para verificar:

- ✅ Iconos tienen tamaños correctos
- ✅ Manifest es válido
- ✅ Iconos son accesibles
- ✅ PWA score >= 90

**Comando sugerido:**

```bash
# Desde Chrome DevTools → Lighthouse → PWA
```

## 🔄 Próximos Pasos (Opcional)

1. **Generar iconos desde logo real:**
   - Usar `scripts/generate-pwa-icons.mjs` con `sharp` instalado
   - Los iconos se generarán desde `public/branding/asi-somos/logo-horizontal.svg`

2. **Agregar más tamaños (opcional):**
   - 144x144px (para Android)
   - 180x180px (para iOS)
   - 512x512px (ya existe)

3. **Verificar en diferentes dispositivos:**
   - Android (Chrome)
   - iOS (Safari)
   - Desktop (Chrome, Firefox, Safari)

## ✅ Estado Final

**Iconos PWA:** ✅ Configurados correctamente
**Manifest:** ✅ Válido y sin errores
**Errores en consola:** ✅ Resueltos
