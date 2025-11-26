# 📦 Documentación de API de Envíos

**Fecha:** 26/11/2025  
**Versión:** 1.0.0

---

## 🔍 Resumen

El sistema de envíos permite calcular costos y crear solicitudes de envío reales con múltiples proveedores de logística.

---

## 🏗️ Arquitectura

### Proveedores Soportados

1. **Envíopack** (API real si está configurado)
2. **OCA** (simulado, listo para integración real)
3. **Andreani** (simulado, listo para integración real)
4. **Correo Argentino** (simulado, listo para integración real)
5. **Mercado Envíos** (condicional, según CP y monto)

### Fallback Automático

Si Envíopack no está configurado o falla, el sistema usa cálculo simulado basado en:

- Código postal (zona geográfica)
- Peso del paquete
- Valor declarado del producto
- Multiplicadores por zona

---

## 📡 Endpoints

### POST `/api/envios/calcular`

Calcula el costo de envío según código postal y peso.

**Request:**

```json
{
  "codigoPostal": "C1000",
  "peso": 1.5,
  "precio": 50000,
  "provincia": "Buenos Aires" // Opcional
}
```

**Response:**

```json
{
  "metodos": [
    {
      "nombre": "OCA Estándar",
      "precio": 3500,
      "demora": "3-5 días hábiles",
      "disponible": true,
      "transportista": "OCA"
    },
    {
      "nombre": "OCA Express",
      "precio": 5250,
      "demora": "1-2 días hábiles",
      "disponible": true,
      "transportista": "OCA"
    }
  ],
  "codigoPostal": "C1000"
}
```

---

## 🔧 Servicio de Envíos

### `core/shipping/shipping-service.ts`

#### `createShippingRequest(request: ShippingRequest, metodo: string): Promise<ShippingResponse>`

Crea una solicitud de envío real con el proveedor seleccionado.

**Parámetros:**

- `request`: Datos del envío (CP, peso, precio, dirección, cliente)
- `metodo`: Método seleccionado (ej: "OCA Estándar")

**Retorna:**

```typescript
{
  success: boolean
  trackingNumber?: string
  provider?: string
  estimatedDelivery?: string
  cost?: number
  error?: string
  retries?: number
}
```

**Características:**

- ✅ Reintentos automáticos (hasta 3 intentos)
- ✅ Backoff exponencial entre reintentos
- ✅ Timeout de 15 segundos
- ✅ Fallback a simulación si falla la API real

#### `getShippingStatus(trackingNumber: string, provider?: string)`

Obtiene el estado actual de un envío.

**Retorna:**

```typescript
{
  status: string // 'en_transito', 'entregado', 'desconocido'
  location?: string
  estimatedDelivery?: string
  lastUpdate?: string
}
```

#### `validateCodigoPostal(codigoPostal: string)`

Valida y autocompleta información de código postal.

**Retorna:**

```typescript
{
  valid: boolean
  localidad?: string
  provincia?: string
  error?: string
}
```

---

## 🔑 Variables de Entorno

### Envíopack (Opcional)

```env
ENVIOPACK_API_KEY=tu_api_key
ENVIOPACK_API_SECRET=tu_api_secret
```

### WhatsApp (Opcional, para notificaciones)

```env
WHATSAPP_API_KEY=tu_api_key
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

---

## 📊 Cálculo Simulado

### Zonas Geográficas

- **CABA/GBA (B, C):** Multiplicador 1.0
- **Interior cercano (A, 1000-2000):** Multiplicador 1.1
- **Interior medio (D-M):** Multiplicador 1.4
- **Interior lejano:** Multiplicador 1.8

### Fórmula Base

```
Costo = (Base + (Peso × PorKg) + (Precio × PorValor)) × MultiplicadorZona
```

### Valores Base (ARS)

| Proveedor        | Base | Por Kg | Por Valor |
| ---------------- | ---- | ------ | --------- |
| OCA              | 2500 | 600    | 2.5%      |
| Correo Argentino | 1800 | 450    | 2%        |
| Andreani         | 2800 | 650    | 3%        |

---

## 🔄 Flujo de Integración

1. **Cliente calcula envío** → `POST /api/envios/calcular`
2. **Cliente selecciona método** → Se guarda en estado del checkout
3. **Cliente completa checkout** → Se crea orden con datos de envío
4. **Pago aprobado** → Webhook de MP se ejecuta
5. **Webhook crea envío real** → `createShippingRequest()` se llama automáticamente
6. **Tracking guardado** → Se actualiza la orden con número de seguimiento
7. **Notificaciones** → Cliente y admin reciben emails con tracking

---

## 🐛 Manejo de Errores

### Errores Comunes

1. **API de Envíopack no disponible**
   - ✅ Fallback automático a cálculo simulado
   - ✅ Logs de advertencia
   - ✅ No bloquea el flujo de compra

2. **Timeout de API**
   - ✅ Reintento automático (hasta 3 veces)
   - ✅ Backoff exponencial
   - ✅ Fallback a simulación

3. **Código postal inválido**
   - ✅ Validación en frontend y backend
   - ✅ Mensaje de error claro
   - ✅ No permite continuar sin CP válido

---

## 📝 Logs

Todos los eventos se registran con el módulo `[SHIPPING]`:

```
[SHIPPING] Intento 1/3 - Creando envío con OCA Estándar
[SHIPPING] ✅ Envío creado: TRACK-1234567890-ABC123
[SHIPPING] ❌ Error en intento 1: Timeout
[SHIPPING] Reintentando en 1000ms...
```

---

## 🔗 Integraciones Futuras

### OCA API

- Endpoint: `https://api.oca.com.ar/...`
- Documentación: https://www.oca.com.ar/...

### Andreani API

- Endpoint: `https://api.andreani.com/...`
- Documentación: https://www.andreani.com/...

### Correo Argentino API

- Endpoint: `https://api.correoargentino.com.ar/...`
- Documentación: https://www.correoargentino.com.ar/...

---

**Última actualización:** 26/11/2025
