# Mapeo del Flujo de Compra - CatalogoIndumentaria

## 📋 Componentes y Páginas

### Frontend

1. **Home (`/`)**
   - `app/page.tsx`
   - Muestra productos destacados, ofertas, nuevos ingresos
   - Permite agregar productos al carrito desde `ProductCard`

2. **Catálogo (`/catalogo`)**
   - `app/catalogo/CatalogoClient.tsx`
   - Listado de productos con filtros
   - Permite agregar productos al carrito desde `ProductCard`

3. **Detalle de Producto (`/producto/[id]`)**
   - `app/producto/[id]/ProductoClient.tsx`
   - Muestra detalles completos del producto
   - Selector de talle (`TalleSelector`)
   - Botones: "Agregar al Carrito" y "Comprar con Mercado Pago"

4. **Carrito (`/carrito`)**
   - `app/carrito/page.tsx`
   - Muestra items del carrito
   - Permite modificar cantidades y eliminar items
   - Botón "Finalizar Compra" que llama a `handleCheckout`

5. **Pantallas de Resultado**
   - `/pago/success` - Pago exitoso
   - `/pago/failure` - Pago rechazado
   - `/pago/pending` - Pago pendiente

### Componentes Clave

- `components/ProductCard.tsx` - Card de producto con botón rápido
- `components/ProductModal.tsx` - Modal de producto con selección de talle
- `components/TalleSelector.tsx` - Selector de talles
- `components/MiniCart.tsx` - Carrito flotante
- `context/CartContext.tsx` - Context del carrito (estado global)
- `hooks/useCart.ts` - Hook para acceder al carrito

## 🔄 Flujo de Compra Paso a Paso

### 1. Selección de Producto

**Desde Home o Catálogo:**
- Usuario hace click en `ProductCard`
- Se abre `ProductModal` o navega a `/producto/[id]`
- Usuario selecciona talle (y color si aplica)
- Usuario hace click en "Agregar al Carrito"

**Lógica:**
- `ProductCard.handleQuickAdd()` o `ProductoClient.handleComprar()`
- Llama a `addToCart()` del hook `useCart`
- Valida que haya talle seleccionado
- Valida stock disponible (parcial - solo verifica que no esté agotado)

### 2. Gestión del Carrito

**Estado:**
- Almacenado en `CartContext` (React Context)
- Persistido en `localStorage`
- Estructura: `CartItem[]` con `id`, `nombre`, `precio`, `descuento`, `imagenPrincipal`, `cantidad`, `talle`, `stock`

**Operaciones:**
- `addToCart(item)` - Agrega o actualiza cantidad si ya existe
- `removeFromCart(id, talle)` - Elimina item del carrito
- `updateQuantity(id, talle, quantity)` - Actualiza cantidad
- `getTotalPrice()` - Calcula total con descuentos

**Validaciones Actuales:**
- ✅ No permite cantidad <= 0
- ❌ NO valida stock disponible antes de agregar
- ❌ NO valida stock al actualizar cantidad

### 3. Checkout (Finalizar Compra)

**Página:** `/carrito`

**Proceso:**
1. Usuario revisa carrito
2. Usuario hace click en "Finalizar Compra"
3. `handleCheckout()` se ejecuta:
   - Valida que el carrito no esté vacío
   - Mapea items a formato MP: `{ title, quantity, unit_price }`
   - Llama a `createPayment()` (API `/api/pago`)

**Validaciones Actuales:**
- ✅ Carrito no vacío
- ❌ NO valida stock antes de crear preferencia (se valida en backend)

### 4. Creación de Preferencia de Pago

**Endpoint:** `POST /api/pago`

**Proceso:**
1. Recibe `items[]` y `back_urls`
2. Valida con `pagoSchema` (Zod)
3. **Valida stock** para cada item:
   - Busca producto por nombre
   - Calcula stock total (suma de todos los talles)
   - Compara con cantidad solicitada
   - ❌ **PROBLEMA:** No valida stock por talle específico
