# 🧪 QA COMPLETO - CARGA DE IMÁGENES

**Fecha:** 2024-12-19  
**Versión:** 1.0  
**Estado:** Testing completo requerido antes de producción

---

## 📋 CASOS DE PRUEBA OBLIGATORIOS

### ✅ **CASO 1: Crear Producto con Imagen Real**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Llenar formulario (nombre, precio, categoría, talles, stock)
4. **Seleccionar imagen real** (JPG, PNG o WebP < 5MB)
5. Esperar a que aparezca "Imagen subida exitosamente"
6. Verificar que el preview muestre la imagen real (no placeholder)
7. Click en "Guardar"

**Resultado Esperado:**
- ✅ Imagen se sube a Supabase Storage
- ✅ Preview muestra imagen real inmediatamente
- ✅ Producto se guarda con URL real de Supabase
- ✅ En la lista de productos, la imagen se muestra correctamente
- ✅ En la vista pública (`/catalogo`), la imagen se muestra correctamente
- ✅ No aparece placeholder en ningún momento

**Logs Esperados:**
```
📤 [ImageUploader] Iniciando upload: { fileName, fileSize, fileType }
[UPLOAD-IMAGE] ✅ Tenant autenticado: {tenantId}
[UPLOAD-IMAGE] 📤 Iniciando upload a Supabase Storage
[UPLOAD-IMAGE] ✅ Archivo subido exitosamente: { path, id }
[UPLOAD-IMAGE] ✅ Imagen subida exitosamente: { url }
✅ [ImageUploader] URL recibida del servidor: https://...
✅ [AdminProductForm] onChange llamado con URL: https://...
✅ [AdminProductForm] Guardando URL válida en formData
🔍 [API Productos POST] Procesando imagen
✅ [API Productos POST] Imagen final a guardar: https://...
```

---

### ✅ **CASO 2: Crear Producto SIN Imagen**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Llenar formulario (nombre, precio, categoría, talles, stock)
4. **NO seleccionar imagen**
5. Click en "Guardar"

**Resultado Esperado:**
- ✅ Producto se guarda con placeholder `/images/default-product.svg`
- ✅ En la lista de productos, se muestra placeholder
- ✅ En la vista pública, se muestra placeholder
- ✅ No hay errores en consola

**Logs Esperados:**
```
🔍 [AdminProductForm] handleSubmit - Verificando imagen
⚠️ [AdminProductForm] No hay imagen válida, usando placeholder automático
🔍 [API Productos POST] Procesando imagen
✅ [API Productos POST] Imagen final a guardar: /images/default-product.svg
```

---

### ✅ **CASO 3: Editar Producto SIN Cambiar Imagen**

**Pasos:**
1. Ir a `/admin/productos`
2. Seleccionar un producto existente con imagen real
3. Click en "Editar"
4. Cambiar algún campo (ej: precio)
5. **NO tocar la imagen**
6. Click en "Guardar"

**Resultado Esperado:**
- ✅ Imagen existente se mantiene
- ✅ No se reemplaza con placeholder
- ✅ URL de Supabase se preserva
- ✅ Cambios se guardan correctamente

**Logs Esperados:**
```
🔍 [AdminProductForm] handleSubmit - Verificando imagen
✅ [AdminProductForm] Imagen válida detectada, preservando URL
🔍 [API Productos PUT] Procesando imagen
✅ [API Productos PUT] Imagen final a guardar: https://... (URL existente)
```

---

### ✅ **CASO 4: Editar Producto CON Nueva Imagen**

**Pasos:**
1. Ir a `/admin/productos`
2. Seleccionar un producto existente
3. Click en "Editar"
4. **Seleccionar nueva imagen** (diferente a la actual)
5. Esperar "Imagen subida exitosamente"
6. Click en "Guardar"

**Resultado Esperado:**
- ✅ Nueva imagen se sube a Supabase Storage
- ✅ Nueva URL se guarda en la base de datos
- ✅ Preview muestra nueva imagen inmediatamente
- ✅ En la lista y vista pública, se muestra nueva imagen
- ✅ Imagen anterior se puede eliminar manualmente del Storage (opcional)

**Logs Esperados:**
```
📤 [ImageUploader] Iniciando upload: { fileName, fileSize, fileType }
[UPLOAD-IMAGE] ✅ Archivo subido exitosamente
✅ [ImageUploader] URL recibida del servidor: https://... (NUEVA URL)
✅ [AdminProductForm] Guardando URL válida en formData
🔍 [API Productos PUT] Procesando imagen
✅ [API Productos PUT] Imagen final a guardar: https://... (NUEVA URL)
```

