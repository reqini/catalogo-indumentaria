# 📱 QA Mobile Checklist - Catálogo Indumentaria

**Versión:** 1.0.0  
**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Dispositivos objetivo:** iOS, Android, Tablets

---

## 🎯 Objetivo

Verificar que el e-commerce funciona correctamente en dispositivos mobile, con especial atención a:

- Layout responsive
- Interacción táctil
- Teclado virtual
- Navegación
- Performance
- UX mobile

---

## 📱 Dispositivos y Viewports a Probar

### Dispositivos Móviles

- iPhone 12/13/14 (375x812)
- iPhone SE (375x667)
- Samsung Galaxy S20/S21 (360x800)
- iPad (768x1024)
- iPad Pro (1024x1366)

### Navegadores

- Safari iOS
- Chrome Android
- Chrome Desktop (DevTools mobile mode)

---

## ✅ Checklist Mobile Completo

### 🏠 Home Page Mobile

#### TC-MOBILE-HOME-001: Carga inicial

- [ ] Home carga correctamente en mobile
- [ ] Hero banner se muestra correctamente (no se corta)
- [ ] Texto es legible sin zoom
- [ ] Botones son suficientemente grandes (mínimo 44x44px)
- [ ] No hay scroll horizontal no deseado
- [ ] Imágenes se cargan correctamente

#### TC-MOBILE-HOME-002: Navegación

- [ ] Menú de navegación funciona en mobile
- [ ] Menú hamburguesa (si existe) funciona correctamente
- [ ] Links son fácilmente clickeables
- [ ] Ícono de carrito es visible y accesible
- [ ] Badge de cantidad en carrito es visible

#### TC-MOBILE-HOME-003: Carrusel de banners

- [ ] Carrusel se muestra correctamente
- [ ] Swipe funciona (deslizar izquierda/derecha)
- [ ] Botones de navegación son accesibles
- [ ] Indicadores de posición son visibles
- [ ] Imágenes se adaptan al viewport
- [ ] Links funcionan al hacer tap

#### TC-MOBILE-HOME-004: Secciones de productos

- [ ] Grid de productos se adapta (típicamente 2 columnas)
- [ ] Productos son fácilmente clickeables
- [ ] Imágenes se cargan correctamente
- [ ] Texto es legible
- [ ] Badges de descuento son visibles
- [ ] Scroll vertical funciona suavemente

---

### 📦 Catálogo Mobile

#### TC-MOBILE-CATALOGO-001: Listado de productos

- [ ] Catálogo carga correctamente
- [ ] Grid responsive (2 columnas en mobile)
- [ ] Productos se muestran correctamente
- [ ] Scroll infinito o paginación funciona
- [ ] Filtros son accesibles (si existen)
- [ ] Búsqueda funciona correctamente

#### TC-MOBILE-CATALOGO-002: Filtros mobile

- [ ] Botón de filtros es visible
- [ ] Panel de filtros se abre correctamente
- [ ] Filtros son fáciles de usar con touch
- [ ] Aplicar filtros funciona
- [ ] Limpiar filtros funciona
- [ ] Panel se cierra correctamente

#### TC-MOBILE-CATALOGO-003: Detalle de producto

- [ ] Página de detalle carga correctamente
- [ ] Imagen principal se muestra correctamente
- [ ] Galería de imágenes funciona (swipe si aplica)
- [ ] Información del producto es legible
- [ ] Selector de talles es accesible
- [ ] Botón "Agregar al carrito" es grande y visible
- [ ] Scroll funciona correctamente

---

### 🛒 Carrito Mobile

#### TC-MOBILE-CARRITO-001: Visualización

- [ ] Carrito se abre correctamente
- [ ] Productos se muestran correctamente
- [ ] Imágenes se adaptan al viewport
- [ ] Información es legible
- [ ] Botones de acción son accesibles

#### TC-MOBILE-CARRITO-002: Modificar cantidad

- [ ] Botones +/- son suficientemente grandes
- [ ] Modificar cantidad funciona correctamente
- [ ] Subtotal se actualiza dinámicamente
- [ ] Validación de stock funciona

#### TC-MOBILE-CARRITO-003: Eliminar producto

- [ ] Botón eliminar es accesible
- [ ] Confirmación funciona (si aplica)
- [ ] Producto se elimina correctamente
- [ ] Carrito se actualiza inmediatamente

#### TC-MOBILE-CARRITO-004: Cálculo de envío

- [ ] Input de código postal es accesible
- [ ] Teclado numérico aparece (si está configurado)
- [ ] Teclado no rompe layout
- [ ] Botón "Calcular" es accesible
- [ ] Métodos de envío se muestran correctamente
- [ ] Selección de método funciona con touch
- [ ] Total se actualiza correctamente

#### TC-MOBILE-CARRITO-005: Checkout button

- [ ] Botón "Finalizar compra" es visible
- [ ] Botón es suficientemente grande (mínimo 44x44px)
- [ ] Botón no está oculto por otros elementos
- [ ] Botón funciona correctamente
- [ ] Estado de carga se muestra claramente

---

### 💳 Checkout Mobile

#### TC-MOBILE-CHECKOUT-001: Redirección a Mercado Pago

- [ ] Redirección funciona correctamente
- [ ] Página de Mercado Pago carga en mobile
- [ ] Formulario de Mercado Pago es mobile-friendly
- [ ] No hay errores de redirección

#### TC-MOBILE-CHECKOUT-002: Completar pago en mobile

- [ ] Campos de formulario son accesibles
- [ ] Teclado aparece correctamente
- [ ] Teclado no oculta campos importantes
- [ ] Validación funciona en mobile
- [ ] Botones de acción son accesibles
- [ ] Proceso de pago se completa correctamente

