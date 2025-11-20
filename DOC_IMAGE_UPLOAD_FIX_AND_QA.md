# 📸 Documentación Completa: Fix de Upload de Imágenes y QA

## 🎯 Objetivo

Este documento documenta el fix crítico del sistema de upload de imágenes para productos, asegurando que **NUNCA** vuelva a romperse mediante:
- Documentación exhaustiva del flujo correcto
- Tests de regresión automáticos
- Alertas de logging
- Reglas anti-regresión

---

## 🔴 Problema Original

### Síntoma
Al cargar un artículo nuevo y seleccionar una foto, **NO se usaba la foto elegida**, se terminaba guardando **SIEMPRE la imagen por defecto (placeholder)**.

### Causa Raíz
La validación de URLs en el API no reconocía correctamente las URLs de Supabase Storage, que tienen el formato:
```
https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

La validación solo verificaba:
- `startsWith('http://')`
- `startsWith('https://')`
- `startsWith('/images/')`

Pero **NO** verificaba si la URL contenía `supabase.co`, lo que causaba que URLs válidas de Supabase fueran rechazadas y se aplicara el placeholder.

---

## ✅ Flujo Correcto (Final)

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona imagen en AdminProductForm           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ImageUploader.handleFileSelect()                        │
│    - Valida archivo (tipo, tamaño)                        │
│    - Muestra preview local                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ImageUploader sube a /api/admin/upload-image           │
│    - Autenticación (getTenantFromRequest)                  │
│    - Validación de archivo                                 │
│    - Upload a Supabase Storage (bucket: productos)         │
│    - Retorna publicUrl                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ImageUploader.onChange(publicUrl)                       │
│    - Valida que URL sea válida                            │
│    - Actualiza preview                                     │
│    - Llama onChange callback                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AdminProductForm.onChange callback                      │
│    - Valida URL recibida                                   │
│    - Actualiza formData.imagen_principal                   │
│    - Actualiza imagePreview                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuario hace click en "Guardar"                         │
│    - handleSubmit() valida imagen                          │
│    - Verifica que NO sea base64 (upload pendiente)         │
│    - Verifica que sea URL válida                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. API POST /api/productos                                 │
│    - Recibe imagenPrincipal o imagen_principal             │
│    - Valida URL (incluye verificación de supabase.co)      │
│    - Si es válida → guarda URL real                        │
│    - Si NO es válida → usa placeholder                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Supabase inserta producto con imagen_principal          │
│    - URL real de Supabase Storage                          │
│    - O placeholder si no hay imagen                        │
└─────────────────────────────────────────────────────────────┘
```

### Puntos Críticos del Flujo

1. **Validación de URL en ImageUploader**:
   ```typescript
   if (!result.url || typeof result.url !== 'string' || result.url.trim() === '') {
     // Error: URL inválida
     return
   }
   ```

2. **Validación de URL en AdminProductForm**:
   ```typescript
   if (!url || typeof url !== 'string' || url.trim() === '') {
     // Error: URL inválida
     return
   }
   ```

3. **Validación de URL en API (CRÍTICO)**:
   ```typescript
   const tieneImagenValida = imagenPrincipalTrimmed && 
                             imagenPrincipalTrimmed !== '' &&
                             imagenPrincipalTrimmed.trim() !== '' &&
                             imagenPrincipalTrimmed !== '/images/default-product.svg' &&
                             (imagenPrincipalTrimmed.startsWith('http://') || 
                              imagenPrincipalTrimmed.startsWith('https://') ||
                              imagenPrincipalTrimmed.startsWith('/images/') ||
                              imagenPrincipalTrimmed.includes('supabase.co')) // ← CRÍTICO
   ```

---

## 📁 Archivos Afectados

### Frontend
- `components/ImageUploader.tsx` - Componente de upload
- `components/AdminProductForm.tsx` - Formulario de productos

### Backend
- `app/api/admin/upload-image/route.ts` - Endpoint de upload
- `app/api/productos/route.ts` - Endpoint POST (crear producto)
- `app/api/productos/[id]/route.ts` - Endpoint PUT (actualizar producto)

### Helpers
- `lib/supabase-storage.ts` - Utilidades de Supabase Storage

