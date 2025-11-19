# 🚀 Carga Múltiple con IA - Documentación

**Versión**: 1.0.0  
**Fecha**: $(date)  
**Estado**: ✅ Funcional y listo para probar

---

## 📋 Descripción General

La herramienta de **Carga Múltiple con IA** permite importar múltiples productos al catálogo de forma rápida y eficiente, procesando texto estructurado o semiestructurado y convirtiéndolo automáticamente en productos listos para crear.

### Características Principales

- ✅ **Parser inteligente** que detecta productos desde texto libre o estructurado
- ✅ **Tabla editable** para revisar y ajustar productos antes de importar
- ✅ **Validaciones automáticas** de datos antes de crear productos
- ✅ **Creación automática de categorías** si no existen
- ✅ **Placeholder de imágenes** por defecto (se pueden subir después)
- ✅ **Manejo robusto de errores** con reporte detallado

---

## 🎯 Flujo de Usuario

### 1. Acceso a la Herramienta

Desde el panel admin, navegar a **"Carga Múltiple (IA)"** en el menú lateral.

### 2. Ingresar Texto

Pegar o escribir la descripción de productos en el textarea. Se soportan múltiples formatos:

#### Formato Estructurado (Recomendado)
```
Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10
Jean mom azul | categoría: Pantalones | precio: 35000 | stock: 5
Buzo hoodie gris | categoría: Buzos | precio: 30000 | stock: 8
```

#### Formato con Punto y Coma
```
Remera negra; categoría Remeras; precio 25000; stock 10
Jean azul; categoría Pantalones; precio 35000; stock 5
```

#### Formato Natural
```
Quiero cargar: Remera oversize blanca talle único, categoría remeras, precio 21000, stock 8. Buzo hoodie gris, categoría buzos, 30000 pesos, 4 unidades en stock.
```

### 3. Analizar con IA

Hacer clic en **"Analizar con IA"**. El sistema procesará el texto y detectará:
- Nombre del producto
- Categoría (o la inferirá del nombre)
- Precio
- Stock
- SKU (si está presente)
- Descripción (si está presente)

### 4. Revisar y Editar

Se mostrará una tabla con todos los productos detectados. El usuario puede:
- **Editar** cualquier campo haciendo clic en el ícono de edición
- **Eliminar** productos que no desea importar
- **Validar** que todos los datos sean correctos

### 5. Importar Productos

Al hacer clic en **"Importar Productos"**, el sistema:
- Valida todos los productos
- Crea categorías que no existan
- Crea todos los productos en la base de datos
- Asigna placeholder de imagen por defecto
- Muestra un resumen con productos creados y errores (si los hay)

---

## 📝 Formatos de Entrada Soportados

### Campos Detectados

El parser puede detectar los siguientes campos:

| Campo | Ejemplos | Requerido |
|-------|----------|-----------|
| **Nombre** | "Remera oversize negra" | ✅ Sí |
| **Categoría** | "categoría: Remeras" o "categoria Remeras" | ✅ Sí (se infiere si falta) |
| **Precio** | "precio: 25000" o "25000 pesos" | ✅ Sí |
| **Stock** | "stock: 10" o "10 unidades" | ⚠️ Opcional (default: 0) |
| **SKU** | "sku: ABC123" | ❌ Opcional |
| **Descripción** | "descripción: Texto largo..." | ❌ Opcional |

### Ejemplos de Texto de Entrada

#### Ejemplo 1: Formato Estructurado Simple
```
Remera básica blanca | categoría: Remeras | precio: 15000 | stock: 20
Jean clásico azul | categoría: Pantalones | precio: 40000 | stock: 15
Buzo canguro negro | categoría: Buzos | precio: 35000 | stock: 10
```

#### Ejemplo 2: Con SKU y Descripción
```
Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: REM-001 | descripción: Remera de algodón oversize
Jean mom azul | categoría: Pantalones | precio: 35000 | stock: 5 | sku: JEA-002 | descripción: Jean estilo mom fit
```

#### Ejemplo 3: Formato Natural
```
Quiero cargar estos productos:
Remera oversize blanca talle único, categoría remeras, precio 21000, stock 8 unidades.
Buzo hoodie gris, categoría buzos, 30000 pesos, tengo 4 unidades en stock.
Jean mom azul oscuro, categoría pantalones, precio 35000, stock 6.
```

#### Ejemplo 4: Múltiples Líneas con Variaciones
```
Remera básica negra | Remeras | 15000 | 20
Jean clásico azul | Pantalones | 40000 | 15
Buzo canguro gris | Buzos | 35000 | 10
Zapatillas deportivas blancas | Zapatillas | 45000 | 8
```

---

## 🔧 Detalles Técnicos

### Parser Inteligente

El parser utiliza múltiples estrategias para detectar productos:

1. **Formato Estructurado** (`|` como separador)
   - Detecta campos con formato `campo: valor`
   - Ejemplo: `nombre | categoría: X | precio: Y | stock: Z`

2. **Formato con Punto y Coma** (`;` como separador)
   - Detecta campos sin etiquetas explícitas
   - Ejemplo: `nombre; categoría X; precio Y; stock Z`

3. **Formato Natural** (texto libre)
   - Usa expresiones regulares para detectar patrones
   - Infiere categorías desde palabras clave del nombre
   - Ejemplo: "Remera oversize blanca, categoría remeras, precio 21000, stock 8"

### Inferencia de Categorías

Si no se especifica una categoría, el sistema intenta inferirla desde el nombre del producto usando palabras clave:

| Categoría | Palabras Clave |
|-----------|----------------|
| Remeras | remera, camiseta, t-shirt, polo |
| Pantalones | pantalón, jean, jeans |
| Buzos | buzo, sweater, hoodie, sudadera |
| Zapatillas | zapatilla, sneaker, calzado |
| Accesorios | accesorio, gorra, cinturón |

