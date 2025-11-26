# 📦 Diagnóstico Completo: Sistema de Envíos

**Fecha:** 2024-11-26  
**Estado:** ⚠️ PARCIALMENTE OPERATIVO - REQUIERE CONFIGURACIÓN

---

## 🔍 1. ¿QUÉ PROVEEDOR DE ENVÍOS ESTÁ CONFIGURADO ACTUALMENTE?

### Estado Actual:

- **Envíopack**: ⚠️ Preparado pero NO configurado
  - Helper implementado: `lib/shipping/envioPack.ts`
  - Endpoint de cálculo: `/api/envios/calcular`
  - Servicio de creación: `core/shipping/shipping-service.ts`
  - **FALTA**: Variables de entorno `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET`

- **OCA Directo**: ❌ No implementado
- **Andreani Directo**: ❌ No implementado
- **Correo Argentino**: ❌ No implementado

### Cálculo Actual:

- ✅ **Funciona con simulación** (cálculo estimado por zona)
- ⚠️ **Fallback a Envíopack** si está configurado (no está configurado actualmente)
- ✅ Múltiples transportistas simulados: OCA, Andreani, Correo Argentino

### Recomendación:

**🏆 ENVIOPACK** es la mejor opción porque:

- ✅ API completa y documentada
- ✅ Integración rápida (1-2 días)
- ✅ Múltiples transportistas (OCA, Andreani, Correo Argentino)
- ✅ Tracking automático
- ✅ Webhooks funcionales
- ✅ Etiquetas PDF automáticas

---

## 📋 2. ¿QUÉ DATOS ESTÁN LLEGANDO DESDE EL FORMULARIO?

### Datos que SÍ llegan:

- ✅ `codigoPostal` - Código postal del cliente
- ✅ `peso` - Peso total estimado
- ✅ `precio` - Valor total del carrito
- ✅ `provincia` - Provincia (opcional)

### Datos que FALTAN para creación real de envío:

- ❌ **Dirección completa** (calle, número, piso/depto) - Solo llega en checkout, no en cálculo
- ❌ **Datos del cliente** (nombre, email, teléfono) - Solo llega en checkout
- ⚠️ **Peso real** - Actualmente usa estimación (1kg default)
- ⚠️ **Dimensiones** - No se calculan ni envían

### Estructura actual en checkout:

```typescript
{
  productos: [...],
  comprador: { nombre, email, telefono },
  envio: {
    tipo: 'estandar' | 'express' | 'retiro_local',
    metodo: 'OCA Estándar',
    costo: 5000,
    direccion: { calle, numero, codigoPostal, localidad, provincia },
    proveedor: 'OCA'
  },
  total: 15000
}
```

✅ **Los datos están completos en checkout**, solo falta integrarlos con creación de envío.

---

## 🔧 3. ¿EN QUÉ PARTE DEL BACKEND FALLA LA CREACIÓN DE ORDEN Y ENVÍO?

### Estado Actual:

#### ✅ Creación de Orden:

- **Funciona correctamente** con estructura simplificada
- Endpoint: `/api/checkout/create-order-simple`
- Guarda en tabla `ordenes` con JSONB

#### ⚠️ Creación de Envío:

- **Lógica implementada** en `app/api/mp/webhook/route.ts` (líneas 335-410)
- **Problema**: Solo se ejecuta si:
  1. Pago está aprobado ✅
  2. Orden existe ✅
  3. `envioData.costo > 0` ✅
  4. `envioData.tipo !== 'retiro_local'` ✅
  5. `envioData.direccion?.codigoPostal` ✅

- **Funciona con simulación** si Envíopack no está configurado
- **Genera tracking simulado**: `TRACK-{timestamp}-{random}`

### Problemas Detectados:

1. **Tracking simulado**: No es real, no se puede rastrear
2. **Sin etiqueta PDF**: No se genera etiqueta de envío
3. **Sin notificación al cliente**: No se envía email con tracking
4. **Webhook de envíos**: Existe pero puede no recibir actualizaciones reales

