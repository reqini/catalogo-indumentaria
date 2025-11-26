# 📊 Informe: Estado Productivo del Checkout

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Prioridad:** 🔴 **CRÍTICA**  
**Estado:** ⚠️ **PARCIALMENTE FUNCIONAL**

---

## 📋 Resumen Ejecutivo

### ✅ Qué Funciona Correctamente

1. **Carrito de compras:**
   - Agregar productos al carrito ✅
   - Persistencia en localStorage ✅
   - Actualización de cantidades ✅
   - Eliminación de productos ✅
   - Cálculo de totales ✅

2. **Checkout - Datos personales:**
   - Formulario multi-step funcional ✅
   - Validación con Zod ✅
   - Mensajes de error claros ✅
   - Navegación entre steps ✅

3. **Cálculo de envío:**
   - Cálculo simulado funciona ✅
   - Fallback robusto si EnvioPack falla ✅
   - NO rompe el checkout si hay error ✅
   - Opción "Retiro en local" funcional ✅

4. **Creación de orden en Supabase:**
   - Validación de stock ✅
   - Validación de datos ✅
   - Intento automático de crear tabla si no existe ✅
   - Logs estructurados ✅

### ❌ Qué NO Funciona o Está Roto

1. **Mercado Pago - Configuración:**
   - ⚠️ **CRÍTICO:** `MP_ACCESS_TOKEN` puede no estar configurado en Vercel
   - Si no está configurado, retorna 503 (no rompe el sitio, pero bloquea pagos)
   - Mensaje de error claro, pero requiere acción manual

2. **Tabla de órdenes en Supabase:**
   - ⚠️ Tabla `public.ordenes` puede no existir
   - Si no existe, retorna PGRST205 con instrucciones SQL
   - Intento automático de creación puede fallar

3. **Webhook de Mercado Pago:**
   - ⚠️ Endpoint existe (`/api/mp/webhook`) pero requiere validación completa
   - Verificación de firma puede no estar completamente implementada

---

## 🗺️ Mapa de Funcionalidades del Flujo de Compra

| Funcionalidad                          | Estado      | Detalle                                              |
| -------------------------------------- | ----------- | ---------------------------------------------------- |
| **Agregar al carrito**                 | ✅ Funciona | CartContext + localStorage funcionando correctamente |
| **Actualizar cantidades en carrito**   | ✅ Funciona | Validación de stock en frontend                      |
| **Eliminar productos del carrito**     | ✅ Funciona | Remoción inmediata del estado                        |
| **Pasar del carrito al checkout**      | ✅ Funciona | Redirección a `/checkout` funcional                  |
| **Completar datos personales**         | ✅ Funciona | Validación Zod, mensajes claros                      |
| **Seleccionar método de envío**        | ✅ Funciona | Cálculo simulado siempre disponible                  |
| **Calcular envío con EnvioPack**       | ⚠️ Parcial  | Funciona si está configurado, fallback si no         |
| **Crear orden en Supabase**            | ⚠️ Parcial  | Funciona si tabla existe, error claro si no          |
| **Validar stock antes de crear orden** | ✅ Funciona | Validación exhaustiva en backend                     |
| **Crear preference en Mercado Pago**   | ❌ Roto     | **FALLA SI `MP_ACCESS_TOKEN` NO ESTÁ CONFIGURADO**   |
| **Redirigir al pago**                  | ⚠️ Parcial  | Funciona solo si MP preference se crea exitosamente  |
| **Recibir vuelta de Mercado Pago**     | ⚠️ Parcial  | Páginas existen, pero webhook requiere validación    |
| **Actualizar orden desde webhook**     | ⚠️ Parcial  | Endpoint existe pero requiere validación completa    |

---

## 🔍 Mercado Pago – Análisis Detallado

### Endpoint y Función Donde Se Integra

**Endpoint:** `POST /api/pago`  
**Archivo:** `app/api/pago/route.ts`  
**Función:** `export async function POST(request: Request)`

### Payload Actual que Se Envía a la API

**Endpoint de Mercado Pago:** `https://api.mercadopago.com/checkout/preferences`

**Payload enviado:**

```json
{
  "items": [
    {
      "title": "Producto (Talle M)",
      "quantity": 1,
      "unit_price": 5000,
      "description": "Talle: M"
    },
    {
      "title": "Envío - OCA Estándar",
      "quantity": 1,
      "unit_price": 2500,
      "description": "Envío - OCA Estándar"
    }
  ],
  "back_urls": {
    "success": "https://catalogo-indumentaria.vercel.app/pago/success?orderId=...",
    "failure": "https://catalogo-indumentaria.vercel.app/pago/failure?orderId=...",
    "pending": "https://catalogo-indumentaria.vercel.app/pago/pending?orderId=..."
  },
  "notification_url": "https://catalogo-indumentaria.vercel.app/api/mp/webhook",
  "statement_descriptor": "CATALOGO INDUMENTARIA",
  "external_reference": "orderId-uuid",
  "payer": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": {
      "area_code": "",
      "number": "+54 11 1234-5678"
    },
    "address": {
      "street_name": "Av. Corrientes",
      "street_number": 1234,
      "zip_code": "C1043AAX"
    }
  },
  "payment_methods": {
    "excluded_payment_types": [],
    "installments": 12
  },
  "additional_info": {
    "items": [...]
  },
  "auto_return": "approved"
}
```