---

### ✅ **CASO 5: Imagen Grande (> 5MB)**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Intentar seleccionar imagen > 5MB

**Resultado Esperado:**
- ✅ Error claro: "El archivo es muy grande. Máximo 5MB"
- ✅ No se intenta subir la imagen
- ✅ Preview no se actualiza

**Logs Esperados:**
```
❌ [ImageUploader] Error: El archivo es muy grande. Máximo 5MB
```

---

### ✅ **CASO 6: Imagen Inválida (no JPG/PNG/WebP)**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Intentar seleccionar archivo no imagen (ej: PDF, TXT)

**Resultado Esperado:**
- ✅ Error claro: "Formato no válido. Solo se permiten JPG, PNG y WebP"
- ✅ No se intenta subir el archivo
- ✅ Preview no se actualiza

**Logs Esperados:**
```
❌ [ImageUploader] Error: Formato no válido. Solo se permiten JPG, PNG y WebP
```

---

### ✅ **CASO 7: Refresh F5 en Admin**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Llenar formulario parcialmente
4. **Seleccionar imagen y esperar upload exitoso**
5. Presionar **F5** (refresh)
6. Verificar estado del formulario

**Resultado Esperado:**
- ✅ Imagen subida se mantiene visible (URL real, no base64)
- ✅ Formulario mantiene otros datos si están en localStorage
- ✅ No se pierde el estado de la imagen

**Logs Esperados:**
```
🔄 [ImageUploader] Actualizando preview desde value externo: https://...
```

---

### ✅ **CASO 8: Red Lenta / Timeout**

**Pasos:**
1. Simular red lenta en DevTools (Network → Throttling → Slow 3G)
2. Ir a `/admin/productos`
3. Click en "Nuevo Producto"
4. Seleccionar imagen
5. Esperar timeout (60 segundos)

**Resultado Esperado:**
- ✅ Después de 60s, muestra error: "La subida de imagen tardó demasiado"
- ✅ Preview vuelve al estado anterior
- ✅ No se queda colgado

**Logs Esperados:**
```
❌ [ImageUploader] Timeout al subir imagen (60s)
```

---

### ✅ **CASO 9: Usuario No Autenticado**

**Pasos:**
1. Cerrar sesión del admin
2. Intentar acceder directamente a `/api/admin/upload-image` (desde consola)

**Resultado Esperado:**
- ✅ Error 401: "No autorizado"
- ✅ Mensaje claro: "Por favor, recarga la página e inicia sesión nuevamente"

**Logs Esperados:**
```
[UPLOAD-IMAGE] ❌ No se encontró tenant - Token inválido o no proporcionado
```

---

### ✅ **CASO 10: Bucket No Existe**

**Pasos:**
1. Eliminar bucket `productos` en Supabase Dashboard (simulación)
2. Intentar subir imagen

**Resultado Esperado:**
- ✅ Error claro: "Bucket 'productos' no existe. Debe crearse manualmente en Supabase Dashboard"
- ✅ Link a documentación

**Logs Esperados:**
```
[UPLOAD-IMAGE] ❌ Error uploading file: Bucket not found
```

---

### ✅ **CASO 11: CSP Bloquea Supabase**

**Pasos:**
1. Verificar CSP en DevTools → Network → Headers
2. Intentar subir imagen
3. Verificar que no haya errores de CSP en consola

**Resultado Esperado:**
- ✅ No hay errores de CSP en consola
- ✅ Conexión a Supabase Storage funciona
- ✅ CSP incluye `https://*.supabase.co` y `wss://*.supabase.co`

**Verificación:**
```javascript
// En consola del navegador
const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
console.log('CSP:', csp?.content)
// Debe incluir: connect-src ... https://*.supabase.co ...
```

---

### ✅ **CASO 12: Múltiples Uploads Simultáneos**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. Seleccionar imagen 1
4. **Sin esperar**, seleccionar imagen 2 inmediatamente

**Resultado Esperado:**
- ✅ Solo la última imagen seleccionada se sube
- ✅ Preview muestra la última imagen
- ✅ No hay errores de concurrencia

---

### ✅ **CASO 13: Eliminar Imagen**

**Pasos:**
1. Ir a `/admin/productos`
2. Seleccionar producto con imagen
3. Click en "Editar"
4. Click en botón "X" para eliminar imagen
5. Click en "Guardar"

**Resultado Esperado:**
- ✅ Imagen se elimina del preview
- ✅ Producto se guarda con placeholder
- ✅ En la lista, se muestra placeholder

