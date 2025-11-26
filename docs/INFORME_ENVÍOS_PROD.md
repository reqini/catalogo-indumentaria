# 📊 Informe Técnico Integral: Sistema de Envíos y Checkout Productivo

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Estado:** ⚠️ **REQUIERE CONFIGURACIÓN Y MEJORAS**

---

## 🎯 RESUMEN EJECUTIVO

El sistema de compra, checkout y envíos está **80% implementado** pero opera en **modo simulado**. Para producción real se requiere:

1. **Configurar credenciales de Envíopack** (2 horas)
2. **Validar credenciales de Mercado Pago** (30 min)
3. **Completar retiro en local** (1 hora)
4. **Crear página de tracking para usuarios** (2 horas)
5. **Verificar y corregir tabla ordenes** (1 hora)

**Tiempo total estimado:** 6.5 horas

---

## 🔍 DIAGNÓSTICO TÉCNICO COMPLETO

### 1. CHECKOUT Y CREACIÓN DE ORDEN

#### ✅ Lo que funciona:

- **Frontend completo**: Formulario multi-paso funcional (`app/(ecommerce)/checkout/page.tsx`)
- **Validaciones**: Schema Zod con validación condicional para retiro en local
- **Cálculo de envío**: Integrado en el flujo de checkout
- **Integración MP**: Creación de preferencia funcional
- **Stock validation**: Verificación antes de crear orden

#### ⚠️ Problemas detectados:

1. **Endpoint duplicado**:
   - Existe `/api/checkout/create-order` (completo)
   - Existe `/api/checkout/create-order-simple` (simplificado)
   - El frontend usa `create-order-simple` pero debería usar `create-order`

2. **Datos enviados vs esperados**:
   - Frontend envía estructura simplificada (`productos`, `comprador`, `envio`)
   - Backend espera estructura completa (`cliente`, `direccion`, `items`)
   - **Inconsistencia**: Puede causar errores de validación

3. **Manejo de errores**:
   - Errores 400 bien manejados con mensajes claros
   - Errores 500 con mensajes técnicos (mejorar UX)

#### 📋 Datos que se envían:

```typescript
{
  productos: [{id, nombre, precio, cantidad, talle, subtotal, imagenPrincipal}],
  comprador: {nombre, email, telefono},
  envio: {
    tipo: 'estandar' | 'express' | 'retiro_local',
    metodo: string,
    costo: number,
    direccion?: {calle, numero, codigoPostal, localidad, provincia},
    demora?: string,
    proveedor?: string
  },
  total: number
}
```

#### 📋 Datos faltantes:

- ❌ `preference_id` no se guarda en orden después de crear preferencia MP
- ❌ `pago_estado` inicial no se establece explícitamente
- ❌ `pago_id` no se guarda hasta que webhook procesa
- ⚠️ Tracking number solo se genera después del pago (correcto)

---

### 2. TABLA "ORDENES" Y MODELO DE DATOS

#### ✅ Estructura actual:

```sql
CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### ⚠️ Problemas detectados:

1. **Campos faltantes**:
   - ❌ No hay campo `pago_preferencia_id`
   - ❌ No hay campo `pago_id`
   - ❌ No hay campo `pago_estado`
   - ❌ No hay campo `pago_fecha`
   - ❌ No hay campo `updated_at`

2. **Índices faltantes**:
   - ❌ No hay índice en `estado` (existe pero verificar)
   - ❌ No hay índice en `comprador->>email` para búsquedas
   - ❌ No hay índice en `envio->>tracking` para búsquedas

3. **RLS Policies**:
   - ✅ Políticas básicas configuradas
   - ⚠️ Permite acceso `anon` a todas las órdenes (revisar seguridad)

#### 🔧 Migración necesaria:

```sql
-- Agregar campos de pago
ALTER TABLE public.ordenes
  ADD COLUMN IF NOT EXISTS pago_preferencia_id TEXT,
  ADD COLUMN IF NOT EXISTS pago_id TEXT,
  ADD COLUMN IF NOT EXISTS pago_estado TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS pago_fecha TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Índices adicionales
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email'));
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking'));
```

---

### 3. INTEGRACIÓN CON SISTEMA DE ENVÍO

#### ✅ Lo que funciona:

- **Cálculo de costos**: Endpoint `/api/envios/calcular` funcional
- **Múltiples transportistas**: OCA, Andreani, Correo Argentino (simulados)
- **Envíopack preparado**: Código listo para usar API real
- **Creación post-pago**: Webhook MP crea envío automáticamente
- **Tracking**: Endpoint `/api/shipping/tracking/[trackingNumber]` existe

#### ⚠️ Problemas detectados:

1. **Envíopack no configurado**:
   - ❌ `ENVIOPACK_API_KEY` no configurado
   - ❌ `ENVIOPACK_API_SECRET` no configurado
   - ⚠️ Sistema funciona con cálculo simulado

2. **URL de API Envíopack**:
   - ⚠️ URL hardcodeada: `https://api.enviopack.com/cotizar`
   - ⚠️ Estructura de respuesta puede variar según versión API
   - ⚠️ Sin validación de formato de respuesta