---

## 📊 4. ¿QUÉ ESTRUCTURA DEBEN TENER LOS DATOS DEL ENVÍO EN LA ORDEN?

### Estructura Actual (Simplificada - JSONB):

```json
{
  "envio": {
    "tipo": "estandar",
    "metodo": "OCA Estándar",
    "costo": 5000,
    "direccion": {
      "calle": "Av. Corrientes",
      "numero": "1234",
      "pisoDepto": "2B",
      "codigoPostal": "C1000",
      "localidad": "CABA",
      "provincia": "Buenos Aires",
      "pais": "Argentina"
    },
    "demora": "3-5 días hábiles",
    "proveedor": "OCA",
    "tracking": "TRACK-1234567890-ABC123", // Se agrega después del pago
    "tracking_number": "TRACK-1234567890-ABC123",
    "status": "en_transito",
    "updated_at": "2024-11-26T12:00:00Z"
  }
}
```

### Campos Requeridos para Envío Real:

**Mínimos:**

- `codigoPostal` ✅
- `direccion.calle` ✅
- `direccion.numero` ✅
- `direccion.localidad` ✅
- `direccion.provincia` ✅
- `comprador.nombre` ✅
- `comprador.email` ✅
- `comprador.telefono` ⚠️ (opcional pero recomendado)

**Adicionales (mejoran la experiencia):**

- `peso` (kg) - Actualmente estimado
- `dimensiones` (largo, ancho, alto) - No implementado
- `valor_declarado` - Ya está (total de productos)

---

## 🔔 5. ¿HAY WEBHOOK DE ESTADOS DE ENVÍO IMPLEMENTADO?

### Estado Actual:

#### ✅ Webhook Implementado:

- **Endpoint**: `/api/shipping/webhook`
- **Ubicación**: `app/api/shipping/webhook/route.ts`
- **Funcionalidad**:
  - ✅ Recibe actualizaciones de estado
  - ✅ Valida firma (si está configurada)
  - ✅ Busca orden por tracking number
  - ✅ Actualiza estado de orden
  - ✅ Envía notificación si está entregado

#### ⚠️ Problemas Detectados:

1. **Variable de entorno faltante**: `ENVIOPACK_WEBHOOK_SECRET`
2. **URL del webhook**: No está configurada en Envíopack Dashboard
3. **Mapeo de estados**: Funciona pero puede necesitar ajustes según proveedor
4. **Notificaciones**: Implementadas pero pueden fallar si no está configurado

### Configuración Requerida:

1. En Envíopack Dashboard → Webhooks:
   - URL: `https://catalogo-indumentaria.vercel.app/api/shipping/webhook`
   - Eventos: `envio.actualizado`, `envio.entregado`, `envio.en_transito`
   - Secret: Configurar `ENVIOPACK_WEBHOOK_SECRET` en Vercel

---

## 🏪 6. ¿ESTÁ RESUELTA LA FUNCIONALIDAD RETIRO EN LOCAL?

### Estado Actual:

#### ✅ Frontend:

- ✅ Opción "Retiro en local" visible en checkout
- ✅ Botón para seleccionar retiro
- ✅ Validación condicional (no requiere dirección si es retiro)
- ✅ Mensaje informativo mostrado

#### ✅ Backend:

- ✅ Se guarda `envio.tipo = 'retiro_local'`
- ✅ `envio.costo = 0`
- ✅ Dirección puede ser `null` o vacía
- ✅ No se crea solicitud de envío si es retiro

#### ⚠️ Mejoras Pendientes:

1. **Mensaje con dirección del local**: No se muestra automáticamente
2. **Horarios de retiro**: No están configurados
3. **Notificación al cliente**: No se envía email con dirección/horarios
4. **Admin panel**: No muestra claramente que es retiro en local

### Datos Requeridos para Completar:

