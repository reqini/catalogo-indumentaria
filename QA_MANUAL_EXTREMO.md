# 📋 QA Manual Extremo - Catálogo Indumentaria

**Versión:** 1.0.0  
**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Estado del Sistema:** READY FOR PRODUCTION  
**Commit Base:** b52e62c

---

## 📊 Tabla Resumen de Casos Principales

| Caso                       | ID            | Estado    | Observaciones                                               |
| -------------------------- | ------------- | --------- | ----------------------------------------------------------- |
| Compra con envío estándar  | TC-COMPRA-001 | Pendiente | Verificar cálculo de envío y redirección a Mercado Pago     |
| Compra con retiro en local | TC-COMPRA-002 | Pendiente | **FUNCIONALIDAD NO IMPLEMENTADA** - Documentado para futuro |
| Compra rechazada           | TC-COMPRA-003 | Pendiente | Verificar mensaje de error y persistencia de carrito        |
| Producto sin stock         | TC-STOCK-001  | Pendiente | Verificar que no aparece en catálogo y no permite agregar   |
| Borrar producto            | TC-ADMIN-001  | Pendiente | Verificar eliminación y actualización de catálogo           |
| Editar producto            | TC-ADMIN-002  | Pendiente | Verificar cambios reflejados en catálogo y carrito          |
| Banner activo/inactivo     | TC-BANNER-001 | Pendiente | Verificar visibilidad en Home según estado                  |
| Checkout desde mobile      | TC-MOBILE-001 | Pendiente | Verificar UI responsive y funcionalidad completa            |

---

## 🎯 Índice de Casos de Prueba

### Módulo: Compra y Checkout

