# TODO - Mejoras CRUD de Productos

## 🎯 Prioridad Alta

### 1. Upload de Imágenes a Supabase Storage ✅ COMPLETADO
- [x] Crear bucket en Supabase Storage para productos
- [x] Implementar componente de upload con preview (`components/ImageUploader.tsx`)
- [x] Reemplazar URLs externas por Supabase Storage URLs
- [x] Validación de formatos (JPG, PNG, WebP) y tamaño máximo (5MB)
- [x] Manejo de errores en upload
- [x] Drag & drop funcional
- [x] Preview antes de guardar
- [x] Integrado en `AdminProductForm`

**Archivos creados:**
- `lib/supabase-storage.ts` - Utilidades para Storage
- `components/ImageUploader.tsx` - Componente reutilizable con drag & drop

**Nota:** El bucket `productos` debe crearse manualmente en Supabase Dashboard con permisos públicos.

---

### 2. Mejorar Validación de Imágenes ✅ COMPLETADO
- [x] Validar formato de imagen (JPG, PNG, WebP)
- [x] Validar tamaño máximo (5MB)
- [x] Preview antes de guardar
- [x] Validación de URL si es externa (soporte para URLs externas también)

**Implementado en:** `lib/supabase-storage.ts` y `components/ImageUploader.tsx`

---

### 3. Búsqueda y Filtros Avanzados ✅ COMPLETADO
- [x] Búsqueda por nombre, categoría, descripción y tags
- [x] Filtro por estado (activo/inactivo/todos)
- [x] Filtro por categoría
- [x] Filtro por rango de precio (mínimo y máximo)
- [x] Panel de filtros colapsable
- [x] Botón para limpiar filtros
- [x] Optimización con `useMemo` para mejor performance

**Implementado en:** `app/admin/productos/page.tsx`

**Mejoras futuras:**
- [ ] Filtro por destacado
- [ ] Ordenamiento (nombre, precio, fecha)
- [ ] Guardar filtros en localStorage

---

## 🎯 Prioridad Media

### 4. Bulk Actions ✅ COMPLETADO
- [x] Selección múltiple de productos (checkboxes)
- [x] Seleccionar todos en página actual
- [x] Activar/desactivar múltiples con confirmación
- [x] Eliminar múltiples con confirmación
- [x] Duplicar múltiples productos
- [x] Barra de acciones visible cuando hay selección
- [x] Feedback visual de productos seleccionados
- [x] Manejo de errores por producto individual

**Implementado en:** 
- `app/admin/productos/page.tsx` - Lógica de bulk actions
- `components/AdminProductTable.tsx` - UI de selección

**Mejoras futuras:**
- [ ] Cambiar categoría en masa
- [ ] Exportar seleccionados a CSV
- [ ] Selección por filtros aplicados

---

### 5. Historial de Cambios ✅ COMPLETADO
- [x] Tabla `producto_historial` en Supabase (`supabase/migrations/004_add_historial_productos.sql`)
- [x] Registrar cambios automáticamente en crear, editar, eliminar
- [x] Detectar cambios específicos (campo modificado, valores antes/después)
- [x] Vista de historial en modal (`components/ProductHistorialModal.tsx`)
- [x] Endpoint API para obtener historial (`/api/productos/[id]/historial`)
- [x] Icono de historial en tabla de productos
- [x] Formato de fecha legible
- [x] Iconos por tipo de acción

**Archivos creados:**
- `supabase/migrations/004_add_historial_productos.sql` - Migración SQL
- `lib/historial-helpers.ts` - Helpers para historial
- `app/api/productos/[id]/historial/route.ts` - Endpoint API
- `components/ProductHistorialModal.tsx` - Modal de historial

**Mejoras futuras:**
- [ ] Comparar versiones lado a lado
- [ ] Revertir a versión anterior
- [ ] Exportar historial a PDF/CSV
- [ ] Filtros en historial (por acción, fecha, usuario)

---

### 6. Categorías Dinámicas
- [ ] CRUD de categorías en admin
- [ ] Asignar iconos a categorías
- [ ] Ordenamiento de categorías
- [ ] Subcategorías (opcional)
- [ ] Validar que categoría existe antes de crear producto