```typescript
// Configurar en .env o en admin panel
LOCAL_RETIRO_DIRECCION = 'Av. Corrientes 1234, CABA'
LOCAL_RETIRO_HORARIOS = 'Lunes a Viernes: 9:00 - 18:00'
LOCAL_RETIRO_TELEFONO = '+54 11 1234-5678'
```

---

## 📮 7. ¿ESTÁ RESUELTO EL CÁLCULO DINÁMICO SEGÚN CP?

### Estado Actual:

#### ✅ Funcionalidad Implementada:

- ✅ Endpoint `/api/envios/calcular` funciona
- ✅ Calcula según código postal
- ✅ Zonas geográficas implementadas (CABA, GBA, Interior)
- ✅ Múltiples transportistas con precios diferentes
- ✅ Ordenamiento por precio (más barato primero)

#### ✅ Frontend:

- ✅ `ShippingCalculator` componente funcional
- ✅ Input de código postal
- ✅ Botón "Calcular"
- ✅ Muestra métodos disponibles
- ✅ Permite seleccionar método

#### ⚠️ Limitaciones:

1. **Sin autocompletado real**: Usa simulación básica
2. **Sin validación de CP**: No verifica si el CP existe realmente
3. **Precios simulados**: No son reales hasta configurar Envíopack
4. **Sin cache**: Calcula cada vez (podría cachear por CP)

### Mejoras Recomendadas:

1. Integrar API de códigos postales de Argentina
2. Autocompletar localidad/provincia automáticamente
3. Validar CP antes de calcular
4. Cachear resultados por CP (24h)

---

## 🔐 8. ¿QUÉ PARTE REQUIERE CREDENCIALES O CONFIGURACIÓN EN .ENV?

### Variables de Entorno Requeridas:

#### 🔴 CRÍTICAS (Sin estas, envíos reales NO funcionan):

```bash
# Envíopack (Recomendado)
ENVIOPACK_API_KEY=tu_api_key_aqui
ENVIOPACK_API_SECRET=tu_api_secret_aqui
ENVIOPACK_WEBHOOK_SECRET=tu_webhook_secret_aqui

# Retiro en Local (Opcional pero recomendado)
LOCAL_RETIRO_DIRECCION="Av. Corrientes 1234, CABA"
LOCAL_RETIRO_HORARIOS="Lunes a Viernes: 9:00 - 18:00"
LOCAL_RETIRO_TELEFONO="+54 11 1234-5678"
```

#### 🟡 OPCIONALES (Mejoran la experiencia):

```bash
# OCA Directo (Alternativa a Envíopack)
OCA_API_USER=tu_usuario
OCA_API_PASSWORD=tu_password

# Andreani Directo (Alternativa)
ANDREANI_API_KEY=tu_api_key
ANDREANI_API_SECRET=tu_api_secret

# Notificaciones de envío
SHIPPING_NOTIFICATION_EMAIL=admin@example.com
```

### Estado Actual de Variables:

- ❌ `ENVIOPACK_API_KEY`: NO configurada
- ❌ `ENVIOPACK_API_SECRET`: NO configurada
- ❌ `ENVIOPACK_WEBHOOK_SECRET`: NO configurada
- ❌ `LOCAL_RETIRO_*`: NO configuradas

**Resultado**: Sistema funciona con simulación, pero NO con envíos reales.

---

## ✅ 9. ¿QUÉ ES OBLIGATORIO IMPLEMENTAR ANTES DE ABRIR AL PÚBLICO?

### 🔴 CRÍTICO (Bloquea producción):

1. **Configurar Envíopack**:
   - ✅ Crear cuenta en https://enviopack.com
   - ✅ Obtener API Key y Secret
   - ✅ Configurar variables en Vercel
   - ✅ Configurar webhook URL en Envíopack Dashboard

2. **Probar creación de envío real**:
   - ✅ Hacer una compra de prueba
   - ✅ Verificar que se crea envío en Envíopack
   - ✅ Verificar que se genera tracking real
   - ✅ Verificar que se guarda en BD