Si no se encuentra ninguna coincidencia, se usa **"General"** como categoría por defecto.

### Normalización de Datos

- **Nombres**: Primera letra mayúscula, resto minúscula
- **Categorías**: Primera letra mayúscula, resto minúscula
- **Precios**: Se limpian símbolos de moneda y se convierten a número
- **Stock**: Se convierte a entero (default: 0 si no se especifica)

---

## ⚠️ Limitaciones Actuales

### Imágenes

- **Las imágenes se guardan como placeholder por defecto** (`/images/default-product.svg`)
- Los productos creados con esta herramienta **NO incluyen imágenes reales**
- **Solución**: Después de importar, editar cada producto individualmente para subir su imagen real

### Talles

- Todos los productos se crean con **un solo talle "M"** por defecto
- El stock se asigna al talle "M"
- **Solución**: Después de importar, editar cada producto para agregar más talles y distribuir el stock

### Validaciones

- El parser intenta detectar datos, pero puede fallar con textos muy desordenados
- Se recomienda usar formato estructurado para mejores resultados
- Siempre revisar la tabla previa antes de importar

---

## 🧪 Casos de Prueba

### Caso 1: Texto Simple con 2 Productos

**Entrada**:
```
Remera negra | categoría: Remeras | precio: 25000 | stock: 10
Jean azul | categoría: Pantalones | precio: 35000 | stock: 5
```

**Resultado Esperado**:
- ✅ 2 productos detectados
- ✅ Datos correctos en tabla previa
- ✅ Importación exitosa

### Caso 2: Texto Semi Desordenado

**Entrada**:
```
Quiero cargar: Remera oversize blanca talle único, categoría remeras, precio 21000, stock 8. Buzo hoodie gris, categoría buzos, 30000 pesos, 4 unidades en stock.
```

**Resultado Esperado**:
- ✅ Al menos 2 productos detectados
- ✅ Nombre, precio, stock y categoría detectados correctamente
- ✅ Importación exitosa

### Caso 3: Producto con Precio No Numérico

**Entrada**:
```
Remera negra | categoría: Remeras | precio: inválido | stock: 10
```

**Resultado Esperado**:
- ⚠️ Producto detectado pero con precio 0 o error
- ⚠️ Validación previa marca error antes de importar
- ✅ Usuario puede corregir manualmente antes de importar

### Caso 4: Importar 10 Productos Válidos

**Entrada**: 10 productos en formato estructurado válido

**Resultado Esperado**:
- ✅ Todos los productos se insertan correctamente
- ✅ En DB tienen placeholder de imagen
- ✅ Aparecen en el listado de productos del admin
- ✅ Categorías se crean automáticamente si no existen

---

## 🚀 Plan de Mejora Futura

### Fase 2: Mejoras de Parser

- [ ] Integración con LLM real (OpenAI, Anthropic, etc.) para mejor detección
- [ ] Detección automática de talles desde el texto
- [ ] Detección de colores y otros atributos
- [ ] Sugerencias de precios basadas en categoría

### Fase 3: Gestión de Imágenes

- [ ] Generación de prompts de búsqueda de imágenes desde descripción
- [ ] Integración con bancos de imágenes (Unsplash, Pexels)
- [ ] IA generativa para mockups de productos
- [ ] Carga masiva de imágenes desde URLs

### Fase 4: Optimizaciones

- [ ] Procesamiento en lotes más grandes
- [ ] Preview de imágenes antes de importar
- [ ] Plantillas de importación guardables
- [ ] Historial de importaciones

---

## 📚 Archivos del Sistema

### Frontend

- `app/admin/productos/carga-multiple/page.tsx` - Página principal de carga múltiple
- `app/admin/layout.tsx` - Layout actualizado con link a carga múltiple

### Backend

- `app/api/admin/ia-bulk-parse/route.ts` - API de parseo de texto
- `app/api/admin/bulk-products-create/route.ts` - API de creación múltiple

### Helpers

- `lib/supabase-helpers.ts` - Funciones actualizadas para categorías con filtros

---

## ✅ Checklist de QA

### Funcionalidad Básica

- [x] Página de carga múltiple accesible desde admin
- [x] Textarea acepta texto de entrada
- [x] Botón "Analizar con IA" funciona
- [x] Tabla previa muestra productos detectados
- [x] Edición inline funciona correctamente
- [x] Eliminación de productos de la lista funciona
- [x] Botón "Importar Productos" crea productos en DB
- [x] Resultado muestra resumen de creación

### Validaciones

- [x] Validación de nombre requerido
- [x] Validación de categoría requerida
- [x] Validación de precio > 0
- [x] Validación de stock >= 0
- [x] Mensajes de error claros

### Integración

- [x] No rompe carga normal de productos
- [x] No rompe edición de productos
- [x] No rompe módulo de categorías
- [x] No rompe módulo de banners

### UX

- [x] Mensajes claros sobre placeholder de imágenes
- [x] Feedback visual durante procesamiento
- [x] Mensajes de éxito/error claros
- [x] Navegación intuitiva

---

## 🐛 Troubleshooting

### Problema: No se detectan productos

**Solución**: 
- Verificar que el texto tenga formato estructurado
- Intentar con menos productos
- Revisar que haya al menos nombre, categoría y precio

### Problema: Categoría no se crea

**Solución**:
- Verificar permisos del tenant
- Revisar logs del servidor
- Intentar crear la categoría manualmente primero

### Problema: Productos no se importan

**Solución**:
- Verificar límites del plan
- Revisar validaciones en tabla previa
- Verificar logs del servidor para errores específicos

---

**Última actualización**: $(date)  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para probar en producción