3. **Tracking simulado**:
   - ⚠️ Tracking numbers generados: `TRACK-{timestamp}-{random}`
   - ⚠️ No se pueden rastrear realmente
   - ⚠️ Estados simulados en `getShippingStatus`

#### 📋 Datos requeridos para creación real:

```typescript
{
  codigoPostal: string,
  peso: number, // kg
  precio: number, // valor declarado
  provincia?: string,
  direccion: {
    calle: string,
    numero: string,
    pisoDepto?: string,
    localidad: string,
    provincia: string
  },
  cliente: {
    nombre: string,
    email: string,
    telefono?: string
  }
}
```

#### ✅ Datos disponibles:

- ✅ Todos los datos requeridos están disponibles en el checkout
- ✅ Se envían correctamente al webhook de MP
- ✅ Se usan para crear envío post-pago

---

### 4. INTEGRACIÓN CON MERCADO PAGO

#### ✅ Lo que funciona:

- **Creación de preferencia**: Endpoint `/api/pago` funcional
- **Items correctos**: Productos + envío como item separado
- **Payer completo**: Nombre, email, teléfono, dirección
- **Back URLs**: Success, failure, pending configuradas
- **External reference**: OrderId incluido correctamente
- **Webhook**: Endpoint `/api/mp/webhook` funcional
- **Idempotencia**: Manejo de pagos duplicados

#### ⚠️ Problemas detectados:

1. **Credenciales no configuradas**:
   - ❌ `MP_ACCESS_TOKEN` no detectado en producción
   - ❌ `NEXT_PUBLIC_MP_PUBLIC_KEY` no detectado
   - ⚠️ Sistema no puede crear preferencias reales

2. **Validación de firma webhook**:
   - ⚠️ `MP_WEBHOOK_SECRET` no configurado
   - ⚠️ Webhook funciona sin validación (riesgo de seguridad)

3. **Manejo de estados**:
   - ✅ Estados `approved`, `rejected`, `pending` manejados
   - ⚠️ Estado `in_process` no manejado explícitamente

#### 📋 Estructura de preferencia generada:

```typescript
{
  items: [
    {title, quantity, unit_price, id, talle},
    {title: "Envío - {metodo}", quantity: 1, unit_price: costo}
  ],
  payer: {
    name, email, phone: {area_code, number},
    address: {street_name, street_number, zip_code}
  },
  back_urls: {success, failure, pending},
  external_reference: orderId,
  notification_url: "/api/mp/webhook"
}
```

✅ **Estructura correcta y completa**

---

### 5. VALIDACIÓN DE TRACKING Y ESTADOS

#### ✅ Lo que funciona:

- **Endpoint de tracking**: `/api/shipping/tracking/[trackingNumber]` existe
- **Búsqueda de orden**: Por tracking number funcional
- **Estados básicos**: `pendiente`, `pagada`, `enviada`, `entregada`
- **Admin panel**: Visualización de tracking en lista y detalle

#### ⚠️ Problemas detectados:

1. **Página de tracking para usuarios**:
   - ❌ No existe `/envio/[trackingNumber]` para clientes
   - ❌ No hay link de tracking en página de éxito
   - ❌ No hay link de tracking en emails

2. **Actualización automática de estados**:
   - ⚠️ Webhook de envíos existe pero puede no recibir actualizaciones
   - ⚠️ Estados no se actualizan automáticamente sin webhook

3. **Visualización de tracking**:
   - ⚠️ Tracking solo visible en admin panel
   - ⚠️ Clientes no pueden consultar su tracking

---

## 🚨 RED FLAGS ACTUALES

### 🔴 CRÍTICO (Bloquea producción)

1. **Mercado Pago no configurado**
   - **Impacto**: No se pueden procesar pagos reales
   - **Solución**: Configurar `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` en Vercel

2. **Envíopack no configurado**
   - **Impacto**: Costos de envío son estimados, no reales
   - **Solución**: Configurar `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` en Vercel

3. **Tabla ordenes incompleta**
   - **Impacto**: No se guardan datos de pago, difícil tracking
   - **Solución**: Ejecutar migración SQL para agregar campos faltantes

