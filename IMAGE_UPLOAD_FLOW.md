# 📸 Flujo Actual de Carga de Imágenes - Documentación Técnica

## 🎯 Resumen Ejecutivo

Este documento mapea el flujo completo de carga de imágenes en el sistema, desde que el usuario selecciona un archivo hasta que se guarda en la base de datos.

---

## 📋 Componentes Involucrados

### Frontend

1. **`components/AdminProductForm.tsx`**
   - Formulario principal para crear/editar productos
   - Usa el componente `ImageUploader` para manejar la carga de imágenes
   - Estado: `formData.imagen_principal` (string con URL)

2. **`components/ImageUploader.tsx`**
   - Componente reutilizable para subir imágenes
   - Maneja drag & drop y selección de archivos
   - Sube la imagen **inmediatamente** al seleccionarla (no espera al submit)
   - Llama a `onChange(url)` cuando el upload es exitoso

### Backend

1. **`app/api/admin/upload-image/route.ts`**
   - Endpoint POST que recibe el archivo en FormData
   - Valida autenticación usando `getTenantFromRequest`
   - Valida tipo y tamaño de archivo
   - Sube a Supabase Storage (bucket: `productos`)
   - Retorna URL pública de la imagen

2. **`app/api/productos/route.ts`** (POST)
   - Crea nuevo producto
   - Recibe `imagenPrincipal` en el body
   - Si no hay imagen válida, usa placeholder `/images/default-product.svg`

3. **`app/api/productos/[id]/route.ts`** (PUT)
   - Actualiza producto existente
   - Preserva imagen existente si no se envía nueva
   - Usa placeholder solo si no hay imagen válida

### Utilidades

1. **`lib/supabase-storage.ts`**
   - Funciones helper para Supabase Storage
   - `validateImageFile()` - Valida tipo y tamaño
   - `uploadImage()` - Sube archivo (no usado directamente, se usa la API)
   - `deleteImage()` - Elimina archivo
   - `getImageUrl()` - Obtiene URL pública

---

## 🔄 Flujo Paso a Paso

### Caso 1: Crear Producto NUEVO con Imagen

```
1. Usuario abre formulario "Nuevo Producto"
   └─> AdminProductForm se monta con formData.imagen_principal = ''

2. Usuario hace click en ImageUploader o arrastra imagen
   └─> ImageUploader.handleFileSelect() se ejecuta

3. ImageUploader valida el archivo
   └─> validateImageFile(file) verifica tipo y tamaño
   └─> Si inválido: muestra error y termina

4. ImageUploader muestra preview inmediato (base64)
   └─> FileReader lee el archivo como data URL
   └─> setPreview(result) actualiza el estado visual

5. ImageUploader sube el archivo INMEDIATAMENTE
   └─> Crea FormData con el archivo
   └─> POST a /api/admin/upload-image
   └─> Muestra spinner de progreso

6. API /api/admin/upload-image procesa:
   └─> Valida autenticación (getTenantFromRequest)
   └─> Valida tipo y tamaño de archivo
   └─> Genera nombre único: `${tenantId}/${timestamp}-${random}-${filename}`
   └─> Sube a Supabase Storage bucket "productos"
   └─> Obtiene URL pública con getPublicUrl()
   └─> Retorna { url: publicUrl, path: filePath }

7. ImageUploader recibe la URL
   └─> setPreview(result.url) actualiza preview con URL real
   └─> onChange(result.url) llama al callback
   └─> Muestra toast de éxito

8. AdminProductForm recibe la URL
   └─> setFormData({ ...prev, imagen_principal: url })
   └─> setImagePreview(url)
   └─> formData.imagen_principal ahora contiene URL de Supabase

9. Usuario completa otros campos y hace submit
   └─> handleSubmit() valida datos
   └─> Verifica que imagen no sea base64 (si es, espera)
   └─> Verifica que sea URL válida (http/https o /images/)
   └─> Si no hay imagen válida: usa placeholder
   └─> POST a /api/productos con productData

10. API /api/productos crea producto
    └─> Valida datos con Zod
    └─> Procesa imagen_principal:
        - Si es URL válida: la usa
        - Si no: usa '/images/default-product.svg'
    └─> Inserta en Supabase (tabla productos)
    └─> Retorna producto creado

11. Frontend muestra éxito
    └─> onSuccess() refresca lista de productos
    └─> Cierra formulario
```

### Caso 2: Crear Producto SIN Imagen

```
1-3. Igual que Caso 1, pero usuario NO selecciona imagen
   └─> formData.imagen_principal permanece como ''

4. Usuario hace submit
   └─> handleSubmit() detecta que no hay imagen válida
   └─> imagenPrincipal = '/images/default-product.svg'

5. API recibe producto con placeholder
   └─> Guarda '/images/default-product.svg' en imagen_principal
```

### Caso 3: Editar Producto CAMBIANDO Imagen

