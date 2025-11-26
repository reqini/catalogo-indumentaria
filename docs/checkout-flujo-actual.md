# 📋 Mapeo del Flujo de Compra Actual

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Estado:** ✅ Documentación completa del flujo actual

---

## 🎯 Resumen Ejecutivo

Este documento describe paso a paso el flujo completo de compra desde que el usuario agrega un producto al carrito hasta que completa el pago (o falla en el proceso).

---

## 🔄 Flujo Completo Paso a Paso

### **PASO 1: Agregar Producto al Carrito**

**Componente:** `app/(ecommerce)/producto/[id]/ProductoClient.tsx`  
**Hook:** `hooks/useCart.ts` → `context/CartContext.tsx`

**Proceso:**

1. Usuario selecciona producto y talle
2. Click en "Agregar al carrito"
3. `addToCart()` valida stock disponible
4. Si hay stock, agrega item al estado `cart` (React Context)
5. Estado se persiste en `localStorage` automáticamente
6. MiniCart muestra badge con cantidad

**Archivos involucrados:**

- `context/CartContext.tsx` - Estado global del carrito
- `hooks/useCart.ts` - Hook para acceder al carrito
- `components/MiniCart.tsx` - Componente visual del carrito flotante

**Estado esperado:**

- ✅ Carrito actualizado en memoria
- ✅ Carrito persistido en localStorage
- ✅ UI actualizada (badge, mini cart)

---

### **PASO 2: Ver Carrito Completo**

**Ruta:** `/carrito`  
**Componente:** `app/(ecommerce)/carrito/page.tsx`

**Proceso:**

1. Usuario click en "Ver Carrito Completo" o navega a `/carrito`
2. Página muestra todos los items del carrito
3. Usuario puede:
   - Ver productos, talles, cantidades, precios
   - Actualizar cantidades
   - Eliminar productos
   - Ver total
4. Click en "Finalizar Compra" → redirige a `/checkout`

**Archivos involucrados:**

- `app/(ecommerce)/carrito/page.tsx` - Página del carrito

**Estado esperado:**

- ✅ Carrito visible con todos los items
- ✅ Totales calculados correctamente
- ✅ Redirección a checkout funcional

---

### **PASO 3: Checkout - Datos Personales**

**Ruta:** `/checkout`  
**Componente:** `app/(ecommerce)/checkout/page.tsx`  
**Step:** `'datos'`

**Proceso:**

1. Usuario llega a `/checkout`
2. Si carrito está vacío → redirige a `/carrito`
3. Formulario multi-step:
   - **Step 1 (datos):** Datos personales
     - Nombre (obligatorio, min 2 caracteres)
     - Email (obligatorio, formato email válido)
     - Teléfono (opcional, min 8 caracteres)
4. Validación con Zod (`checkoutSchema`)
5. Click en "Continuar a Envío" → avanza a step 2

**Validaciones:**

- Nombre: mínimo 2 caracteres
- Email: formato válido
- Teléfono: mínimo 8 caracteres (si se completa)

**Archivos involucrados:**

- `app/(ecommerce)/checkout/page.tsx` - Página completa de checkout
- Schema Zod definido inline en el componente

**Estado esperado:**

- ✅ Formulario válido antes de avanzar
- ✅ Mensajes de error claros si hay campos inválidos
- ✅ Datos guardados en estado local (`formData`)

---

### **PASO 4: Checkout - Método de Envío**

**Ruta:** `/checkout`  
**Componente:** `app/(ecommerce)/checkout/page.tsx`  
**Step:** `'envio'`  
**Componente:** `components/ShippingCalculator.tsx`

**Proceso:**

1. Usuario selecciona método de envío:
   - **Opción A: Envío a domicilio**
     - Ingresa código postal
     - Sistema calcula costos de envío
     - Muestra opciones disponibles (OCA, Correo Argentino, Andreani, etc.)
     - Usuario selecciona método
   - **Opción B: Retiro en el local**
     - No requiere dirección
     - Costo = $0
     - Mensaje: "Vas a retirar tu pedido por el local..."

2. **Cálculo de envío:**
   - Si `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` están configurados:
     - Llama a `lib/shipping/envioPack.ts` → `calcularEnvioConEnvioPack()`
     - Hace POST a `https://api.enviopack.com/cotizar`
     - Transforma respuesta a formato interno
   - Si NO están configurados o falla:
     - Usa `calcularEnvioSimulado()` como fallback
     - Calcula costos basados en CP, peso, valor declarado

3. Usuario selecciona método → estado `selectedShipping` se actualiza
4. Click en "Continuar a Resumen" → avanza a step 3