**Headers:**

```
Authorization: Bearer {MP_ACCESS_TOKEN}
Content-Type: application/json
```

### Respuesta Real de la API Cuando Falla

#### Escenario 1: Token No Configurado

**Status:** `503 Service Unavailable`

**Respuesta:**

```json
{
  "error": "checkout-disabled",
  "message": "El servicio de pago está temporalmente deshabilitado. Estamos actualizando la configuración.",
  "details": "Las variables de entorno no están disponibles en este deployment. Por favor, verifica que MP_ACCESS_TOKEN esté configurado en Vercel Dashboard y haz un redeploy.",
  "technical": {
    "hasToken": false,
    "hasTokenDirect": false,
    "hasTokenConfig": false,
    "errors": ["MP_ACCESS_TOKEN no está configurado"],
    "environment": "production",
    "allMPVars": []
  },
  "help": {
    "local": "Configura MP_ACCESS_TOKEN en .env.local",
    "production": "Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables → Production",
    "redeploy": "Después de agregar la variable, haz REDEPLOY en Vercel"
  }
}
```

#### Escenario 2: Token Inválido o Expirado

**Status:** `401 Unauthorized` o `400 Bad Request` (según MP)

**Respuesta de Mercado Pago:**

```json
{
  "message": "Invalid access token",
  "error": "unauthorized",
  "status": 401,
  "cause": []
}
```

#### Escenario 3: Datos Inválidos en Payload

**Status:** `400 Bad Request`

**Respuesta de Mercado Pago:**

```json
{
  "message": "Invalid request",
  "error": "bad_request",
  "status": 400,
  "cause": [
    {
      "code": "invalid_field",
      "description": "items[0].unit_price must be greater than 0",
      "data": null
    }
  ]
}
```

### Hipótesis y Confirmación de Causa Raíz

#### ✅ Hipótesis 1: Access Token Inválido o Inexistente

**Confirmación:** ✅ **CONFIRMADO**

**Evidencia:**

- Logs muestran: `[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP`
- Validación retorna: `hasToken: false`
- Respuesta 503 con mensaje claro sobre configuración

**Causa raíz:**

- Variable `MP_ACCESS_TOKEN` no está configurada en Vercel Dashboard
- O está configurada pero no se hizo REDEPLOY después de agregarla

**Solución:**

1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Agregar `MP_ACCESS_TOKEN` con valor del token de Mercado Pago
3. Seleccionar todos los ambientes (Production, Preview, Development)
4. **Hacer REDEPLOY** (crítico)

---

#### ⚠️ Hipótesis 2: Falta de Campo Obligatorio

**Confirmación:** ⚠️ **POSIBLE PERO NO CONFIRMADO**

**Evidencia:**

- Código valida todos los campos antes de enviar
- Zod schema valida estructura completa
- Pero si Mercado Pago cambia requerimientos, puede fallar

**Causa raíz potencial:**

- Cambios en API de Mercado Pago
- Campos nuevos requeridos que no están en el payload

**Solución:**

- Revisar documentación oficial de MP
- Agregar campos faltantes si es necesario

---

#### ⚠️ Hipótesis 3: URL de Notificación Inválida

**Confirmación:** ⚠️ **POSIBLE PERO NO CONFIRMADO**

**Evidencia:**

- `notification_url` se construye desde `baseUrl`
- Si `NEXT_PUBLIC_BASE_URL` no está configurado, usa fallback
- Fallback puede ser `localhost` en desarrollo

**Causa raíz potencial:**

- `notification_url` apunta a localhost en producción
- Mercado Pago no puede alcanzar localhost

**Solución:**

- Verificar que `NEXT_PUBLIC_BASE_URL` esté configurado en producción
- Asegurar que `notification_url` sea URL pública válida

---

#### ⚠️ Hipótesis 4: Usando Credenciales de Sandbox en Prod o Viceversa

**Confirmación:** ⚠️ **POSIBLE PERO NO CONFIRMADO**

**Evidencia:**

- Código detecta si token es de producción (`APP_USR-`) o sandbox (`TEST-`)
- Logs muestran: `Tipo: PRODUCCIÓN` o `Tipo: TEST`
- Pero no hay validación cruzada con ambiente de Vercel