**Logs Esperados:**
```
🗑️ [ImageUploader] Eliminando imagen
🗑️ [AdminProductForm] Limpiando imagen (URL vacía)
⚠️ [AdminProductForm] No hay imagen válida, usando placeholder automático
```

---

### ✅ **CASO 14: Drag & Drop**

**Pasos:**
1. Ir a `/admin/productos`
2. Click en "Nuevo Producto"
3. **Arrastrar imagen** desde el escritorio al área de upload
4. Soltar imagen

**Resultado Esperado:**
- ✅ Imagen se detecta correctamente
- ✅ Preview se muestra inmediatamente
- ✅ Upload se inicia automáticamente
- ✅ Mismo comportamiento que selección manual

---

### ✅ **CASO 15: Vista Pública - Imagen Real**

**Pasos:**
1. Crear producto con imagen real (Caso 1)
2. Ir a `/catalogo`
3. Buscar el producto creado
4. Verificar imagen

**Resultado Esperado:**
- ✅ Imagen real se muestra en la tarjeta del producto
- ✅ Al hacer click, imagen se muestra en detalle
- ✅ No aparece placeholder
- ✅ Imagen carga correctamente desde Supabase Storage

---

## 🔍 VERIFICACIONES ADICIONALES

### **Verificación de Logs:**

Todos los casos deben tener logs claros y detallados. Verificar:

- ✅ Logs de inicio de upload
- ✅ Logs de éxito de upload
- ✅ Logs de validación de URL
- ✅ Logs de guardado en DB
- ✅ Logs de errores específicos

### **Verificación de Errores:**

- ✅ No hay errores silenciosos
- ✅ Todos los errores muestran mensajes claros al usuario
- ✅ Errores se loguean en consola con detalles

### **Verificación de Performance:**

- ✅ Upload de imagen < 5MB toma < 10 segundos en red normal
- ✅ Preview se muestra inmediatamente (< 100ms)
- ✅ No hay bloqueos de UI durante upload

---

## 📊 MATRIZ DE RESULTADOS

| Caso | Estado | Notas |
|------|--------|-------|
| Caso 1: Crear con imagen | ⬜ Pendiente | |
| Caso 2: Crear sin imagen | ⬜ Pendiente | |
| Caso 3: Editar sin cambiar | ⬜ Pendiente | |
| Caso 4: Editar con nueva | ⬜ Pendiente | |
| Caso 5: Imagen grande | ⬜ Pendiente | |
| Caso 6: Imagen inválida | ⬜ Pendiente | |
| Caso 7: Refresh F5 | ⬜ Pendiente | |
| Caso 8: Timeout | ⬜ Pendiente | |
| Caso 9: No autenticado | ⬜ Pendiente | |
| Caso 10: Bucket no existe | ⬜ Pendiente | |
| Caso 11: CSP | ⬜ Pendiente | |
| Caso 12: Múltiples uploads | ⬜ Pendiente | |
| Caso 13: Eliminar imagen | ⬜ Pendiente | |
| Caso 14: Drag & drop | ⬜ Pendiente | |
| Caso 15: Vista pública | ⬜ Pendiente | |

**Leyenda:**
- ✅ Pasó
- ❌ Falló
- ⬜ Pendiente
- ⚠️ Con advertencias

---

## 🚨 CRITERIOS DE ACEPTACIÓN

El sistema se considera **LISTO PARA PRODUCCIÓN** cuando:

- ✅ Todos los casos 1-15 pasan sin errores
- ✅ No hay errores en consola del navegador
- ✅ No hay errores en logs del servidor
- ✅ Imágenes reales NUNCA se reemplazan con placeholder
- ✅ Placeholder solo se usa cuando NO hay imagen
- ✅ Upload funciona en red normal y lenta
- ✅ Errores muestran mensajes claros al usuario
- ✅ Logs son detallados y útiles para debugging

---

## 📝 NOTAS FINALES

- **Fecha de Testing:** _______________
- **Tester:** _______________
- **Ambiente:** Local / Staging / Producción
- **Navegador:** Chrome / Firefox / Safari / Edge
- **Versión:** _______________

---

## 🔗 REFERENCIAS

- `IMAGE_UPLOAD_CURRENT_FLOW.md` - Flujo completo documentado
- `docs/SETUP_SUPABASE_STORAGE_COMPLETE.md` - Setup del bucket
- `components/ImageUploader.tsx` - Componente de upload
- `app/api/admin/upload-image/route.ts` - API de upload

