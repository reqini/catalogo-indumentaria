# 🧪 QA: Checkout Completo - Flujo de Compra End-to-End

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA** - Flujo de compra completo  
**Estado:** ✅ **LISTO PARA PRUEBAS**

---

## 📋 PRE-REQUISITOS OBLIGATORIOS

### 1. Ejecutar SQL en Supabase (OBLIGATORIO)

**ANTES de probar el checkout**, ejecuta el siguiente SQL en Supabase Dashboard:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en "SQL Editor" en el menú lateral
4. Click en "New query"
5. Copia y pega el contenido completo de: `supabase/schemas/checkout-schema-completo.sql`
6. Click en "Run" o presiona `Ctrl+Enter` / `Cmd+Enter`
7. Verifica que aparezca: "Success. No rows returned"

**Archivo SQL:** `supabase/schemas/checkout-schema-completo.sql`

**⚠️ SIN ESTO EL CHECKOUT NO FUNCIONARÁ**

---

### 2. Configurar Mercado Pago (OBLIGATORIO)

1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Obtén tu Access Token (empieza con `APP_USR-` o `TEST-`)
3. Ve a Vercel Dashboard → Settings → Environment Variables
4. Agrega:
   - Key: `MP_ACCESS_TOKEN`
   - Value: Tu token
   - Environment: Production, Preview, Development
5. Haz **REDEPLOY** después de agregar

**⚠️ SIN ESTO NO SE PODRÁ CREAR LA PREFERENCIA DE PAGO**

---

## ✅ CASOS DE PRUEBA OBLIGATORIOS

### TC-CHECKOUT-001: Flujo Completo de Compra (Happy Path)

**Objetivo:** Verificar que el flujo completo funciona sin errores

**Precondiciones:**

- ✅ Tabla `ordenes` existe en Supabase
- ✅ `MP_ACCESS_TOKEN` configurado en Vercel
- ✅ Productos disponibles en catálogo
- ✅ Carrito con al menos 1 producto

**Pasos:**

1. **Agregar producto al carrito**
   - Ir a catálogo
   - Seleccionar producto
   - Elegir talle (si aplica)
   - Click en "Agregar al carrito"
   - Verificar que aparece en el carrito

2. **Ir a checkout**
   - Click en icono de carrito
   - Click en "Finalizar compra" o "Ir a checkout"
   - Verificar que se carga `/checkout`

3. **Completar datos personales (Paso 1)**
   - Nombre: "Juan Pérez"
   - Email: "juan.perez@example.com"
   - Teléfono: "+54 11 1234-5678"
   - Click en "Continuar a Envío"

4. **Seleccionar método de envío (Paso 2)**
   - Si es envío a domicilio:
     - Ingresar código postal: "C1043AAX"
     - Esperar cálculo de envío
     - Seleccionar método (ej: "OCA Estándar")
   - Si es retiro en local:
     - Seleccionar "Retiro en el local"
   - Click en "Continuar a Resumen"

5. **Revisar resumen (Paso 3)**
   - Verificar productos correctos
   - Verificar total correcto (productos + envío)
   - Verificar datos personales
   - Verificar dirección (si aplica)

6. **Procesar pago**
   - Click en "Pagar Ahora"
   - **VERIFICAR:**
     - ✅ Botón muestra "Procesando pago..." con spinner
     - ✅ Botón está deshabilitado
     - ✅ No se puede hacer click nuevamente
   - Esperar respuesta del servidor

7. **Verificar redirección**
   - **VERIFICAR:**
     - ✅ Aparece toast "Redirigiendo a Mercado Pago..."
     - ✅ Redirección automática a URL de Mercado Pago
     - ✅ URL contiene `init_point` válido
     - ✅ Se carga la página de Mercado Pago

**Resultado esperado:**