**Causa raíz potencial:**

- Token de sandbox usado en producción
- Token de producción usado en desarrollo

**Solución:**

- Validar que token coincida con ambiente
- Usar tokens diferentes según `VERCEL_ENV`

---

### Recomendaciones Concretas para Corregirlo

#### Prioridad 1: Configurar MP_ACCESS_TOKEN (CRÍTICO)

1. **Obtener token de Mercado Pago:**
   - Ir a https://www.mercadopago.com.ar/developers/panel
   - Seleccionar aplicación (o crear nueva)
   - Copiar Access Token (empieza con `APP_USR-` o `TEST-`)

2. **Configurar en Vercel:**
   - Dashboard → Proyecto → Settings → Environment Variables
   - Agregar:
     - Key: `MP_ACCESS_TOKEN`
     - Value: Token copiado
     - Environment: Production, Preview, Development
   - Guardar

3. **Hacer REDEPLOY:**
   - Deployments → Último deployment → Redeploy
   - O hacer push a `main` para trigger automático

4. **Verificar:**
   - Probar checkout nuevamente
   - Revisar logs en Vercel Dashboard
   - Buscar: `[MP-PAYMENT] ✅ Token configurado correctamente`

---

#### Prioridad 2: Verificar Tabla de Órdenes (CRÍTICO)

1. **Ejecutar SQL en Supabase:**
   - Ir a https://supabase.com/dashboard
   - SQL Editor → New query
   - Copiar contenido de `supabase/schemas/checkout-schema-completo.sql`
   - Ejecutar
   - Verificar: "Success. No rows returned"

2. **Verificar tabla existe:**
   - Table Editor → Buscar tabla `ordenes`
   - Verificar estructura coincide con schema

---

#### Prioridad 3: Validar URLs de Callback (IMPORTANTE)

1. **Verificar `NEXT_PUBLIC_BASE_URL`:**
   - Debe estar configurado en Vercel
   - Valor: `https://catalogo-indumentaria.vercel.app`

2. **Verificar `notification_url`:**
   - Debe ser URL pública válida
   - No puede ser localhost en producción

---

## 📦 Envíos / EnvioPack – Análisis

### ¿Se Está Llamando Correctamente?

**Sí**, pero con fallback robusto:

1. **Si está configurado:**
   - Llama a `https://api.enviopack.com/cotizar`
   - Usa `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET`
   - Transforma respuesta a formato interno

2. **Si NO está configurado o falla:**
   - Usa `calcularEnvioSimulado()` automáticamente
   - NO rompe el checkout
   - Muestra métodos simulados (OCA, Correo Argentino, Andreani)

### ¿Qué Pasa Si Falla?

**✅ NO rompe el checkout**

**Comportamiento:**

- Si API falla → fallback a simulado
- Si credenciales faltan → fallback a simulado
- Si timeout → fallback a simulado
- Logs claros: `[ENVIOS][ENVIOPACK] ⚠️ Usando cálculo simulado como fallback`

### ¿Rompe el Checkout o No?

**✅ NO rompe el checkout**

**Evidencia:**

- Código tiene `try/catch` completo
- Siempre retorna métodos (simulados si es necesario)
- No lanza errores que bloqueen el flujo

### Estado Actual

**Operativo con fallback**

- ✅ Funciona siempre (real o simulado)
- ✅ NO requiere configuración para funcionar básico
- ⚠️ Requiere credenciales para cálculo real
- ✅ Logs claros sobre qué método se usa

---

## ⚠️ Riesgos y Puntos Críticos

### 1. Usuario Se Queda Sin Feedback

**Riesgo:** MEDIO

**Escenarios:**

- Si Mercado Pago falla silenciosamente (aunque código maneja esto bien)
- Si redirección falla sin mensaje

**Mitigación actual:**

- ✅ Mensajes de error claros en UI
- ✅ Toasts visibles con duración extendida
- ✅ Logs estructurados para debugging

**Mejora recomendada:**

- Agregar página de error dedicada si redirección falla
- Enviar email al usuario si orden se crea pero pago falla

---

### 2. Estados de "Orden Creada en DB Pero Pago Fallido"

**Riesgo:** ALTO

**Escenario:**

- Orden se crea en Supabase con `estado: 'pendiente'`
- Mercado Pago falla al crear preference
- Orden queda "huérfana" en estado pendiente

**Mitigación actual:**

- ⚠️ Orden se crea ANTES de crear preference MP
- ⚠️ Si MP falla, orden queda pendiente sin `pago_preferencia_id`

**Mejora recomendada:**

- Crear orden SOLO después de crear preference MP exitosamente
- O marcar orden como "error_pago" si MP falla
- Agregar job de limpieza para órdenes pendientes > 24hs