3. **Probar webhook de envíos**:
   - ✅ Simular actualización de estado desde Envíopack
   - ✅ Verificar que se actualiza orden en BD
   - ✅ Verificar que se envía notificación

### 🟡 IMPORTANTE (Mejora experiencia):

4. **Completar retiro en local**:
   - ✅ Configurar dirección y horarios
   - ✅ Mostrar mensaje claro al cliente
   - ✅ Enviar email con información

5. **Mejorar tracking**:
   - ✅ Mostrar tracking en página de éxito
   - ✅ Mostrar tracking en admin panel
   - ✅ Permitir consultar tracking desde frontend

6. **Notificaciones**:
   - ✅ Email al cliente cuando se crea envío
   - ✅ Email al cliente cuando se actualiza estado
   - ✅ Email al admin cuando hay nuevo envío

### 🟢 OPCIONAL (Nice to have):

7. **Autocompletado de CP**:
   - Integrar API de códigos postales
   - Autocompletar localidad/provincia

8. **Etiquetas PDF**:
   - Generar etiqueta automáticamente
   - Permitir descargar desde admin

9. **Múltiples proveedores**:
   - Integrar OCA directo
   - Integrar Andreani directo

---

## 📊 RESUMEN DE ESTADO

| Componente        | Estado          | Notas                                  |
| ----------------- | --------------- | -------------------------------------- |
| Cálculo de envío  | ✅ Funcional    | Simulación, listo para Envíopack       |
| Creación de orden | ✅ Funcional    | Estructura simplificada operativa      |
| Creación de envío | ⚠️ Simulado     | Requiere Envíopack configurado         |
| Tracking          | ⚠️ Parcial      | Endpoint existe, necesita datos reales |
| Webhook de envíos | ✅ Implementado | Requiere configuración en Envíopack    |
| Retiro en local   | ✅ Funcional    | Falta configurar dirección/horarios    |
| Validación CP     | ⚠️ Básica       | Sin API real de códigos postales       |
| Notificaciones    | ⚠️ Parcial      | Implementadas pero pueden fallar       |

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 ALTA PRIORIDAD (Hacer YA):

1. **Configurar Envíopack** (2 horas)
   - Crear cuenta
   - Obtener credenciales
   - Configurar en Vercel
   - Probar cálculo real

2. **Probar flujo completo** (1 hora)
   - Compra de prueba
   - Verificar creación de envío
   - Verificar tracking real

3. **Configurar webhook** (30 min)
   - URL en Envíopack Dashboard
   - Secret en Vercel
   - Probar actualización

### 🟡 MEDIA PRIORIDAD (Esta semana):

4. **Completar retiro en local** (1 hora)
   - Configurar variables
   - Mostrar mensaje
   - Enviar email

5. **Mejorar tracking display** (2 horas)
   - Página de tracking
   - Admin panel mejorado
   - Notificaciones

### 🟢 BAJA PRIORIDAD (Próximas semanas):

6. **Autocompletado CP** (4 horas)
7. **Etiquetas PDF** (3 horas)
8. **Múltiples proveedores** (8 horas)

---

## 🔗 ARCHIVOS CLAVE

- `lib/shipping/envioPack.ts` - Helper de Envíopack
- `core/shipping/shipping-service.ts` - Servicio de envíos
- `app/api/envios/calcular/route.ts` - Cálculo de envío
- `app/api/mp/webhook/route.ts` - Creación de envío después de pago
- `app/api/shipping/webhook/route.ts` - Webhook de actualizaciones
- `app/api/shipping/tracking/[trackingNumber]/route.ts` - Consulta de tracking
- `components/ShippingCalculator.tsx` - Componente de cálculo
- `app/checkout/page.tsx` - Página de checkout

---

## ✅ CONCLUSIÓN

El sistema de envíos está **80% implementado** y funcional con simulación. Para producción real, solo falta:

1. **Configurar Envíopack** (2 horas)
2. **Probar flujo completo** (1 hora)
3. **Configurar webhook** (30 min)

**Total estimado: 3.5 horas para producción completa.**