- ✅ No aparece error 500
- ✅ No aparece error PGRST205
- ✅ Orden creada en Supabase con todos los datos
- ✅ Preferencia MP creada correctamente
- ✅ Redirección a Mercado Pago exitosa
- ✅ Loading visible durante procesamiento
- ✅ Botón deshabilitado durante procesamiento

**Logs esperados en consola del navegador:**

```
[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] 📤 Creando preferencia MP...
[CHECKOUT][API] ✅ Preferencia MP creada: {preferenceId}
[CHECKOUT][API] ✅ Checkout completado exitosamente
[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}
[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...
```

**Logs esperados en Vercel Dashboard:**

```
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] 📤 Creando preferencia MP...
[MP-PAYMENT] ✅ Token configurado correctamente
[MP-PAYMENT] ✅ Preferencia creada exitosamente
[CHECKOUT][API] ✅ Checkout completado exitosamente
```

---

### TC-CHECKOUT-002: Compra con Retiro en Local

**Objetivo:** Verificar que funciona sin dirección

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar datos personales
4. Seleccionar "Retiro en el local"
5. Verificar que NO se requiere dirección
6. Continuar a resumen
7. Click en "Pagar Ahora"

**Resultado esperado:**

- ✅ No se requiere dirección completa
- ✅ `envio_costo = 0` en resumen
- ✅ Orden creada con `envio.tipo = 'retiro_local'`
- ✅ Redirección a MP exitosa

---

### TC-CHECKOUT-003: Validación de Datos

**Objetivo:** Verificar validaciones funcionan

**Pasos:**

1. Ir a checkout sin completar datos
2. Intentar avanzar
3. Completar datos con formato inválido:
   - Email: "juan@" (inválido)
   - Teléfono: "123" (muy corto)
   - Código postal sin dirección completa

**Resultado esperado:**

- ✅ Mensajes de error claros y específicos
- ✅ No se permite avanzar con datos inválidos
- ✅ Errores específicos por campo

---

### TC-CHECKOUT-004: Loading y Estados del Botón

**Objetivo:** Verificar UX durante procesamiento

**Pasos:**

1. Completar checkout completo
2. Click en "Pagar Ahora"
3. Observar botón y UI

**Resultado esperado:**

- ✅ Botón muestra "Procesando pago..." con spinner
- ✅ Botón está deshabilitado (no se puede clickear)
- ✅ Botón tiene opacidad reducida
- ✅ No se puede hacer submit múltiple
- ✅ Toast de éxito antes de redirigir

---

### TC-CHECKOUT-005: Manejo de Errores

**Objetivo:** Verificar mensajes de error claros

**Escenarios:**

#### 5.1. Error: Mercado Pago no configurado

- **Resultado esperado:**
  - ✅ Mensaje claro: "El servicio de pago está temporalmente deshabilitado..."
  - ✅ Toast visible con duración extendida (6 segundos)
  - ✅ Botón se habilita nuevamente

#### 5.2. Error: Tabla no existe (PGRST205)

- **Resultado esperado:**
  - ✅ Mensaje con instrucciones para ejecutar SQL
  - ✅ Menciona archivo: `supabase/schemas/checkout-schema-completo.sql`

#### 5.3. Error: Stock insuficiente

- **Resultado esperado:**
  - ✅ Mensaje: "Stock insuficiente para [producto]..."
  - ✅ Indica cantidad disponible

#### 5.4. Error: Conexión

- **Resultado esperado:**
  - ✅ Mensaje: "Error de conexión. Verificá tu conexión..."
  - ✅ Botón se habilita para reintentar

---

### TC-CHECKOUT-006: Verificación en Supabase

**Objetivo:** Confirmar que la orden se guarda correctamente

**Pasos:**

1. Completar compra exitosa
2. Ir a Supabase Dashboard → Table Editor → `ordenes`
3. Buscar orden por email o fecha reciente

**Resultado esperado:**