**Archivos involucrados:**

- `components/ShippingCalculator.tsx` - Componente de cálculo de envío
- `lib/shipping/envioPack.ts` - Integración con EnvioPack API
- `app/api/envios/calcular/route.ts` - Endpoint API para cálculo (si existe)

**Estado esperado:**

- ✅ Cálculo de envío funciona (real o simulado)
- ✅ Métodos disponibles se muestran correctamente
- ✅ Selección guardada en estado
- ✅ Si EnvioPack falla, NO rompe el checkout (usa fallback)

---

### **PASO 5: Checkout - Resumen y Pago**

**Ruta:** `/checkout`  
**Componente:** `app/(ecommerce)/checkout/page.tsx`  
**Step:** `'resumen'`

**Proceso:**

1. Usuario revisa resumen:
   - Productos con cantidades y precios
   - Datos personales
   - Método de envío seleccionado
   - Costo de envío
   - **Total final** (productos + envío)

2. Click en "Pagar Ahora" → inicia `handleCheckout()`

**Archivos involucrados:**

- `app/(ecommerce)/checkout/page.tsx` - Función `handleCheckout()`

**Estado esperado:**

- ✅ Resumen completo y correcto
- ✅ Total calculado correctamente
- ✅ Botón "Pagar Ahora" visible y funcional

---

### **PASO 6: Crear Orden en Backend**

**Endpoint:** `POST /api/checkout/create-order-simple`  
**Archivo:** `app/api/checkout/create-order-simple/route.ts`

**Proceso:**

1. **Validación de datos (Zod):**
   - Valida estructura completa del payload
   - Verifica productos, comprador, envío, total
   - Si falla → retorna 400 con detalles

2. **Validación de stock:**
   - Para cada producto, verifica stock disponible
   - Si stock insuficiente → retorna 400 con mensaje específico
   - Si producto no existe → retorna 404

3. **Crear orden en Supabase:**
   - Llama a `lib/ordenes-helpers-simple.ts` → `createSimpleOrder()`
   - Inserta en tabla `public.ordenes`:
     ```json
     {
       "productos": [...],
       "comprador": {...},
       "envio": {...},
       "total": 12345.67,
       "estado": "pendiente"
     }
     ```
   - Si tabla NO existe (PGRST205):
     - Intenta crear tabla automáticamente
     - Si falla → retorna 500 con instrucciones SQL
   - Si éxito → obtiene `orderId`

4. **Preparar items para Mercado Pago:**
   - Transforma productos a formato MP:
     ```json
     {
       "title": "Producto (Talle M)",
       "quantity": 1,
       "unit_price": 5000,
       "id": "uuid-producto",
       "talle": "M"
     }
     ```
   - Si hay costo de envío > 0, agrega item "Envío"

5. **Llamar a endpoint de Mercado Pago:**
   - Hace fetch interno a `/api/pago`
   - Envía:
     - `items`: array de productos + envío
     - `back_urls`: success, failure, pending
     - `payer`: datos del comprador
     - `external_reference`: orderId

**Archivos involucrados:**

- `app/api/checkout/create-order-simple/route.ts` - Endpoint principal
- `lib/ordenes-helpers-simple.ts` - Helpers para Supabase
- `lib/supabase-helpers.ts` - Helpers generales de Supabase

**Estado esperado:**

- ✅ Orden creada en Supabase con `orderId`
- ✅ Si tabla no existe, mensaje claro con instrucciones
- ✅ Stock validado correctamente
- ✅ Items preparados para MP

---

### **PASO 7: Crear Preferencia en Mercado Pago**

**Endpoint:** `POST /api/pago`  
**Archivo:** `app/api/pago/route.ts`

**Proceso:**

1. **Validar configuración de Mercado Pago:**
   - Lee `MP_ACCESS_TOKEN` de `process.env`
   - Valida formato (debe empezar con `APP_USR-` o `TEST-`)
   - Si NO está configurado:
     - Retorna 503 (Service Unavailable)
     - Mensaje: "El servicio de pago está temporalmente deshabilitado..."
     - Instrucciones para configurar en Vercel

2. **Validar payload:**
   - Valida con `pagoSchema` (Zod)
   - Verifica `items` y `back_urls`
   - Si `back_urls` incompleto → retorna 400

3. **Validar stock (nuevamente):**
   - Para cada item (excepto envío), verifica stock
   - Si stock insuficiente → retorna 400

4. **Construir preferencia para MP:**

   ```json
   {
     "items": [...],
     "back_urls": {
       "success": "https://.../pago/success?orderId=...",
       "failure": "https://.../pago/failure?orderId=...",
       "pending": "https://.../pago/pending?orderId=..."
     },
     "notification_url": "https://.../api/mp/webhook",
     "external_reference": "orderId-uuid",
     "payer": {...},
     "auto_return": "approved"
   }
   ```

