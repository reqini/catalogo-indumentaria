# 📋 MAPEO COMPLETO DEL FLUJO DE CARGA DE IMÁGENES

**Fecha:** 2024-12-19  
**Estado:** Análisis completo del flujo actual

---

## 🔄 FLUJO ACTUAL PASO A PASO

### 1️⃣ **SELECCIÓN DE ARCHIVO** (`components/ImageUploader.tsx`)

**Líneas:** 48-62

```
Usuario selecciona archivo
  ↓
handleFileSelect(file: File)
  ↓
Validar archivo (validateImageFile)
  ↓
FileReader.readAsDataURL() → Preview inmediato (base64)
  ↓
setPreview(base64String)
```

**Estado temporal:** `preview` contiene base64 string

---

### 2️⃣ **PREPARACIÓN DEL UPLOAD** (`components/ImageUploader.tsx`)

**Líneas:** 64-102

```
setIsUploading(true)
setUploadProgress(10)
  ↓
Crear FormData
  formData.append('file', file)
  ↓
Obtener token (localStorage o cookie)
  token = localStorage.getItem('token') || cookie['auth_token']
  ↓
Preparar headers
  headers['Authorization'] = `Bearer ${token}`
  ↓
setUploadProgress(30)
```

**Estado:** Archivo listo para enviar, token obtenido

---

### 3️⃣ **PETICIÓN HTTP** (`components/ImageUploader.tsx`)

**Líneas:** 111-145

```
fetch('/api/admin/upload-image', {
  method: 'POST',
  headers: { Authorization: Bearer token },
  credentials: 'include',
  body: formData,
  signal: AbortController (timeout 60s)
})
  ↓
Esperar respuesta
  ↓
setUploadProgress(70)
```

**Punto crítico:** Si falla aquí → "Failed to fetch"

---

### 4️⃣ **API ROUTE - VALIDACIÓN** (`app/api/admin/upload-image/route.ts`)

**Líneas:** 50-111

```
POST /api/admin/upload-image
  ↓
getTenantFromRequest(request)
  - Lee token de cookie 'auth_token' O header 'Authorization'
  - Valida JWT
  - Extrae tenantId
  ↓
Si no hay tenant → 401 Unauthorized
  ↓
Obtener FormData
  file = formData.get('file')
  ↓
Validar tipo (JPG, PNG, WebP)
Validar tamaño (max 5MB)
  ↓
generateFileName(tenantId, file.name)
  - Normaliza nombre
  - Evita doble extensión (.jpg.jpg)
  - Genera: tenantId/timestamp-random-name.ext
```

**Punto crítico:** Si bucket no existe → Error 500

---

### 5️⃣ **UPLOAD A SUPABASE STORAGE** (`app/api/admin/upload-image/route.ts`)

**Líneas:** 140-209

```
Convertir File → ArrayBuffer → Uint8Array
  ↓
supabaseAdmin.storage
  .from('productos')
  .upload(filePath, uint8Array, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false
  })
  ↓
Si error:
  - Bucket not found → 500
  - RLS violation → 403
  - Network error → 503
  ↓
Si éxito:
  uploadData = { path, id }
  ↓
Obtener URL pública
  supabaseAdmin.storage
    .from('productos')
    .getPublicUrl(filePath)
  ↓
publicUrl = "https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/tenantId/timestamp-random-name.jpg"
```

**Punto crítico:** Si CSP bloquea → "Failed to fetch"

---

### 6️⃣ **RESPUESTA AL CLIENTE** (`app/api/admin/upload-image/route.ts`)

**Líneas:** 235-239

```
return NextResponse.json({
  url: publicUrl,
  path: filePath,
  success: true
})
```

---

### 7️⃣ **PROCESAMIENTO EN CLIENTE** (`components/ImageUploader.tsx`)

**Líneas:** 150-247

```
Parsear respuesta JSON
  ↓
Validar result.url existe y no está vacío
  ↓
Validar que sea URL HTTP/HTTPS válida
  ↓
setPreview(imageUrl) ← REEMPLAZA base64 con URL real
  ↓
onChange(imageUrl) ← Notifica al componente padre
  ↓
toast.success('Imagen subida exitosamente')
setUploadProgress(100)
setIsUploading(false)
```

**Punto crítico:** Si `onChange` no se llama → URL no se guarda en formData

---

### 8️⃣ **GUARDADO EN FORMULARIO** (`components/AdminProductForm.tsx`)

**Líneas:** 150-200 (aproximado)

