# Documentación CRUD de Productos - Catálogo Indumentaria

## 📋 Índice

1. [Flujo Completo del CRUD](#flujo-completo-del-crud)
2. [Endpoints y Ejemplos](#endpoints-y-ejemplos)
3. [Validaciones](#validaciones)
4. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
5. [Mejoras Futuras](#mejoras-futuras)

---

## 🔄 Flujo Completo del CRUD

### 1. CREAR PRODUCTO (POST)

**Frontend:** `app/admin/productos/page.tsx` → `components/AdminProductForm.tsx`

**Flujo:**
1. Usuario hace clic en "Nuevo Producto"
2. Se abre modal `AdminProductForm` con formulario vacío
3. Usuario completa campos requeridos:
   - Nombre (mínimo 3 caracteres)
   - Precio (número > 0)
   - Categoría (requerida)
   - Al menos un talle con stock definido
   - Imagen principal
4. Validaciones frontend antes de enviar
5. POST a `/api/productos` con datos validados
6. Backend valida con Zod schema
7. Verifica límites del plan del tenant
8. Crea producto en Supabase
9. Registra logs de stock inicial
10. Retorna producto creado
11. Frontend actualiza lista sin refrescar página

**Campos Requeridos:**
- `nombre`: string (min 3 caracteres)
- `precio`: number (> 0)
- `categoria`: string
- `talles`: array[string] (min 1)
- `stock`: object { [talle]: number } (todos los talles deben tener stock)
- `imagenPrincipal`: string (URL o base64)

**Campos Opcionales:**
- `descripcion`: string
- `descuento`: number (0-100)
- `color`: string
- `tags`: array[string]
- `destacado`: boolean (default: false)
- `activo`: boolean (default: true)
- `imagenesSec`: array[string]
- `idMercadoPago`: string

---

### 2. EDITAR PRODUCTO (PUT)

**Frontend:** `app/admin/productos/page.tsx` → `components/AdminProductForm.tsx`

**Flujo:**
1. Usuario hace clic en botón "Editar" en tabla
2. Se abre modal `AdminProductForm` con datos del producto precargados
3. Usuario modifica campos deseados
4. Validaciones frontend (mismas que crear)
5. PUT a `/api/productos/[id]` con datos actualizados
6. Backend verifica:
   - Token válido
   - Producto pertenece al tenant
   - Datos válidos (Zod)
7. Actualiza producto en Supabase
8. Retorna producto actualizado
9. Frontend actualiza lista y cierra modal

**Nota:** El campo `id` no puede modificarse. Los campos de sistema (`created_at`, `updated_at`, `tenant_id`) se manejan automáticamente.

---

### 3. DUPLICAR PRODUCTO

**Frontend:** `app/admin/productos/page.tsx` → `handleDuplicate()`

**Flujo:**
1. Usuario hace clic en botón "Duplicar" (ícono Copy)
2. Confirmación: "¿Duplicar '[nombre]'?"
3. Se crea copia limpia del producto:
   - Nombre: `"[nombre] (Copia)"`
   - Todos los demás campos se copian
   - Se eliminan campos de sistema: `id`, `_id`, `tenant_id`, `created_at`, `updated_at`
4. POST a `/api/productos` con datos del duplicado
5. Backend crea nuevo producto (mismo flujo que crear)
6. Frontend actualiza lista

**Campos que NO se duplican:**
- `id` / `_id`
- `tenant_id`
- `created_at` / `createdAt`
- `updated_at` / `updatedAt`
- `imagen_principal` (se usa `imagenPrincipal`)
- `imagenes_sec` (se usa `imagenesSec`)
- `id_mercado_pago` (se usa `idMercadoPago`)

---

### 4. ELIMINAR PRODUCTO (DELETE)

**Frontend:** `app/admin/productos/page.tsx` → `handleDelete()`

**Flujo:**
1. Usuario hace clic en botón "Eliminar" (ícono Trash2)
2. Confirmación: "¿Estás seguro de eliminar '[nombre]'?\n\nEsta acción no se puede deshacer."
3. DELETE a `/api/productos/[id]`
4. Backend verifica:
   - Token válido
   - Producto pertenece al tenant
   - Producto existe
5. Elimina producto de Supabase (DELETE real, no soft-delete)
6. Frontend actualiza lista

**⚠️ ADVERTENCIA:** Esta acción es permanente. El producto se elimina completamente de la base de datos.

---

### 5. ACTIVAR/DESACTIVAR PRODUCTO (Soft Delete)

**Frontend:** `app/admin/productos/page.tsx` → `handleToggleActive()`

**Flujo:**
1. Usuario hace clic en botón "Activar/Desactivar" (ícono Eye/EyeOff)
2. Confirmación: "¿Activar/Desactivar '[nombre]'?"
3. PUT a `/api/productos/[id]` con `{ activo: !producto.activo }`
4. Backend actualiza campo `activo` en Supabase
5. Frontend actualiza lista
6. Productos inactivos no se muestran en catálogo público

**Uso:** Para ocultar productos temporalmente sin eliminarlos.

---

### 6. ACTUALIZAR STOCK

**Frontend:** `components/AdminProductTable.tsx` → `handleStockUpdate()`

**Flujo:**
1. Usuario hace clic en "Editar" junto a un talle en la tabla
2. Se muestra input numérico con botones +/- y "Guardar"
3. Usuario modifica cantidad
4. Validaciones:
   - Cantidad >= 0
   - Cantidad es entero
5. PUT a `/api/productos/[id]/stock` con `{ talle, cantidad }`
6. Backend verifica:
   - Token válido
   - Producto pertenece al tenant
   - Talle existe en el producto
   - Cantidad >= 0 y es entero
7. Actualiza stock en Supabase
8. Registra log de cambio de stock
9. Frontend actualiza tabla

---

## 🔌 Endpoints y Ejemplos

### POST `/api/productos`

**Request:**
```json
{
  "nombre": "Remera Básica Algodón",
  "descripcion": "Remera básica de algodón 100%",
  "precio": 8990,
  "descuento": 10,
  "categoria": "remeras",
  "color": "Blanco",
  "talles": ["S", "M", "L", "XL"],
  "stock": {
    "S": 20,
    "M": 25,
    "L": 18,
    "XL": 12
  },
  "imagenPrincipal": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "imagenesSec": [],
  "tags": ["básico", "algodón"],
  "destacado": false,
  "activo": true
}
```

**Response (201):**
```json
{
  "id": "102ad29e-705a-4eda-abb7-3bd2651d2abb",
  "nombre": "Remera Básica Algodón",
  "precio": 8990,
  "imagenPrincipal": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "stock": {
    "S": 20,
    "M": 25,
    "L": 18,
    "XL": 12
  },
  "activo": true,
  "created_at": "2025-11-18T23:11:25.296798+00:00"
}
```

**Errores:**
- `400`: Datos inválidos (Zod validation)
- `401`: Token no proporcionado o inválido
- `403`: Límite de productos alcanzado
- `500`: Error del servidor

---

### PUT `/api/productos/[id]`

**Request:**
```json
{
  "nombre": "Remera Básica Algodón Actualizada",
  "precio": 9990,
  "activo": false
}
```

**Response (200):**
```json
{
  "id": "102ad29e-705a-4eda-abb7-3bd2651d2abb",
  "nombre": "Remera Básica Algodón Actualizada",
  "precio": 9990,
  "activo": false,
  "updated_at": "2025-11-18T23:30:00.000000+00:00"
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Token no proporcionado
- `403`: Producto no pertenece al tenant
- `404`: Producto no encontrado
- `500`: Error del servidor

---

### DELETE `/api/productos/[id]`

**Request:** Sin body

**Response (200):**
```json
{
  "message": "Producto eliminado"
}
```

**Errores:**
- `401`: Token no proporcionado
- `403`: Producto no pertenece al tenant
- `404`: Producto no encontrado
- `500`: Error del servidor

---

### PUT `/api/productos/[id]/stock`

**Request:**
```json
{
  "talle": "M",
  "cantidad": 30,
  "accion": "reposicion"
}
```

**Response (200):**
```json
{
  "id": "102ad29e-705a-4eda-abb7-3bd2651d2abb",
  "stock": {
    "S": 20,
    "M": 30,
    "L": 18,
    "XL": 12
  }
}
```

**Errores:**
- `400`: Talle o cantidad inválidos
- `401`: Token no proporcionado
- `403`: Producto no pertenece al tenant
- `404`: Producto no encontrado
- `500`: Error del servidor

---

## ✅ Validaciones

### Frontend (AdminProductForm)

1. **Nombre:**
   - Requerido
   - Mínimo 3 caracteres
   - Trim de espacios

2. **Precio:**
   - Requerido
   - Número válido
   - Mayor a 0

3. **Descuento:**
   - Opcional
   - Si existe: número entre 0 y 100

4. **Categoría:**
   - Requerida
   - Debe estar en lista permitida

5. **Talles:**
   - Mínimo 1 talle
   - Cada talle debe tener stock definido
   - Stock no puede ser negativo

6. **Imagen Principal:**
   - Requerida
   - URL válida o base64

### Backend (Zod Schema)

```typescript
productoSchema = {
  nombre: string.min(1).max(255),
  precio: number.min(0),
  descuento: number.min(0).max(100).optional(),
  categoria: string.min(1),
  talles: array[string].min(1),
  stock: record[string, number.min(0)],
  imagenPrincipal: string.optional(),
  activo: boolean.default(true),
  destacado: boolean.default(false),
}
```

---

## 🐛 Errores Comunes y Soluciones

### 1. "Producto no encontrado" al editar

**Causa:** El producto fue eliminado o el ID es incorrecto.

**Solución:**
- Verificar que el producto existe en Supabase
- Refrescar la lista de productos
- Verificar que el ID es un UUID válido

---

### 2. "Límite de productos alcanzado"

**Causa:** El plan del tenant tiene un límite y se alcanzó.

**Solución:**
- Actualizar el plan del tenant (free → pro → premium)
- Eliminar productos innecesarios
- Desactivar productos en lugar de eliminarlos

**Límites por plan:**
- Free: 10 productos
- Pro: 100 productos
- Premium: Ilimitado

---

### 3. "Los talles [X, Y] deben tener stock definido"

**Causa:** Se agregaron talles pero no se definió stock para todos.

**Solución:**
- Agregar stock para todos los talles antes de guardar
- O eliminar los talles sin stock

---

### 4. "El stock no puede ser negativo"

**Causa:** Se intentó establecer stock negativo.

**Solución:**
- Usar valores >= 0
- Para reducir stock, usar valores menores al actual

---

### 5. "Token no proporcionado" o "No autorizado"

**Causa:** Sesión expirada o token inválido.

**Solución:**
- Cerrar sesión y volver a iniciar
- Verificar que el token está en localStorage
- Verificar que el token no expiró

---

### 6. Imagen no se muestra en tabla

**Causa:** URL inválida o imagen eliminada.

**Solución:**
- Verificar que la URL es accesible
- Usar URLs de imágenes públicas (Unsplash, Cloudinary)
- O subir imagen a Supabase Storage

---

## 🚀 Mejoras Futuras

### Corto Plazo

1. **Upload de imágenes a Supabase Storage**
   - Reemplazar URLs externas
   - Optimización automática
   - CDN integrado

2. **Búsqueda avanzada**
   - Filtros por múltiples categorías
   - Búsqueda por tags
   - Ordenamiento personalizado

3. **Bulk Actions**
   - Activar/desactivar múltiples productos
   - Eliminar múltiples productos
   - Exportar a CSV/Excel

4. **Historial de cambios**
   - Ver quién modificó qué y cuándo
   - Revertir cambios
   - Comparar versiones

### Mediano Plazo

1. **Importación masiva**
   - CSV/Excel import
   - Validación batch
   - Preview antes de importar

2. **Categorías dinámicas**
   - CRUD de categorías
   - Jerarquía de categorías
   - Filtros por subcategorías

3. **Variantes de productos**
   - Productos con múltiples colores/talles como variantes
   - Gestión centralizada
   - Stock por variante

4. **Analytics de productos**
   - Productos más vistos
   - Productos más vendidos
   - Tendencias de stock

### Largo Plazo

1. **Sincronización con Google Sheets** (si se requiere)
   - Exportar productos a Sheets
   - Importar desde Sheets
   - Sincronización bidireccional

2. **API pública para productos**
   - Endpoints públicos con rate limiting
   - Documentación OpenAPI
   - SDK para desarrolladores

3. **Multi-idioma**
   - Traducción de nombres/descripciones
   - Categorías por idioma
   - SEO multi-idioma

---

## 📝 Notas Técnicas

### Estructura de Datos

**Producto en Supabase:**
```typescript
{
  id: UUID,
  tenant_id: UUID,
  nombre: string,
  descripcion: string?,
  precio: number,
  descuento: number?,
  categoria: string,
  color: string?,
  talles: string[],
  stock: { [talle: string]: number },
  imagen_principal: string,
  imagenes_sec: string[],
  id_mercado_pago: string?,
  tags: string[],
  destacado: boolean,
  activo: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Mapeo Frontend ↔ Backend

**Frontend usa:**
- `imagenPrincipal` → Backend: `imagen_principal`
- `imagenesSec` → Backend: `imagenes_sec`
- `idMercadoPago` → Backend: `id_mercado_pago`

**Backend normaliza automáticamente** ambos formatos para compatibilidad.

---

## 🔒 Seguridad

1. **Autenticación:** Todos los endpoints requieren token JWT válido
2. **Autorización:** Solo el tenant propietario puede modificar sus productos
3. **Validación:** Zod schema valida todos los datos de entrada
4. **Rate Limiting:** Endpoints críticos excluidos, otros limitados a 30 req/min
5. **Sanitización:** Inputs sanitizados antes de guardar en DB

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Verificar logs en consola del navegador
3. Verificar logs del servidor
4. Revisar errores en Supabase Dashboard

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0

