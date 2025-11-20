# 🧪 QA COMPLETO - FIX DEFINITIVO CARGA DE IMÁGENES + CSP + BUCKET + MANIFEST

**Fecha:** 2024-12-19  
**Versión:** 2.0 - Fix Definitivo  
**Estado:** Testing completo requerido

---

## ✅ CAMBIOS IMPLEMENTADOS

### 1️⃣ **MANIFEST E ÍCONO PWA**

**Archivos modificados:**
- `public/manifest.json` - Corregido `purpose` de "any maskable" a "any"
- `scripts/create-real-pwa-icons.mjs` - Script mejorado para crear íconos reales

**Cambios:**
- ✅ Corregido campo `purpose` en manifest.json
- ✅ Script para generar íconos reales (requiere sharp o canvas)
- ⚠️ **ACCIÓN MANUAL REQUERIDA:** Crear íconos PNG reales de 192x192 y 512x512

**Verificación:**
- [ ] `public/icon-192x192.png` existe y tiene exactamente 192x192 píxeles
- [ ] `public/icon-512x512.png` existe y tiene exactamente 512x512 píxeles
- [ ] No hay errores de "Resource size is not correct" en consola

---

### 2️⃣ **CSP (CONTENT SECURITY POLICY)**

**Archivos modificados:**
- `middleware.ts` - CSP mejorado con dominio dinámico de Supabase
- `next.config.js` - CSP mejorado con todas las rutas de Supabase

**Cambios:**
- ✅ Agregado dominio específico de Supabase en `connect-src`
- ✅ Agregado `wss://` para WebSocket de Supabase
- ✅ Agregado ruta `/storage/v1` específica en `connect-src`
- ✅ `img-src` incluye `https://*.supabase.co` y dominio específico

**CSP Final:**
```
connect-src 'self' ... https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co wss://*.supabase.co wss://yqggrzxjhylnxjuagfyr.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1
img-src 'self' blob: data: https: https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co
```

**Verificación:**
- [ ] No hay errores de CSP en consola del navegador
- [ ] Llamadas a `/storage/v1/bucket` no son bloqueadas
- [ ] Llamadas a `/storage/v1/object/...` no son bloqueadas
- [ ] Imágenes de Supabase se cargan correctamente

---

### 3️⃣ **BUCKET "productos" - ELIMINAR LÓGICA DE CREACIÓN**

**Archivos modificados:**
- `app/api/admin/upload-image/route.ts` - Eliminada verificación de bucket
- `lib/supabase-storage.ts` - Eliminada verificación de bucket

**Cambios:**
- ✅ Eliminadas todas las llamadas a `listBuckets()`
- ✅ Eliminada lógica de verificación de existencia del bucket
- ✅ Código ahora asume que el bucket existe (creado manualmente)
- ✅ Si el bucket no existe, el error se mostrará al intentar subir

**Antes:**
```typescript
const { data: buckets } = await supabaseAdmin.storage.listBuckets()
if (!buckets?.some(b => b.name === BUCKET_NAME)) {
  return error
}
```

**Después:**
```typescript
// NO verificar bucket - asumimos que existe (creado manualmente)
// Si no existe, el error se mostrará al intentar subir
```

**Verificación:**
- [ ] No hay llamadas a `listBuckets()` en el código
- [ ] No hay llamadas a `createBucket()` en el código
- [ ] Bucket `productos` creado manualmente en Supabase Dashboard
- [ ] Políticas RLS configuradas correctamente

---

### 4️⃣ **FLUJO DE CARGA DE IMÁGENES - ROBUSTO**

**Archivos modificados:**
- `app/api/admin/upload-image/route.ts` - Función `generateFileName` mejorada
- `lib/upload-product-image.ts` - Nueva función centralizada (opcional, para futuro)

**Cambios:**
- ✅ Normalización robusta de nombres de archivo
- ✅ Validación de doble extensión con corrección automática
- ✅ Extracción correcta de extensión (última parte después del último punto)
- ✅ Sanitización mejorada del nombre base
- ✅ Logging detallado en cada paso