---

## 🧪 Tests de Regresión

### Test Unitario: Validación de URLs

**Archivo**: `tests/utils/imageUrlValidation.spec.ts`

```typescript
import { describe, it, expect } from 'vitest'

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '' || url === '/images/default-product.svg') {
    return false
  }
  
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/images/') ||
    url.includes('supabase.co')
  )
}

describe('Image URL Validation', () => {
  it('should accept Supabase Storage URLs', () => {
    const supabaseUrl = 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/tenant123/image.jpg'
    expect(isValidImageUrl(supabaseUrl)).toBe(true)
  })

  it('should accept HTTPS URLs', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
  })

  it('should accept HTTP URLs', () => {
    expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
  })

  it('should accept relative paths', () => {
    expect(isValidImageUrl('/images/product.jpg')).toBe(true)
  })

  it('should reject placeholder', () => {
    expect(isValidImageUrl('/images/default-product.svg')).toBe(false)
  })

  it('should reject empty strings', () => {
    expect(isValidImageUrl('')).toBe(false)
    expect(isValidImageUrl('   ')).toBe(false)
  })

  it('should reject null/undefined', () => {
    expect(isValidImageUrl(null as any)).toBe(false)
    expect(isValidImageUrl(undefined as any)).toBe(false)
  })
})
```

### Test Funcional: Upload de Imagen

**Archivo**: `e2e/image-upload.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Image Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@catalogo.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin/dashboard')
  })

  test('should upload image and save product with real image URL', async ({ page }) => {
    // Ir a crear producto
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')

    // Completar datos básicos
    await page.fill('input[name="nombre"]', 'Producto Test Imagen')
    await page.fill('input[name="precio"]', '10000')
    await page.selectOption('select[name="categoria"]', { label: 'Remeras' })

    // Subir imagen
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

    // Esperar a que se complete el upload
    await page.waitForSelector('text=Imagen subida exitosamente', { timeout: 10000 })

    // Verificar que el preview muestra la imagen
    const preview = page.locator('img[alt*="preview"]')
    await expect(preview).toBeVisible()

    // Guardar producto
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto creado correctamente')

    // Verificar en la tabla que el producto tiene imagen real (no placeholder)
    const productRow = page.locator('tr:has-text("Producto Test Imagen")')
    const imageCell = productRow.locator('img')
    const imageSrc = await imageCell.getAttribute('src')
    
    expect(imageSrc).toBeTruthy()
    expect(imageSrc).not.toContain('default-product.svg')
    expect(imageSrc).toContain('supabase.co')
  })

  test('should use placeholder when no image is uploaded', async ({ page }) => {
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')

    await page.fill('input[name="nombre"]', 'Producto Sin Imagen')
    await page.fill('input[name="precio"]', '5000')
    await page.selectOption('select[name="categoria"]', { label: 'Remeras' })

    // NO subir imagen
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto creado correctamente')

    // Verificar que usa placeholder
    const productRow = page.locator('tr:has-text("Producto Sin Imagen")')
    const imageCell = productRow.locator('img')
    const imageSrc = await imageCell.getAttribute('src')
    
    expect(imageSrc).toContain('default-product.svg')
  })
})
```

---

## 🚨 Alertas de Logging

### Logging en ImageUploader

```typescript
// ✅ Upload exitoso
console.log('✅ [ImageUploader] URL recibida del servidor:', imageUrl.substring(0, 100))
console.log('✅ [ImageUploader] Llamando onChange con URL:', imageUrl)

// ❌ Error de upload
console.error('❌ [ImageUploader] Error uploading image:', error)
console.error('❌ [ImageUploader] Response:', result)
```

### Logging en AdminProductForm

```typescript
// ✅ onChange llamado
console.log('✅ [AdminProductForm] onChange llamado con URL:', url)
console.log('✅ [AdminProductForm] formData actualizado. imagen_principal:', updated.imagen_principal)

// ⚠️ Validación fallida
console.warn('⚠️ [AdminProductForm] No hay imagen válida, usando placeholder automático')
console.warn('  - Valor actual de imagenPrincipal:', imagenPrincipal)
```

### Logging en API

