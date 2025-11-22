# Solución Completa: Mercado Pago + Cálculo de Envío

## 🎯 Objetivo

Sistema completo y funcional de:

- ✅ Integración con Mercado Pago para pagos
- ✅ Cálculo de envío real con múltiples transportistas
- ✅ Integración de envío en checkout
- ✅ Validación robusta que no rompe el build
- ✅ Manejo de errores completo

## 📋 Arquitectura

### Flujo Completo de Checkout

```
1. Usuario agrega productos al carrito
2. Usuario calcula envío (opcional)
3. Usuario selecciona método de envío (opcional)
4. Usuario hace click en "Finalizar Compra"
5. Frontend valida stock y prepara items
6. Si hay envío seleccionado, se agrega como item
7. Se crea preferencia en Mercado Pago
8. Usuario es redirigido a checkout de MP
9. Después del pago, webhook actualiza estado
```

### Componentes Clave

#### 1. Validación de Mercado Pago (`lib/mercadopago/validate.ts`)

**Características:**

- ✅ Validación en runtime (no al cargar módulo)
- ✅ No rompe el build si falta token
- ✅ Detecta tokens de TEST vs PRODUCCIÓN
- ✅ Maneja errores de forma resiliente

**Uso:**

```typescript
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'

const mpConfig = validateMercadoPagoConfig()
if (!mpConfig.isValid) {
  // Manejar error sin romper el build
}
```

#### 2. API de Pago (`app/api/pago/route.ts`)

**Características:**

- ✅ Valida configuración de MP en runtime
- ✅ Verifica stock antes de crear preferencia
- ✅ Maneja items de envío correctamente
- ✅ Crea preferencia con todos los items (productos + envío)
- ✅ Logs detallados para debugging

**Items de Envío:**

- Se agregan con `id: 'envio'`
- Se saltan validaciones de stock
- Se incluyen en la preferencia de MP

#### 3. Cálculo de Envío (`app/api/envios/calcular/route.ts`)

**Características:**

- ✅ Integración con Envíopack API (si está configurado)
- ✅ Fallback a cálculo simulado si no hay API
- ✅ Soporta múltiples transportistas:
  - OCA (Estándar y Express)
  - Correo Argentino
  - Andreani (Estándar y Express)
  - Mercado Envíos (si aplica)

**Uso:**

```typescript
POST /api/envios/calcular
{
  "codigoPostal": "B8000",
  "peso": 1.5,
  "precio": 50000
}
```

#### 4. Componente de Carrito (`app/carrito/page.tsx`)

**Características:**

- ✅ Calculadora de envío integrada
- ✅ Selección de método de envío
- ✅ Envío opcional (no bloquea checkout)
- ✅ Total con envío calculado automáticamente
- ✅ Validación de stock antes de checkout

## 🔧 Configuración

### Variables de Entorno Requeridas

#### Mercado Pago (Obligatorio)

```bash
# Token de acceso (server-side only)
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx

# Public key (opcional, recomendado para frontend)
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxx
```

#### Envíopack (Opcional - para cálculo real)

```bash
ENVIOPACK_API_KEY=tu_api_key
ENVIOPACK_API_SECRET=tu_api_secret
```

#### Otras APIs de Envío (Opcional)

```bash
OCA_API_KEY=tu_oca_key
OCA_API_SECRET=tu_oca_secret

CORREO_API_KEY=tu_correo_key
CORREO_API_SECRET=tu_correo_secret
```

### Configuración en Vercel

1. Ir a **Settings → Environment Variables**
2. Agregar `MP_ACCESS_TOKEN` (Production, Preview, Development)
3. Agregar `NEXT_PUBLIC_MP_PUBLIC_KEY` (Production, Preview, Development)
4. (Opcional) Agregar credenciales de Envíopack

## 🚀 Flujo de Uso

### 1. Usuario Calcula Envío

```typescript
// En ShippingCalculator.tsx
const response = await fetch('/api/envios/calcular', {
  method: 'POST',
  body: JSON.stringify({
    codigoPostal: 'B8000',
    peso: totalWeight,
    precio: totalPrice,
  }),
})
```

### 2. Usuario Selecciona Método

```typescript
// En carrito/page.tsx
const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null)

// Cuando selecciona un método
onSelectMethod={(method) => setSelectedShipping(method)}
```

### 3. Checkout con Envío