#### TC-MOBILE-CHECKOUT-003: Confirmación

- [ ] Redirección a `/pago/success` funciona
- [ ] Página de éxito se muestra correctamente
- [ ] Mensajes son legibles
- [ ] Botones son accesibles
- [ ] Links funcionan correctamente

---

### ⚠️ Errores Mobile

#### TC-MOBILE-ERROR-001: Pago rechazado

- [ ] Redirección a `/pago/failure` funciona
- [ ] Mensaje de error es legible
- [ ] Botones son accesibles
- [ ] Link "Reintentar" funciona

#### TC-MOBILE-ERROR-002: Sin conexión

- [ ] Mensaje de error offline es claro
- [ ] Botón de reintento funciona
- [ ] No se pierden datos del carrito

---

### 🎨 UI/UX Mobile Específico

#### TC-MOBILE-UX-001: Touch targets

- [ ] Todos los botones tienen mínimo 44x44px
- [ ] Links tienen suficiente espacio entre ellos
- [ ] No hay elementos demasiado pequeños
- [ ] Áreas clickeables son claras

#### TC-MOBILE-UX-002: Scroll y navegación

- [ ] Scroll es suave (60fps)
- [ ] No hay lag al hacer scroll
- [ ] Pull-to-refresh funciona (si aplica)
- [ ] Navegación back funciona correctamente
- [ ] No hay scroll horizontal no deseado

#### TC-MOBILE-UX-003: Teclado virtual

- [ ] Teclado no rompe layout
- [ ] Campos no quedan ocultos por teclado
- [ ] Scroll automático cuando aparece teclado funciona
- [ ] Teclado se cierra correctamente
- [ ] Tipo de teclado es apropiado (numérico para CP, etc.)

#### TC-MOBILE-UX-004: Imágenes y media

- [ ] Imágenes se cargan rápidamente
- [ ] Imágenes se adaptan al viewport
- [ ] No hay imágenes pixeladas
- [ ] Lazy loading funciona correctamente
- [ ] Placeholders se muestran mientras cargan

#### TC-MOBILE-UX-005: Performance

- [ ] Página carga en menos de 3 segundos (3G)
- [ ] Interacciones responden inmediatamente
- [ ] No hay bloqueos de UI
- [ ] Animaciones son suaves

---

### 🔍 Casos Específicos Mobile

#### TC-MOBILE-SPEC-001: Orientación landscape

- [ ] Layout se adapta a landscape
- [ ] Contenido sigue siendo usable
- [ ] No hay elementos cortados
- [ ] Navegación sigue funcionando

#### TC-MOBILE-SPEC-002: Rotación de pantalla

- [ ] Rotación no rompe layout
- [ ] Contenido se reajusta correctamente
- [ ] Estado se mantiene (carrito, etc.)
- [ ] No hay pérdida de datos

#### TC-MOBILE-SPEC-003: Zoom y pinch

- [ ] Zoom funciona correctamente
- [ ] Contenido sigue siendo usable con zoom
- [ ] No hay problemas de layout con zoom
- [ ] Reset de zoom funciona

#### TC-MOBILE-SPEC-004: Safari iOS específico

- [ ] Funciona correctamente en Safari iOS
- [ ] No hay problemas con viewport
- [ ] Safe area se respeta (notch, etc.)
- [ ] Compartir funciona (si aplica)

#### TC-MOBILE-SPEC-005: Chrome Android específico

- [ ] Funciona correctamente en Chrome Android
- [ ] No hay problemas con viewport
- [ ] Barra de navegación no interfiere
- [ ] Compartir funciona (si aplica)

---

### 📊 Tabla Resumen Mobile

| Caso                   | Dispositivo | Navegador | Estado    | Observaciones             |
| ---------------------- | ----------- | --------- | --------- | ------------------------- |
| TC-MOBILE-HOME-001     | iPhone 12   | Safari    | Pendiente |                           |
| TC-MOBILE-HOME-001     | Galaxy S20  | Chrome    | Pendiente |                           |
| TC-MOBILE-CARRITO-004  | iPhone 12   | Safari    | Pendiente | Verificar teclado         |
| TC-MOBILE-CHECKOUT-001 | iPhone 12   | Safari    | Pendiente |                           |
| TC-MOBILE-CHECKOUT-001 | Galaxy S20  | Chrome    | Pendiente |                           |
| TC-MOBILE-UX-003       | iPhone 12   | Safari    | Pendiente | Verificar teclado virtual |

---

## 🛠️ Herramientas de Testing Mobile

### Chrome DevTools

1. Abrir Chrome DevTools (F12)
2. Activar modo responsive (Ctrl+Shift+M / Cmd+Shift+M)
3. Seleccionar dispositivo o configurar viewport personalizado
4. Probar funcionalidad completa

### Dispositivos Reales

- iPhone con Safari
- Android con Chrome
- Tablets (iPad, Android tablets)

### Herramientas Online

- BrowserStack
- LambdaTest
- Responsive Design Checker

---

## 📝 Checklist Rápido Mobile

### Antes de cada release

- [ ] Home funciona en mobile
- [ ] Catálogo funciona en mobile
- [ ] Carrito funciona en mobile
- [ ] Checkout funciona en mobile
- [ ] Teclado no rompe layout
- [ ] Botones son accesibles
- [ ] Imágenes se cargan correctamente
- [ ] Performance es aceptable
- [ ] No hay scroll horizontal
- [ ] Navegación funciona correctamente

---

**Última actualización:** ${new Date().toLocaleString('es-AR')}  
**Versión:** 1.0.0
