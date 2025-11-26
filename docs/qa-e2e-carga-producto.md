# 🧪 QA E2E: Carga de Producto con Foto Real

**Fecha:** 2024-11-26  
**Tipo:** End-to-End Test  
**Prioridad:** 🟡 MEDIA  
**Estado:** ⏳ PENDIENTE DE EJECUCIÓN

---

## 📋 Pre-requisitos

- [ ] Acceso al panel admin (`/admin`)
- [ ] Credenciales de admin válidas
- [ ] Permisos para crear productos
- [ ] Foto real disponible para subir

---

## 🎯 Objetivo

Verificar que se puede cargar un nuevo producto con foto real desde el panel admin y que aparece correctamente en el catálogo público, siendo comprable sin errores.

---

## 📝 Pasos de la Prueba

### Paso 1: Acceder al Panel Admin

**Acción:**

- Ir a `/admin` o `/admin/login`
- Iniciar sesión con credenciales de admin

**Resultado esperado:**

- ✅ Login funciona correctamente
- ✅ Redirección a panel admin
- ✅ Panel admin carga correctamente

**Resultado real:** ⏳ PENDIENTE

---

### Paso 2: Navegar a Carga de Productos

**Acción:**

- Buscar sección de productos
- Click en "Crear producto" o "Cargar producto" o similar
- Verificar que se carga formulario

**Resultado esperado:**

- ✅ Formulario de carga visible
- ✅ Campos requeridos presentes:
  - Nombre
  - Precio
  - Descripción (si aplica)
  - Fotos/imágenes
  - Stock (si aplica)
  - Categoría (si aplica)

**Resultado real:** ⏳ PENDIENTE

---

### Paso 3: Completar Datos del Producto

**Acción:**

- Completar formulario:
  - Nombre: "Producto Test E2E - [TIMESTAMP]"
  - Precio: 5000
  - Descripción: "Producto de prueba para QA E2E"
  - Stock: 10 unidades
  - Categoría: Seleccionar una existente

**Resultado esperado:**

- ✅ Campos se completan correctamente
- ✅ Validación funciona
- ✅ Sin errores en consola

**Resultado real:** ⏳ PENDIENTE

---

### Paso 4: Subir Foto Real

**Acción:**

- Seleccionar foto real del dispositivo
- Subir imagen
- Esperar que se procese y muestre preview

**Resultado esperado:**

- ✅ Selector de archivo funciona
- ✅ Imagen se sube correctamente
- ✅ Preview de imagen visible
- ✅ Sin errores de carga
- ✅ Imagen se guarda en Supabase Storage o similar

**Logs esperados:**

```
[ADMIN][UPLOAD] Subiendo imagen...
[ADMIN][UPLOAD] ✅ Imagen subida exitosamente: {url}
```

**Resultado real:** ⏳ PENDIENTE

---

### Paso 5: Guardar Producto

**Acción:**

- Click en "Guardar" o "Crear producto"
- Esperar confirmación

**Resultado esperado:**

- ✅ Producto se guarda correctamente
- ✅ Mensaje de éxito visible
- ✅ Redirección a lista de productos o detalle
- ✅ Producto visible en lista admin

**Logs esperados:**

```
[ADMIN][PRODUCTO] Creando producto...
[ADMIN][PRODUCTO] ✅ Producto creado exitosamente: {id}
```

**Resultado real:** ⏳ PENDIENTE

---

### Paso 6: Verificar en Catálogo Público

**Acción:**

- Ir a `/catalogo` (vista pública)
- Buscar el producto recién creado
- Verificar que aparece correctamente

**Resultado esperado:**

- ✅ Producto visible en catálogo
- ✅ Imagen carga correctamente
- ✅ Precio correcto
- ✅ Nombre correcto
- ✅ Stock visible (si aplica)
- ✅ Sin errores en consola

**Resultado real:** ⏳ PENDIENTE

---

### Paso 7: Verificar Detalle del Producto

**Acción:**

- Click en el producto
- Verificar página de detalle (`/producto/[id]`)

**Resultado esperado:**

- ✅ Página de detalle carga correctamente
- ✅ Imagen principal visible
- ✅ Galería de imágenes funciona (si aplica)
- ✅ Precio correcto
- ✅ Descripción visible
- ✅ Botón "Agregar al carrito" funcional
- ✅ Sin errores

**Resultado real:** ⏳ PENDIENTE

---

### Paso 8: Agregar al Carrito y Comprar

**Acción:**

- Seleccionar talle (si aplica)
- Click en "Agregar al carrito"
- Ir a checkout
- Completar compra (usar flujo de prueba de envío)

**Resultado esperado:**

- ✅ Producto se agrega al carrito
- ✅ Checkout funciona correctamente
- ✅ Orden se crea correctamente
- ✅ Preference MP se crea correctamente
- ✅ Redirección a MP funciona

**Resultado real:** ⏳ PENDIENTE

---

### Paso 9: Verificar en Base de Datos

**Acción:**

- Ir a Supabase Dashboard
- Buscar producto en tabla `productos` o similar
- Verificar estructura completa

**Resultado esperado:**

- ✅ Producto visible en tabla
- ✅ Campos completos:
  - nombre
  - precio
  - imagenPrincipal (URL válida)
  - imagenes (array con URLs)
  - stock
  - categoria
  - created_at
- ✅ URLs de imágenes son válidas y accesibles

**Resultado real:** ⏳ PENDIENTE

---

## 📊 Resumen de Resultados

| Paso                     | Estado       | Observaciones |
| ------------------------ | ------------ | ------------- |
| 1. Acceder admin         | ⏳ PENDIENTE | -             |
| 2. Navegar a carga       | ⏳ PENDIENTE | -             |
| 3. Completar datos       | ⏳ PENDIENTE | -             |
| 4. Subir foto            | ⏳ PENDIENTE | -             |
| 5. Guardar producto      | ⏳ PENDIENTE | -             |
| 6. Verificar en catálogo | ⏳ PENDIENTE | -             |
| 7. Verificar detalle     | ⏳ PENDIENTE | -             |
| 8. Comprar producto      | ⏳ PENDIENTE | -             |
| 9. Verificar en BD       | ⏳ PENDIENTE | -             |

---

## 🔍 Errores Encontrados y Corregidos

### Error 1: [PENDIENTE]

**Descripción:**  
**Causa raíz:**  
**Corrección aplicada:**  
**Archivos modificados:**  
**Resultado:**

---

## ✅ Estado Final

**Estado:** ⏳ PENDIENTE DE EJECUCIÓN

---

**Última actualización:** 2024-11-26  
**Ejecutado por:** [PENDIENTE]