```
1. Usuario abre formulario de edición
   └─> useEffect carga datos del producto
   └─> formData.imagen_principal = producto.imagenPrincipal (URL existente)
   └─> ImageUploader muestra preview de imagen actual

2. Usuario selecciona nueva imagen
   └─> Sigue pasos 2-7 del Caso 1
   └─> formData.imagen_principal se actualiza con nueva URL

3. Usuario hace submit
   └─> PUT a /api/productos/[id]
   └─> API detecta nueva URL válida
   └─> Actualiza imagen_principal en DB
   └─> (La imagen vieja queda en Storage, no se elimina automáticamente)
```

### Caso 4: Editar Producto SIN Cambiar Imagen

```
1. Usuario abre formulario de edición
   └─> formData.imagen_principal = producto.imagenPrincipal (URL existente)

2. Usuario cambia otros campos (nombre, precio, etc.)
   └─> NO toca la imagen

3. Usuario hace submit
   └─> PUT a /api/productos/[id]
   └─> API detecta que imagenPrincipalRaw es igual a la existente
   └─> Mantiene productoExistente.imagen_principal
   └─> NO sobrescribe con placeholder
```

---

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación

1. **Frontend (ImageUploader)**:
   - Intenta obtener token de `localStorage.getItem('token')`
   - Si no existe, busca en cookies `auth_token`
   - Envía token en header `Authorization: Bearer <token>` (opcional)
   - **CRÍTICO**: Usa `credentials: 'include'` para enviar cookies automáticamente

2. **Backend (API /api/admin/upload-image)**:
   - Usa `getTenantFromRequest(request)` que:
     - Busca token en header `Authorization`
     - Si no existe, busca en cookie `auth_token`
     - Valida token con JWT
     - Retorna tenant o lanza error
   - Si no hay tenant válido: retorna 401

3. **Middleware**:
   - Protege `/api/admin/*` requiriendo token en cookie O header
   - CSP permite conexiones a `https://*.supabase.co`

---

## 🗄️ Supabase Storage

### Configuración

- **Bucket**: `productos`
- **Estructura de paths**: `${tenantId}/${timestamp}-${random}-${filename}`
- **Tipos permitidos**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Tamaño máximo**: 5MB
- **Visibilidad**: Público (usa `getPublicUrl()`)

### Políticas RLS

El bucket debe tener políticas que permitan:
- **Upload**: Autenticados pueden subir en su carpeta `${tenantId}/*`
- **Read**: Público puede leer todas las imágenes

---

## ⚠️ Problemas Conocidos y Soluciones

### Problema 1: "Debes iniciar sesión para subir imágenes"

**Causa**: Token no se envía correctamente o cookie no se lee.

**Solución aplicada**:
- ImageUploader usa `credentials: 'include'` para enviar cookies
- API valida token desde cookie O header
- Removida validación client-side innecesaria

### Problema 2: Imagen se sobrescribe con placeholder

**Causa**: Lógica de validación muy estricta o URL no reconocida como válida.

**Solución aplicada**:
- Validación mejorada que reconoce URLs de Supabase
- Preserva imagen existente al editar si no se cambia
- Solo usa placeholder si realmente no hay imagen válida

### Problema 3: CSP bloquea conexión a Supabase

**Causa**: CSP no incluye dominio de Supabase Storage.

**Solución aplicada**:
- CSP incluye `https://*.supabase.co` en `connect-src`
- CSP incluye dominio específico `https://yqggrzxjhylnxjuagfyr.supabase.co`

---

## 📊 Estados del Componente ImageUploader

```
Estado Inicial:
- preview: '' (vacío)
- isUploading: false
- uploadProgress: 0

Estado: Archivo Seleccionado (antes de upload):
- preview: data:image/jpeg;base64,... (base64)
- isUploading: false
- uploadProgress: 0

Estado: Subiendo:
- preview: data:image/jpeg;base64,... (base64)
- isUploading: true
- uploadProgress: 10-70%

Estado: Upload Exitoso:
- preview: https://xxx.supabase.co/storage/v1/object/public/productos/... (URL real)
- isUploading: false
- uploadProgress: 100%

Estado: Error:
- preview: value anterior o ''
- isUploading: false
- uploadProgress: 0
- toast.error() muestra mensaje
```

---

## 🧪 Casos de Prueba Recomendados

1. ✅ Crear producto con imagen válida (JPG/PNG/WebP)
2. ✅ Crear producto sin imagen (debe usar placeholder)
3. ✅ Crear producto con archivo inválido (debe rechazar)
4. ✅ Crear producto con archivo muy grande (>5MB, debe rechazar)
5. ✅ Editar producto cambiando imagen
6. ✅ Editar producto sin tocar imagen (debe mantener)
7. ✅ Subir imagen sin estar autenticado (debe mostrar error claro)
8. ✅ Subir imagen con sesión expirada (debe sugerir recargar)

---

**Última actualización**: 2024-12-19
**Versión del flujo**: 2.0 (con ImageUploader y API dedicada)