4. Crea preferencia en Mercado Pago:
   - `items[]` con title, quantity, unit_price
   - `back_urls` (success, failure, pending)
   - `notification_url` → `/api/mp/webhook`
5. Guarda `CompraLog` con estado 'pendiente'
6. Retorna `init_point` y `preference_id`

**Errores Manejados:**
- ✅ MP no configurado
- ✅ Producto no encontrado
- ✅ Stock insuficiente
- ✅ Error de MP API
- ✅ Error de validación

### 5. Redirección a Mercado Pago

**Frontend:**
- Recibe `preference.init_point`
- Redirige con `window.location.href = preference.init_point`
- Usuario completa pago en MP

### 6. Webhook de Mercado Pago

**Endpoint:** `POST /api/mp/webhook`

**Proceso:**
1. Recibe notificación de MP
2. Valida firma (si está configurada)
3. Obtiene detalles del pago desde MP API
4. Si `status === 'approved'`:
   - Verifica idempotencia (no procesar dos veces)
   - Para cada item del pago:
     - Busca producto por nombre o ID
     - ❌ **PROBLEMA:** Asume talle M o primer talle (no usa talle del carrito)
     - Inicia transacción MongoDB
     - Verifica stock disponible
     - Descuenta stock
     - Crea `CompraLog` con estado 'aprobado'
     - Crea `StockLog` de la venta
     - Envía email de confirmación
     - Commit de transacción
5. Si `status !== 'approved'`:
   - Solo registra el estado (no descuenta stock)

**Idempotencia:**
- ✅ Verifica `CompraLog` con mismo `mpPaymentId` y estado 'aprobado'
- ✅ No procesa dos veces el mismo pago

### 7. Retorno del Usuario

**Pantallas:**
- `/pago/success` - Muestra mensaje de éxito
- `/pago/failure` - Muestra mensaje de error
- `/pago/pending` - Muestra mensaje de pendiente

**Estado Actual:**
- ✅ Pantallas implementadas
- ✅ Mensajes claros
- ❌ No limpia carrito automáticamente en success

## 🔍 Problemas Identificados

### Críticos

1. **Validación de Stock por Talle:**
   - El carrito no valida stock por talle antes de agregar
   - El checkout no valida stock por talle
   - El webhook asume un talle (M o primero) en lugar de usar el talle del carrito

2. **Búsqueda de Producto:**
   - El webhook busca por nombre (puede fallar si hay duplicados)
   - Debería usar ID del producto

3. **Información de Talle en Preferencia:**
   - La preferencia de MP no incluye información del talle
   - El webhook no puede saber qué talle se compró

### Mejoras

1. **Validación de Stock en Carrito:**
   - Validar stock al agregar producto
   - Validar stock al actualizar cantidad
   - Mostrar mensaje claro si no hay stock

2. **Limpieza de Carrito:**
   - Limpiar carrito después de pago exitoso

3. **Manejo de Errores:**
   - Mejorar mensajes de error en frontend
   - Agregar loading states

## 📊 Endpoints Clave

- `POST /api/pago` - Crear preferencia de pago
- `POST /api/mp/webhook` - Recibir notificaciones de MP
- `GET /api/productos` - Obtener productos
- `GET /api/productos/[id]` - Obtener producto por ID
- `PUT /api/productos/[id]/stock` - Actualizar stock (no usado en checkout)

## 🔄 Flujo de Datos

```
Usuario → ProductCard → addToCart() → CartContext → localStorage
                                                          ↓
Usuario → Carrito → handleCheckout() → POST /api/pago → Validar Stock → MP API
                                                          ↓
MP → Webhook → POST /api/mp/webhook → Validar → Descontar Stock → Email
                                                          ↓
Usuario → /pago/success → Mensaje de confirmación
```

## 📝 Notas Técnicas

- El carrito usa `localStorage` para persistencia
- El stock se almacena como `Map` en MongoDB pero se convierte a objeto en APIs
- Las transacciones MongoDB aseguran consistencia en webhook
- El email se envía de forma asíncrona y no bloquea el flujo

