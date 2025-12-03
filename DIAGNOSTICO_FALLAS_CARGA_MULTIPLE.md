# 🔍 DIAGNÓSTICO DE FALLAS – CARGA MÚLTIPLE DE ARTÍCULOS

**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Versión Analizada:** 1.0  
**Estado:** ⚠️ REQUIERE RECONSTRUCCIÓN

---

## 📋 CAUSAS DETECTADAS

### 1. **Soporte Limitado de Formatos** 🔴 CRÍTICO

**Problema:**

- XLSX está comentado y no funciona (requiere dependencia no instalada)
- Solo soporta CSV básico y texto plano
- No hay soporte para JSON
- No hay validación de formato de archivo

**Archivos Afectados:**

- `components/admin/BulkImportTabs.tsx` (líneas 48-67)
- `app/api/admin/ia-bulk-parse-v2/route.ts` (no valida formatos)

**Impacto:** CRÍTICO - Limita uso a solo texto/CSV

---

### 2. **IA No Detecta Talles y Colores** 🔴 CRÍTICO

**Problema:**

- El parser no extrae talles del texto
- No detecta colores automáticamente
- No parsea variantes (talle + color)
- Stock se asigna solo a talle "M" por defecto

**Archivos Afectados:**

- `app/api/admin/ia-bulk-parse-v2/route.ts` (líneas 70-205)
- `app/api/admin/bulk-products-create-v2/route.ts` (línea 141 - hardcodea ['M'])

**Impacto:** CRÍTICO - Productos se crean sin variantes

---

### 3. **Validaciones Débiles** 🟡 ALTO

**Problema:**

- No valida tamaño máximo de archivo
- No valida formato antes de procesar
- Validaciones de producto son básicas
- No valida URLs de imágenes
- No detecta duplicados antes de crear

**Archivos Afectados:**

- `app/api/admin/ia-bulk-parse-v2/route.ts` (líneas 327-371)
- `app/api/admin/bulk-products-create-v2/route.ts` (líneas 72-91)
- `app/(ecommerce)/admin/productos/carga-inteligente/page.tsx` (líneas 198-215)

**Impacto:** ALTO - Permite datos inválidos

---

### 4. **Manejo de Errores Insuficiente** 🔴 CRÍTICO

**Problema:**

- Errores genéricos sin contexto
- No hay retry automático
- Errores silenciosos en parsing
- No hay Error Boundaries
- No hay logs estructurados

**Archivos Afectados:**

- Todos los archivos de carga masiva
- No hay `lib/import-error-handler.ts`
- No hay logs en `/admin/data-import-logs`

**Impacto:** CRÍTICO - Errores no rastreables

---

### 5. **OCR No Implementado** 🟡 MEDIO

**Problema:**

- OCR retorna mensaje de "en desarrollo"
- No hay procesamiento real de imágenes
- Dependencias comentadas (Tesseract.js)

**Archivos Afectados:**

- `app/api/admin/ocr-process/route.ts` (líneas 18-28)
- `components/admin/BulkImportTabs.tsx` (líneas 6-7, 96-97)

**Impacto:** MEDIO - Funcionalidad prometida no disponible

---

### 6. **IA Básica - No Corrige Errores** 🟡 ALTO

**Problema:**

- No corrige errores de ortografía
- No normaliza precios mal formateados ("$12.000" → no parsea bien)
- No completa campos faltantes inteligentemente
- No detecta columnas desordenadas

**Archivos Afectados:**

- `app/api/admin/ia-bulk-parse-v2/route.ts` (función `parsePrice` - línea 285)
- `app/api/admin/ia-bulk-parse-v2/route.ts` (función `enhanceProduct` - línea 207)

**Impacto:** ALTO - Requiere corrección manual

---

### 7. **Sin Vista Previa Real** 🟡 MEDIO

**Problema:**

- Vista previa muestra tabla pero no imágenes reales
- No muestra cómo se verá en la tienda
- No permite editar antes de confirmar completamente

