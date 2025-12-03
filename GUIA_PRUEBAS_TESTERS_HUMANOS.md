# 📋 Guía de Pruebas para Equipo Humano

**Versión:** 1.0  
**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Objetivo:** Proporcionar instrucciones claras para testers humanos que prueben la tienda online

---

## 🎯 Información General

Esta guía está diseñada para que cualquier tester pueda probar la tienda de manera sistemática y reportar problemas de forma clara.

### Navegadores a Probar

- ✅ Chrome (última versión)
- ✅ Firefox (última versión)
- ✅ Safari (última versión)
- ✅ Edge (última versión)
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

### Dispositivos Recomendados

- Desktop (1920x1080 o superior)
- Tablet (iPad, Android tablet)
- Mobile (iPhone, Android phone)

---

## 📱 1. RECORRIDO COMPLETO DE COMPRA

### Paso 1: Navegar a la Home

**Qué hacer:**

1. Abrir la URL de la tienda
2. Esperar a que cargue completamente
3. Verificar que se muestren productos

**Qué verificar:**

- ✅ La página carga sin errores
- ✅ Se muestran productos en la home
- ✅ Las imágenes cargan correctamente
- ✅ Los botones son clickeables
- ✅ El menú de navegación funciona

**Qué reportar si falla:**

- Captura de pantalla del error
- Mensaje de error (si aparece)
- Navegador y versión
- Dispositivo usado

---

### Paso 2: Buscar Productos

**Qué hacer:**

1. Usar el buscador (si existe) o navegar al catálogo
2. Buscar un producto específico (ej: "remera", "zapatilla")
3. Aplicar filtros (categoría, precio, etc.)

**Qué verificar:**

- ✅ Los resultados aparecen correctamente
- ✅ Los filtros funcionan
- ✅ Las imágenes de productos cargan
- ✅ Los precios se muestran correctamente

**Qué reportar si falla:**

- Qué buscaste
- Qué filtros aplicaste
- Qué resultado esperabas vs qué obtuviste
- Captura de pantalla

---

### Paso 3: Ver Detalle de Producto

**Qué hacer:**

1. Clickear en un producto
2. Ver todas las imágenes del producto
3. Leer descripción y detalles

**Qué verificar:**

- ✅ La página del producto carga
- ✅ Las imágenes se muestran correctamente
- ✅ La descripción es legible
- ✅ El precio se muestra correctamente
- ✅ Los talles están disponibles (si aplica)

**Qué reportar si falla:**

- ID o nombre del producto
- Qué elemento no funciona
- Captura de pantalla

---

### Paso 4: Seleccionar Talle y Color

**Qué hacer:**

1. Seleccionar un talle disponible
2. Seleccionar un color (si está disponible)
3. Verificar que la selección se marca visualmente

**Qué verificar:**

- ✅ Los talles disponibles se muestran
- ✅ Puedes seleccionar un talle
- ✅ La selección se marca visualmente
- ✅ Los colores se muestran (si aplica)
- ✅ Puedes cambiar de talle/color

**Qué reportar si falla:**

- Qué producto estabas probando
- Qué talle/color intentaste seleccionar
- Qué pasó (no se marcó, no apareció, etc.)
- Captura de pantalla

---

### Paso 5: Agregar al Carrito

**Qué hacer:**

1. Seleccionar talle (y color si aplica)
2. Clickear "Agregar al Carrito"
3. Verificar mensaje de confirmación

**Qué verificar:**

- ✅ Aparece mensaje de éxito
- ✅ El producto se agrega al carrito
- ✅ El contador del carrito se actualiza
- ✅ Puedes agregar múltiples productos

**Qué reportar si falla:**

- Qué producto intentaste agregar
- Qué talle/color seleccionaste
- Qué mensaje de error apareció (si hay)
- Captura de pantalla

---

### Paso 6: Ver Carrito

**Qué hacer:**

1. Abrir el carrito
2. Ver todos los productos agregados
3. Modificar cantidades
4. Eliminar productos

**Qué verificar:**

- ✅ Todos los productos aparecen
- ✅ Los precios son correctos
- ✅ La suma total es correcta
- ✅ Puedes cambiar cantidades
- ✅ Puedes eliminar productos
- ✅ El total se actualiza automáticamente

**Qué reportar si falla:**

- Qué productos tenías en el carrito
- Qué operación intentaste (cambiar cantidad, eliminar)
- Qué resultado obtuviste vs qué esperabas
- Captura de pantalla

---

### Paso 7: Seleccionar Método de Envío

