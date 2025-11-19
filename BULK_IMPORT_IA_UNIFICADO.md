# 🚀 Carga Inteligente con IA - Guía Unificada

**Versión**: 2.0.0 Unificada  
**Fecha**: $(date)  
**Estado**: ✅ Funcional y lista para producción

---

## 📋 Descripción de la Herramienta

La **Carga Inteligente con IA** es una herramienta unificada del panel administrativo que permite cargar múltiples productos de forma rápida y eficiente utilizando inteligencia artificial. Es la herramienta oficial y única para carga múltiple de productos.

### Características Principales

- ✅ **Ejemplo precargado editable** - Listo para usar desde el primer momento
- ✅ **Procesamiento con IA** - Genera descripciones, tags SEO y optimiza contenido automáticamente
- ✅ **Tabla editable** - Revisa y edita productos antes de importar
- ✅ **Validaciones visuales** - Verde/Amarillo/Rojo para identificar estado de cada producto
- ✅ **QA automático** - Detecta duplicados y errores antes de importar
- ✅ **Métricas** - Muestra tiempo ahorrado y calidad promedio

---

## 🎯 Cómo Acceder

1. Iniciar sesión en el panel administrativo
2. En el menú lateral, hacer clic en **"Carga Inteligente (IA)"**
3. La herramienta se abrirá con un ejemplo precargado listo para usar

**Ruta**: `/admin/productos/carga-inteligente`

---

## 📝 Flujo de Uso Paso a Paso

### Paso 1: Ingreso

Al abrir la herramienta, verás:

- **Textarea grande** con un ejemplo precargado editable:
  ```
  Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01
  Jean mom azul talle 36/38/40 | categoría: Pantalones | precio: 35000 | stock: 15 | sku: JMM-04
  Buzo hoodie frisa premium gris | categoría: Buzos | precio: 42000 | stock: 6 | sku: BHF-22
  Zapatillas urban street blancas | categoría: Calzado | precio: 65000 | stock: 8 | sku: ZUS-31
  ```

- **Texto de ayuda**: "Podés pegar productos desde WhatsApp, Excel, o generarlos con IA usando el botón de abajo."

- **Botones**:
  - **"Procesar con IA"** - Analiza el texto y genera productos
  - **"Generar prompt IA"** - Abre ChatGPT con prompt prellenado
  - **"Copiar ejemplo"** - Copia el ejemplo al portapapeles

### Paso 2: Procesado

Al hacer clic en "Procesar con IA":

- Se muestra un loader animado con mensaje "Procesando con IA..."
- El sistema analiza el texto y detecta productos
- Genera automáticamente:
  - Descripciones cortas y largas
  - Tags SEO optimizados
  - Sugerencias de precios
  - Categorías inferidas
- Calcula calidad de cada producto (score 0-100)

**Tiempo estimado**: 5-15 segundos según cantidad de productos

### Paso 3: Vista Previa Editable

Después del procesamiento, verás:

- **Tabla editable** con columnas:
  - Imagen (placeholder por defecto)
  - Nombre (editable)
  - Categoría (editable)
  - Precio (editable)
  - Stock (editable)
  - SKU (editable)
  - Calidad (score visual)
  - Acciones (editar, eliminar)

- **Validaciones visuales**:
  - 🟢 **Verde**: Producto completo y válido, listo para importar
  - 🟡 **Amarillo**: Advertencias menores (sin imagen, descripción corta, sin SKU)
  - 🔴 **Rojo**: Errores críticos (falta nombre, precio inválido, stock negativo)

- **QA Automático**: Muestra duplicados detectados y errores encontrados

- **Mensaje sobre imágenes**: 
  > "Las imágenes se asignarán momentáneamente con un placeholder. Luego podés cargarlas a mano en la edición individual de productos."

- **Botón "Importar productos"**: Crea todos los productos en la base de datos

### Resultado Final

Después de importar, verás:

- ✅ Resumen de productos creados exitosamente
- ⚠️ Lista de productos que fallaron (si los hubo)
- 📊 Métricas:
  - Productos creados
  - Tiempo ahorrado
  - Calidad promedio
  - Errores detectados
  - Duplicados encontrados

---

## 📝 Formato de Texto Recomendado

### Formato Estándar (Recomendado)

```
NOMBRE | categoría: CATEGORIA | precio: PRECIO | stock: STOCK | sku: SKU
```

### Ejemplo Real

```
Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01
Jean mom azul talle 36/38/40 | categoría: Pantalones | precio: 35000 | stock: 15 | sku: JMM-04
Buzo hoodie frisa premium gris | categoría: Buzos | precio: 42000 | stock: 6 | sku: BHF-22
```

### Variaciones Soportadas

El sistema es flexible y acepta:

- **Sin SKU**: `Remera negra | categoría: Remeras | precio: 25000 | stock: 10`
- **Sin stock**: `Remera negra | categoría: Remeras | precio: 25000`
- **Formato natural**: `Remera negra, categoría remeras, precio 25000, stock 10`
- **Múltiples separadores**: Puedes usar `|` o `;` como separadores

---

## 💡 Generar Productos con ChatGPT

### Pasos

1. Hacer clic en **"Generar prompt IA"**
2. Se abrirá ChatGPT en una nueva pestaña
3. El prompt ya estará copiado en tu portapapeles
4. Pegar el prompt en ChatGPT
5. ChatGPT generará una lista de productos
6. Copiar la respuesta de ChatGPT
7. Pegar en el textarea de la herramienta
8. Hacer clic en "Procesar con IA"

### Prompt que se Copia Automáticamente