**Archivos Afectados:**

- `app/(ecommerce)/admin/productos/carga-inteligente/page.tsx` (líneas 496-578)
- `components/admin/SmartProductTable.tsx` (no leído aún)

**Impacto:** MEDIO - UX mejorable

---

### 8. **Sin Tests Completos** 🔴 CRÍTICO

**Problema:**

- Tests básicos solo para parser simple
- No hay tests de integración
- No hay tests de carga de múltiples archivos
- No hay tests de validación
- No hay tests de guardado

**Archivos Afectados:**

- `tests/bulk-import.spec.ts` (solo tests básicos)

**Impacto:** CRÍTICO - Sin garantía de calidad

---

### 9. **Sin Reportes de Importación** 🔴 CRÍTICO

**Problema:**

- No hay página `/admin/import-status`
- No hay historial de importaciones
- No hay métricas de éxito/fallo
- No hay logs accesibles

**Archivos Afectados:**

- No existe `app/(ecommerce)/admin/import-status/page.tsx`

**Impacto:** CRÍTICO - Sin trazabilidad

---

### 10. **Problemas de Asincronía** 🟡 ALTO

**Problema:**

- Procesamiento secuencial lento
- No hay procesamiento en paralelo
- Puede quedar colgado en archivos grandes
- No hay timeout configurado

**Archivos Afectados:**

- `app/api/admin/bulk-products-create-v2/route.ts` (línea 68 - loop secuencial)

**Impacto:** ALTO - Lento con muchos productos

---

## 📁 ARCHIVOS AFECTADOS

### Frontend

- `components/admin/BulkImportTabs.tsx` - Tabs de entrada
- `app/(ecommerce)/admin/productos/carga-inteligente/page.tsx` - Página principal
- `components/admin/SmartProductTable.tsx` - Tabla de productos (no analizado aún)
- `components/admin/AutoQA.tsx` - QA automático (no analizado aún)

### Backend

- `app/api/admin/ia-bulk-parse-v2/route.ts` - Parser con IA
- `app/api/admin/bulk-products-create-v2/route.ts` - Creación masiva
- `app/api/admin/ocr-process/route.ts` - OCR (no implementado)

### Tests

- `tests/bulk-import.spec.ts` - Tests básicos insuficientes

### Utils

- `utils/api.ts` - Funciones de API (líneas 82-99)

---

## 🎯 IMPACTO GENERAL

**Nivel:** 🔴 **CRÍTICO**

**Razones:**

- Funcionalidad core incompleta (talles/colores)
- Sin manejo robusto de errores
- Sin tests adecuados
- Sin reportes/trazabilidad
- Formatos limitados

---

## 💡 RECOMENDACIÓN PREVIA AL FIX

### Prioridad 1 (CRÍTICO - Hacer primero):

1. ✅ Implementar detección de talles y colores en parser
2. ✅ Agregar manejo robusto de errores con logs
3. ✅ Implementar validaciones completas
4. ✅ Crear sistema de reportes

### Prioridad 2 (ALTO - Hacer después):

5. ✅ Soporte completo para XLSX, CSV, JSON, TXT
6. ✅ IA que corrige errores humanos
7. ✅ Vista previa mejorada
8. ✅ Tests completos

### Prioridad 3 (MEDIO - Mejoras):

9. ✅ OCR funcional
10. ✅ Procesamiento paralelo
11. ✅ Auto-completado inteligente

---

## 📊 RESUMEN EJECUTIVO

**Estado Actual:** ⚠️ Funcional pero limitado

**Problemas Críticos:** 4  
**Problemas Altos:** 4  
**Problemas Medios:** 2

**Recomendación:** 🔴 **RECONSTRUCCIÓN TOTAL RECOMENDADA**

La herramienta funciona para casos básicos pero requiere mejoras significativas para ser producción-ready y manejar cargas masivas reales.

---

**Fin del Diagnóstico**