**Qué hacer:**

1. Ir a checkout
2. Completar datos personales
3. Seleccionar método de envío o retiro en local
4. Si es envío, ingresar código postal y calcular

**Qué verificar:**

- ✅ Los campos del formulario funcionan
- ✅ Puedes seleccionar envío o retiro
- ✅ El cálculo de envío funciona (si aplica)
- ✅ Los métodos de envío se muestran
- ✅ El costo de envío se suma al total

**Qué reportar si falla:**

- Qué método intentaste seleccionar
- Qué código postal ingresaste (si aplica)
- Qué error apareció
- Captura de pantalla

---

### Paso 8: Completar Checkout

**Qué hacer:**

1. Revisar resumen de compra
2. Verificar total final
3. Clickear "Pagar con Mercado Pago"
4. (NO completar el pago real, solo verificar que redirige)

**Qué verificar:**

- ✅ El resumen muestra todos los productos
- ✅ El total es correcto
- ✅ El botón de pago funciona
- ✅ Redirige a Mercado Pago (o muestra error claro si no está configurado)

**Qué reportar si falla:**

- Qué productos tenías en el carrito
- Qué total esperabas vs qué total apareció
- Qué pasó al clickear "Pagar"
- Captura de pantalla

---

## 🧑‍💼 2. FLUJO ADMINISTRADOR

### Paso 1: Login Admin

**Qué hacer:**

1. Ir a `/admin/login`
2. Ingresar credenciales de admin
3. Verificar que inicia sesión

**Qué verificar:**

- ✅ El formulario de login funciona
- ✅ Las credenciales correctas funcionan
- ✅ Las credenciales incorrectas muestran error
- ✅ Redirige al panel después de login

**Qué reportar si falla:**

- Qué credenciales usaste
- Qué error apareció
- Captura de pantalla

---

### Paso 2: Ver Listado de Productos

**Qué hacer:**

1. Ir a `/admin/productos`
2. Ver todos los productos
3. Usar búsqueda y filtros

**Qué verificar:**

- ✅ Los productos se muestran
- ✅ La búsqueda funciona
- ✅ Los filtros funcionan
- ✅ La paginación funciona (si aplica)

**Qué reportar si falla:**

- Qué acción intentaste
- Qué resultado obtuviste
- Captura de pantalla

---

### Paso 3: Crear Producto Nuevo

**Qué hacer:**

1. Clickear "Nuevo Producto"
2. Completar todos los campos obligatorios
3. Subir imágenes (múltiples si es posible)
4. Asignar talles y colores
5. Guardar

**Qué verificar:**

- ✅ Todos los campos funcionan
- ✅ Puedes subir múltiples imágenes
- ✅ Puedes asignar talles
- ✅ Puedes asignar colores
- ✅ El producto se guarda correctamente
- ✅ Aparece en el listado
- ✅ Se muestra en la tienda pública

**Qué reportar si falla:**

- Qué campos completaste
- Qué imágenes subiste
- Qué error apareció
- Captura de pantalla

---

### Paso 4: Editar Producto Existente

**Qué hacer:**

1. Seleccionar un producto del listado
2. Editar nombre, precio, descripción
3. Agregar o eliminar imágenes
4. Modificar talles/colores
5. Guardar cambios

**Qué verificar:**

- ✅ Los cambios se guardan
- ✅ Las imágenes se actualizan
- ✅ Los cambios se reflejan en la tienda pública

**Qué reportar si falla:**

- Qué producto editaste
- Qué cambios intentaste hacer
- Qué error apareció
- Captura de pantalla

---

### Paso 5: Eliminar Producto

**Qué hacer:**

1. Seleccionar un producto
2. Clickear "Eliminar"
3. Confirmar eliminación

**Qué verificar:**

- ✅ El producto se elimina
- ✅ Desaparece del listado
- ✅ Desaparece de la tienda pública

**Qué reportar si falla:**

- Qué producto intentaste eliminar
- Qué error apareció
- Captura de pantalla

---

## ⚠️ 3. FLUJO CON ERRORES INTENCIONALES

### Test 1: No Seleccionar Talle

**Qué hacer:**

1. Ir a un producto
2. NO seleccionar talle
3. Intentar agregar al carrito

**Qué esperar:**

- ✅ Debe aparecer mensaje de error
- ✅ No debe agregarse al carrito
- ✅ El mensaje debe ser claro

**Qué reportar:**

- Si el mensaje no aparece
- Si el mensaje no es claro
- Si se agrega al carrito de todas formas

---

### Test 2: Agregar Producto Agotado