- ✅ Orden visible en tabla
- ✅ Campo `productos` contiene array JSON correcto
- ✅ Campo `comprador` contiene datos correctos
- ✅ Campo `envio` contiene datos correctos
- ✅ Campo `total` coincide con cálculo
- ✅ Campo `estado` = 'pendiente'
- ✅ Campo `pago_preferencia_id` presente
- ✅ Campo `created_at` tiene timestamp reciente

---

## 🔍 VERIFICACIÓN DE LOGS

### Logs en Consola del Navegador

Abre DevTools (F12) → Console y busca:

**✅ Logs de éxito:**

- `[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...`
- `[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...`
- `[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}`
- `[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...`

**❌ Logs de error (NO deberían aparecer):**

- `[CHECKOUT][CLIENT] ❌ Error del servidor`
- `[CHECKOUT][API] ❌ Error creando orden`
- `PGRST205`
- `checkout-disabled`

---

### Logs en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona proyecto → Deployments → Último deployment → Logs
3. Busca mensajes con `[CHECKOUT]` o `[MP-PAYMENT]`

**✅ Logs esperados:**

- `[CHECKOUT][API] 📥 Request recibido`
- `[CHECKOUT][API] ✅ Orden creada exitosamente`
- `[CHECKOUT][API] ✅ Preferencia MP creada`
- `[MP-PAYMENT] ✅ Token configurado correctamente`

---

## 📊 RESUMEN DE RESULTADOS

| Caso            | Estado       | Observaciones      | Resultado Actual       |
| --------------- | ------------ | ------------------ | ---------------------- |
| TC-CHECKOUT-001 | ⏳ PENDIENTE | Flujo completo     | -                      |
| TC-CHECKOUT-002 | ⏳ PENDIENTE | Retiro en local    | -                      |
| TC-CHECKOUT-003 | ⏳ PENDIENTE | Validaciones       | -                      |
| TC-CHECKOUT-004 | ⏳ PENDIENTE | Loading/Estados    | -                      |
| TC-CHECKOUT-005 | ⏳ PENDIENTE | Manejo de errores  | -                      |
| TC-CHECKOUT-006 | ⏳ PENDIENTE | Verificación BD    | -                      |
| TC-CHECKOUT-007 | ⏳ PENDIENTE | MP no configurado  | Ver sección específica |
| TC-CHECKOUT-008 | ⏳ PENDIENTE | EnvioPack fallback | Ver sección específica |

---

## 🐛 TROUBLESHOOTING

### Error: "Error al procesar el checkout"

**Causas posibles:**

1. Mercado Pago no configurado → Verificar `MP_ACCESS_TOKEN` en Vercel
2. Tabla no existe → Ejecutar SQL en Supabase
3. Error de conexión → Verificar red/Vercel status

**Solución:**

- Revisar logs en consola del navegador
- Revisar logs en Vercel Dashboard
- Verificar variables de entorno

---

### Error: "checkout-disabled"

**Causa:** Mercado Pago no está configurado

**Solución:**

1. Configurar `MP_ACCESS_TOKEN` en Vercel
2. Hacer REDEPLOY
3. Probar nuevamente

---

### Error: PGRST205

**Causa:** Tabla `ordenes` no existe

**Solución:**

1. Ejecutar SQL: `supabase/schemas/checkout-schema-completo.sql`
2. Esperar 1-2 minutos
3. Probar nuevamente

---

## ✅ CHECKLIST FINAL

Antes de considerar el checkout como funcional:

- [ ] Tabla `ordenes` existe en Supabase
- [ ] `MP_ACCESS_TOKEN` configurado en Vercel
- [ ] Flujo completo funciona sin errores
- [ ] Loading visible durante procesamiento
- [ ] Botón deshabilitado durante procesamiento
- [ ] Redirección a Mercado Pago funciona
- [ ] Mensajes de error claros y visibles
- [ ] Orden se guarda en Supabase
- [ ] Logs estructurados funcionando

