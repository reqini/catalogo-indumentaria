# 🔴 Fix Crítico: Upload de Imágenes No Funciona

## 🚨 Problema Reportado

**Error Grave**: Al subir cualquier foto, no se carga la imagen real sino que se carga la imagen por defecto (placeholder).

---

## 🔍 Análisis del Problema

### Flujo Esperado:
1. Usuario selecciona imagen → `ImageUploader` sube a Supabase
2. API retorna URL de Supabase → `onChange(url)` se llama
3. `formData.imagen_principal` se actualiza con URL
4. Al guardar → URL se envía al API
5. API guarda URL en DB → Producto tiene imagen real

### Problema Detectado:
El flujo parece correcto en teoría, pero hay posibles puntos de falla:
1. El `useEffect` en `ImageUploader` podría estar reseteando el preview
2. La validación de URL podría no reconocer URLs de Supabase
3. El `formData` podría no actualizarse correctamente
4. La lógica de placeholder podría sobrescribir la URL real

---

## ✅ Correcciones Aplicadas

### 1. Logging Detallado Agregado

**Archivo**: `components/ImageUploader.tsx`

- ✅ Logging cuando se recibe URL del servidor
- ✅ Validación explícita de URL antes de llamar `onChange`
- ✅ Logging cuando se llama `onChange`
- ✅ Verificación de tipo y formato de URL

**Cambios**:
```typescript
// Validar URL antes de usar
if (!result.url || typeof result.url !== 'string' || result.url.trim() === '') {
  console.error('❌ URL inválida recibida del servidor:', result)
  toast.error('Error: URL de imagen inválida recibida del servidor')
  return
}

const imageUrl = result.url.trim()
console.log('✅ [ImageUploader] URL recibida:', imageUrl.substring(0, 100))
console.log('✅ [ImageUploader] Llamando onChange con URL:', imageUrl)
onChange(imageUrl)
```

---

### 2. Logging en AdminProductForm

**Archivo**: `components/AdminProductForm.tsx`

- ✅ Logging cuando `onChange` se llama
- ✅ Logging cuando `formData` se actualiza
- ✅ Logging en `handleSubmit` antes de enviar
- ✅ Validación mejorada de URL

**Cambios**:
```typescript
onChange={(url) => {
  console.log('✅ [AdminProductForm] onChange llamado con URL:', url)
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.error('❌ URL inválida recibida en onChange:', url)
    toast.error('Error: URL de imagen inválida')
    return
  }
  
  const imageUrl = url.trim()
  setFormData((prev) => {
    const updated = { ...prev, imagen_principal: imageUrl }
    console.log('✅ formData actualizado. imagen_principal:', updated.imagen_principal)
    return updated
  })
  setImagePreview(imageUrl)
}}
```

---

### 3. Validación Mejorada en handleSubmit

**Archivo**: `components/AdminProductForm.tsx`

- ✅ Logging detallado antes de validar
- ✅ Validación más estricta (verifica `trim()` y longitud)
- ✅ Logging de cada paso de validación
- ✅ Mensajes claros sobre qué está pasando

**Cambios**:
```typescript
console.log('🔍 [AdminProductForm] handleSubmit - Verificando imagen:')
console.log('  - formData.imagen_principal:', imagenPrincipal?.substring(0, 100))
console.log('  - Tipo:', typeof imagenPrincipal)
console.log('  - Longitud:', imagenPrincipal?.length || 0)

const tieneImagenValida = imagenPrincipal && 
                          imagenPrincipal !== '' && 
                          imagenPrincipal.trim() !== '' &&
                          (imagenPrincipal.startsWith('http://') || 
                           imagenPrincipal.startsWith('https://') ||
                           imagenPrincipal.startsWith('/images/'))

console.log('🔍 Validación de imagen:')
console.log('  - tieneImagenValida:', tieneImagenValida)
console.log('  - Empieza con https://:', imagenPrincipal?.startsWith('https://'))
```