**Qué hacer:**

1. Buscar un producto agotado
2. Intentar agregarlo al carrito

**Qué esperar:**

- ✅ Debe aparecer mensaje de que está agotado
- ✅ No debe agregarse al carrito
- ✅ El botón debe estar deshabilitado o mostrar "Agotado"

**Qué reportar:**

- Si permite agregar productos agotados
- Si el mensaje no es claro

---

### Test 3: Checkout sin Productos

**Qué hacer:**

1. Ir al checkout con carrito vacío

**Qué esperar:**

- ✅ Debe redirigir al carrito
- ✅ O mostrar mensaje de que el carrito está vacío

**Qué reportar:**

- Si permite continuar sin productos
- Si muestra error confuso

---

### Test 4: Código Postal Inválido

**Qué hacer:**

1. Ir a checkout
2. Ingresar código postal inválido (ej: "123")
3. Intentar calcular envío

**Qué esperar:**

- ✅ Debe mostrar error claro
- ✅ No debe calcular envío

**Qué reportar:**

- Si acepta código postal inválido
- Si el mensaje de error no es claro

---

## 📸 4. QUÉ CAPTURAS DE PANTALLA ENVIAR

Cuando encuentres un problema, envía:

1. **Captura de pantalla completa** del error
2. **Captura de la consola del navegador** (F12 → Console)
3. **Captura de la pestaña Network** (si es un error de carga)
4. **Información del dispositivo:**
   - Navegador y versión
   - Sistema operativo
   - Tamaño de pantalla
   - Dispositivo (si es mobile)

---

## 📝 5. FORMATO DE REPORTE

Cuando reportes un problema, usa este formato:

```
**Problema:** [Descripción breve]

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado esperado:**
[Qué debería pasar]

**Resultado actual:**
[Qué pasa realmente]

**Información adicional:**
- Navegador: [Chrome 120]
- Dispositivo: [Desktop / Mobile]
- URL: [URL donde ocurre]
- Capturas: [Adjuntar capturas]
```

---

## ✅ 6. CHECKLIST DE PRUEBAS COMPLETAS

Marca cada item cuando lo pruebes:

### Flujo de Compra

- [ ] Home carga correctamente
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Producto individual carga
- [ ] Selección de talles funciona
- [ ] Selección de colores funciona (si aplica)
- [ ] Agregar al carrito funciona
- [ ] Ver carrito funciona
- [ ] Modificar cantidades funciona
- [ ] Eliminar productos funciona
- [ ] Cálculo de envío funciona
- [ ] Selección de método de envío funciona
- [ ] Checkout funciona
- [ ] Redirección a Mercado Pago funciona

### Flujo Admin

- [ ] Login funciona
- [ ] Listado de productos funciona
- [ ] Crear producto funciona
- [ ] Editar producto funciona
- [ ] Eliminar producto funciona
- [ ] Carga múltiple de imágenes funciona
- [ ] Asignar talles funciona
- [ ] Asignar colores funciona

### Errores y Validaciones

- [ ] Mensaje cuando no se selecciona talle
- [ ] Mensaje cuando producto está agotado
- [ ] Mensaje cuando carrito está vacío
- [ ] Validación de código postal
- [ ] Manejo de errores de red

### Mobile

- [ ] Todo funciona en mobile
- [ ] Botones son suficientemente grandes
- [ ] Formularios son fáciles de usar
- [ ] Imágenes cargan correctamente
- [ ] No hay elementos que se solapen

---

## 🚨 7. PROBLEMAS CRÍTICOS A REPORTAR INMEDIATAMENTE

Si encuentras alguno de estos problemas, repórtalo **INMEDIATAMENTE**:

- ❌ La página no carga
- ❌ No se pueden agregar productos al carrito
- ❌ El checkout no funciona
- ❌ Los precios están incorrectos
- ❌ Se pueden agregar productos agotados
- ❌ El admin no funciona
- ❌ Las imágenes no cargan
- ❌ La página se congela o crashea

---

## 📞 8. CONTACTO

Si tienes dudas o necesitas ayuda:

1. Revisa esta guía primero
2. Consulta con el equipo técnico
3. Documenta todo lo que encuentres

---

## 🎯 OBJETIVO FINAL

El objetivo es asegurar que la tienda funcione perfectamente para usuarios reales. Cada problema que encuentres y reportes ayuda a mejorar la experiencia de todos.

**¡Gracias por tu ayuda!** 🙏

---

**Última actualización:** ${new Date().toLocaleString('es-AR')}