---

### TC-CHECKOUT-007: Mercado Pago No Configurado

**Objetivo:** Verificar manejo cuando `MP_ACCESS_TOKEN` no está configurado

**Precondiciones:**

- `MP_ACCESS_TOKEN` NO configurado en Vercel
- Tabla `ordenes` existe en Supabase
- Productos disponibles

**Pasos:**

1. Completar checkout completo hasta "Pagar Ahora"
2. Click en "Pagar Ahora"
3. Observar respuesta del servidor

**Resultado esperado:**

- ✅ Error 503 (Service Unavailable)
- ✅ Mensaje claro: "El servicio de pago está temporalmente deshabilitado..."
- ✅ Instrucciones para configurar en Vercel
- ✅ Toast visible con duración extendida (6 segundos)
- ✅ Botón se habilita nuevamente
- ✅ NO crashea la aplicación

**Logs esperados en consola:**

```
[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] 📤 Creando preferencia MP...
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ Mercado Pago no configurado correctamente
[CHECKOUT][API] ❌ Mercado Pago no configurado (503)
[CHECKOUT][CLIENT] ❌ Error del servidor: {code: 'CHECKOUT_MP_NOT_CONFIGURED', ...}
```

**Logs esperados en Vercel:**

```
[MP-PAYMENT] 🔍 DIAGNÓSTICO COMPLETO DE VARIABLES DE ENTORNO
[MP-PAYMENT] Variables relacionadas con MP encontradas: 0
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ SOLUCIÓN: Hacer REDEPLOY después de agregar variables
```

---

### TC-CHECKOUT-008: EnvioPack No Configurado (Fallback)

**Objetivo:** Verificar que EnvioPack no rompe el checkout si no está configurado

**Precondiciones:**

- `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` NO configurados
- Tabla `ordenes` existe
- `MP_ACCESS_TOKEN` configurado

**Pasos:**

1. Ir a checkout
2. Completar datos personales
3. En método de envío, ingresar código postal válido (ej: "C1043AAX")
4. Observar métodos de envío disponibles
5. Seleccionar método
6. Continuar y completar compra

**Resultado esperado:**

- ✅ Métodos de envío se muestran (simulados)
- ✅ NO aparece error 500
- ✅ Checkout continúa funcionando normalmente
- ✅ Métodos simulados disponibles (OCA, Correo Argentino, Andreani)
- ✅ Precios calculados correctamente (simulados)

**Logs esperados:**

```
[ENVIOS][ENVIOPACK] ⚠️ Credenciales no configuradas, usando cálculo simulado
[ENVIOS][ENVIOPACK] ✅ Métodos simulados generados: 5
```

**Resultado actual esperado:**

- ✅ Checkout funciona completamente
- ✅ Métodos simulados se muestran
- ✅ No hay errores en consola relacionados con EnvioPack

---

### TC-CHECKOUT-009: Tabla de Órdenes No Existe (PGRST205)

**Objetivo:** Verificar manejo cuando tabla `ordenes` no existe

**Precondiciones:**

- Tabla `ordenes` NO existe en Supabase
- `MP_ACCESS_TOKEN` configurado (opcional para este test)

**Pasos:**

1. Completar checkout hasta "Pagar Ahora"
2. Click en "Pagar Ahora"
3. Observar respuesta del servidor

**Resultado esperado:**

- ✅ Error 500 con código `CHECKOUT_CREATE_ORDER_ERROR`
- ✅ Mensaje claro indicando que falta ejecutar SQL
- ✅ Instrucciones para ejecutar migración
- ✅ Menciona archivo: `supabase/schemas/checkout-schema-completo.sql`
- ✅ NO crashea la aplicación

**Respuesta esperada:**