---

### 4. Validación Mejorada en API

**Archivo**: `app/api/productos/route.ts`

- ✅ Logging detallado de la imagen recibida
- ✅ Validación más estricta
- ✅ Logging del resultado final

**Cambios**:
```typescript
console.log('🔍 [API Productos POST] Procesando imagen:')
console.log('  - imagenPrincipalRaw:', imagenPrincipalRaw?.substring(0, 150))
console.log('  - imagenPrincipalTrimmed:', imagenPrincipalTrimmed?.substring(0, 150))
console.log('  - Tipo:', typeof imagenPrincipalTrimmed)
console.log('  - Longitud:', imagenPrincipalTrimmed?.length || 0)

const tieneImagenValida = imagenPrincipalTrimmed && 
                          imagenPrincipalTrimmed !== '' &&
                          imagenPrincipalTrimmed.trim() !== '' &&
                          (imagenPrincipalTrimmed.startsWith('http://') || 
                           imagenPrincipalTrimmed.startsWith('https://') ||
                           imagenPrincipalTrimmed.startsWith('/images/'))

console.log('✅ [API Productos POST] Imagen final a guardar:', imagenPrincipal.substring(0, 150))
console.log('  - Es placeholder:', imagenPrincipal === '/images/default-product.svg')
console.log('  - Es URL real:', imagenPrincipal.startsWith('http://') || imagenPrincipal.startsWith('https://'))
```

---

### 5. Fix del useEffect en ImageUploader

**Archivo**: `components/ImageUploader.tsx`

**Problema**: El `useEffect` tenía `preview` en las dependencias, lo que podía causar loops o resets inesperados.

**Solución**:
- ✅ Removido `preview` de dependencias
- ✅ Lógica mejorada para no resetear imágenes válidas
- ✅ Solo actualizar si `value` cambió externamente

**Cambios**:
```typescript
useEffect(() => {
  // Solo actualizar si el value cambió Y es diferente al preview actual
  // Esto evita que se resetee la imagen después de un upload exitoso
  if (value && value !== preview && value.trim() !== '') {
    console.log('🔄 [ImageUploader] Actualizando preview desde value externo:', value.substring(0, 100))
    setPreview(value)
  } else if (!value && preview && !preview.startsWith('data:')) {
    // Si value se borra pero preview tiene una URL válida (no base64), mantenerla
    console.log('🔄 [ImageUploader] Manteniendo preview válido aunque value esté vacío')
  }
}, [value]) // Removido 'preview' de dependencias para evitar loops
```

---

### 6. Fix del useEffect en AdminProductForm

**Archivo**: `components/AdminProductForm.tsx`

- ✅ Logging cuando se carga producto existente
- ✅ Resetear imagen solo cuando se crea producto nuevo
- ✅ Preservar imagen al editar

**Cambios**:
```typescript
useEffect(() => {
  if (product) {
    const imagenProducto = product.imagenPrincipal || product.imagen_principal || ''
    console.log('🔄 [AdminProductForm] Cargando producto existente, imagen:', imagenProducto?.substring(0, 100))
    // ... cargar datos del producto
  } else {
    // Si no hay producto (crear nuevo), resetear imagen_principal
    console.log('🔄 [AdminProductForm] Creando nuevo producto, reseteando imagen_principal')
    setFormData((prev) => ({ ...prev, imagen_principal: '' }))
    setImagePreview('')
  }
}, [product])
```

---

## 🧪 Cómo Probar el Fix

### Paso 1: Abrir Consola del Navegador
1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Limpiar consola

### Paso 2: Crear Producto Nuevo con Imagen
1. Ir a Admin → Productos → Nuevo Producto
2. Completar campos básicos (nombre, precio, etc.)
3. **Seleccionar una imagen**
4. **Observar los logs en consola**:
   - Debe aparecer: `✅ [ImageUploader] URL recibida del servidor:`
   - Debe aparecer: `✅ [AdminProductForm] onChange llamado con URL:`
   - Debe aparecer: `✅ [AdminProductForm] formData actualizado`

