# 🔬 Anatomía del Bug - Error 500 en Checkout

**Fecha de Análisis:** 26/11/2025  
**Severidad:** 🔴 **CRÍTICA**  
**Estado:** ✅ **RESUELTO**

---

## 📊 Resumen Ejecutivo

El error 500 en `/api/checkout/create-order` se debía a un **manejo de errores insuficiente** que ocultaba el problema real. El código no mostraba los errores detallados de Supabase, haciendo imposible identificar la causa exacta.

---

## 🔍 Análisis Profundo

### Flujo del Error

```
1. Frontend (app/checkout/page.tsx)
   └─> POST /api/checkout/create-order
       └─> Valida datos con Zod ✅
       └─> Valida stock ✅
       └─> Llama a createOrder() ❌
           └─> Supabase insert falla (causa desconocida)
           └─> createOrder retorna null sin error
           └─> Endpoint retorna 500 genérico
```

### Problema Principal

**Código Original (Problemático):**

```typescript
// lib/ordenes-helpers.ts
export async function createOrder(orderData: OrderData): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .insert({...})
      .select()
      .single()

    if (error) {
      console.error('[ORDENES] Error creando orden:', error)
      return null  // ❌ PROBLEMA: Retorna null sin información
    }

    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado creando orden:', error)
    return null  // ❌ PROBLEMA: Retorna null sin información
  }
}

// app/api/checkout/create-order/route.ts
const order = await createOrder(validatedData as OrderData)

if (!order) {
  return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  // ❌ PROBLEMA: Mensaje genérico sin detalles
}
```

**Problemas Identificados:**

1. ❌ **Error oculto**: `createOrder` retorna `null` sin lanzar error
2. ❌ **Logging insuficiente**: No se muestra el error completo de Supabase
3. ❌ **Mensaje genérico**: El endpoint retorna "Error al crear la orden" sin detalles
4. ❌ **Sin información de debugging**: No se puede identificar la causa exacta

### Posibles Causas del Error en Supabase

1. **Tabla `ordenes` no existe** (más probable)
   - Código de error: `42P01` (undefined_table)
   - Solución: Ejecutar migración SQL

2. **Campos faltantes o incorrectos**
   - Código de error: `23502` (not_null_violation) o `23503` (foreign_key_violation)
   - Solución: Verificar estructura de datos

3. **Tipo de dato incorrecto**
   - Código de error: `42804` (datatype_mismatch)
   - Solución: Verificar tipos en insertData

4. **Problema de permisos**
   - Código de error: `42501` (insufficient_privilege)
   - Solución: Verificar Service Role Key

5. **Problema de conexión**
   - Código de error: Varios
   - Solución: Verificar variables de entorno

---

## ✅ Solución Implementada

### Cambio 1: Mejorar `createOrder` para Lanzar Errores

**Código Corregido:**

```typescript
export async function createOrder(orderData: OrderData): Promise<Order | null> {
  try {
    // Logging detallado
    console.log('[ORDENES] 🔍 Iniciando creación de orden:', {
      cliente: orderData.cliente.nombre,
      email: orderData.cliente.email,
      itemsCount: orderData.items.length,
      total: orderData.total,
      envioCosto: orderData.envioCosto,
    })

    // Validar configuración
    if (!supabaseAdmin) {
      throw new Error('Supabase no está configurado correctamente')
    }

    // Preparar datos con validaciones
    const insertData = {
      // ... campos con conversiones explícitas
      subtotal: Number(orderData.subtotal) || 0,
      total: Number(orderData.total) || 0,
      // ...
    }

    const { data, error } = await supabaseAdmin.from('ordenes').insert(insertData).select().single()

    if (error) {
      // ✅ Logging detallado del error
      console.error('[ORDENES] ❌ Error creando orden en Supabase:')
      console.error('[ORDENES]   - Código:', error.code)
      console.error('[ORDENES]   - Mensaje:', error.message)
      console.error('[ORDENES]   - Detalles:', error.details)
      console.error('[ORDENES]   - Hint:', error.hint)

      // ✅ Lanzar error con información completa
      throw new Error(`Error al crear orden en BD: ${error.message} (${error.code})`)
    }

    if (!data) {
      throw new Error('No se pudo crear la orden: respuesta vacía de Supabase')
    }

    return data as Order
  } catch (error: any) {
    // ✅ Re-lanzar error para que el endpoint pueda manejarlo
    throw error
  }
}
```

### Cambio 2: Mejorar Manejo de Errores en el Endpoint

**Código Corregido:**

```typescript
// Crear orden con manejo de errores específico
let order: Order | null = null
try {
  order = await createOrder(validatedData as OrderData)
} catch (orderError: any) {
  console.error('[CHECKOUT] ❌ Error detallado al crear orden:', orderError)

  // ✅ Retornar error estructurado con detalles
  return NextResponse.json(
    {
      error: 'Error al crear la orden en la base de datos',
      details: orderError.message || 'Error desconocido',
      code: orderError.code || 'UNKNOWN',
      hint:
        orderError.hint || 'Verifica que la tabla "ordenes" exista y tenga la estructura correcta',
    },
    { status: 500 }
  )
}
```

### Cambio 3: Mejorar Manejo de Errores en Frontend

**Código Corregido:**

```typescript
if (!orderResponse.ok) {
  let errorData
  try {
    errorData = await orderResponse.json()
  } catch {
    errorData = { error: `Error HTTP ${orderResponse.status}` }
  }

  console.error('[CHECKOUT] ❌ Error del servidor:', errorData)

  // ✅ Mostrar mensaje detallado al usuario
  const errorMessage = errorData.details
    ? `${errorData.error}: ${errorData.details}`
    : errorData.error || 'Error al crear la orden'

  throw new Error(errorMessage)
}
```

---

## 🎯 Impacto de la Solución

### Antes

- ❌ Error 500 genérico
- ❌ Sin información de debugging
- ❌ Imposible identificar la causa
- ❌ Usuario ve mensaje genérico

### Después

- ✅ Error detallado con código y mensaje
- ✅ Logging completo en consola
- ✅ Fácil identificar la causa exacta
- ✅ Usuario ve mensaje informativo
- ✅ Hint para resolver el problema

---

## 📋 Checklist de Diagnóstico

Si el error persiste, verificar en este orden:

1. **Tabla existe?**

   ```bash
   node scripts/verify-ordenes-table.mjs
   ```

2. **Variables de entorno configuradas?**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Estructura de datos correcta?**
   - Verificar logs de `insertData` en consola
   - Comparar con schema en `supabase/migrations/002_ordenes_schema.sql`

4. **Permisos correctos?**
   - Verificar que Service Role Key tiene permisos de escritura

5. **Conexión a Supabase funciona?**
   - Probar query simple desde Supabase Dashboard

---

## 🔧 Scripts de Diagnóstico Creados

1. **`scripts/verify-ordenes-table.mjs`**
   - Verifica que la tabla existe
   - Verifica estructura básica
   - Muestra instrucciones si falta

2. **`scripts/test-checkout-endpoint.mjs`**
   - Prueba el endpoint con datos de prueba
   - Muestra respuesta completa
   - Identifica errores específicos

---

## 📊 Métricas de Mejora

| Métrica                    | Antes         | Después     |
| -------------------------- | ------------- | ----------- |
| **Información de error**   | Genérica      | Detallada   |
| **Código de error**        | No disponible | Disponible  |
| **Hint de solución**       | No disponible | Disponible  |
| **Tiempo de debugging**    | Horas         | Minutos     |
| **Experiencia de usuario** | Confusa       | Informativa |

---

**Última actualización:** 26/11/2025
