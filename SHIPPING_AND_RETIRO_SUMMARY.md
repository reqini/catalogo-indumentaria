# Resumen: Sistema de Envío y Retiro en Local

## 📦 Retiro en el Local

### Funcionamiento

Cuando el cliente selecciona "Retiro en el local" durante el checkout:

1. **No se requiere código postal** ni dirección completa
2. **Costo de envío = $0**
3. **Mensaje informativo**: "Vas a retirar tu pedido por el local. Te vamos a contactar con la dirección y horarios."
4. **En la BD**:
   - `envio_tipo = 'retiro_local'`
   - `envio_metodo = 'Retiro en el local'`
   - `envio_costo = 0`
   - Campos de dirección = `NULL`

### Flujo Completo

```
Cliente → Checkout → Selecciona "Retiro en local"
  ↓
No requiere CP ni dirección
  ↓
Orden creada con envio_tipo = 'retiro_local'
  ↓
Mercado Pago (sin address)
  ↓
Pago aprobado → Webhook actualiza orden
  ↓
Admin ve orden con tipo "Retiro en local"
  ↓
Admin contacta cliente con dirección y horarios
```

## 🚚 Envío a Domicilio

### Funcionamiento

Cuando el cliente selecciona "Envío a domicilio":

1. **Requiere código postal** para calcular costos
2. **Cálculo de envío** basado en CP, peso y valor
3. **Métodos disponibles**: OCA, Andreani, Correo Argentino, Mercado Envíos
4. **En la BD**:
   - `envio_tipo = 'estandar'` o `'express'`
   - `envio_metodo = 'OCA Estándar'` (ejemplo)
   - `envio_costo = [costo calculado]`
   - Campos de dirección completos

### Flujo Completo

```
Cliente → Checkout → Ingresa CP
  ↓
ShippingCalculator calcula métodos disponibles
  ↓
Cliente selecciona método de envío
  ↓
Orden creada con datos de dirección completos
  ↓
Mercado Pago (con address completo)
  ↓
Pago aprobado → Webhook crea solicitud de envío real
  ↓
Tracking number asignado
  ↓
Admin marca como "enviada" → Cliente recibe tracking
```

## 💾 Qué se Guarda en BD

### Para Retiro en Local

```json
{
  "envio_tipo": "retiro_local",
  "envio_metodo": "Retiro en el local",
  "envio_costo": 0,
  "envio_proveedor": null,
  "envio_tracking": null,
  "direccion_calle": null,
  "direccion_numero": null,
  "direccion_codigo_postal": null,
  "direccion_localidad": null,
  "direccion_provincia": null
}
```

### Para Envío a Domicilio

```json
{
  "envio_tipo": "estandar",
  "envio_metodo": "OCA Estándar",
  "envio_costo": 2500,
  "envio_proveedor": "OCA",
  "envio_tracking": "OCA123456789",
  "direccion_calle": "Av. Corrientes",
  "direccion_numero": "1234",
  "direccion_codigo_postal": "C1000",
  "direccion_localidad": "CABA",
  "direccion_provincia": "Buenos Aires"
}
```

## 🔄 Integración con Mercado Pago

### Retiro en Local

- **NO se envía** `payer.address` en la preferencia
- Solo se envía `payer.name`, `payer.email`, `payer.phone`
- El total NO incluye costo de envío

### Envío a Domicilio

- **SÍ se envía** `payer.address` completo:
  ```json
  {
    "street_name": "Av. Corrientes",
    "street_number": 1234,
    "zip_code": "C1000"
  }
  ```
- El total incluye costo de envío como item adicional

## 🎨 UI/UX

### En Checkout

- **Selector de tipo**: Botones grandes "Envío a domicilio" / "Retiro en local"
- **Condicional**: Si es retiro, no muestra campos de CP
- **Mensaje claro**: Información sobre qué esperar

### En Admin

- **Columna "Envío"**: Muestra "Retiro en local" o método de envío + tracking
- **Detalle de orden**: Sección diferente según tipo de entrega
- **Acciones**: Para retiro, no se puede marcar como "enviada" (solo "entregada")

## 📋 Validaciones

### Retiro en Local

- ✅ Solo requiere: nombre, email, teléfono
- ✅ No requiere: CP, calle, número, localidad, provincia
- ✅ Puede avanzar sin seleccionar método de envío

### Envío a Domicilio

- ✅ Requiere: todos los campos de dirección
- ✅ Requiere: CP válido (mínimo 4 caracteres)
- ✅ Requiere: método de envío seleccionado

## 🔧 Archivos Clave

- `components/ShippingCalculator.tsx`: Componente principal con selector de tipo
- `app/checkout/page.tsx`: Lógica de validación condicional
- `lib/ordenes-helpers.ts`: Manejo de NULL en dirección
- `app/api/checkout/create-order/route.ts`: Validación y creación de orden
- `app/api/mp/webhook/route.ts`: Manejo de envío real solo si no es retiro