```typescript
// En handleCheckout
const items = cart.map((item) => ({
  title: item.nombre,
  quantity: item.cantidad,
  unit_price: calculateDiscount(item.precio, item.descuento),
  id: item.id,
  talle: item.talle,
}))

// Agregar envío si está seleccionado
if (selectedShipping && selectedShipping.precio > 0) {
  items.push({
    title: `Envío - ${selectedShipping.nombre}`,
    quantity: 1,
    unit_price: selectedShipping.precio,
    id: 'envio', // ID especial para envío
    talle: '',
  })
}

// Crear preferencia
const preference = await createPayment({ items, back_urls })
```

### 4. Backend Procesa Items

```typescript
// En app/api/pago/route.ts
for (const item of items) {
  // Saltar validación de stock para envío
  if (item.id === 'envio') {
    continue
  }

  // Validar stock para productos
  // ...
}

// Crear preferencia con todos los items
const preferenceData = {
  items: items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unit_price,
    description: item.talle ? `Talle: ${item.talle}` : item.title,
  })),
  // ...
}
```

## 🧪 QA y Testing

### Casos de Prueba

#### 1. Checkout sin Envío

- ✅ Agregar productos al carrito
- ✅ No calcular envío
- ✅ Hacer checkout
- ✅ Verificar que preferencia se crea sin item de envío

#### 2. Checkout con Envío

- ✅ Agregar productos al carrito
- ✅ Calcular envío con código postal válido
- ✅ Seleccionar método de envío
- ✅ Hacer checkout
- ✅ Verificar que preferencia incluye item de envío
- ✅ Verificar que total incluye costo de envío

#### 3. Validación de Stock

- ✅ Agregar producto con stock insuficiente
- ✅ Intentar checkout
- ✅ Verificar que se muestra error de stock

#### 4. Validación de MP

- ✅ Sin `MP_ACCESS_TOKEN` configurado
- ✅ Intentar checkout
- ✅ Verificar que se muestra error claro
- ✅ Verificar que build no se rompe

#### 5. Cálculo de Envío

- ✅ Con código postal válido
- ✅ Verificar que se muestran métodos disponibles
- ✅ Con código postal inválido
- ✅ Verificar que se muestra error

### Logs para Debugging

Todos los logs incluyen prefijos para fácil identificación:

- `[MP-PAYMENT]` - Logs de creación de preferencia
- `[MP-WEBHOOK]` - Logs de webhook
- `[API-ENVIOS]` - Logs de cálculo de envío
- `[ENVIOPACK]` - Logs de API de Envíopack

## 🔍 Troubleshooting

### Error: "Mercado Pago no configurado"

**Causa:** `MP_ACCESS_TOKEN` no está configurado o es inválido.

**Solución:**

1. Verificar que `MP_ACCESS_TOKEN` está en Vercel Dashboard
2. Verificar que el token es válido (no es placeholder)
3. Verificar que el token tiene formato correcto:
   - TEST: `TEST-xxxxxxxxxxxxxxxxxxxx`
   - PRODUCCIÓN: `APP_USR-xxxxxxxxxxxxxxxxxxxx`

### Error: "No hay métodos de envío disponibles"

**Causa:** Código postal inválido o API de envío no disponible.

**Solución:**

1. Verificar que el código postal es válido
2. Verificar que hay conexión a internet
3. Si usa Envíopack, verificar credenciales

### Error: "Stock insuficiente"

**Causa:** Producto no tiene stock suficiente.

**Solución:**

1. Verificar stock en base de datos
2. Actualizar stock si es necesario
3. Informar al usuario

### Preferencia no incluye envío

**Causa:** Envío no se agregó como item antes de crear preferencia.

**Solución:**

1. Verificar que `selectedShipping` no es null
2. Verificar que `selectedShipping.precio > 0`
3. Verificar logs en `[MP-PAYMENT]` para ver items enviados

## 📚 Referencias

- [Mercado Pago API](https://www.mercadopago.com.ar/developers/es/docs)
- [Envíopack API](https://developers.enviopack.com)
- [OCA API](https://www.oca.com.ar/)
- [Andreani API](https://www.andreani.com/)
- [Correo Argentino](https://www.correoargentino.com.ar/)

## ✅ Checklist de Implementación

- [x] Validación de MP no rompe build
- [x] Envío se agrega como item en preferencia
- [x] Envío es opcional (no bloquea checkout)
- [x] Cálculo de envío funciona con/sin API
- [x] Logs detallados para debugging
- [x] Manejo de errores completo
- [x] Documentación completa
- [x] QA completo

## 🎯 Próximos Pasos

1. **Integrar APIs reales de transportistas** cuando se obtengan credenciales
2. **Agregar tracking de envíos** después del pago
3. **Implementar retiro en local** como opción
4. **Agregar notificaciones** de estado de envío
5. **Optimizar cálculo de envío** con caché

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0
**Mantenido por:** Equipo FullStack