```
Necesito que generes una lista de productos en formato:

NOMBRE | categoría: X | precio: X | stock: X | sku: código sugerido

Ejemplo:
Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01

Generá 10 productos de indumentaria moderna urbana y deportiva.
```

---

## ⚠️ Qué Hacer si Algo No Parsea Bien

### Problema: No se detectan productos

**Causas posibles**:
- Formato muy desordenado
- Falta información crítica (nombre, precio)

**Solución**:
1. Usar formato estructurado recomendado
2. Asegurarse de incluir nombre, categoría y precio mínimo
3. Probar con menos productos primero
4. Revisar que cada producto esté en una línea separada

### Problema: Productos con errores en rojo

**Causas posibles**:
- Falta nombre o categoría
- Precio inválido (0 o negativo)
- Stock negativo

**Solución**:
1. Hacer clic en el ícono de edición (lápiz) en la fila con error
2. Corregir el campo marcado en rojo
3. Hacer clic en el check para guardar
4. El error desaparecerá cuando el campo sea válido

### Problema: Importación falla para algunos productos

**Causas posibles**:
- Categoría con caracteres especiales
- Precio fuera de rango permitido
- Límite del plan alcanzado

**Solución**:
1. Revisar el mensaje de error específico en el resumen final
2. Corregir el producto en la tabla antes de importar
3. Verificar límites del plan en Dashboard
4. Reintentar la importación

---

## 🖼️ Cómo Cargar Imágenes Manualmente

### Después de Importar

1. Ir a **"Productos"** en el menú admin
2. Buscar el producto importado
3. Hacer clic en **"Editar"**
4. En la sección "Imagen Principal", hacer clic en **"Subir Imagen"**
5. Seleccionar la imagen desde tu computadora
6. La imagen se subirá automáticamente a Supabase Storage
7. Guardar el producto

### Notas Importantes

- Las imágenes se suben a Supabase Storage
- Se aceptan formatos: JPG, PNG, WebP
- Tamaño máximo recomendado: 2MB
- Si no subes imagen, se mantiene el placeholder

---

## 🧪 Casos de Prueba

### Caso 1: Abrir herramienta por primera vez

**Resultado esperado**:
- ✅ Ver ejemplo precargado en textarea
- ✅ No hay errores en consola
- ✅ Botones visibles y funcionales

### Caso 2: Procesar ejemplo precargado sin tocar nada

**Resultado esperado**:
- ✅ Se genera tabla con 4 productos válidos
- ✅ Todos en estado "OK para importar" (verde)
- ✅ Calidad promedio > 60

### Caso 3: Editar un precio a texto no numérico

**Resultado esperado**:
- ✅ Fila marcada con error (rojo)
- ✅ Mensaje de error visible
- ✅ Botón "Importar" deshabilitado o avisa qué fila falló

### Caso 4: Borrar todo el texto y tocar "Procesar con IA"

**Resultado esperado**:
- ✅ Mostrar mensaje: "Debes ingresar información para analizar."
- ✅ Botón deshabilitado

### Caso 5: Generar productos con ChatGPT

**Resultado esperado**:
- ✅ Abre ChatGPT en pestaña nueva
- ✅ Prompt copiado al portapapeles
- ✅ Usuario puede pegar resultado y procesarlo
- ✅ Productos se importan correctamente

### Caso 6: Importar 20+ productos

**Resultado esperado**:
- ✅ La app no se cuelga
- ✅ Los productos aparecen en el listado admin
- ✅ No hay errores 500 en logs
- ✅ Tiempo de procesamiento < 30 segundos

---

## 🔒 Seguridad y Permisos

- Solo usuarios con rol **admin** pueden acceder
- Todas las operaciones están autenticadas con JWT
- Los productos se crean asociados al tenant del usuario logueado
- Validaciones server-side en todas las APIs

---

## 📊 Métricas y Analítica

Después de cada importación, verás:

- **Productos Creados**: Cantidad total importada exitosamente
- **Tiempo Ahorrado**: Estimado vs carga manual (2 min/producto)
- **Calidad Promedio**: Score promedio de todos los productos
- **Errores Detectados**: Errores encontrados y corregidos automáticamente
- **Duplicados Encontrados**: Productos duplicados detectados

---

## 🐛 Troubleshooting

### Problema: No se detectan productos

**Solución**: Usar formato estructurado, incluir nombre/categoría/precio mínimo

### Problema: Productos con errores en rojo

**Solución**: Editar campos marcados en rojo, validar que todos los campos requeridos estén completos

### Problema: Importación falla para algunos productos

**Solución**: Revisar mensaje de error específico, corregir producto y reintentar

### Problema: Calidad baja en productos

**Solución**: Hacer clic en "Optimizar Todos con IA" antes de importar, agregar descripciones manualmente si es necesario

---

## ✅ Checklist de Uso Óptimo

Antes de importar, verificar:

- [ ] Todos los productos tienen nombre válido
- [ ] Todas las categorías son correctas
- [ ] Todos los precios son números válidos (> 0)
- [ ] Todos los stocks son números válidos (>= 0)
- [ ] No hay productos duplicados (o son intencionales)
- [ ] Calidad promedio es aceptable (> 60)
- [ ] No hay errores críticos marcados en rojo

---

## 🚀 Roadmap Futuro

### Próximas Mejoras

- [ ] Integración con LLM real (OpenAI GPT-4) para mejor parsing
- [ ] Búsqueda automática de imágenes desde Unsplash/Pexels
- [ ] Detección automática de talles desde el texto
- [ ] Plantillas guardables para formatos frecuentes
- [ ] Modo "One-Click": Crear todo sin revisar

---

**Última actualización**: $(date)  
**Versión**: 2.0.0 Unificada  
**Estado**: ✅ Listo para producción