**Estimado:** 5-6 horas

---

### 7. Mejoras de UX en Tabla
- [ ] Paginación mejorada (mostrar total, ir a página)
- [ ] Columnas ordenables (click en header)
- [ ] Columnas personalizables (mostrar/ocultar)
- [ ] Vista de tarjetas además de tabla
- [ ] Exportar tabla a CSV/Excel

**Estimado:** 4-5 horas

---

## 🎯 Prioridad Baja

### 8. Importación Masiva
- [ ] Template CSV para descargar
- [ ] Upload de CSV con validación
- [ ] Preview de datos antes de importar
- [ ] Validación batch con reporte de errores
- [ ] Importación progresiva con progress bar

**Estimado:** 8-10 horas

---

### 9. Variantes de Productos
- [ ] Modelo de variantes (color, talle como variantes)
- [ ] Gestión centralizada de variantes
- [ ] Stock por variante
- [ ] Precios por variante (opcional)
- [ ] Imágenes por variante

**Estimado:** 12-15 horas

---

### 10. Analytics de Productos
- [ ] Productos más vistos (tracking de vistas)
- [ ] Productos más vendidos (de ventas)
- [ ] Tendencias de stock (gráficos)
- [ ] Productos con bajo stock (alertas)
- [ ] Dashboard de métricas

**Estimado:** 10-12 horas

---

### 11. Sincronización con Google Sheets
- [ ] Configurar Google Sheets API
- [ ] Endpoint para exportar productos a Sheets
- [ ] Endpoint para importar desde Sheets
- [ ] Sincronización bidireccional (opcional)
- [ ] Mapeo de columnas personalizable

**Estimado:** 8-10 horas

---

### 12. API Pública
- [ ] Endpoints públicos con rate limiting
- [ ] Documentación OpenAPI/Swagger
- [ ] SDK para desarrolladores
- [ ] Webhooks para cambios de productos
- [ ] Autenticación por API key

**Estimado:** 15-20 horas

---

## 🐛 Bugs Conocidos

### Pendientes de Fix

1. **Imagen no se muestra después de editar**
   - Status: Pendiente
   - Prioridad: Media
   - Solución propuesta: Verificar mapeo de `imagenPrincipal` vs `imagen_principal`

2. **Stock no se actualiza en tiempo real**
   - Status: Pendiente
   - Prioridad: Alta
   - Solución propuesta: Usar optimistic updates o polling

3. **Duplicar producto mantiene referencias a imágenes**
   - Status: Pendiente
   - Prioridad: Baja
   - Solución propuesta: Copiar imágenes a nuevas URLs

---

## 🔧 Mejoras Técnicas

### Performance
- [ ] Implementar virtualización en tabla (react-window)
- [ ] Lazy loading de imágenes
- [ ] Debounce en búsqueda
- [ ] Cache de productos con React Query
- [ ] Optimistic updates para mejor UX

### Código
- [ ] Refactorizar tipos TypeScript (interfaces)
- [ ] Extraer lógica de negocio a hooks
- [ ] Crear componentes reutilizables (FormField, etc.)
- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Playwright

### Seguridad
- [ ] Validar permisos por acción (FREE vs FULL)
- [ ] Rate limiting más granular
- [ ] Sanitización de inputs HTML
- [ ] Validación de URLs de imágenes
- [ ] Límites de tamaño de payload

---

## 📚 Documentación Pendiente

- [ ] Guía de uso para administradores
- [ ] Video tutorial de CRUD completo
- [ ] Diagrama de flujo visual
- [ ] Ejemplos de código para integraciones
- [ ] FAQ de problemas comunes

---

## 🎨 Mejoras de UI/UX

- [ ] Skeleton loaders en lugar de spinners
- [ ] Animaciones suaves en transiciones
- [ ] Confirmaciones con modales en lugar de `confirm()`
- [ ] Drag & drop para reordenar productos
- [ ] Vista previa del producto antes de guardar
- [ ] Autocompletado en campos de categoría/tags
- [ ] Sugerencias de tags basadas en productos existentes

---

**Última actualización:** Noviembre 2025
**Mantenido por:** Equipo de Desarrollo