---

### 3. Logs Suficientes para Debuggear Producción

**Riesgo:** BAJO

**Estado actual:**

- ✅ Logs estructurados con prefijos claros
- ✅ Logs detallados en cada paso crítico
- ✅ Logs de errores con stack traces

**Mejora recomendada:**

- Agregar correlation ID para rastrear requests completos
- Enviar logs críticos a servicio externo (Sentry, LogRocket, etc.)

---

## 🎯 Plan de Mejoras Priorizado

### Prioridad 1: Corregir Causa Raíz de Mercado Pago (CRÍTICO)

**Tareas:**

1. ✅ Configurar `MP_ACCESS_TOKEN` en Vercel Dashboard
2. ✅ Hacer REDEPLOY después de configurar
3. ✅ Verificar que token se lee correctamente en logs
4. ⚠️ Validar que token es válido haciendo test request a MP API

**Tiempo estimado:** 15 minutos

**Impacto:** 🔴 **CRÍTICO** - Sin esto, NO se pueden procesar pagos

---

### Prioridad 2: Blindar EnvioPack para que Nunca Rompa el Flujo (ALTA)

**Tareas:**

1. ✅ Ya implementado - fallback robusto existe
2. ⚠️ Agregar test para verificar fallback funciona
3. ⚠️ Documentar comportamiento de fallback

**Tiempo estimado:** 30 minutos

**Impacto:** 🟡 **MEDIO** - Ya está implementado, solo requiere validación

---

### Prioridad 3: Mejorar Mensajes de Error en UI (MEDIA)

**Tareas:**

1. ✅ Ya implementado - mensajes claros y visibles
2. ⚠️ Agregar página de error dedicada para casos críticos
3. ⚠️ Enviar email al usuario si pago falla después de crear orden

**Tiempo estimado:** 2 horas

**Impacto:** 🟡 **MEDIO** - Mejora UX pero no bloquea funcionalidad

---

### Prioridad 4: Añadir Más Logs Útiles para Futuras Incidencias (BAJA)

**Tareas:**

1. ⚠️ Agregar correlation ID a todos los requests
2. ⚠️ Enviar logs críticos a servicio externo
3. ⚠️ Agregar métricas de éxito/fallo de checkout

**Tiempo estimado:** 4 horas

**Impacto:** 🟢 **BAJO** - Mejora debugging pero no es crítico

---

### Prioridad 5: Manejar Órdenes Huérfanas (MEDIA)

**Tareas:**

1. ⚠️ Crear orden SOLO después de crear preference MP exitosamente
2. ⚠️ O marcar orden como "error_pago" si MP falla
3. ⚠️ Agregar job de limpieza para órdenes pendientes > 24hs

**Tiempo estimado:** 3 horas

**Impacto:** 🟡 **MEDIO** - Previene datos inconsistentes en BD

---

## 📊 Resumen de Estado por Componente

| Componente              | Estado                      | Bloqueante              | Acción Requerida                          |
| ----------------------- | --------------------------- | ----------------------- | ----------------------------------------- |
| **Carrito**             | ✅ Funcional                | No                      | Ninguna                                   |
| **Checkout UI**         | ✅ Funcional                | No                      | Ninguna                                   |
| **Validación de datos** | ✅ Funcional                | No                      | Ninguna                                   |
| **Cálculo de envío**    | ✅ Funcional (con fallback) | No                      | Opcional: Configurar EnvioPack            |
| **Creación de orden**   | ⚠️ Parcial                  | Sí (si tabla no existe) | Ejecutar SQL en Supabase                  |
| **Mercado Pago**        | ❌ Roto                     | **SÍ**                  | **Configurar MP_ACCESS_TOKEN + REDEPLOY** |
| **Redirección a MP**    | ⚠️ Parcial                  | Sí (depende de MP)      | Depende de MP                             |
| **Webhook MP**          | ⚠️ Parcial                  | No                      | Validar implementación completa           |

---

## ✅ Checklist de Acciones Inmediatas

- [ ] **CRÍTICO:** Configurar `MP_ACCESS_TOKEN` en Vercel Dashboard
- [ ] **CRÍTICO:** Hacer REDEPLOY después de configurar token
- [ ] **CRÍTICO:** Ejecutar SQL en Supabase si tabla `ordenes` no existe
- [ ] Verificar que `NEXT_PUBLIC_BASE_URL` esté configurado
- [ ] Probar flujo completo después de configuraciones
- [ ] Revisar logs en Vercel Dashboard después de prueba
- [ ] Verificar que orden se crea en Supabase después de compra exitosa

---

**Última actualización:** 2024-11-26  
**Versión del informe:** 1.0  
**Próxima revisión:** Después de implementar mejoras priorizadas