```
ImageUploader onChange(imageUrl)
  ↓
handleImageChange(imageUrl)
  ↓
setFormData(prev => ({
  ...prev,
  imagen_principal: imageUrl
}))
```

**Estado:** `formData.imagen_principal` contiene URL de Supabase

---

### 9️⃣ **SUBMIT DEL FORMULARIO** (`components/AdminProductForm.tsx`)

**Líneas:** 150-200

```
handleSubmit()
  ↓
createProduct(formData)
  ↓
POST /api/productos
  body: {
    ...formData,
    imagen_principal: "https://yqggrzxjhylnxjuagfyr.supabase.co/..."
  }
```

---

### 🔟 **API PRODUCTOS - GUARDADO** (`app/api/productos/route.ts`)

**Líneas:** 115-169

```
Validar datos con Zod
  ↓
const imagenPrincipalRaw = validatedData.imagenPrincipal || validatedData.imagen_principal || ''
const imagenPrincipalTrimmed = imagenPrincipalRaw?.trim() || ''
  ↓
Validar si es URL válida:
  tieneImagenValida = imagenPrincipalTrimmed &&
    imagenPrincipalTrimmed !== '' &&
    imagenPrincipalTrimmed !== '/images/default-product.svg' &&
    (startsWith('http://') || startsWith('https://') || includes('supabase.co'))
  ↓
Si tieneImagenValida:
  imagenPrincipal = imagenPrincipalTrimmed ← URL REAL
Si NO tieneImagenValida:
  imagenPrincipal = '/images/default-product.svg' ← PLACEHOLDER
  ↓
Guardar en Supabase:
  {
    ...productoData,
    imagen_principal: imagenPrincipal
  }
```

**Punto crítico:** Si URL no es válida → Se guarda placeholder aunque haya imagen

---

## 🚨 PUNTOS DE FALLA IDENTIFICADOS

### ❌ **FALLA 1: CSP Bloquea Supabase**
- **Ubicación:** `middleware.ts` línea 17
- **Problema:** CSP puede bloquear conexiones a Supabase Storage
- **Solución:** Ya está corregido, pero verificar que funcione

### ❌ **FALLA 2: Bucket No Existe**
- **Ubicación:** `app/api/admin/upload-image/route.ts` línea 125
- **Problema:** Si bucket no existe, retorna error 500
- **Solución:** Documentar creación manual del bucket

### ❌ **FALLA 3: URL No Se Valida Correctamente**
- **Ubicación:** `app/api/productos/route.ts` línea 132
- **Problema:** Si URL no pasa validación → placeholder
- **Solución:** Mejorar validación para aceptar todas las URLs de Supabase

### ❌ **FALLA 4: Preview Base64 Sobrescribe URL Real**
- **Ubicación:** `components/ImageUploader.tsx` línea 60
- **Problema:** Preview base64 puede persistir después del upload
- **Solución:** Ya corregido en línea 244, pero verificar

### ❌ **FALLA 5: Refresh F5 Pierde Estado**
- **Ubicación:** `components/AdminProductForm.tsx`
- **Problema:** Estado del formulario se pierde al refrescar
- **Solución:** Ya implementado `usePersistedState` en otros componentes

---

## ✅ FLUJO CORRECTO ESPERADO

```
1. Usuario selecciona imagen
   → Preview base64 inmediato

2. Usuario hace submit O upload automático
   → Upload a Supabase Storage
   → Obtener URL pública real
   → Reemplazar preview base64 con URL real
   → Guardar URL en formData

3. Usuario guarda producto
   → Validar URL es válida
   → Guardar URL real en DB
   → NUNCA sobrescribir con placeholder si hay URL real
```

---

## 📝 NOTAS TÉCNICAS

- **Bucket Name:** `productos` (hardcoded en múltiples lugares)
- **Max File Size:** 5MB
- **Allowed Types:** JPG, PNG, WebP
- **Storage Path Format:** `{tenantId}/{timestamp}-{random}-{sanitizedName}.{ext}`
- **Public URL Format:** `https://{project}.supabase.co/storage/v1/object/public/productos/{path}`

---

## 🔍 LOGGING ACTUAL

El flujo tiene logging detallado en:
- `[ImageUploader]` - Cliente
- `[UPLOAD-IMAGE]` - API route
- `[API Productos POST/PUT]` - API productos

Todos los logs incluyen:
- Estado del archivo
- URLs generadas
- Validaciones realizadas
- Errores específicos