5. **Llamar a API de Mercado Pago:**
   - POST a `https://api.mercadopago.com/checkout/preferences`
   - Headers:
     ```
     Authorization: Bearer {MP_ACCESS_TOKEN}
     Content-Type: application/json
     ```
   - Si falla:
     - Retorna error con detalles de MP
     - Status code del error de MP
   - Si éxito:
     - Retorna `init_point` y `preference_id`

**Archivos involucrados:**

- `app/api/pago/route.ts` - Endpoint de Mercado Pago
- `lib/mercadopago/validate.ts` - Validación de configuración MP

**Estado esperado:**

- ✅ Token MP válido y configurado
- ✅ Preferencia creada exitosamente
- ✅ `init_point` retornado correctamente
- ✅ Si falla, mensaje claro del error

---

### **PASO 8: Redirección a Mercado Pago**

**Componente:** `app/(ecommerce)/checkout/page.tsx`  
**Función:** `handleCheckout()` (continuación)

**Proceso:**

1. **Recibir respuesta del backend:**
   - Si `ok: true` y `initPoint` presente:
     - Valida que `initPoint` sea URL válida
     - Muestra toast: "Redirigiendo a Mercado Pago..."
     - Espera 500ms
     - Redirige: `window.location.href = initPoint`

2. **Si hay error:**
   - Parsea error según código:
     - `CHECKOUT_MP_NOT_CONFIGURED` → Mensaje sobre configuración
     - `CHECKOUT_MP_ERROR` → Error genérico de MP
     - `PGRST205` → Instrucciones SQL
     - Otros → Mensaje específico
   - Muestra toast de error (6 segundos)
   - Resetea estado `isProcessing`

**Archivos involucrados:**

- `app/(ecommerce)/checkout/page.tsx` - Manejo de respuesta y redirección

**Estado esperado:**

- ✅ Redirección exitosa a Mercado Pago
- ✅ Si error, mensaje claro y visible
- ✅ Botón se habilita nuevamente después de error

---

### **PASO 9: Pago en Mercado Pago**

**Plataforma:** Mercado Pago (externa)

**Proceso:**

1. Usuario completa pago en Mercado Pago
2. Mercado Pago procesa pago
3. Redirección según resultado:
   - **Aprobado:** `/pago/success?orderId=...`
   - **Rechazado:** `/pago/failure?orderId=...`
   - **Pendiente:** `/pago/pending?orderId=...`

**Archivos involucrados:**

- `app/(ecommerce)/pago/success/page.tsx` - Página de éxito
- `app/(ecommerce)/pago/failure/page.tsx` - Página de fallo
- `app/(ecommerce)/pago/pending/page.tsx` - Página de pendiente

**Estado esperado:**

- ✅ Redirección correcta según estado del pago
- ✅ Páginas muestran información relevante

---

### **PASO 10: Webhook de Mercado Pago (Asíncrono)**

**Endpoint:** `POST /api/mp/webhook` (si existe)  
**Archivo:** `app/api/mp/webhook/route.ts` (verificar existencia)

**Proceso:**

1. Mercado Pago envía notificación POST al webhook
2. Endpoint valida firma (si está implementado)
3. Actualiza orden en Supabase:
   - Cambia `pago_estado` a 'approved', 'rejected', o 'pending'
   - Guarda `pago_id` y `pago_fecha`
   - Actualiza `estado` de orden si corresponde

**Estado actual:**

- ⚠️ **VERIFICAR:** Endpoint puede no estar implementado completamente

---

## 📊 Diagrama de Flujo Simplificado

```
Usuario
  ↓
[1] Agregar al carrito → CartContext → localStorage
  ↓
[2] Ver carrito → /carrito
  ↓
[3] Finalizar compra → /checkout
  ↓
[4] Completar datos personales (Step 1)
  ↓
[5] Seleccionar envío (Step 2) → ShippingCalculator → EnvioPack o simulado
  ↓
[6] Revisar resumen (Step 3)
  ↓
[7] Click "Pagar Ahora"
  ↓
[8] POST /api/checkout/create-order-simple
  ├─ Validar datos (Zod)
  ├─ Validar stock
  ├─ Crear orden en Supabase (tabla ordenes)
  └─ POST /api/pago
      ├─ Validar MP_ACCESS_TOKEN
      ├─ Validar payload
      ├─ Validar stock (nuevamente)
      ├─ Construir preferencia MP
      └─ POST https://api.mercadopago.com/checkout/preferences
          ├─ ✅ Éxito → retorna init_point
          └─ ❌ Error → retorna error detallado
  ↓
[9] Redirección a Mercado Pago (init_point)
  ↓
[10] Usuario paga en MP
  ↓
[11] Redirección según resultado:
  ├─ /pago/success?orderId=...
  ├─ /pago/failure?orderId=...
  └─ /pago/pending?orderId=...
  ↓
[12] Webhook MP → /api/mp/webhook (asíncrono)
  └─ Actualizar orden en Supabase
```