### 🟡 ALTO (Afecta experiencia)

4. **Endpoint inconsistente**
   - **Impacto**: Frontend usa endpoint simplificado, puede causar errores
   - **Solución**: Unificar endpoints o ajustar frontend

5. **Tracking no visible para usuarios**
   - **Impacto**: Clientes no pueden rastrear sus envíos
   - **Solución**: Crear página `/envio/[trackingNumber]` y agregar links

6. **Retiro en local incompleto**
   - **Impacto**: Clientes no saben dónde retirar
   - **Solución**: Configurar variables de entorno y mostrar información

### 🟢 MEDIO (Mejoras)

7. **Validación de firma webhook**
   - **Impacto**: Riesgo de seguridad
   - **Solución**: Configurar `MP_WEBHOOK_SECRET` y `ENVIOPACK_WEBHOOK_SECRET`

8. **Autocompletado de CP**
   - **Impacto**: UX mejorable
   - **Solución**: Integrar API de códigos postales de Argentina

---

## 📋 LISTA PRIORIZADA DE TAREAS

### 🔴 PRIORIDAD CRÍTICA (Hacer YA)

1. **Configurar Mercado Pago** (30 min)
   - [ ] Agregar `MP_ACCESS_TOKEN` en Vercel (Production)
   - [ ] Agregar `NEXT_PUBLIC_MP_PUBLIC_KEY` en Vercel (Production)
   - [ ] Agregar `MP_WEBHOOK_SECRET` en Vercel (Production)
   - [ ] Hacer REDEPLOY
   - [ ] Verificar creación de preferencia

2. **Configurar Envíopack** (2 horas)
   - [ ] Crear cuenta en Envíopack
   - [ ] Obtener credenciales API
   - [ ] Agregar `ENVIOPACK_API_KEY` en Vercel (Production)
   - [ ] Agregar `ENVIOPACK_API_SECRET` en Vercel (Production)
   - [ ] Agregar `ENVIOPACK_WEBHOOK_SECRET` en Vercel (Production)
   - [ ] Configurar webhook en Envíopack Dashboard
   - [ ] Hacer REDEPLOY
   - [ ] Probar cálculo real

3. **Migrar tabla ordenes** (1 hora)
   - [ ] Ejecutar migración SQL para agregar campos de pago
   - [ ] Verificar que migración se aplicó correctamente
   - [ ] Actualizar código para usar nuevos campos
   - [ ] Probar creación de orden con nuevos campos

### 🟡 PRIORIDAD ALTA (Esta semana)

4. **Unificar endpoints de checkout** (1 hora)
   - [ ] Decidir: usar `create-order` o `create-order-simple`
   - [ ] Actualizar frontend para usar endpoint unificado
   - [ ] Eliminar endpoint duplicado
   - [ ] Probar flujo completo

5. **Crear página de tracking** (2 horas)
   - [ ] Crear `app/(ecommerce)/envio/[trackingNumber]/page.tsx`
   - [ ] Agregar link en página de éxito
   - [ ] Agregar link en emails de notificación
   - [ ] Probar visualización de tracking

6. **Completar retiro en local** (1 hora)
   - [ ] Configurar variables de entorno
   - [ ] Actualizar componente para mostrar información
   - [ ] Agregar información en página de éxito
   - [ ] Agregar información en emails

### 🟢 PRIORIDAD MEDIA (Próximas semanas)

7. **Mejorar validación webhook** (1 hora)
8. **Autocompletado de CP** (4 horas)
9. **Generación de etiquetas PDF** (3 horas)
10. **Notificaciones mejoradas** (2 horas)

---

## 🎯 RECOMENDACIÓN DE PROVEEDOR DE ENVÍOS

### 🥇 **ENVIOPACK** - RECOMENDADO

**Razones:**

1. ✅ Código ya implementado (solo falta configurar credenciales)
2. ✅ API completa y bien documentada
3. ✅ Acceso a múltiples transportistas (OCA, Andreani, Correo Argentino)
4. ✅ Tiempo de implementación mínimo (1-2 días)
5. ✅ Funcionalidades avanzadas (webhooks, etiquetas PDF, tracking)

**Alternativas evaluadas:**

- **ShipNow**: Buena opción pero requiere integración desde cero
- **OCA Directo**: Requiere cuenta corriente y proceso largo
- **Andreani Directo**: Tarifas más altas, integración compleja

**Decisión:** **Envíopack** es la mejor opción porque el código ya está preparado y solo requiere configuración.

---

## 📊 ESTIMACIÓN TÉCNICA + IMPACTO UX

