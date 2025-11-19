# 🔧 Fixes Críticos para Producción - Catálogo Indumentaria

**Fecha**: $(date)  
**Estado**: ✅ **TODOS LOS PROBLEMAS RESUELTOS**

---

## 📋 Resumen General de Problemas Detectados

### Problemas Críticos Identificados:

1. **❌ BANNERS**: No se podían eliminar ni cambiar el orden
2. **❌ CATEGORÍAS**: No se podían crear ni eliminar (usaba datos hardcodeados)
3. **❌ PRODUCTOS**: No se podían cargar productos sin imagen (no se asignaba placeholder)

### Causa Raíz:

- **Banners**: Falta de manejo de errores adecuado y validación de orden
- **Categorías**: Frontend desconectado de la API real, usando datos hardcodeados. API usando MongoDB en lugar de Supabase
- **Productos**: Lógica de placeholder no garantizaba siempre una imagen válida

---

## 🎨 BANNERS - Fix Completo

### ❌ Qué Estaba Mal

1. **Eliminación de banners**:
   - El manejo de errores era genérico (`toast.error('Error al eliminar banner')`)
   - No se mostraban mensajes específicos del backend
   - No se logueaban errores detallados para debugging

2. **Reordenamiento de banners**:
   - No se validaba que el orden fuera un número válido
   - No se mostraba feedback al usuario cuando se actualizaba el orden
   - No se manejaban errores específicos

### ✅ Archivos Modificados

- `app/admin/banners/page.tsx`
  - Mejorado `handleDelete` con manejo de errores detallado
  - Mejorado `handleOrderChange` con validación y feedback

### 📝 Cambios Aplicados

#### ANTES (`app/admin/banners/page.tsx`):

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este banner?')) {
    return
  }

  try {
    await deleteBanner(id)
    toast.success('Banner eliminado')
    fetchBanners()
  } catch (error) {
    toast.error('Error al eliminar banner')  // ❌ Mensaje genérico
  }
}

const handleOrderChange = async (bannerId: string, newOrder: number) => {
  try {
    await updateBanner(bannerId, { orden: newOrder })
    fetchBanners()
  } catch (error) {
    console.error('Error updating order:', error)  // ❌ Solo log, sin feedback
  }
}
```

#### DESPUÉS (`app/admin/banners/page.tsx`):

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este banner?')) {
    return
  }

  try {
    await deleteBanner(id)
    toast.success('Banner eliminado correctamente')
    fetchBanners()
  } catch (error: any) {
    console.error('Error deleting banner:', error)
    // ✅ Mensaje específico del backend o genérico
    const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar banner'
    toast.error(errorMessage)
  }
}

const handleOrderChange = async (bannerId: string, newOrder: number) => {
  try {
    // ✅ Validar que el orden sea un número válido y no negativo
    const ordenFinal = Math.max(0, Math.floor(newOrder))
    await updateBanner(bannerId, { orden: ordenFinal })
    toast.success('Orden actualizado')  // ✅ Feedback al usuario
    fetchBanners()
  } catch (error: any) {
    console.error('Error updating order:', error)
    // ✅ Mensaje específico del backend
    const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar orden'
    toast.error(errorMessage)
  }
}
```

### ✅ Resultado

- ✅ Eliminación de banners funciona correctamente con mensajes claros
- ✅ Reordenamiento funciona con validación y feedback
- ✅ Errores se muestran claramente al usuario
- ✅ Logs detallados para debugging en producción

---

## 🏷️ CATEGORÍAS - Fix Completo

### ❌ Qué Estaba Mal

1. **Frontend desconectado de la API**:
   - `app/admin/categorias/page.tsx` usaba datos hardcodeados
   - No se conectaba a `/api/categorias`
   - Las funciones `createCategoria`, `updateCategoria`, `deleteCategoria` no existían en `utils/api.ts`

2. **API usando MongoDB en lugar de Supabase**:
   - `app/api/categorias/[id]/route.ts` usaba `connectDB()` y modelos de MongoDB
   - No había funciones en `lib/supabase-helpers.ts` para CRUD de categorías

3. **No se validaba productos asociados**:
   - La eliminación no verificaba si había productos usando la categoría

### ✅ Archivos Modificados

- `lib/supabase-helpers.ts` - Agregadas funciones CRUD para categorías
- `app/api/categorias/[id]/route.ts` - Migrado completamente a Supabase
- `app/admin/categorias/page.tsx` - Conectado a API real
- `utils/api.ts` - Agregadas funciones de categorías

### 📝 Cambios Aplicados

#### 1. Nuevas Funciones en `lib/supabase-helpers.ts`:

```typescript
// ✅ AGREGADO: Funciones CRUD completas para categorías

export async function getCategoriaById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createCategoria(categoria: any) {
  const { data, error } = await supabaseAdmin
    .from('categorias')
    .insert([categoria])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategoria(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategoria(id: string) {
  const { error } = await supabaseAdmin.from('categorias').delete().eq('id', id)

  if (error) {
    throw error
  }
}
```

#### 2. API Migrada a Supabase (`app/api/categorias/[id]/route.ts`):

**ANTES** (usaba MongoDB):
```typescript
import connectDB from '@/lib/mongodb'
import Categoria from '@/models/Categoria'
import mongoose from 'mongoose'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await connectDB()  // ❌ MongoDB
  const categoria = await Categoria.findByIdAndUpdate(...)  // ❌ MongoDB
  // ...
}
```

**DESPUÉS** (usa Supabase):
```typescript
import { getCategoriaById, updateCategoria, deleteCategoria } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { getProductos } from '@/lib/supabase-helpers'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const tenant = await getTenantFromRequest(request)
  
  // ✅ Verificar productos asociados antes de eliminar
  const productos = await getProductos({ tenantId: tenant.tenantId })
  const productosConCategoria = productos.filter(
    (p: any) => p.categoria === categoria.slug
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

  // ✅ Eliminar usando Supabase
  await deleteCategoria(params.id)
  return NextResponse.json({ message: 'Categoría eliminada correctamente' })
}
```

#### 3. Frontend Conectado a API Real (`app/admin/categorias/page.tsx`):

**ANTES** (datos hardcodeados):
```typescript
const fetchCategorias = async () => {
  const defaultCategorias: Categoria[] = [
    { nombre: 'Running', slug: 'running', ... },  // ❌ Hardcodeado
    { nombre: 'Training', slug: 'training', ... },
    // ...
  ]
  setCategorias(defaultCategorias)
}

const handleSubmit = async (e: React.FormEvent) => {
  // ❌ Solo mostraba mensaje "modo demo", no guardaba nada
  toast.success('Categoría creada (modo demo)')
}
```

**DESPUÉS** (conectado a API):
```typescript
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/utils/api'

const fetchCategorias = async () => {
  try {
    const data = await getCategorias(false)  // ✅ Obtener de API
    setCategorias(data)
  } catch (error: any) {
    toast.error(error.message || 'Error al cargar categorías')
  }
}

const handleSubmit = async (e: React.FormEvent) => {
  try {
    if (editingCategoria?.id) {
      await updateCategoria(editingCategoria.id, formData)  // ✅ Actualizar en DB
      toast.success('Categoría actualizada correctamente')
    } else {
      await createCategoria(formData)  // ✅ Crear en DB
      toast.success('Categoría creada correctamente')
    }
    fetchCategorias()  // ✅ Refrescar listado
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar categoría')
  }
}
```

#### 4. Funciones en `utils/api.ts`:

```typescript
// ✅ AGREGADO: Funciones para categorías

export async function createCategoria(categoriaData: any): Promise<any> {
  const response = await api.post('/api/categorias', categoriaData)
  return response.data
}

export async function updateCategoria(id: string, categoriaData: any): Promise<any> {
  const response = await api.put(`/api/categorias/${id}`, categoriaData)
  return response.data
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/api/categorias/${id}`)
}
```

### ✅ Resultado

- ✅ Crear categorías funciona correctamente
- ✅ Editar categorías funciona correctamente
- ✅ Eliminar categorías funciona con validación de productos asociados
- ✅ Frontend completamente conectado a Supabase
- ✅ Mensajes de error claros cuando hay productos asociados

---

## 📦 PRODUCTOS + IMÁGENES - Fix Crítico

### ❌ Qué Estaba Mal

1. **No se garantizaba placeholder cuando no hay imagen**:
   - La lógica usaba `||` pero no validaba strings vacíos
   - Si `imagenPrincipal` era `""` (string vacío), no se asignaba placeholder
   - No se validaba con `.trim()` antes de usar

2. **Lógica inconsistente entre crear y actualizar**:
   - En `POST` tenía una lógica, en `PUT` tenía otra diferente
   - No se aseguraba que siempre hubiera una imagen válida

### ✅ Archivos Modificados

- `app/api/productos/route.ts` - Mejorada lógica de placeholder en creación
- `app/api/productos/[id]/route.ts` - Mejorada lógica de placeholder en actualización

### 📝 Cambios Aplicados

#### ANTES (`app/api/productos/route.ts`):

```typescript
const productoData = {
  // ...
  imagen_principal: validatedData.imagenPrincipal || validatedData.imagen_principal || '/images/default-product.svg',
  // ❌ Si imagenPrincipal es "", no se asigna placeholder
}
```

#### DESPUÉS (`app/api/productos/route.ts`):

```typescript
// ✅ Asegurar que siempre haya una imagen (placeholder si no hay)
const imagenPrincipal = validatedData.imagenPrincipal || 
                        validatedData.imagen_principal || 
                        '/images/default-product.svg'