### Paso 3: Guardar Producto
1. Hacer click en "Guardar"
2. **Observar los logs en consola**:
   - Debe aparecer: `🔍 [AdminProductForm] handleSubmit - Verificando imagen:`
   - Debe aparecer: `✅ Imagen válida detectada, preservando URL:`
   - Debe aparecer: `🔍 [API Productos POST] Procesando imagen:`
   - Debe aparecer: `✅ [API Productos POST] Imagen final a guardar:` (con URL de Supabase)

### Paso 4: Verificar en DB y Frontend
1. Verificar en Supabase que `imagen_principal` tenga la URL de Supabase Storage
2. Verificar en el listado de productos que se vea la imagen real
3. Verificar en el catálogo público que se vea la imagen real

---

## 🔍 Debugging con los Logs

### Si ves en consola:

#### ✅ "URL recibida del servidor" pero NO "onChange llamado"
**Problema**: El `onChange` no se está llamando
**Solución**: Verificar que `onChange` esté definido correctamente

#### ✅ "onChange llamado" pero NO "formData actualizado"
**Problema**: El `setFormData` no está funcionando
**Solución**: Verificar que no haya errores de React

#### ✅ "formData actualizado" pero "No hay imagen válida" en handleSubmit
**Problema**: La URL se perdió entre el update y el submit
**Solución**: Verificar que no haya otro `useEffect` reseteando el estado

#### ✅ "Imagen válida detectada" pero "Es placeholder" en API
**Problema**: La URL no se está enviando correctamente al API
**Solución**: Verificar el `productData` que se envía

---

## 📋 Checklist de Verificación

- [ ] Abrir consola del navegador
- [ ] Crear producto nuevo
- [ ] Subir imagen
- [ ] Verificar logs: "URL recibida del servidor"
- [ ] Verificar logs: "onChange llamado"
- [ ] Verificar logs: "formData actualizado"
- [ ] Guardar producto
- [ ] Verificar logs: "Imagen válida detectada"
- [ ] Verificar logs en servidor: "Imagen final a guardar" (con URL real)
- [ ] Verificar en DB: `imagen_principal` tiene URL de Supabase
- [ ] Verificar en frontend: Imagen real se muestra

---

## 🚨 Si Aún No Funciona

### Verificar en Consola:

1. **¿Aparece "URL recibida del servidor"?**
   - Si NO → El upload a Supabase está fallando
   - Verificar logs del servidor en `/api/admin/upload-image`

2. **¿Aparece "onChange llamado"?**
   - Si NO → El callback no se está ejecutando
   - Verificar que `onChange` esté definido en `ImageUploader`

3. **¿Aparece "formData actualizado"?**
   - Si NO → El estado no se está actualizando
   - Verificar errores de React en consola

4. **¿Aparece "Imagen válida detectada" en handleSubmit?**
   - Si NO → La URL se perdió antes del submit
   - Verificar que no haya `useEffect` reseteando el estado

5. **¿Aparece "Imagen final a guardar" con URL real en API?**
   - Si NO → La URL no se está enviando correctamente
   - Verificar el `productData` en la request

---

## 📝 Archivos Modificados

1. ✅ `components/ImageUploader.tsx` - Logging y validación mejorada
2. ✅ `components/AdminProductForm.tsx` - Logging y validación mejorada
3. ✅ `app/api/productos/route.ts` - Logging y validación mejorada

---

## 🎯 Próximos Pasos

1. **Probar el upload completo** con los logs activos
2. **Revisar los logs en consola** para identificar dónde falla
3. **Compartir los logs** si el problema persiste
4. **Ajustar según los logs** encontrados

---

**Fecha de Fix**: 2024-12-19
**Estado**: ✅ **LOGGING DETALLADO AGREGADO - LISTO PARA DEBUGGING**

