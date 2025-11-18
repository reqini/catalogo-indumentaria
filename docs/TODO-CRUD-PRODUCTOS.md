# TODO - Mejoras CRUD de Productos

## 🎯 Prioridad Alta

### 1. Upload de Imágenes a Supabase Storage
- [ ] Crear bucket en Supabase Storage para productos
- [ ] Implementar componente de upload con preview
- [ ] Reemplazar URLs externas por Supabase Storage URLs
- [ ] Optimización automática de imágenes (resize, WebP)
- [ ] Manejo de errores en upload

**Estimado:** 4-6 horas

---

### 2. Mejorar Validación de Imágenes
- [ ] Validar formato de imagen (JPG, PNG, WebP)
- [ ] Validar tamaño máximo (ej: 5MB)
- [ ] Validar dimensiones mínimas/máximas
- [ ] Preview antes de guardar
- [ ] Validación de URL si es externa

**Estimado:** 2-3 horas

---

### 3. Búsqueda y Filtros Avanzados
- [ ] Filtro por múltiples categorías
- [ ] Filtro por rango de precio
- [ ] Filtro por estado (activo/inactivo)
- [ ] Filtro por destacado
- [ ] Búsqueda por tags
- [ ] Ordenamiento (nombre, precio, fecha)

**Estimado:** 3-4 horas

---

## 🎯 Prioridad Media

### 4. Bulk Actions
- [ ] Selección múltiple de productos (checkboxes)
- [ ] Activar/desactivar múltiples
- [ ] Eliminar múltiples con confirmación
- [ ] Cambiar categoría en masa
- [ ] Exportar seleccionados a CSV

**Estimado:** 4-5 horas

---

### 5. Historial de Cambios
- [ ] Tabla `producto_historial` en Supabase
- [ ] Registrar cambios (quién, qué, cuándo)
- [ ] Vista de historial en detalle de producto
- [ ] Comparar versiones
- [ ] Revertir a versión anterior (opcional)

**Estimado:** 6-8 horas

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