```typescript
// 🔍 Procesamiento de imagen
console.log('🔍 [API Productos POST] Procesando imagen:')
console.log('  - imagenPrincipalRaw:', imagenPrincipalRaw?.substring(0, 150))
console.log('  - tieneImagenValida:', tieneImagenValida)
console.log('  - Contiene supabase.co:', imagenPrincipalTrimmed?.includes('supabase.co'))

// ✅ Imagen guardada
console.log('✅ [API Productos POST] Imagen final a guardar:', imagenPrincipal.substring(0, 150))
console.log('  - Es placeholder:', imagenPrincipal === '/images/default-product.svg')
console.log('  - Es URL real:', imagenPrincipal.startsWith('http://') || imagenPrincipal.startsWith('https://'))
```

### Logging de Errores Críticos

```typescript
// En app/api/admin/upload-image/route.ts
if (uploadError) {
  console.error('[UPLOAD-IMAGE] ❌ Error uploading file:', {
    error: uploadError.message,
    code: uploadError.statusCode,
    tenantId: tenant?.tenantId,
    fileName: file.name,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
  })
}

// En app/api/productos/route.ts
if (!tieneImagenValida && imagenPrincipalTrimmed) {
  console.error('[API Productos POST] ⚠️ URL de imagen rechazada:', {
    url: imagenPrincipalTrimmed.substring(0, 200),
    reason: 'No pasa validación de URL válida',
    timestamp: new Date().toISOString(),
  })
}
```

---

## 🛡️ Reglas Anti-Regresión

### Regla 1: Validación de URLs de Supabase

**CRÍTICO**: La validación de URLs **DEBE** incluir verificación de `supabase.co`:

```typescript
// ✅ CORRECTO
const tieneImagenValida = imagenPrincipalTrimmed && 
                          imagenPrincipalTrimmed !== '' &&
                          imagenPrincipalTrimmed.trim() !== '' &&
                          imagenPrincipalTrimmed !== '/images/default-product.svg' &&
                          (imagenPrincipalTrimmed.startsWith('http://') || 
                           imagenPrincipalTrimmed.startsWith('https://') ||
                           imagenPrincipalTrimmed.startsWith('/images/') ||
                           imagenPrincipalTrimmed.includes('supabase.co')) // ← OBLIGATORIO

// ❌ INCORRECTO (causa el bug original)
const tieneImagenValida = imagenPrincipalTrimmed && 
                          (imagenPrincipalTrimmed.startsWith('http://') || 
                           imagenPrincipalTrimmed.startsWith('https://'))
```

### Regla 2: Envío de Campos Duplicados

**CRÍTICO**: El formulario **DEBE** enviar ambos campos (`imagenPrincipal` e `imagen_principal`) para compatibilidad:

```typescript
// ✅ CORRECTO
const productData = {
  // ... otros campos
  imagenPrincipal: imagenPrincipal,
  imagen_principal: imagenPrincipal, // ← OBLIGATORIO
  // ... otros campos
}

// ❌ INCORRECTO
const productData = {
  imagenPrincipal: imagenPrincipal, // Solo uno puede causar problemas
}
```

### Regla 3: No Sobrescribir URLs Válidas

**CRÍTICO**: Si hay una URL válida, **NUNCA** sobrescribirla con placeholder:

```typescript
// ✅ CORRECTO
const imagenPrincipal = tieneImagenValida 
  ? imagenPrincipalTrimmed 
  : '/images/default-product.svg'

// ❌ INCORRECTO
const imagenPrincipal = '/images/default-product.svg' // Siempre placeholder
```

### Regla 4: Validación de Base64

**CRÍTICO**: Si la imagen está en formato base64, significa que el upload aún está en progreso:

```typescript
// ✅ CORRECTO
if (imagenPrincipal && imagenPrincipal.startsWith('data:')) {
  toast.error('La imagen aún se está subiendo. Por favor, espera...')
  return // No guardar hasta que termine
}

// ❌ INCORRECTO
// Guardar base64 directamente (causa problemas)
```

---

## ✅ Checklist de QA

### QA Manual