**Función mejorada:**
```typescript
function generateFileName(tenantId: string, originalName: string): string {
  // Extraer extensión (última parte)
  // Remover extensión del nombre
  // Sanitizar nombre base
  // Construir nombre final con extensión única
  // Validar y corregir doble extensión si existe
}
```

**Verificación:**
- [ ] No hay doble extensión (.jpg.jpg, .png.png)
- [ ] Nombres de archivo se normalizan correctamente
- [ ] Upload funciona sin errores
- [ ] URLs se generan correctamente

---

## 📋 CASOS DE PRUEBA OBLIGATORIOS

### ✅ **CASO A1: Crear Producto con Imagen JPG**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Llenar formulario
4. Seleccionar imagen JPG
5. Esperar "Imagen subida exitosamente"
6. Guardar producto

**Resultado Esperado:**
- ✅ Imagen se sube sin errores
- ✅ Se ve correctamente en Admin y Tienda
- ✅ No hay `.jpg.jpg` en el nombre del archivo
- ✅ URL es válida (https://...supabase.co/...)

**Logs Esperados:**
```
📤 [ImageUploader] Iniciando upload
[UPLOAD-IMAGE] ✅ Tenant autenticado
[UPLOAD-IMAGE] 📝 Generando nombre de archivo: { extension: 'jpg', ... }
[UPLOAD-IMAGE] ✅ Archivo subido exitosamente
✅ [ImageUploader] URL recibida del servidor: https://...
```

**Estado:** ⬜ Pendiente

---

### ✅ **CASO A2: Crear Producto con Imagen PNG**

**Pasos:**
1. Mismo que A1, pero con imagen PNG

**Resultado Esperado:**
- ✅ Mismo que A1
- ✅ No hay `.png.png` en el nombre

**Estado:** ⬜ Pendiente

---

### ✅ **CASO A3: Crear Producto sin Imagen**

**Pasos:**
1. Crear producto sin seleccionar imagen
2. Guardar

**Resultado Esperado:**
- ✅ Se asigna placeholder automáticamente
- ✅ No hay errores de upload

**Estado:** ⬜ Pendiente

---

### ✅ **CASO A4: Editar Producto sin Cambiar Imagen**

**Pasos:**
1. Editar producto existente con imagen
2. Cambiar otro campo (precio, etc.)
3. NO tocar la imagen
4. Guardar

**Resultado Esperado:**
- ✅ Mantiene misma imagen
- ✅ No se reemplaza con placeholder

**Estado:** ⬜ Pendiente

---

### ✅ **CASO A5: Editar Producto Cambiando Imagen**

**Pasos:**
1. Editar producto existente
2. Seleccionar nueva imagen
3. Guardar

**Resultado Esperado:**
- ✅ Sube nueva imagen
- ✅ Reemplaza la anterior
- ✅ Se ve en Admin y Tienda

**Estado:** ⬜ Pendiente

---

### ✅ **CASO B1: CSP - Verificar Consola**

**Pasos:**
1. Abrir DevTools → Console
2. Navegar por la app
3. Intentar subir imagen

**Resultado Esperado:**
- ✅ NO aparece: "Refused to connect ... violates Content Security Policy"
- ✅ NO aparece: "Refused to connect ... supabase..."

**Verificación Manual:**
```javascript
// En consola del navegador
const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
console.log('CSP:', csp?.content)
// Debe incluir: connect-src ... https://*.supabase.co ...
```

**Estado:** ⬜ Pendiente

---

### ✅ **CASO B2: CSP - Verificar Llamadas a Storage**

**Pasos:**
1. Abrir DevTools → Network
2. Filtrar por "supabase"
3. Intentar subir imagen
4. Verificar requests

**Resultado Esperado:**
- ✅ Requests a `/storage/v1/bucket` no son bloqueados
- ✅ Requests a `/storage/v1/object/...` no son bloqueados
- ✅ Status 200 o 201 (no bloqueados por CSP)

**Estado:** ⬜ Pendiente

---

### ✅ **CASO C1: Bucket - Verificar Código**

**Pasos:**
1. Buscar en código: `listBuckets`
2. Buscar en código: `createBucket`

**Resultado Esperado:**
- ✅ NO hay llamadas a `listBuckets()` en código de producción
- ✅ NO hay llamadas a `createBucket()` en código de producción
- ✅ Solo hay llamadas a `.from('productos').upload(...)`

**Estado:** ⬜ Pendiente

---

### ✅ **CASO C2: Bucket - Verificar Consola**

**Pasos:**
1. Abrir consola del navegador
2. Intentar subir imagen

**Resultado Esperado:**
- ✅ NO aparece: "Bucket productos no existe"
- ✅ NO aparece: "Error listando buckets"

**Estado:** ⬜ Pendiente

---

### ✅ **CASO D1: Manifest - Verificar Íconos**

**Pasos:**
1. Abrir DevTools → Application → Manifest
2. Verificar íconos

**Resultado Esperado:**
- ✅ `icon-192x192.png` existe y tiene 192x192 píxeles
- ✅ `icon-512x512.png` existe y tiene 512x512 píxeles
- ✅ NO aparece: "Resource size is not correct"

**Estado:** ⬜ Pendiente

---

### ✅ **CASO D2: Manifest - Verificar Consola**

**Pasos:**
1. Abrir consola del navegador
2. Navegar por la app

**Resultado Esperado:**
- ✅ NO aparece: "Error while trying to use the following icon from the Manifest: icon-192x192.png"

**Estado:** ⬜ Pendiente

---

## 📊 MATRIZ DE RESULTADOS

| Caso | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| A1 | Crear con JPG | ⬜ | |
| A2 | Crear con PNG | ⬜ | |
| A3 | Crear sin imagen | ⬜ | |
| A4 | Editar sin cambiar | ⬜ | |
| A5 | Editar cambiando | ⬜ | |
| B1 | CSP - Consola | ⬜ | |
| B2 | CSP - Network | ⬜ | |
| C1 | Bucket - Código | ⬜ | |
| C2 | Bucket - Consola | ⬜ | |
| D1 | Manifest - Íconos | ⬜ | |
| D2 | Manifest - Consola | ⬜ | |

**Leyenda:**
- ✅ Pasó
- ❌ Falló
- ⬜ Pendiente
- ⚠️ Con advertencias

---

## 🚨 CRITERIOS DE ACEPTACIÓN

El sistema se considera **LISTO PARA PRODUCCIÓN** cuando:

- ✅ Todos los casos A1-A5 pasan sin errores
- ✅ Todos los casos B1-B2 pasan (no hay errores de CSP)
- ✅ Todos los casos C1-C2 pasan (no hay llamadas a listBuckets)
- ✅ Todos los casos D1-D2 pasan (íconos PWA correctos)
- ✅ No hay errores en consola del navegador
- ✅ No hay errores en logs del servidor
- ✅ Imágenes reales NUNCA se reemplazan con placeholder
- ✅ No hay doble extensión en nombres de archivo
- ✅ Upload funciona en producción

---

## 📝 NOTAS FINALES

- **Fecha de Testing:** _______________
- **Tester:** _______________
- **Ambiente:** Local / Staging / Producción
- **Navegador:** Chrome / Firefox / Safari / Edge
- **Versión:** _______________

---

## 🔗 REFERENCIAS

- `IMAGE_UPLOAD_CURRENT_FLOW.md` - Flujo completo
- `docs/SETUP_SUPABASE_STORAGE_COMPLETE.md` - Setup del bucket
- `RESUMEN_FIX_IMAGENES_FINAL.md` - Resumen ejecutivo
- `components/ImageUploader.tsx` - Componente de upload
- `app/api/admin/upload-image/route.ts` - API de upload