| Tarea                | Tiempo  | Impacto UX | Prioridad  |
| -------------------- | ------- | ---------- | ---------- |
| Configurar MP        | 30 min  | 🔴 CRÍTICO | 🔴 CRÍTICA |
| Configurar Envíopack | 2 horas | 🔴 CRÍTICO | 🔴 CRÍTICA |
| Migrar tabla ordenes | 1 hora  | 🟡 ALTO    | 🔴 CRÍTICA |
| Unificar endpoints   | 1 hora  | 🟡 ALTO    | 🟡 ALTA    |
| Página de tracking   | 2 horas | 🟡 ALTO    | 🟡 ALTA    |
| Retiro en local      | 1 hora  | 🟡 ALTO    | 🟡 ALTA    |
| Validación webhook   | 1 hora  | 🟢 MEDIO   | 🟢 MEDIA   |
| Autocompletado CP    | 4 horas | 🟢 MEDIO   | 🟢 MEDIA   |
| Etiquetas PDF        | 3 horas | 🟢 MEDIO   | 🟢 MEDIA   |

**Total crítico:** 3.5 horas  
**Total alta:** 4 horas  
**Total medio:** 8 horas

---

## 🚀 PASOS EXACTOS PARA HABILITAR SISTEMA PRODUCTIVO

### Paso 1: Configurar Mercado Pago (30 min)

1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Credenciales → Producción
3. Copiar `Access Token` y `Public Key`
4. Vercel Dashboard → Settings → Environment Variables → Production
5. Agregar:
   ```
   MP_ACCESS_TOKEN=APP_USR-tu_token_aqui
   NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_tu_public_key_aqui
   MP_WEBHOOK_SECRET=tu_webhook_secret_aqui
   ```
6. Webhooks → Agregar webhook:
   - URL: `https://catalogo-indumentaria.vercel.app/api/mp/webhook`
   - Eventos: `payment`
7. Hacer REDEPLOY en Vercel
8. Probar creación de preferencia

### Paso 2: Configurar Envíopack (2 horas)

1. Crear cuenta en https://enviopack.com
2. Dashboard → API → Credenciales
3. Copiar `API Key` y `API Secret`
4. Vercel Dashboard → Settings → Environment Variables → Production
5. Agregar:
   ```
   ENVIOPACK_API_KEY=tu_api_key_aqui
   ENVIOPACK_API_SECRET=tu_api_secret_aqui
   ENVIOPACK_WEBHOOK_SECRET=tu_webhook_secret_aqui
   ```
6. Envíopack Dashboard → Webhooks → Agregar:
   - URL: `https://catalogo-indumentaria.vercel.app/api/shipping/webhook`
   - Eventos: `envio.actualizado`, `envio.entregado`, `envio.en_transito`
7. Hacer REDEPLOY en Vercel
8. Probar cálculo real con CP de prueba

### Paso 3: Migrar tabla ordenes (1 hora)

1. Supabase Dashboard → SQL Editor
2. Ejecutar migración (ver sección "Migración necesaria" arriba)
3. Verificar que campos se agregaron correctamente
4. Actualizar código para usar nuevos campos
5. Probar creación de orden

### Paso 4: Completar retiro en local (1 hora)

1. Vercel Dashboard → Settings → Environment Variables → Production
2. Agregar:
   ```
   LOCAL_RETIRO_DIRECCION="Av. Corrientes 1234, CABA"
   LOCAL_RETIRO_HORARIOS="Lunes a Viernes: 9:00 - 18:00"
   LOCAL_RETIRO_TELEFONO="+54 11 1234-5678"
   ```
3. Hacer REDEPLOY
4. Verificar que información se muestra en checkout y página de éxito

### Paso 5: Crear página de tracking (2 horas)

1. Crear `app/(ecommerce)/envio/[trackingNumber]/page.tsx`
2. Agregar link en página de éxito (`app/(ecommerce)/pago/success/page.tsx`)
3. Agregar link en emails de notificación
4. Probar visualización de tracking

---

## ✅ CHECKLIST DE PRODUCCIÓN

### Antes de Abrir al Público:

- [ ] Mercado Pago configurado y probado
- [ ] Envíopack configurado y probado
- [ ] Tabla ordenes migrada correctamente
- [ ] Retiro en local completo
- [ ] Página de tracking creada
- [ ] Flujo completo probado end-to-end
- [ ] Sin errores 500 en creación de orden
- [ ] Sin errores en webhooks
- [ ] Tracking visible para usuarios
- [ ] Admin panel muestra tracking correctamente

---

**Última actualización:** 2024-11-26  
**Estado:** ⚠️ **REQUIERE CONFIGURACIÓN INMEDIATA**