- [ ] **Crear producto con imagen válida**
  - [ ] Seleccionar imagen JPG
  - [ ] Verificar que se muestra preview
  - [ ] Verificar mensaje "Imagen subida exitosamente"
  - [ ] Guardar producto
  - [ ] Verificar en DB que `imagen_principal` tiene URL de Supabase
  - [ ] Verificar en listado que se muestra imagen real
  - [ ] Verificar en catálogo público que se muestra imagen real

- [ ] **Crear producto sin imagen**
  - [ ] NO seleccionar imagen
  - [ ] Guardar producto
  - [ ] Verificar en DB que `imagen_principal` es `/images/default-product.svg`
  - [ ] Verificar en listado que se muestra placeholder

- [ ] **Editar producto cambiando imagen**
  - [ ] Editar producto existente con imagen
  - [ ] Cambiar imagen
  - [ ] Verificar que se muestra nueva preview
  - [ ] Guardar
  - [ ] Verificar en DB que `imagen_principal` se actualizó
  - [ ] Verificar en frontend que se muestra nueva imagen

- [ ] **Editar producto sin tocar imagen**
  - [ ] Editar producto existente con imagen
  - [ ] Cambiar otros campos (nombre, precio)
  - [ ] NO tocar imagen
  - [ ] Guardar
  - [ ] Verificar que imagen original se mantiene

- [ ] **Verificar logs en consola**
  - [ ] Abrir DevTools → Console
  - [ ] Subir imagen
  - [ ] Verificar logs: "URL recibida del servidor"
  - [ ] Verificar logs: "onChange llamado"
  - [ ] Verificar logs: "formData actualizado"
  - [ ] Verificar logs en servidor: "Imagen final a guardar"

### QA Automático

- [ ] **Tests unitarios pasan**
  ```bash
  pnpm test tests/utils/imageUrlValidation.spec.ts
  ```

- [ ] **Tests E2E pasan**
  ```bash
  pnpm test:ui e2e/image-upload.spec.ts
  ```

- [ ] **Build pasa sin errores**
  ```bash
  pnpm build
  ```

---

## 🔍 Debugging

### Si las imágenes no se guardan:

1. **Verificar logs en consola del navegador**:
   - Buscar `[ImageUploader]` y `[AdminProductForm]`
   - Verificar que aparece "URL recibida del servidor"
   - Verificar que aparece "onChange llamado"

2. **Verificar logs en servidor**:
   - Buscar `[API Productos POST]` o `[API Productos PUT]`
   - Verificar que `tieneImagenValida` es `true`
   - Verificar que `Es URL real` es `true`

3. **Verificar en DB**:
   ```sql
   SELECT id, nombre, imagen_principal 
   FROM productos 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   - Verificar que `imagen_principal` tiene URL de Supabase (no placeholder)

4. **Verificar Supabase Storage**:
   - Ir a Supabase Dashboard → Storage → productos
   - Verificar que los archivos se subieron correctamente

---

## 📝 Notas Técnicas

### Formato de URLs de Supabase Storage

Las URLs de Supabase Storage tienen el formato:
```
https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

Ejemplo:
```
https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/tenant123/1234567890-abc123-image.jpg
```

### Validación de URLs

La función de validación acepta:
- URLs que empiezan con `http://` o `https://`
- URLs que contienen `supabase.co` (para Supabase Storage)
- Rutas relativas que empiezan con `/images/`
- **Rechaza**: `/images/default-product.svg` (placeholder explícito)

### Persistencia

- Las imágenes se guardan en Supabase Storage (bucket `productos`)
- Las URLs se guardan en la tabla `productos` en el campo `imagen_principal`
- El placeholder se usa solo si no hay imagen válida

---

## 🚀 Mantenimiento

### Antes de Modificar el Código

1. **Leer esta documentación completa**
2. **Ejecutar tests de regresión**
3. **Verificar que los tests pasan**
4. **Documentar cualquier cambio**

### Después de Modificar el Código

1. **Ejecutar tests de regresión**
2. **Verificar que los tests pasan**
3. **Actualizar esta documentación si es necesario**
4. **Probar manualmente el flujo completo**

---

**Última actualización**: 2024-12-19
**Versión del Fix**: 1.0.0
**Estado**: ✅ **BLINDEADO Y DOCUMENTADO**