```json
{
  "ok": false,
  "code": "CHECKOUT_CREATE_ORDER_ERROR",
  "message": "Error al crear la orden en la base de datos",
  "errorCode": "PGRST205",
  "hint": "Ejecuta el SQL en Supabase Dashboard → SQL Editor",
  "migrationFile": "supabase/schemas/checkout-schema-completo.sql"
}
```

**Logs esperados:**

```
[CHECKOUT][API] 📤 Creando orden en Supabase...
[ORDENES-SIMPLE] ❌ Error creando orden en Supabase:
[ORDENES-SIMPLE]    - Código: PGRST205
[ORDENES-SIMPLE]    - Mensaje: Could not find the table 'public.ordenes'
[CHECKOUT][API] ❌ Error creando orden: PGRST205
```

---

### TC-CHECKOUT-010: Stock Insuficiente Durante Checkout

**Objetivo:** Verificar validación de stock antes de crear orden

**Precondiciones:**

- Producto con stock limitado (ej: 2 unidades)
- Usuario tiene 3 unidades en carrito (más de lo disponible)

**Pasos:**

1. Agregar producto con stock limitado al carrito (más unidades de las disponibles)
2. Ir a checkout
3. Completar datos
4. Click en "Pagar Ahora"

**Resultado esperado:**

- ✅ Error 400 con código `CHECKOUT_INSUFFICIENT_STOCK`
- ✅ Mensaje claro: "Stock insuficiente para [producto] (Talle X). Disponible: Y"
- ✅ NO se crea orden en Supabase
- ✅ Toast visible con mensaje de error

**Logs esperados:**

```
[CHECKOUT][API] Validando stock para producto: {id}
[CHECKOUT][API] ❌ Stock insuficiente: disponible=2, solicitado=3
[CHECKOUT][API] Retornando error 400
```

---

## 🔍 Análisis de Logs para Debugging

### Logs Críticos a Buscar

#### ✅ Flujo Exitoso Completo

**Consola del navegador:**

```
[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}
[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...
```

**Vercel Dashboard:**

```
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] 📤 Creando preferencia MP...
[MP-PAYMENT] ✅ Token configurado correctamente
[MP-PAYMENT] ✅ Preferencia creada exitosamente
[CHECKOUT][API] ✅ Checkout completado exitosamente
```

#### ❌ Error: Mercado Pago No Configurado

**Vercel Dashboard:**

```
[MP-PAYMENT] 🔍 DIAGNÓSTICO COMPLETO DE VARIABLES DE ENTORNO
[MP-PAYMENT] Variables relacionadas con MP encontradas: 0
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ SOLUCIÓN: Hacer REDEPLOY después de agregar variables
[MP-PAYMENT] ❌ Mercado Pago no configurado correctamente
[CHECKOUT][API] ❌ Mercado Pago no configurado (503)
```

#### ❌ Error: Tabla No Existe (PGRST205)

**Vercel Dashboard:**

```
[CHECKOUT][API] 📤 Creando orden en Supabase...
[ORDENES-SIMPLE] ❌ Error creando orden en Supabase:
[ORDENES-SIMPLE]    - Código: PGRST205
[ORDENES-SIMPLE]    - Mensaje: Could not find the table 'public.ordenes'
[CHECKOUT][API] ❌ Error creando orden: PGRST205
```

---

## 📝 Notas de Implementación para QA

### Cómo Simular Escenarios de Error

#### Simular MP No Configurado:

1. Remover temporalmente `MP_ACCESS_TOKEN` de Vercel
2. Hacer redeploy
3. Probar checkout

#### Simular Tabla No Existe:

1. En Supabase Dashboard, eliminar tabla `ordenes` (temporalmente)
2. Probar checkout
3. Restaurar tabla después

#### Simular EnvioPack No Configurado:

1. Remover `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` de Vercel
2. Probar cálculo de envío
3. Verificar que usa fallback simulado

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ **LISTO PARA PRUEBAS**  
**Versión:** 2.0 (Mejorado con casos adicionales)