---

## 🔑 Puntos Críticos del Flujo

### **1. Persistencia del Carrito**

- ✅ Funciona: localStorage + React Context
- ✅ Persiste entre sesiones
- ⚠️ No se sincroniza entre dispositivos

### **2. Validación de Stock**

- ✅ Validación en frontend (al agregar al carrito)
- ✅ Validación en backend (al crear orden)
- ✅ Validación en MP endpoint (antes de crear preferencia)
- ⚠️ Posible race condition si múltiples usuarios compran simultáneamente

### **3. Creación de Orden en Supabase**

- ✅ Intenta crear tabla automáticamente si no existe
- ✅ Retorna error claro si falla (PGRST205)
- ⚠️ Requiere ejecutar SQL manualmente si creación automática falla

### **4. Integración con Mercado Pago**

- ✅ Validación exhaustiva de configuración
- ✅ Manejo de errores detallado
- ⚠️ **CRÍTICO:** Requiere `MP_ACCESS_TOKEN` configurado en Vercel
- ⚠️ Si token no está configurado, retorna 503 (no rompe el sitio)

### **5. Cálculo de Envío (EnvioPack)**

- ✅ Fallback a cálculo simulado si EnvioPack no está configurado
- ✅ NO rompe el checkout si falla
- ⚠️ Requiere `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` para funcionar realmente

---

## 🗂️ Archivos Clave del Flujo

### Frontend

- `app/(ecommerce)/checkout/page.tsx` - Página principal de checkout
- `app/(ecommerce)/carrito/page.tsx` - Página del carrito
- `components/ShippingCalculator.tsx` - Componente de cálculo de envío
- `context/CartContext.tsx` - Estado global del carrito
- `hooks/useCart.ts` - Hook para acceder al carrito

### Backend

- `app/api/checkout/create-order-simple/route.ts` - Endpoint principal de checkout
- `app/api/pago/route.ts` - Endpoint de Mercado Pago
- `lib/ordenes-helpers-simple.ts` - Helpers para órdenes en Supabase
- `lib/shipping/envioPack.ts` - Integración con EnvioPack
- `lib/mercadopago/validate.ts` - Validación de configuración MP

### Base de Datos

- `supabase/schemas/checkout-schema-completo.sql` - Schema SQL para tabla `ordenes`

---

## ⚠️ Dependencias Críticas

### Variables de Entorno Requeridas

1. **Mercado Pago (OBLIGATORIO para pagos):**
   - `MP_ACCESS_TOKEN` - Token de acceso de Mercado Pago
   - Formato: `APP_USR-...` (producción) o `TEST-...` (sandbox)

2. **EnvioPack (OPCIONAL - tiene fallback):**
   - `ENVIOPACK_API_KEY` - API Key de EnvioPack
   - `ENVIOPACK_API_SECRET` - API Secret de EnvioPack

3. **Supabase (OBLIGATORIO):**
   - `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key para admin operations

4. **Base URL (OPCIONAL - tiene fallback):**
   - `NEXT_PUBLIC_BASE_URL` - URL base de la aplicación

---

## 📝 Notas Técnicas

### Validaciones Duplicadas

- Stock se valida 3 veces:
  1. Al agregar al carrito (frontend)
  2. Al crear orden (backend)
  3. Al crear preferencia MP (backend)

**Razón:** Prevenir race conditions y asegurar integridad.

### Manejo de Errores

- Todos los errores retornan JSON estructurado con:
  - `ok: boolean`
  - `code: string` - Código de error específico
  - `message: string` - Mensaje amigable
  - `detail: string` - Detalle técnico (opcional)

### Logs Estructurados

- Prefijos consistentes:
  - `[CHECKOUT][CLIENT]` - Logs del frontend
  - `[CHECKOUT][API]` - Logs del backend
  - `[MP-PAYMENT]` - Logs de Mercado Pago
  - `[ENVIOS][ENVIOPACK]` - Logs de EnvioPack
  - `[ORDENES-SIMPLE]` - Logs de órdenes

---

**Última actualización:** 2024-11-26  
**Versión del documento:** 1.0