- [TC-COMPRA-001](#tc-compra-001-compra-con-envío-estándar) - Compra con envío estándar
- [TC-COMPRA-002](#tc-compra-002-compra-con-retiro-en-local) - Compra con retiro en local (NO IMPLEMENTADO)
- [TC-COMPRA-003](#tc-compra-003-compra-rechazada) - Compra rechazada
- [TC-COMPRA-004](#tc-compra-004-compra-con-múltiples-productos) - Compra con múltiples productos
- [TC-COMPRA-005](#tc-compra-005-compra-con-producto-en-descuento) - Compra con producto en descuento
- [TC-COMPRA-006](#tc-compra-006-cambio-de-tipo-de-envío) - Cambio de tipo de envío durante checkout

### Módulo: Stock y Disponibilidad

- [TC-STOCK-001](#tc-stock-001-producto-sin-stock) - Producto sin stock
- [TC-STOCK-002](#tc-stock-002-stock-insuficiente) - Stock insuficiente para cantidad solicitada
- [TC-STOCK-003](#tc-stock-003-producto-desactivado) - Producto desactivado

### Módulo: Administración

- [TC-ADMIN-001](#tc-admin-001-borrar-producto) - Borrar producto
- [TC-ADMIN-002](#tc-admin-002-editar-producto) - Editar producto
- [TC-ADMIN-003](#tc-admin-003-crear-producto) - Crear nuevo producto
- [TC-ADMIN-004](#tc-admin-004-duplicar-producto) - Duplicar producto
- [TC-ADMIN-005](#tc-admin-005-actualizar-stock) - Actualizar stock de producto

### Módulo: Banners

- [TC-BANNER-001](#tc-banner-001-banner-activoinactivo) - Banner activo/inactivo
- [TC-BANNER-002](#tc-banner-002-crear-banner) - Crear nuevo banner
- [TC-BANNER-003](#tc-banner-003-múltiples-banners-activos) - Múltiples banners activos

### Módulo: Carrito

- [TC-CARRITO-001](#tc-carrito-001-agregar-producto-al-carrito) - Agregar producto al carrito
- [TC-CARRITO-002](#tc-carrito-002-modificar-cantidad-en-carrito) - Modificar cantidad en carrito
- [TC-CARRITO-003](#tc-carrito-003-eliminar-producto-del-carrito) - Eliminar producto del carrito
- [TC-CARRITO-004](#tc-carrito-004-carrito-persistente) - Carrito persistente (localStorage)

### Módulo: Catálogo y Navegación

- [TC-CATALOGO-001](#tc-catalogo-001-navegar-catálogo) - Navegar catálogo
- [TC-CATALOGO-002](#tc-catalogo-002-filtrar-por-categoría) - Filtrar por categoría
- [TC-CATALOGO-003](#tc-catalogo-003-buscar-producto) - Buscar producto
- [TC-CATALOGO-004](#tc-catalogo-004-ver-detalle-de-producto) - Ver detalle de producto

### Módulo: Home

- [TC-HOME-001](#tc-home-001-carga-de-productos-destacados) - Carga de productos destacados
- [TC-HOME-002](#tc-home-002-carrusel-de-banners) - Carrusel de banners
- [TC-HOME-003](#tc-home-003-sección-nuevos-ingresos) - Sección nuevos ingresos

### Módulo: Mobile

- [TC-MOBILE-001](#tc-mobile-001-checkout-desde-mobile) - Checkout desde mobile
- Ver también: [QA_MOBILE_CHECKLIST.md](./QA_MOBILE_CHECKLIST.md)

---

## 📝 CASOS DE PRUEBA DETALLADOS

---

### TC-COMPRA-001: Compra con envío estándar

**Módulo:** Compra y Checkout  
**Prioridad:** Alta  
**Tipo:** Funcional E2E

#### Precondiciones

- Usuario navegando en el sitio
- Al menos un producto disponible con stock > 0
- Mercado Pago configurado correctamente
- Variables de entorno `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` configuradas

#### Datos de Prueba

- **Producto:** Cualquier producto activo con stock disponible
- **Talle:** Talle disponible del producto seleccionado
- **Cantidad:** 1
- **Código postal:** B8000 (Buenos Aires) o cualquier código válido
- **Tipo de envío:** OCA Estándar, Correo Argentino, Andreani Estándar, o Mercado Envíos

#### Pasos Detallados

1. **Navegar al catálogo**
   - Ir a `/catalogo`
   - Verificar que se cargan productos correctamente

2. **Seleccionar producto**
   - Hacer clic en un producto disponible
   - Verificar que se abre la página de detalle (`/producto/[id]`)

3. **Agregar al carrito**
   - Seleccionar un talle disponible
   - Hacer clic en botón "Agregar al carrito"
   - Verificar mensaje de éxito: "Producto agregado al carrito"
   - Verificar que el ícono del carrito muestra la cantidad actualizada

4. **Ir al carrito**
   - Hacer clic en el ícono del carrito o navegar a `/carrito`
   - Verificar que el producto aparece en el carrito con:
     - Nombre correcto
     - Talle seleccionado
     - Cantidad: 1
     - Precio correcto (con descuento aplicado si corresponde)

5. **Calcular envío**
   - En la sección "Cálculo de Envío"
   - Ingresar código postal válido (ej: B8000)
   - Hacer clic en botón "Calcular"
   - Verificar que aparecen métodos de envío disponibles
   - Verificar que se muestran:
     - Nombre del método (ej: "OCA Estándar")
     - Precio del envío
     - Demora estimada (ej: "3-5 días hábiles")

6. **Seleccionar envío estándar**
   - Hacer clic en un método de envío estándar (ej: "OCA Estándar")
   - Verificar que el método se marca como seleccionado
   - Verificar mensaje: "Envío seleccionado: [nombre]"
   - Verificar que el total se actualiza mostrando:
     - Subtotal: precio del producto
     - Envío: precio del método seleccionado
     - **Total:** subtotal + envío

7. **Iniciar checkout**
   - Hacer clic en botón "Finalizar compra" o "Pagar con Mercado Pago"
   - Verificar que el botón muestra estado de carga ("Procesando...")
   - Verificar validación de stock antes de redirigir

8. **Redirección a Mercado Pago**
   - Verificar que se redirige a `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...`
   - Verificar que la URL contiene `pref_id` válido
   - Verificar que los items incluyen:
     - Producto con nombre, cantidad y precio correctos
     - Item de envío con nombre "Envío - [método]" y precio correcto

9. **Completar pago en Mercado Pago**
   - En la página de Mercado Pago (sandbox o producción)
   - Completar datos de pago de prueba
   - Confirmar pago

10. **Verificar confirmación**
    - Verificar redirección a `/pago/success?payment_id=...`
    - Verificar que se muestra:
      - Mensaje: "¡Pago Exitoso!"
      - Mensaje: "Tu pago fue procesado correctamente"
      - ID de pago visible
      - Botones: "Seguir Comprando" y "Volver al Inicio"
    - Verificar que el carrito se vació automáticamente
    - Verificar que el ícono del carrito muestra cantidad 0

11. **Verificar registro de orden**
    - Verificar en logs del servidor que se creó registro de compra
    - Verificar que el stock se actualizó correctamente
    - Verificar que se registró el método de envío y costo

#### Resultado Esperado

- Compra completada exitosamente
- Carrito vaciado automáticamente
- Orden registrada en base de datos
- Stock actualizado correctamente
- Usuario redirigido a página de éxito

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

#### Observaciones

- El sistema redirige directamente a Mercado Pago sin página intermedia de datos del comprador
- Los datos del comprador se completan en Mercado Pago
- El carrito se limpia automáticamente en `/pago/success` mediante `clearCart()`

---

### TC-COMPRA-002: Compra con retiro en local

**Módulo:** Compra y Checkout  
**Prioridad:** Media  
**Tipo:** Funcional E2E

#### Precondiciones

- **IMPORTANTE:** Esta funcionalidad **NO ESTÁ IMPLEMENTADA** en el código actual
- El sistema actual solo soporta envíos con costo
- Documentado para implementación futura

#### Datos de Prueba

- **Producto:** Cualquier producto disponible
- **Tipo de retiro:** Retiro en local / sucursal

#### Pasos Detallados (Para implementación futura)

1. Agregar producto al carrito
2. Ir a `/carrito`
3. En sección de envío, seleccionar opción "Retiro en local"
4. Verificar que el costo de envío es $0 o el costo configurado para retiro
5. Verificar que el total se ajusta correctamente
6. Completar checkout
7. Verificar que en la confirmación aparece mensaje: "Retira en local" o similar
8. Verificar que se registra método de retiro en la orden

#### Resultado Esperado

- Opción de retiro en local disponible
- Costo de envío = $0 o costo configurado
- Mensaje de confirmación indica retiro en local
- Orden registrada con método de retiro

#### Resultado Actual

**FUNCIONALIDAD NO IMPLEMENTADA**

#### Estado

**Pendiente - Requiere desarrollo**

#### Observaciones

- **Recomendación:** Implementar opción de retiro en local en `ShippingCalculator`
- Agregar método de envío con `nombre: "Retiro en local"` y `precio: 0`
- Actualizar mensajes de confirmación para indicar método de retiro

---

### TC-COMPRA-003: Compra rechazada

**Módulo:** Compra y Checkout  
**Prioridad:** Alta  
**Tipo:** Funcional E2E / Manejo de Errores

#### Precondiciones

- Usuario con productos en carrito
- Mercado Pago configurado
- Acceso a simular rechazo de pago (sandbox o producción)

#### Datos de Prueba

- **Producto:** Cualquier producto disponible
- **Método de pago:** Tarjeta de prueba que será rechazada
- **Código postal:** B8000
- **Tipo de envío:** Cualquier método disponible

#### Pasos Detallados

1. **Preparar compra**
   - Agregar producto al carrito
   - Ir a `/carrito`
   - Calcular y seleccionar envío
   - Anotar productos y cantidades en carrito

2. **Iniciar checkout**
   - Hacer clic en "Finalizar compra"
   - Verificar redirección a Mercado Pago

3. **Simular rechazo de pago**
   - En Mercado Pago, usar tarjeta de prueba rechazada:
     - **Sandbox:** Tarjeta que retorna estado "rejected"
     - **Producción:** Tarjeta real rechazada por el banco
   - Completar datos y confirmar pago rechazado

4. **Verificar redirección a fallo**
   - Verificar que se redirige a `/pago/failure`
   - Verificar que NO se redirige a `/pago/success`

5. **Verificar página de fallo**
   - Verificar que se muestra:
     - Icono de error (XCircle rojo)
     - Título: "Pago No Procesado"
     - Mensaje explicativo claro
     - Lista de posibles causas:
       - Fondos insuficientes
       - Tarjeta rechazada por el banco
       - Datos de tarjeta incorrectos
       - Límite de compra excedido
     - Botones: "Reintentar Pago" y "Ver Catálogo"

6. **Verificar persistencia de carrito**
   - Hacer clic en "Reintentar Pago"
   - Verificar redirección a `/carrito`
   - **CRÍTICO:** Verificar que el carrito NO se vació
   - Verificar que los productos siguen en el carrito:
     - Mismos productos
     - Mismas cantidades
     - Mismo talle seleccionado
   - Verificar que el envío seleccionado se mantiene (si aplica)

7. **Verificar que no se creó orden pagada**
   - Verificar en logs que NO se creó registro de compra con estado "aprobado"
   - Verificar que el stock NO se actualizó
   - Verificar que NO se envió email de confirmación

8. **Probar reintento**
   - Desde `/carrito`, intentar checkout nuevamente
   - Verificar que funciona normalmente
   - Opcional: Completar con pago exitoso para verificar flujo completo

#### Resultado Esperado

- Redirección a `/pago/failure` con mensaje claro
- Carrito NO se vacía automáticamente
- Orden NO queda marcada como pagada
- Stock NO se actualiza
- Usuario puede reintentar el pago
- Mensajes de error son claros y útiles

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

#### Observaciones

- El carrito se limpia solo en `/pago/success`, no en `/pago/failure`
- La página de fallo incluye botón para reintentar
- No hay página intermedia de datos del comprador (se completa en Mercado Pago)

---

### TC-COMPRA-004: Compra con múltiples productos

**Módulo:** Compra y Checkout  
**Prioridad:** Alta  
**Tipo:** Funcional E2E

#### Precondiciones

- Múltiples productos disponibles con stock
- Usuario navegando en el sitio

#### Datos de Prueba

- **Producto 1:** Remera Básica, Talle M, Cantidad: 2
- **Producto 2:** Pantalón Training, Talle L, Cantidad: 1
- **Código postal:** B8000
- **Tipo de envío:** OCA Estándar

#### Pasos Detallados

1. Agregar primer producto al carrito (Remera, Talle M, Cantidad: 1)
2. Agregar segundo producto al carrito (Pantalón, Talle L, Cantidad: 1)
3. Volver al primer producto y agregar una unidad más (Remera, Talle M, Cantidad: 1 adicional)
4. Ir a `/carrito`
5. Verificar que aparecen ambos productos:
   - Remera Básica, Talle M, Cantidad: 2
   - Pantalón Training, Talle L, Cantidad: 1
6. Verificar subtotal correcto (suma de ambos productos)
7. Calcular envío con código postal B8000
8. Seleccionar método de envío
9. Verificar total correcto: subtotal + envío
10. Completar checkout
11. Verificar que todos los items aparecen en Mercado Pago
12. Completar pago
13. Verificar confirmación con todos los productos
14. Verificar que stock se actualizó para ambos productos

#### Resultado Esperado

- Carrito muestra múltiples productos correctamente
- Subtotal calculado correctamente
- Total con envío correcto
- Todos los productos incluidos en preferencia de Mercado Pago
- Stock actualizado para todos los productos

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-COMPRA-005: Compra con producto en descuento

**Módulo:** Compra y Checkout  
**Prioridad:** Media  
**Tipo:** Funcional

#### Precondiciones

- Producto con descuento configurado (campo `descuento > 0`)

#### Datos de Prueba

- **Producto:** Con descuento del 20%
- **Precio original:** $10.000
- **Precio con descuento:** $8.000

#### Pasos Detallados

1. Navegar a producto con descuento
2. Verificar que se muestra:
   - Precio original tachado
   - Precio con descuento destacado
   - Badge "X% OFF"
3. Agregar al carrito
4. Ir a `/carrito`
5. Verificar que se muestra precio con descuento aplicado
6. Verificar que el subtotal usa precio con descuento
7. Completar checkout
8. Verificar que en Mercado Pago aparece precio con descuento
9. Completar pago
10. Verificar confirmación

#### Resultado Esperado

- Descuento aplicado correctamente en todo el flujo
- Precio final refleja descuento
- Badge de descuento visible en UI

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-COMPRA-006: Cambio de tipo de envío durante checkout

**Módulo:** Compra y Checkout  
**Prioridad:** Media  
**Tipo:** Funcional / UX

#### Precondiciones

- Productos en carrito
- Múltiples métodos de envío disponibles

#### Datos de Prueba

- **Código postal:** B8000
- **Método inicial:** OCA Estándar
- **Método alternativo:** OCA Express

#### Pasos Detallados

1. Agregar producto al carrito
2. Ir a `/carrito`
3. Calcular envío con código postal B8000
4. Seleccionar primer método (ej: OCA Estándar)
5. Anotar total inicial
6. Seleccionar segundo método (ej: OCA Express)
7. Verificar que:
   - El método anterior se deselecciona
   - El nuevo método se selecciona
   - El total se actualiza correctamente
   - El mensaje muestra el nuevo método seleccionado
8. Volver a seleccionar el primer método
9. Verificar que el total vuelve al valor inicial
10. Completar checkout con método final seleccionado
11. Verificar que el método correcto aparece en Mercado Pago

#### Resultado Esperado

- Cambio de método de envío funciona correctamente
- Total se actualiza dinámicamente
- Solo un método seleccionado a la vez
- Método correcto incluido en preferencia de pago

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-STOCK-001: Producto sin stock

**Módulo:** Stock y Disponibilidad  
**Prioridad:** Alta  
**Tipo:** Funcional / Validación

#### Precondiciones

- Producto con stock = 0 en todos los talles
- O producto con campo `activo = false`

#### Datos de Prueba

- **Producto sin stock:** ID conocido, stock = 0
- **Producto desactivado:** ID conocido, activo = false

#### Pasos Detallados

**Caso A: Producto con stock = 0**

1. Navegar a `/catalogo`
2. Verificar que el producto **NO aparece** en el listado
3. Si se filtra por categoría del producto, verificar que tampoco aparece
4. Intentar acceder directamente a `/producto/[id-producto-sin-stock]`
5. Verificar comportamiento:
   - Opción A: Redirección a `/catalogo` con mensaje
   - Opción B: Página muestra mensaje "Producto no disponible" o "Sin stock"
   - Opción C: Página muestra producto pero con badge "Agotado" y botón deshabilitado
6. Si el producto se muestra, verificar que:
   - No permite seleccionar talle (o todos muestran "Agotado")
   - Botón "Agregar al carrito" está deshabilitado
   - Mensaje claro indica falta de stock

**Caso B: Producto desactivado**

1. Navegar a `/catalogo`
2. Verificar que el producto **NO aparece** en el listado
3. Intentar acceder directamente a `/producto/[id-producto-desactivado]`
4. Verificar redirección a `/catalogo` o mensaje de producto no disponible

**Caso C: Producto con stock parcial**

1. Producto con algunos talles con stock y otros sin stock
2. Verificar que aparece en catálogo
3. Al abrir detalle, verificar que:
   - Talles con stock están disponibles
   - Talles sin stock muestran "Agotado" o están deshabilitados
   - Solo permite agregar al carrito con talles disponibles

#### Resultado Esperado

- Productos sin stock no aparecen en catálogo público
- Acceso directo muestra mensaje adecuado o redirección
- No permite agregar productos sin stock al carrito
- Mensajes claros sobre disponibilidad

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

#### Observaciones

- El sistema filtra productos activos en la API: `filters.activo = activo !== false`
- Productos con `activo = false` no deberían aparecer en catálogo público

---

### TC-STOCK-002: Stock insuficiente para cantidad solicitada

**Módulo:** Stock y Disponibilidad  
**Prioridad:** Alta  
**Tipo:** Validación

#### Precondiciones

- Producto con stock limitado (ej: stock = 2)
- Usuario intentando agregar más unidades de las disponibles

#### Datos de Prueba

- **Producto:** Stock disponible = 2 unidades
- **Cantidad solicitada:** 3 unidades

#### Pasos Detallados

**Caso A: Agregar al carrito desde detalle**

1. Ir a producto con stock = 2
2. Seleccionar talle disponible
3. Intentar agregar 3 unidades al carrito
4. Verificar que se muestra mensaje de error:
   - "Stock insuficiente. Disponible: 2, Solicitado: 3"
5. Verificar que NO se agrega al carrito

**Caso B: Modificar cantidad en carrito**

1. Agregar producto con stock = 2 al carrito (cantidad: 1)
2. Ir a `/carrito`
3. Intentar aumentar cantidad a 3
4. Verificar que:
   - No permite aumentar más allá del stock disponible
   - Muestra mensaje de error
   - La cantidad se mantiene en el máximo disponible

**Caso C: Checkout con stock insuficiente**

1. Agregar producto al carrito (cantidad válida)
2. Mientras está en carrito, otro usuario compra y agota el stock
3. Intentar hacer checkout
4. Verificar que:
   - Se valida stock antes de redirigir a Mercado Pago
   - Muestra mensaje: "Stock insuficiente para [producto] (Talle [X]). Disponible: [Y], Solicitado: [Z]"
   - NO redirige a Mercado Pago
   - Carrito se mantiene

#### Resultado Esperado

- Validación de stock en múltiples puntos
- Mensajes de error claros
- No permite agregar más unidades de las disponibles
- Validación antes de checkout

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-STOCK-003: Producto desactivado

**Módulo:** Stock y Disponibilidad  
**Prioridad:** Media  
**Tipo:** Validación

#### Precondiciones

- Producto con campo `activo = false` en base de datos

#### Pasos Detallados

1. Navegar a `/catalogo`
2. Verificar que el producto NO aparece en listado
3. Intentar acceder a `/producto/[id-producto-desactivado]`
4. Verificar redirección o mensaje de error
5. Verificar que no aparece en búsquedas
6. Verificar que no aparece en filtros por categoría

#### Resultado Esperado

- Producto desactivado invisible para usuarios públicos
- Acceso directo bloqueado o redirigido

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-ADMIN-001: Borrar producto

**Módulo:** Administración  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador
- Acceso a `/admin/productos`
- Producto existente para eliminar

#### Datos de Prueba

- **Producto a eliminar:** Producto de prueba sin ventas asociadas
- **Producto con ventas:** Producto con compras históricas (si aplica)

#### Pasos Detallados

**Caso A: Eliminar producto sin ventas**

1. Iniciar sesión como administrador
2. Ir a `/admin/productos`
3. Buscar producto de prueba
4. Hacer clic en botón "Eliminar" o icono de basura
5. Confirmar eliminación en diálogo
6. Verificar mensaje de éxito: "Producto eliminado correctamente"
7. Verificar que el producto desaparece de la lista
8. Refrescar página y verificar que sigue eliminado
9. Navegar a `/catalogo` (como usuario público)
10. Verificar que el producto NO aparece en catálogo
11. Intentar acceder a `/producto/[id-producto-eliminado]`
12. Verificar redirección a `/catalogo` o mensaje de error

**Caso B: Intentar eliminar producto con ventas**

1. Buscar producto que tiene compras registradas
2. Intentar eliminar
3. Verificar comportamiento:
   - Opción A: Permite eliminar pero marca como "eliminado" (soft delete)
   - Opción B: Bloquea eliminación con mensaje explicativo
   - Opción C: Permite eliminar pero mantiene registro histórico
4. Verificar que las compras históricas siguen siendo accesibles

**Caso C: Eliminar producto en carrito de usuario**

1. Agregar producto al carrito (como usuario público)
2. En otra sesión (admin), eliminar el producto
3. Volver a sesión de usuario público
4. Ir a `/carrito`
5. Verificar comportamiento:
   - Opción A: Producto desaparece del carrito automáticamente
   - Opción B: Producto aparece pero con mensaje "No disponible"
   - Opción C: Error al intentar checkout

#### Resultado Esperado

- Eliminación funciona correctamente
- Producto desaparece de catálogo público
- No se rompen listados ni navegación
- Manejo adecuado de productos con ventas históricas

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

#### Observaciones

- Verificar si el sistema usa soft delete o hard delete
- Considerar impacto en carritos activos de usuarios

---

### TC-ADMIN-002: Editar producto

**Módulo:** Administración  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador
- Producto existente para editar

#### Datos de Prueba

- **Producto:** Cualquier producto existente
- **Cambios a realizar:**
  - Nombre: "Remera Básica" → "Remera Básica Premium"
  - Precio: $10.000 → $12.000
  - Descuento: 0% → 15%
  - Imagen: Cambiar URL de imagen
  - Categoría: Cambiar categoría
  - Stock: Modificar stock de talles

#### Pasos Detallados

1. **Iniciar edición**
   - Ir a `/admin/productos`
   - Buscar producto a editar
   - Hacer clic en botón "Editar"
   - Verificar que se abre formulario con datos actuales

2. **Modificar nombre**
   - Cambiar nombre del producto
   - Guardar cambios
   - Verificar mensaje de éxito
   - Ir a `/catalogo`
   - Verificar que el producto aparece con nuevo nombre
   - Verificar que el detalle muestra nuevo nombre

3. **Modificar precio**
   - Editar producto nuevamente
   - Cambiar precio
   - Guardar cambios
   - Verificar en catálogo que precio se actualizó
   - Verificar en detalle que precio se actualizó

4. **Modificar descuento**
   - Editar producto
   - Agregar/modificar descuento
   - Guardar cambios
   - Verificar en catálogo que se muestra badge de descuento
   - Verificar que precio con descuento es correcto

5. **Modificar imagen**
   - Editar producto
   - Cambiar URL de `imagenPrincipal`
   - Guardar cambios
   - Verificar en catálogo que imagen se actualizó
   - Verificar en detalle que imagen se actualizó
   - Verificar que no hay errores de carga de imagen

6. **Modificar categoría**
   - Editar producto
   - Cambiar categoría
   - Guardar cambios
   - Filtrar catálogo por nueva categoría
   - Verificar que producto aparece en nueva categoría
   - Filtrar por categoría anterior
   - Verificar que producto NO aparece en categoría anterior

7. **Modificar stock**
   - Editar producto
   - Modificar stock de talles
   - Guardar cambios
   - Ir a detalle del producto
   - Verificar que talles con stock están disponibles
   - Verificar que talles sin stock muestran "Agotado"

8. **Verificar producto en carrito**
   - Si producto estaba en carrito antes de editar:
     - Verificar comportamiento:
       - Opción A: Carrito mantiene datos antiguos hasta checkout
       - Opción B: Carrito se actualiza automáticamente
       - Opción C: Error al intentar checkout con datos desactualizados
   - Documentar comportamiento observado

#### Resultado Esperado

- Cambios se guardan correctamente
- Catálogo se actualiza automáticamente
- Imágenes se cargan correctamente
- Categorías se actualizan correctamente
- Stock se refleja correctamente
- Comportamiento con carrito documentado

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

#### Observaciones

- El sistema usa `updateProduct` de la API
- Verificar si hay cache que requiere invalidación
- Documentar comportamiento del carrito con productos editados

---

### TC-ADMIN-003: Crear nuevo producto

**Módulo:** Administración  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador
- Acceso a `/admin/productos`

#### Datos de Prueba

- **Nombre:** "Producto QA Test"
- **Descripción:** "Producto creado para pruebas de QA"
- **Precio:** $15.000
- **Descuento:** 10%
- **Categoría:** "Running"
- **Color:** "Negro"
- **Talles:** S, M, L
- **Stock:** S: 5, M: 10, L: 8
- **Imagen:** URL válida de Supabase Storage o imagen de prueba

#### Pasos Detallados

1. **Abrir formulario de creación**
   - Ir a `/admin/productos`
   - Hacer clic en botón "Nuevo Producto" o "+"
   - Verificar que se abre formulario vacío

2. **Completar datos básicos**
   - Ingresar nombre: "Producto QA Test"
   - Ingresar descripción
   - Ingresar precio: 15000
   - Ingresar descuento: 10
   - Seleccionar categoría: "Running"
   - Ingresar color: "Negro"

3. **Configurar talles y stock**
   - Agregar talle "S"
   - Configurar stock para S: 5
   - Agregar talle "M"
   - Configurar stock para M: 10
   - Agregar talle "L"
   - Configurar stock para L: 8

4. **Agregar imagen**
   - Ingresar URL de imagen válida
   - Verificar preview de imagen (si aplica)

5. **Guardar producto**
   - Hacer clic en "Guardar" o "Crear"
   - Verificar mensaje de éxito: "Producto creado exitosamente"
   - Verificar que formulario se cierra
   - Verificar que producto aparece en lista de admin

6. **Verificar en catálogo público**
   - Navegar a `/catalogo`
   - Verificar que producto aparece en listado
   - Verificar que se muestra con:
     - Nombre correcto
     - Precio correcto ($13.500 con descuento aplicado)
     - Badge de descuento "10% OFF"
     - Imagen correcta

7. **Verificar detalle de producto**
   - Hacer clic en producto
   - Verificar página de detalle (`/producto/[id]`)
   - Verificar que muestra:
     - Todos los datos ingresados
     - Talles disponibles (S, M, L)
     - Stock correcto por talle
     - Precio con descuento aplicado

8. **Verificar filtros**
   - Filtrar por categoría "Running"
   - Verificar que producto aparece
   - Buscar por nombre "Producto QA Test"
   - Verificar que aparece en resultados

9. **Limpiar datos de prueba**
   - Volver a admin
   - Eliminar producto de prueba creado

#### Resultado Esperado

- Producto creado exitosamente
- Aparece inmediatamente en catálogo público
- Todos los datos se guardan correctamente
- Imagen se carga correctamente
- Filtros funcionan correctamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-ADMIN-004: Duplicar producto

**Módulo:** Administración  
**Prioridad:** Baja  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador
- Producto existente

#### Pasos Detallados

1. Ir a `/admin/productos`
2. Buscar producto a duplicar
3. Hacer clic en botón "Duplicar" (si existe)
4. Confirmar duplicación
5. Verificar que se crea nuevo producto con nombre "[Nombre] (Copia)"
6. Verificar que todos los datos se copiaron excepto:
   - ID
   - Fechas de creación/actualización
7. Editar producto duplicado y cambiar nombre
8. Verificar que ambos productos existen independientemente

#### Resultado Esperado

- Duplicación funciona correctamente
- Nuevo producto independiente creado
- Datos copiados correctamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-ADMIN-005: Actualizar stock de producto

**Módulo:** Administración  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Producto existente con stock

#### Pasos Detallados

1. Ir a `/admin/productos`
2. Editar producto
3. Modificar stock de talles:
   - Reducir stock de un talle
   - Aumentar stock de otro talle
   - Agregar nuevo talle con stock
4. Guardar cambios
5. Verificar en catálogo que cambios se reflejan
6. Verificar en detalle que stock actualizado es correcto
7. Intentar agregar más unidades de las disponibles
8. Verificar que valida correctamente

#### Resultado Esperado

- Stock se actualiza correctamente
- Cambios se reflejan inmediatamente
- Validaciones funcionan correctamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-BANNER-001: Banner activo/inactivo

**Módulo:** Banners  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador
- Acceso a `/admin/banners`

#### Datos de Prueba

- **Banner de prueba:** Con imagen válida
- **Estado inicial:** Activo
- **Estado a cambiar:** Inactivo

#### Pasos Detallados

1. **Crear banner activo**
   - Ir a `/admin/banners`
   - Crear nuevo banner con:
     - Título: "Banner QA Test"
     - Imagen: URL válida
     - Link: `/catalogo`
     - Estado: Activo
   - Guardar banner

2. **Verificar banner en Home**
   - Navegar a `/` (Home)
   - Verificar que banner aparece en carousel
   - Verificar que imagen se carga correctamente
   - Verificar que es clickeable y redirige correctamente

3. **Desactivar banner**
   - Volver a `/admin/banners`
   - Buscar banner creado
   - Hacer clic en toggle de activación o botón "Desactivar"
   - Verificar mensaje: "Banner desactivado"
   - Verificar que estado cambia a inactivo en la lista

4. **Verificar que desaparece de Home**
   - Navegar a `/` (Home)
   - Refrescar página si es necesario
   - Verificar que banner NO aparece en carousel
   - Verificar que otros banners activos siguen apareciendo

5. **Reactivar banner**
   - Volver a admin
   - Activar banner nuevamente
   - Verificar mensaje: "Banner activado"
   - Verificar en Home que vuelve a aparecer

6. **Limpiar datos de prueba**
   - Eliminar banner de prueba creado

#### Resultado Esperado

- Banner activo aparece en Home
- Banner inactivo NO aparece en Home
- Cambio de estado funciona correctamente
- Carousel se actualiza automáticamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-BANNER-002: Crear nuevo banner

**Módulo:** Banners  
**Prioridad:** Media  
**Tipo:** Funcional

#### Precondiciones

- Usuario autenticado como administrador

#### Datos de Prueba

- **Título:** "Nueva Colección 2025"
- **Imagen:** URL válida de Supabase Storage
- **Link:** `/catalogo?destacado=true`
- **Orden:** 1
- **Estado:** Activo

#### Pasos Detallados

1. Ir a `/admin/banners`
2. Hacer clic en "Nuevo Banner"
3. Completar formulario:
   - Título
   - URL de imagen
   - Link de destino
   - Orden (opcional)
   - Estado: Activo
4. Guardar banner
5. Verificar mensaje de éxito
6. Verificar que aparece en lista de admin
7. Verificar en Home que aparece en carousel
8. Verificar que imagen se carga correctamente
9. Verificar que link funciona correctamente

#### Resultado Esperado

- Banner creado exitosamente
- Aparece en Home inmediatamente
- Imagen y link funcionan correctamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-BANNER-003: Múltiples banners activos

**Módulo:** Banners  
**Prioridad:** Media  
**Tipo:** Funcional / UX

#### Precondiciones

- Múltiples banners creados y activos

#### Pasos Detallados

1. Crear 3 banners activos con diferentes imágenes
2. Configurar orden: 1, 2, 3
3. Ir a Home (`/`)
4. Verificar que carousel muestra los 3 banners
5. Verificar que rotación automática funciona (cada 5 segundos según código)
6. Verificar navegación manual:
   - Botones de flecha izquierda/derecha
   - Indicadores de posición
7. Verificar que al hacer hover se pausa la rotación
8. Verificar que cada banner redirige correctamente

#### Resultado Esperado

- Múltiples banners se muestran correctamente
- Rotación automática funciona
- Navegación manual funciona
- Pausa en hover funciona

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CARRITO-001: Agregar producto al carrito

**Módulo:** Carrito  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Producto disponible con stock

#### Pasos Detallados

1. Navegar a producto
2. Seleccionar talle disponible
3. Hacer clic en "Agregar al carrito"
4. Verificar mensaje de éxito
5. Verificar que ícono de carrito muestra cantidad actualizada
6. Ir a `/carrito`
7. Verificar que producto aparece con:
   - Nombre correcto
   - Talle seleccionado
   - Cantidad: 1
   - Precio correcto
   - Imagen correcta

#### Resultado Esperado

- Producto agregado correctamente
- Carrito se actualiza inmediatamente
- Datos correctos en carrito

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CARRITO-002: Modificar cantidad en carrito

**Módulo:** Carrito  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Producto en carrito

#### Pasos Detallados

1. Ir a `/carrito`
2. Encontrar producto en carrito
3. Hacer clic en botón "+" para aumentar cantidad
4. Verificar que cantidad aumenta
5. Verificar que subtotal se actualiza
6. Hacer clic en botón "-" para disminuir cantidad
7. Verificar que cantidad disminuye
8. Verificar que subtotal se actualiza
9. Intentar disminuir a 0
10. Verificar que producto se elimina del carrito

#### Resultado Esperado

- Modificación de cantidad funciona correctamente
- Subtotal se actualiza dinámicamente
- Validación de stock funciona
- Eliminación al llegar a 0 funciona

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CARRITO-003: Eliminar producto del carrito

**Módulo:** Carrito  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Precondiciones

- Producto en carrito

#### Pasos Detallados

1. Ir a `/carrito`
2. Hacer clic en icono de basura del producto
3. Verificar que producto desaparece del carrito
4. Verificar que subtotal se actualiza
5. Verificar que si era el último producto, carrito muestra mensaje "Carrito vacío"
6. Verificar que ícono de carrito muestra cantidad 0

#### Resultado Esperado

- Eliminación funciona correctamente
- Carrito se actualiza inmediatamente
- Mensajes apropiados cuando está vacío

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CARRITO-004: Carrito persistente

**Módulo:** Carrito  
**Prioridad:** Alta  
**Tipo:** Funcional / Persistencia

#### Precondiciones

- Productos agregados al carrito

#### Pasos Detallados

1. Agregar productos al carrito
2. Cerrar navegador completamente
3. Abrir navegador nuevamente
4. Navegar al sitio
5. Ir a `/carrito`
6. Verificar que productos siguen en carrito
7. Verificar que cantidades se mantienen
8. Verificar que talles se mantienen
9. Probar en modo incógnito (no debería persistir)
10. Probar limpiar localStorage manualmente (carrito debería vaciarse)

#### Resultado Esperado

- Carrito persiste entre sesiones
- Datos se mantienen correctamente
- Funciona con localStorage

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CATALOGO-001: Navegar catálogo

**Módulo:** Catálogo y Navegación  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Pasos Detallados

1. Navegar a `/catalogo`
2. Verificar que se cargan productos
3. Verificar paginación (si aplica)
4. Verificar scroll infinito o botones de página
5. Verificar que productos se muestran con:
   - Imagen
   - Nombre
   - Precio
   - Badge de descuento (si aplica)
6. Hacer clic en producto
7. Verificar redirección a `/producto/[id]`

#### Resultado Esperado

- Catálogo carga correctamente
- Navegación funciona
- Productos se muestran correctamente

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CATALOGO-002: Filtrar por categoría

**Módulo:** Catálogo y Navegación  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Pasos Detallados

1. Ir a `/catalogo`
2. Verificar filtros disponibles
3. Seleccionar categoría (ej: "Running")
4. Verificar que solo aparecen productos de esa categoría
5. Seleccionar otra categoría
6. Verificar que productos cambian
7. Limpiar filtro
8. Verificar que aparecen todos los productos

#### Resultado Esperado

- Filtros funcionan correctamente
- Productos se filtran correctamente
- Limpiar filtro funciona

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CATALOGO-003: Buscar producto

**Módulo:** Catálogo y Navegación  
**Prioridad:** Media  
**Tipo:** Funcional

#### Pasos Detallados

1. Ir a `/catalogo`
2. Usar campo de búsqueda (si existe)
3. Buscar por nombre de producto
4. Verificar que aparecen resultados relevantes
5. Buscar término que no existe
6. Verificar mensaje "No se encontraron productos"
7. Limpiar búsqueda
8. Verificar que vuelven todos los productos

#### Resultado Esperado

- Búsqueda funciona correctamente
- Resultados relevantes
- Mensajes apropiados cuando no hay resultados

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-CATALOGO-004: Ver detalle de producto

**Módulo:** Catálogo y Navegación  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Pasos Detallados

1. Desde catálogo, hacer clic en producto
2. Verificar redirección a `/producto/[id]`
3. Verificar que se muestra:
   - Imagen principal
   - Nombre
   - Precio (con descuento si aplica)
   - Descripción
   - Talles disponibles
   - Stock por talle
   - Botón "Agregar al carrito"
4. Seleccionar talle
5. Verificar que botón se habilita
6. Agregar al carrito
7. Verificar mensaje de éxito

#### Resultado Esperado

- Detalle de producto completo
- Información correcta
- Agregar al carrito funciona

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-HOME-001: Carga de productos destacados

**Módulo:** Home  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Pasos Detallados

1. Navegar a `/` (Home)
2. Scroll hasta sección "Destacados de la Semana"
3. Verificar que se cargan productos con `destacado = true`
4. Verificar que aparecen máximo 6 productos
5. Verificar que cada producto muestra:
   - Imagen
   - Nombre
   - Precio
   - Badge de descuento (si aplica)
6. Hacer clic en "Ver todos"
7. Verificar redirección a `/catalogo?destacado=true`
8. Verificar que aparecen todos los productos destacados

#### Resultado Esperado

- Productos destacados se cargan correctamente
- Máximo 6 productos en home
- Link "Ver todos" funciona

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-HOME-002: Carrusel de banners

**Módulo:** Home  
**Prioridad:** Alta  
**Tipo:** Funcional / UI

#### Pasos Detallados

1. Navegar a `/` (Home)
2. Verificar que carousel de banners aparece
3. Verificar que muestra banners activos
4. Esperar 5 segundos
5. Verificar que banner cambia automáticamente
6. Hacer hover sobre carousel
7. Verificar que rotación se pausa
8. Quitar hover
9. Verificar que rotación continúa
10. Usar botones de navegación
11. Verificar que cambia manualmente
12. Hacer clic en banner
13. Verificar redirección al link configurado

#### Resultado Esperado

- Carousel funciona correctamente
- Rotación automática funciona
- Pausa en hover funciona
- Navegación manual funciona
- Links funcionan

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-HOME-003: Sección nuevos ingresos

**Módulo:** Home  
**Prioridad:** Media  
**Tipo:** Funcional

#### Pasos Detallados

1. Navegar a `/` (Home)
2. Scroll hasta sección "Nuevos ingresos"
3. Verificar que se cargan últimos productos creados
4. Verificar que aparecen máximo 4 productos
5. Verificar orden: más recientes primero
6. Verificar que productos se muestran correctamente

#### Resultado Esperado

- Nuevos ingresos se cargan correctamente
- Orden correcto (más recientes primero)
- Máximo 4 productos

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

### TC-MOBILE-001: Checkout desde mobile

**Módulo:** Mobile  
**Prioridad:** Alta  
**Tipo:** UI / UX / Responsive

#### Precondiciones

- Acceso a dispositivo mobile o Chrome DevTools con viewport mobile
- Productos en carrito

#### Pasos Detallados

1. **Configurar viewport mobile**
   - Abrir Chrome DevTools (F12)
   - Activar modo responsive (Ctrl+Shift+M)
   - Seleccionar dispositivo mobile (ej: iPhone 12, Galaxy S20)
   - O usar dispositivo mobile real

2. **Navegar catálogo en mobile**
   - Ir a `/catalogo`
   - Verificar que layout es responsive
   - Verificar que productos se muestran en grid adecuado (2 columnas típicamente)
   - Verificar que imágenes se adaptan correctamente
   - Verificar que texto es legible

3. **Agregar producto al carrito**
   - Hacer clic en producto
   - Verificar que detalle se muestra correctamente en mobile
   - Seleccionar talle
   - Agregar al carrito
   - Verificar que mensaje de éxito es visible

4. **Ir al carrito**
   - Hacer clic en ícono de carrito
   - Verificar que carrito se abre correctamente
   - Verificar que productos se muestran correctamente
   - Verificar que botones son accesibles y grandes enough

5. **Calcular envío**
   - Scroll hasta sección de envío
   - Verificar que input de código postal es accesible
   - Ingresar código postal
   - Hacer clic en "Calcular"
   - Verificar que teclado no rompe layout
   - Verificar que métodos de envío se muestran correctamente
   - Seleccionar método de envío
   - Verificar que selección funciona correctamente

6. **Iniciar checkout**
   - Scroll hasta botón "Finalizar compra"
   - Verificar que botón es visible y accesible
   - Verificar que no está oculto por teclado u otros elementos
   - Hacer clic en botón
   - Verificar redirección a Mercado Pago

7. **Completar pago en mobile**
   - En Mercado Pago, verificar que formulario es mobile-friendly
   - Completar datos de pago
   - Verificar que teclado funciona correctamente
   - Confirmar pago

8. **Verificar confirmación en mobile**
   - Verificar redirección a `/pago/success`
   - Verificar que página se muestra correctamente en mobile
   - Verificar que botones son accesibles
   - Verificar que mensajes son legibles

#### Resultado Esperado

- Layout responsive funciona correctamente
- Elementos son accesibles en mobile
- Teclado no rompe layout
- Botones son suficientemente grandes
- Navegación funciona correctamente
- Checkout completo funciona en mobile

#### Resultado Actual

_Pendiente de ejecución manual_

#### Estado

**Pendiente**

---

## 📊 Casos Negativos y Edge Cases

### TC-ERROR-001: Código postal inválido

**Módulo:** Envíos  
**Prioridad:** Media  
**Tipo:** Validación

#### Pasos Detallados

1. Ir a `/carrito`
2. En calculadora de envío, ingresar código postal inválido:
   - Menos de 4 caracteres
   - Caracteres especiales
   - Vacío
3. Intentar calcular
4. Verificar mensaje de error apropiado
5. Verificar que no se muestran métodos de envío

#### Resultado Esperado

- Validación de código postal funciona
- Mensajes de error claros
- No permite calcular con datos inválidos

#### Estado

**Pendiente**

---

### TC-ERROR-002: Checkout sin seleccionar envío

**Módulo:** Checkout  
**Prioridad:** Media  
**Tipo:** Validación

#### Pasos Detallados

1. Agregar producto al carrito
2. Ir a `/carrito`
3. NO calcular ni seleccionar envío
4. Intentar hacer checkout
5. Verificar comportamiento:
   - Opción A: Permite checkout sin envío (envío = $0)
   - Opción B: Requiere seleccionar envío antes de checkout
   - Opción C: Muestra advertencia pero permite continuar

#### Resultado Esperado

- Comportamiento claro y consistente
- Usuario entiende qué hacer

#### Estado

**Pendiente**

---

### TC-ERROR-003: Carrito vacío al intentar checkout

**Módulo:** Checkout  
**Prioridad:** Media  
**Tipo:** Validación

#### Pasos Detallados

1. Vaciar carrito manualmente (eliminar todos los productos)
2. Intentar hacer checkout
3. Verificar mensaje: "El carrito está vacío"
4. Verificar que NO redirige a Mercado Pago

#### Resultado Esperado

- Validación de carrito vacío funciona
- Mensaje claro
- No permite checkout vacío

#### Estado

**Pendiente**

---

## 📈 Métricas y Cobertura

### Cobertura por Módulo

| Módulo                 | Casos Totales | Prioridad Alta | Prioridad Media | Prioridad Baja |
| ---------------------- | ------------- | -------------- | --------------- | -------------- |
| Compra y Checkout      | 6             | 3              | 3               | 0              |
| Stock y Disponibilidad | 3             | 2              | 1               | 0              |
| Administración         | 5             | 3              | 1               | 1              |
| Banners                | 3             | 1              | 2               | 0              |
| Carrito                | 4             | 4              | 0               | 0              |
| Catálogo               | 4             | 3              | 1               | 0              |
| Home                   | 3             | 2              | 1               | 0              |
| Mobile                 | 1             | 1              | 0               | 0              |
| Errores                | 3             | 0              | 3               | 0              |
| **TOTAL**              | **32**        | **19**         | **12**          | **1**          |

### Cobertura por Tipo

| Tipo          | Cantidad |
| ------------- | -------- |
| Funcional E2E | 15       |
| Funcional     | 10       |
| Validación    | 4        |
| UI/UX         | 2        |
| Integración   | 1        |

---

## 🔄 Proceso de Ejecución de QA Manual

### Fase 1: Preparación

1. Revisar este documento completo
2. Preparar datos de prueba (productos, usuarios, etc.)
3. Configurar ambiente de testing (sandbox de Mercado Pago)
4. Preparar dispositivos mobile (real o DevTools)

### Fase 2: Ejecución

1. Ejecutar casos de prioridad Alta primero
2. Documentar resultados en columna "Resultado Actual"
3. Capturar screenshots de issues encontrados
4. Anotar observaciones detalladas

### Fase 3: Reporte

1. Actualizar tabla resumen con estados finales
2. Generar reporte de bugs encontrados
3. Priorizar fixes según severidad
4. Documentar workarounds si aplica

---

## 📝 Notas Finales

- Todos los casos están diseñados basados en la funcionalidad real del sistema
- Casos marcados como "NO IMPLEMENTADO" son para desarrollo futuro
- Se recomienda ejecutar casos de prioridad Alta primero
- Documentar cualquier desvío encontrado en "Observaciones"
- Mantener este documento actualizado con resultados de ejecución

---

**Última actualización:** ${new Date().toLocaleString('es-AR')}  
**Versión del documento:** 1.0.0
