# Reporte: Corrección de Error 400 "Datos Inválidos"

## 🔍 Error Original

**Error:** `POST /api/checkout/create-order 400 (Bad Request)`
**Mensaje:** `{error: 'Datos inválidos', details: Array(1)}`
**Log:** `[CHECKOUT] Error: Datos inválidos: [object Object]`

## 🔎 Causa Identificada

El error se producía por una **validación demasiado estricta** en el schema de Zod cuando el usuario seleccionaba "Retiro en el local":

1. **Problema en el schema original:**
   - Los campos de dirección tenían validaciones `.min(3)`, `.min(1)`, `.min(4)` incluso cuando eran opcionales
   - Cuando era retiro en local, el frontend enviaba strings vacíos (`''`) para los campos de dirección
   - Zod rechazaba estos valores porque no cumplían con los mínimos requeridos

2. **Problema en el frontend:**
   - El payload enviado tenía campos de dirección como strings vacíos cuando era retiro
   - El schema esperaba que estos campos fueran válidos o no existieran

## ✅ Solución Implementada

### 1. Schema de Validación Mejorado

**Archivo:** `app/api/checkout/create-order/route.ts`

Se implementó un schema con validación condicional usando `.refine()`:

```typescript
const createOrderSchema = z
  .object({
    cliente: z.object({
      nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      telefono: z.string().optional(),
    }),
    direccion: z.object({
      calle: z.string(),
      numero: z.string(),
      pisoDepto: z.string().optional(),
      codigoPostal: z.string(),
      localidad: z.string(),
      provincia: z.string(),
      pais: z.string().optional(),
    }),
    envio: z.object({
      tipo: z.enum(['estandar', 'express', 'retiro_local']),
      metodo: z.string().min(1, 'El método de envío es requerido'),
      costo: z.number().min(0),
      demora: z.string().optional(),
      proveedor: z.string().nullable().optional(),
    }),
    // ... items, subtotal, total, etc.
  })
  .refine(
    (data) => {
      // Si es retiro_local, no validar dirección
      if (data.envio.tipo === 'retiro_local') {
        return true
      }
      // Si es envío, validar que todos los campos estén completos
      return (
        data.direccion.calle &&
        data.direccion.calle.length >= 3 &&
        data.direccion.numero &&
        data.direccion.numero.length >= 1 &&
        data.direccion.codigoPostal &&
        data.direccion.codigoPostal.length >= 4 &&
        data.direccion.localidad &&
        data.direccion.localidad.length >= 2 &&
        data.direccion.provincia &&
        data.direccion.provincia.length >= 2
      )
    },
    {
      message: 'Si elegiste envío a domicilio, completá todos los campos de dirección',
      path: ['direccion'],
    }
  )
```

### 2. Frontend Ajustado

**Archivo:** `app/checkout/page.tsx`

Se modificó el payload para que cuando es retiro en local, envíe valores placeholder válidos en lugar de strings vacíos:

```typescript
direccion: selectedShipping?.tipo === 'retiro_local'
  ? {
      calle: 'Retiro en local',
      numero: '0',
      pisoDepto: '',
      codigoPostal: '0000',
      localidad: 'Retiro en local',
      provincia: 'Buenos Aires',
      pais: 'Argentina',
    }
  : {
      calle: formData.calle || '',
      numero: formData.numero || '',
      // ... resto de campos
    }
```

### 3. Logging Mejorado

Se agregó logging detallado para facilitar el debugging:

```typescript
console.log('[CHECKOUT] 📋 Body recibido completo:', JSON.stringify(body, null, 2))
console.log('[CHECKOUT] 📋 Resumen:', {
  cliente: body.cliente?.nombre,
  email: body.cliente?.email,
  itemsCount: body.items?.length,
  envioTipo: body.envio?.tipo,
  // ...
})

// En caso de error de validación:
validationError.errors.forEach((err) => {
  console.error(`  - ${err.path.join('.')}: ${err.message}`)
})
```

### 4. Mensajes de Error Mejorados

**Frontend:** `app/checkout/page.tsx`

```typescript
let errorMessage = errorData.error || 'Error al crear la orden'

if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
  const firstError = errorData.details[0]
  if (firstError.path) {
    const fieldName = firstError.path.split('.').pop() || 'campo'
    errorMessage = `Por favor, completá correctamente el campo: ${fieldName}. ${firstError.message || ''}`
  }
}
```

## 📋 Ejemplo de Payload Correcto

### Para Envío a Domicilio

```json
{
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+54 11 1234-5678"
  },
  "direccion": {
    "calle": "Av. Corrientes",
    "numero": "1234",
    "pisoDepto": "2° A",
    "codigoPostal": "C1000",
    "localidad": "CABA",
    "provincia": "Buenos Aires",
    "pais": "Argentina"
  },
  "envio": {
    "tipo": "estandar",
    "metodo": "OCA Estándar",
    "costo": 2500,
    "demora": "5-7 días hábiles",
    "proveedor": "OCA"
  },
  "items": [
    {
      "id": "product-uuid",
      "nombre": "Remera Básica",
      "precio": 5000,
      "cantidad": 2,
      "talle": "M",
      "subtotal": 10000,
      "imagenPrincipal": "https://..."
    }
  ],
  "subtotal": 10000,
  "descuento": 0,
  "envioCosto": 2500,
  "total": 12500
}
```

### Para Retiro en Local

```json
{
  "cliente": {
    "nombre": "María González",
    "email": "maria@example.com",
    "telefono": "+54 11 9876-5432"
  },
  "direccion": {
    "calle": "Retiro en local",
    "numero": "0",
    "pisoDepto": "",
    "codigoPostal": "0000",
    "localidad": "Retiro en local",
    "provincia": "Buenos Aires",
    "pais": "Argentina"
  },
  "envio": {
    "tipo": "retiro_local",
    "metodo": "Retiro en el local",
    "costo": 0,
    "demora": "Disponible de lunes a viernes de 9 a 18hs",
    "proveedor": null
  },
  "items": [
    {
      "id": "product-uuid",
      "nombre": "Remera Básica",
      "precio": 5000,
      "cantidad": 1,
      "talle": "L",
      "subtotal": 5000,
      "imagenPrincipal": "https://..."
    }
  ],
  "subtotal": 5000,
  "descuento": 0,
  "envioCosto": 0,
  "total": 5000
}
```

## ✅ Validaciones Implementadas

1. **Cliente:** Nombre (min 2), email válido, teléfono opcional
2. **Dirección:**
   - Si `envio.tipo === 'retiro_local'`: No se valida
   - Si `envio.tipo === 'estandar' | 'express'`: Todos los campos requeridos con mínimos
3. **Envío:** Tipo enum, método requerido, costo >= 0
4. **Items:** Array no vacío, cada item con id, nombre, precio, cantidad >= 1
5. **Totales:** Todos >= 0, total = subtotal + envioCosto

## 🔧 Archivos Modificados

- `app/api/checkout/create-order/route.ts`: Schema de validación mejorado
- `app/checkout/page.tsx`: Payload ajustado y mensajes de error mejorados

## 🎯 Resultado

- ✅ El error 400 "Datos inválidos" ya no aparece cuando los datos son correctos
- ✅ Retiro en local funciona sin requerir dirección completa
- ✅ Envío a domicilio valida correctamente todos los campos
- ✅ Mensajes de error son claros y específicos
- ✅ Logging detallado para debugging futuro
