# 📚 Guía Completa - Admin: Productos, Categorías, Imágenes y Carga Múltiple

**Versión**: 2.0.0  
**Fecha**: $(date)  
**Estado**: ✅ Funcional y lista para producción

---

## 📋 Índice

1. [Carga Normal de Producto](#1-carga-normal-de-producto)
2. [Carga Múltiple IA](#2-carga-múltiple-ia)
3. [Carga de Imágenes](#3-carga-de-imágenes)
4. [Manejo de Categorías](#4-manejo-de-categorías)
5. [Problemas Encontrados y Soluciones](#5-problemas-encontrados-y-soluciones)
6. [Tips de Uso para el Admin](#6-tips-de-uso-para-el-admin)

---

## 1. Carga Normal de Producto

### Descripción

La carga normal permite crear o editar productos individuales desde el formulario del admin.

### Cómo Usar

1. Ir a **"Productos"** en el menú admin
2. Hacer clic en **"Nuevo Producto"**
3. Completar el formulario:
   - **Nombre** (requerido)
   - **Precio** (requerido)
   - **Categoría** (requerido, seleccionar de la lista)
   - **Descripción** (opcional)
   - **Descuento** (opcional, porcentaje)
   - **Color** (opcional)
   - **Talles y Stock** (agregar talles y cantidad)
   - **Imagen Principal** (opcional, se usa placeholder si no hay)
   - **Tags** (opcional, agregar uno por uno)
   - **Destacado** (checkbox)
   - **Activo** (checkbox, por defecto activo)

4. Hacer clic en **"Guardar"**

### Características

- ✅ Validaciones en tiempo real
- ✅ Carga de imagen opcional (placeholder automático)
- ✅ Gestión de talles y stock por talle
- ✅ Tags personalizados
- ✅ Edición inline de productos existentes

---

## 2. Carga Múltiple IA

### Descripción

Herramienta avanzada que permite cargar múltiples productos desde texto libre, CSV o generados con IA.

### Cómo Acceder

1. Ir a **"Carga Inteligente (IA)"** en el menú admin
2. Ruta: `/admin/productos/carga-inteligente`

### Flujo de Uso

#### Paso 1: Ingreso

- Verás un textarea con ejemplo precargado
- Pegar lista de productos desde Excel, WhatsApp o generar con IA
- Formato recomendado:
  ```
  NOMBRE | categoría: CATEGORIA | precio: PRECIO | stock: STOCK | sku: SKU
  ```

#### Paso 2: Procesado

- Hacer clic en **"Procesar con IA"**
- El sistema analiza y genera:
  - Descripciones automáticas
  - Tags SEO
  - Sugerencias de precios
  - Categorías inferidas

#### Paso 3: Vista Previa

- Tabla editable con todos los productos detectados
- Validaciones visuales:
  - 🟢 Verde: Listo para importar
  - 🟡 Amarillo: Advertencias menores
  - 🔴 Rojo: Errores que deben corregirse
- Editar cualquier campo antes de importar
- Eliminar productos no deseados

#### Paso 4: Importación

- Hacer clic en **"Importar productos"**
- Ver resumen con métricas:
  - Productos creados
  - Tiempo ahorrado
  - Calidad promedio
  - Errores detectados

### Características

- ✅ Ejemplo precargado editable
- ✅ Botón "Generar prompt IA" para ChatGPT
- ✅ Procesamiento inteligente con IA
- ✅ Tabla editable con validaciones
- ✅ QA automático antes de importar
- ✅ Métricas y analítica

---

## 3. Carga de Imágenes

### Descripción

Sistema de carga de imágenes a Supabase Storage con placeholder automático.

### Cómo Funciona

#### En Carga Normal

1. En el formulario de producto, sección **"Imagen Principal"**
2. Hacer clic en el área de carga o arrastrar imagen
3. La imagen se sube automáticamente a Supabase Storage
4. Se muestra preview inmediato
5. Si no se sube imagen, se usa placeholder automático (`/images/default-product.svg`)

#### En Carga Múltiple IA

- Las imágenes se asignan como placeholder por defecto
- Después de importar, editar cada producto para subir imagen real

### Formatos Soportados

- JPG / JPEG
- PNG
- WebP

### Límites

- Tamaño máximo: 5MB
- Se aceptan múltiples imágenes por producto

### Lógica de Placeholder

- **Si NO se selecciona imagen** → Se usa placeholder automático
- **Si SÍ se selecciona imagen**:
  - Se sube a Supabase Storage
  - Se guarda URL real en DB
  - Se muestra esa imagen (no placeholder)

### Comportamientos Correctos

- ✅ Crear producto SIN imagen → placeholder guardado
- ✅ Crear producto CON imagen → URL real guardada
- ✅ Editar producto cambiando imagen → nueva imagen reemplaza la anterior
- ✅ Editar producto sin tocar imagen → mantiene imagen actual

---

## 4. Manejo de Categorías

### Descripción

Sistema completo de gestión de categorías con validaciones y protección de integridad.

### Cómo Acceder

1. Ir a **"Categorías"** en el menú admin
2. Ruta: `/admin/categorias`

### Funcionalidades

#### Crear Categoría

1. Hacer clic en **"Nueva Categoría"**
2. Completar formulario:
   - **Nombre** (requerido, se genera slug automático)
   - **Slug** (requerido, se genera desde nombre)
   - **Descripción** (opcional)
   - **Orden** (opcional, número)
   - **Activa** (checkbox, por defecto activa)
3. Hacer clic en **"Crear"**
4. La categoría aparece inmediatamente en el listado

#### Editar Categoría

1. Hacer clic en el ícono de edición (lápiz)
2. Modificar campos necesarios
3. Hacer clic en **"Actualizar"**
4. Los cambios se reflejan inmediatamente

#### Eliminar Categoría

1. Hacer clic en el ícono de eliminar (papelera)
2. Confirmar eliminación
3. **Si hay productos asociados**:
   - Se muestra error: "No se puede eliminar. Hay X producto(s) usando esta categoría."
   - No se elimina la categoría
   - Re-asignar productos primero
4. **Si NO hay productos asociados**:
   - Se elimina correctamente
   - Desaparece del listado

### Validaciones

- ✅ Nombre y slug requeridos
- ✅ Slug único (no duplicados)
- ✅ No eliminar si hay productos asociados
- ✅ Slug se genera automáticamente desde nombre

### Uso en Productos

- Las categorías aparecen en el selector del formulario de productos
- Solo se muestran categorías activas
- Los productos guardan el nombre de la categoría (no el slug)

---

## 5. Problemas Encontrados y Soluciones

### Problema 1: Categorías sin tenant_id

**Síntoma**: Las categorías se creaban pero no se asociaban al tenant correcto.

**Causa**: El API de creación no agregaba `tenant_id` al insertar.

**Solución**: 
- Modificado `app/api/categorias/route.ts` para incluir `tenant_id` en el insert
- Modificado `app/api/categorias/[id]/route.ts` para incluir `tenant_id` en actualizaciones

**Código corregido**:
```typescript
.insert([
  {
    nombre,
    slug,
    descripcion,
    orden: orden || 0,
    activa: true,
    tenant_id: tenant.tenantId, // ✅ Agregado
  },
])
```

---

### Problema 2: "Debes iniciar sesión para subir imágenes"

**Síntoma**: Usuario logueado recibía mensaje de "Debes iniciar sesión" al intentar subir imágenes.

**Causa**: Validación de token demasiado estricta o cookies no se enviaban correctamente.

**Solución**:
- Mejorado `components/ImageUploader.tsx` para usar `credentials: 'include'` automáticamente
- Mejorado `app/api/admin/upload-image/route.ts` para validar token desde cookie o header
- Removida validación client-side innecesaria

**Código corregido**:
```typescript
// ImageUploader.tsx
const response = await fetch('/api/admin/upload-image', {
  method: 'POST',
  headers,
  credentials: 'include', // ✅ Envía cookies automáticamente
  body: formData,
})
```

---

### Problema 3: Placeholder sobrescribiendo imágenes reales

**Síntoma**: Aunque se subiera una imagen real, se guardaba placeholder.

**Causa**: Lógica de placeholder se ejecutaba siempre, incluso cuando había imagen válida.

**Solución**:
- Mejorada lógica en `components/AdminProductForm.tsx` para verificar URL válida antes de usar placeholder
- Solo usar placeholder si NO hay imagen válida (http/https o /images/)

**Código corregido**:
```typescript
const tieneImagenValida = imagenPrincipal && 
                          imagenPrincipal !== '' && 
                          (imagenPrincipal.startsWith('http://') || 
                           imagenPrincipal.startsWith('https://') ||
                           imagenPrincipal.startsWith('/images/'))

if (!tieneImagenValida) {
  imagenPrincipal = '/images/default-product.svg'
}
```

---

### Problema 4: Eliminación de categorías con productos asociados

**Síntoma**: Se podía intentar eliminar categorías con productos, causando errores.

**Causa**: No se validaba existencia de productos antes de eliminar.

**Solución**:
- Agregada validación en `app/api/categorias/[id]/route.ts`
- Verificar productos asociados antes de eliminar
- Retornar error claro si hay productos asociados

**Código corregido**:
```typescript
const productosConCategoria = productos.filter(
  (p: any) => p.categoria === categoria.slug || p.categoria === categoria.nombre
)

if (productosConCategoria.length > 0) {
  return NextResponse.json(
    {
      error: `No se puede eliminar. Hay ${productosConCategoria.length} producto(s) usando esta categoría.`,
      productosAsociados: productosConCategoria.length,
    },
    { status: 400 }
  )
}
```

---

### Problema 5: Categorías no se filtraban por tenant

**Síntoma**: Todas las categorías se mostraban para todos los tenants.

**Causa**: No se filtraba por `tenant_id` en las consultas.

**Solución**:
- Agregado filtro por `tenant_id` en `lib/supabase-helpers.ts`
- Modificado `getCategorias` para aceptar `tenantId` en filtros

**Código corregido**:
```typescript
if (filters?.tenantId) {
  query = query.eq('tenant_id', filters.tenantId)
}
```

---

## 6. Tips de Uso para el Admin

### Carga Normal

- **Usar para**: Productos individuales, productos con detalles específicos
- **Ventaja**: Control total sobre cada campo
- **Cuándo usar**: 1-5 productos a la vez

### Carga Múltiple IA

- **Usar para**: Múltiples productos similares, actualización masiva de stock
- **Ventaja**: Ahorro de tiempo (10 segundos vs 2 minutos por producto)
- **Cuándo usar**: 5+ productos a la vez

### Imágenes

- **Recomendación**: Subir imágenes reales para mejor presentación
- **Formato**: JPG o PNG, máximo 5MB
- **Placeholder**: Se usa automáticamente si no hay imagen

### Categorías

- **Crear primero**: Crear categorías antes de crear productos
- **Nombres claros**: Usar nombres descriptivos y consistentes
- **Slug automático**: Se genera desde el nombre, pero se puede editar
- **Eliminar con cuidado**: Verificar que no haya productos asociados

### Flujo Recomendado

1. **Crear categorías** primero
2. **Cargar productos** (normal o múltiple)
3. **Subir imágenes** después de crear productos
4. **Revisar y ajustar** precios, descuentos, stock

---

## 🔧 Archivos Modificados

### APIs

- `app/api/categorias/route.ts` - Agregado `tenant_id` en creación
- `app/api/categorias/[id]/route.ts` - Agregado `tenant_id` en actualización, mejorada validación de productos asociados
- `app/api/admin/upload-image/route.ts` - Mejorada validación de autenticación

### Componentes

- `components/AdminProductForm.tsx` - Mejorada lógica de placeholder
- `components/ImageUploader.tsx` - Mejorado envío de cookies, removida validación client-side innecesaria
- `app/admin/productos/carga-inteligente/page.tsx` - Texto de ayuda actualizado

### Helpers

- `lib/supabase-helpers.ts` - Agregado filtro por `tenant_id` en categorías

---

## ✅ Checklist de Validación

### Carga Normal

- [ ] Crear producto sin imagen → placeholder guardado
- [ ] Crear producto con imagen → URL real guardada
- [ ] Editar producto cambiando imagen → nueva imagen reemplaza anterior
- [ ] Editar producto sin tocar imagen → mantiene imagen actual

### Carga Múltiple IA

- [ ] Ejemplo precargado visible
- [ ] Procesar ejemplo → tabla con productos válidos
- [ ] Editar precio a texto no numérico → error visual
- [ ] Importar productos → aparecen en listado admin
- [ ] Importar 20+ productos → no se cuelga

### Categorías

- [ ] Crear categoría → aparece en listado y selector
- [ ] Editar categoría → cambios se reflejan
- [ ] Eliminar categoría sin productos → se borra correctamente
- [ ] Eliminar categoría con productos → error claro, no se borra

### Imágenes

- [ ] Subir imagen → se guarda en Supabase Storage
- [ ] Sin imagen → placeholder se muestra correctamente
- [ ] No aparece "Debes iniciar sesión" cuando ya está logueado

---

**Última actualización**: $(date)  
**Versión**: 2.0.0  
**Estado**: ✅ Listo para producción