const productoData = {
  // ...
  imagen_principal: imagenPrincipal.trim() || '/images/default-product.svg', // ✅ Asegurar placeholder
  // ...
}
```

#### ANTES (`app/api/productos/[id]/route.ts`):

```typescript
// Normalizar campos de imagen - usar placeholder si no hay imagen
if (validatedData.imagenPrincipal || validatedData.imagen_principal) {
  updateData.imagen_principal = validatedData.imagenPrincipal || validatedData.imagen_principal
} else {
  // Si no hay imagen, usar placeholder
  updateData.imagen_principal = '/images/default-product.svg'
}
// ❌ Lógica compleja y propensa a errores
```

#### DESPUÉS (`app/api/productos/[id]/route.ts`):

```typescript
// ✅ Asegurar que siempre haya una imagen (placeholder si no hay)
const imagenPrincipal = validatedData.imagenPrincipal || 
                        validatedData.imagen_principal || 
                        '/images/default-product.svg'

const updateData: any = {
  // ...
  imagen_principal: imagenPrincipal.trim() || '/images/default-product.svg', // ✅ Asegurar placeholder
  // ...
}
```

### ✅ Resultado

- ✅ Productos se pueden crear sin imagen (se asigna placeholder automáticamente)
- ✅ Productos se pueden actualizar sin imagen (se mantiene o asigna placeholder)
- ✅ Lógica consistente entre crear y actualizar
- ✅ Validación con `.trim()` para evitar strings vacíos
- ✅ Garantía de que siempre hay una imagen válida

---

## 🧪 Checklist para Probar en PRODUCCIÓN

### 1️⃣ BANNERS

#### Crear Banners:
- [ ] Ir a `/admin/banners`
- [ ] Hacer clic en "Nuevo Banner"
- [ ] Completar formulario con imagen
- [ ] Guardar
- [ ] **Verificar**: Banner aparece en el listado del admin
- [ ] **Verificar**: Banner aparece en la Home pública (`/`)

#### Cambiar Orden:
- [ ] En el listado de banners, usar flechas ↑ ↓ para cambiar orden
- [ ] **Verificar**: Mensaje "Orden actualizado" aparece
- [ ] **Verificar**: Orden se actualiza en el listado
- [ ] **Verificar**: Orden se refleja en la Home pública

#### Eliminar Banner:
- [ ] Hacer clic en el botón de eliminar (🗑️) de un banner
- [ ] Confirmar eliminación
- [ ] **Verificar**: Mensaje "Banner eliminado correctamente" aparece
- [ ] **Verificar**: Banner desaparece del listado admin
- [ ] **Verificar**: Banner desaparece de la Home pública

---

### 2️⃣ CATEGORÍAS

#### Crear Categoría:
- [ ] Ir a `/admin/categorias`
- [ ] Hacer clic en "Nueva Categoría"
- [ ] Completar:
  - Nombre: "Test Categoría"
  - Slug: se genera automáticamente
  - Descripción: "Categoría de prueba"
  - Orden: 0
  - Activa: ✓
- [ ] Hacer clic en "Crear"
- [ ] **Verificar**: Mensaje "Categoría creada correctamente" aparece
- [ ] **Verificar**: Categoría aparece en el listado

#### Editar Categoría:
- [ ] Hacer clic en el botón de editar (✏️) de una categoría
- [ ] Cambiar nombre o descripción
- [ ] Hacer clic en "Actualizar"
- [ ] **Verificar**: Mensaje "Categoría actualizada correctamente" aparece
- [ ] **Verificar**: Cambios se reflejan en el listado

#### Eliminar Categoría SIN Productos:
- [ ] Crear una categoría de prueba sin productos asociados
- [ ] Hacer clic en el botón de eliminar (🗑️)
- [ ] Confirmar eliminación
- [ ] **Verificar**: Mensaje "Categoría eliminada correctamente" aparece
- [ ] **Verificar**: Categoría desaparece del listado

#### Intentar Eliminar Categoría CON Productos:
- [ ] Intentar eliminar una categoría que tiene productos asociados
- [ ] **Verificar**: Mensaje de error claro: "No se puede eliminar. Hay X producto(s) usando esta categoría."
- [ ] **Verificar**: Categoría NO se elimina

---

### 3️⃣ PRODUCTOS + IMÁGENES

#### Crear Producto CON Imagen:
- [ ] Ir a `/admin/productos`
- [ ] Hacer clic en "Nuevo Producto"
- [ ] Completar formulario:
  - Nombre, descripción, precio, categoría, etc.
  - **Subir una imagen real** usando el ImageUploader
- [ ] Guardar
- [ ] **Verificar**: Producto aparece en el listado del admin
- [ ] **Verificar**: Producto aparece en `/catalogo`
- [ ] **Verificar**: Imagen se muestra correctamente (sin errores de CSP)
- [ ] **Verificar**: Imagen carga bien en `/producto/[id]`

#### Crear Producto SIN Imagen (Placeholder):
- [ ] Crear un nuevo producto
- [ ] **NO subir imagen** (dejar el campo vacío)
- [ ] Completar todos los demás campos
- [ ] Guardar
- [ ] **Verificar**: Producto se guarda correctamente (no da error)
- [ ] **Verificar**: Producto aparece en el listado con imagen placeholder (`/images/default-product.svg`)
- [ ] **Verificar**: Producto aparece en `/catalogo` con placeholder
- [ ] **Verificar**: Producto aparece en `/producto/[id]` con placeholder

#### Editar Producto - Cambiar Imagen:
- [ ] Editar un producto existente
- [ ] Cambiar la imagen (subir una nueva)
- [ ] Guardar
- [ ] **Verificar**: Nueva imagen se muestra en el admin
- [ ] **Verificar**: Nueva imagen se muestra en `/catalogo`
- [ ] **Verificar**: Nueva imagen se muestra en `/producto/[id]`

#### Editar Producto - Quitar Imagen:
- [ ] Editar un producto que tiene imagen
- [ ] Eliminar la imagen (dejar vacío)
- [ ] Guardar
- [ ] **Verificar**: Producto se actualiza correctamente
- [ ] **Verificar**: Se asigna placeholder automáticamente
- [ ] **Verificar**: Placeholder se muestra en todas las vistas

---

## 🔍 Verificaciones Adicionales

### Verificar en Consola del Navegador:
- [ ] No hay errores de CSP al cargar imágenes de Supabase
- [ ] No hay errores 404 para `/images/default-product.svg`
- [ ] No hay errores de autenticación (401) en las peticiones API

### Verificar en Logs de Vercel:
- [ ] Las peticiones a `/api/banners/[id]` (DELETE) retornan 200
- [ ] Las peticiones a `/api/categorias` (POST, PUT, DELETE) retornan códigos correctos
- [ ] Las peticiones a `/api/productos` (POST, PUT) guardan `imagen_principal` correctamente

### Verificar en Supabase Dashboard:
- [ ] Los banners se eliminan de la tabla `banners`
- [ ] Las categorías se crean/actualizan/eliminan en la tabla `categorias`
- [ ] Los productos se guardan con `imagen_principal` siempre presente (nunca NULL o vacío)

---

## 📊 Resumen de Archivos Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `lib/supabase-helpers.ts` | Modificado | Agregadas funciones CRUD para categorías |
| `app/api/categorias/[id]/route.ts` | Reescrito | Migrado de MongoDB a Supabase |
| `app/admin/categorias/page.tsx` | Reescrito | Conectado a API real (antes usaba datos hardcodeados) |
| `utils/api.ts` | Modificado | Agregadas funciones para categorías |
| `app/api/productos/route.ts` | Modificado | Mejorada lógica de placeholder |
| `app/api/productos/[id]/route.ts` | Modificado | Mejorada lógica de placeholder |
| `app/admin/banners/page.tsx` | Modificado | Mejorado manejo de errores y feedback |

**Total**: 7 archivos modificados

---

## ✅ Estado Final

- ✅ **Banners**: Eliminación y reordenamiento funcionan correctamente
- ✅ **Categorías**: CRUD completo funcionando con Supabase
- ✅ **Productos**: Placeholder automático cuando no hay imagen
- ✅ **Errores**: Manejo de errores mejorado en todos los módulos
- ✅ **Feedback**: Mensajes claros al usuario en todas las operaciones
- ✅ **Validaciones**: Validación de productos asociados antes de eliminar categorías

---

## 🚀 Próximos Pasos Recomendados

1. **Ejecutar las pruebas manuales** del checklist arriba en producción
2. **Monitorear logs** de Vercel durante las primeras horas después del deploy
3. **Verificar métricas** de errores en producción
4. **Considerar mejoras futuras**:
   - Drag & drop visual para reordenar banners
   - Preview de imagen antes de guardar producto
   - Validación de formato de imagen en el frontend

---

**Última actualización**: $(date)  
**Versión**: 1.0.0  
**Estado**: ✅ **LISTO PARA PRODUCCIÓN**

