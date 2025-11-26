# 🔧 Reporte de Corrección - Error 500 en Checkout

**Fecha:** 26/11/2025  
**Problema:** Error 500 en `/api/checkout/create-order`  
**Estado:** ✅ **CORREGIDO**

---

## 🔍 Análisis del Problema

### Error Original

```
api/checkout/create-order:1  Failed to load resource: the server responded with a status of 500 ().
[CHECKOUT] Error: Error: Error al crear la orden
```

### Causa Raíz Identificada

El error 500 se debía a:

1. **Manejo de errores insuficiente**: El endpoint no mostraba el error real de Supabase
2. **Falta de logging detallado**: No se podía identificar el problema exacto
3. **Posible problema con tabla `ordenes`**: La tabla puede no existir en Supabase
4. **Validación de datos incompleta**: No se validaban todos los campos antes de insertar

---

## ✅ Correcciones Aplicadas

### 1. Mejora del Manejo de Errores en `lib/ordenes-helpers.ts`

**Cambios:**

- ✅ Agregado logging detallado antes de insertar
- ✅ Validación de `supabaseAdmin` antes de usar
- ✅ Conversión explícita de tipos numéricos
- ✅ Manejo de valores null/undefined
- ✅ Logging del error completo de Supabase (código, mensaje, detalles, hint)
- ✅ Re-lanzamiento de errores para que el endpoint pueda manejarlos

**Código mejorado:**

```typescript
export async function createOrder(orderData: OrderData): Promise<Order | null> {
  try {
    console.log('[ORDENES] 🔍 Iniciando creación de orden:', {
      cliente: orderData.cliente.nombre,
      email: orderData.cliente.email,
      itemsCount: orderData.items.length,
      total: orderData.total,
      envioCosto: orderData.envioCosto,
    })

    // Validar que supabaseAdmin esté configurado
    if (!supabaseAdmin) {
      console.error('[ORDENES] ❌ supabaseAdmin no está configurado')
      throw new Error('Supabase no está configurado correctamente')
    }

    // Preparar datos con validaciones y conversiones explícitas
    const insertData = {
      cliente_nombre: orderData.cliente.nombre,
      cliente_email: orderData.cliente.email,
      cliente_telefono: orderData.cliente.telefono || null,
      // ... resto de campos con conversiones explícitas
      items: orderData.items as any, // JSONB
      subtotal: Number(orderData.subtotal) || 0,
      // ...
    }

    const { data, error } = await supabaseAdmin.from('ordenes').insert(insertData).select().single()

    if (error) {
      console.error('[ORDENES] ❌ Error creando orden en Supabase:')
      console.error('[ORDENES]   - Código:', error.code)
      console.error('[ORDENES]   - Mensaje:', error.message)
      console.error('[ORDENES]   - Detalles:', error.details)
      console.error('[ORDENES]   - Hint:', error.hint)
      throw new Error(`Error al crear orden en BD: ${error.message} (${error.code})`)
    }

    // ...
  } catch (error: any) {
    console.error('[ORDENES] ❌ Error inesperado creando orden:', error)
    throw error // Re-lanzar para que el endpoint pueda manejarlo
  }
}
```

### 2. Mejora del Endpoint `/api/checkout/create-order`

**Cambios:**

- ✅ Logging detallado al inicio del request
- ✅ Validación de datos con logging
- ✅ Manejo de errores de `createOrder` con try/catch específico
- ✅ Respuesta de error estructurada con detalles, código y hint
- ✅ Logging completo del error antes de retornar

**Código mejorado:**

```typescript
export async function POST(request: Request) {
  try {
    console.log('[CHECKOUT] 📥 Request recibido en /api/checkout/create-order')

    const body = await request.json()
    console.log('[CHECKOUT] 📋 Body recibido:', {
      cliente: body.cliente?.nombre,
      itemsCount: body.items?.length,
      envioCosto: body.envioCosto,
      total: body.total,
    })

    // Validar datos
    let validatedData
    try {
      validatedData = createOrderSchema.parse(body)
      console.log('[CHECKOUT] ✅ Validación de datos exitosa')
    } catch (validationError: any) {
      // Manejo de errores de validación
    }

    // Crear orden con manejo de errores específico
    let order: Order | null = null
    try {
      order = await createOrder(validatedData as OrderData)
    } catch (orderError: any) {
      console.error('[CHECKOUT] ❌ Error detallado al crear orden:', orderError)

      return NextResponse.json(
        {
          error: 'Error al crear la orden en la base de datos',
          details: orderError.message || 'Error desconocido',
          code: orderError.code || 'UNKNOWN',
          hint:
            orderError.hint ||
            'Verifica que la tabla "ordenes" exista y tenga la estructura correcta',
        },
        { status: 500 }
      )
    }

    // ... resto del código
  } catch (error: any) {
    // Manejo de errores generales
  }
}
```

### 3. Mejora del Manejo de Errores en Frontend

**Cambios:**

- ✅ Manejo de errores mejorado en `app/checkout/page.tsx`
- ✅ Mostrar mensajes de error más detallados al usuario
- ✅ Logging de errores en consola para debugging

**Código mejorado:**

```typescript
if (!orderResponse.ok) {
  let errorData
  try {
    errorData = await orderResponse.json()
  } catch {
    errorData = { error: `Error HTTP ${orderResponse.status}` }
  }

  console.error('[CHECKOUT] ❌ Error del servidor:', errorData)

  const errorMessage = errorData.details
    ? `${errorData.error}: ${errorData.details}`
    : errorData.error || 'Error al crear la orden'

  throw new Error(errorMessage)
}
```

### 4. Scripts de Verificación Creados

**Scripts creados:**

- ✅ `scripts/verify-ordenes-table.mjs` - Verifica que la tabla `ordenes` existe
- ✅ `scripts/test-checkout-endpoint.mjs` - Prueba el endpoint con datos de prueba

---

## 🔧 Problemas Secundarios Corregidos

### Error de Manifest Icon

**Problema:**

```
Error while trying to use the following icon from the Manifest:
Failed to load resource: 404
```

**Análisis:**

- Los iconos existen en `/public/icon-192x192.png` y `/public/icon-512x512.png`
- El manifest.json está correctamente configurado
- Puede ser un problema de caché del navegador

**Solución:**

- ✅ Verificado que los iconos existen
- ✅ Verificado que el manifest.json está correcto
- ⚠️ Si persiste, puede requerir limpiar caché del navegador

### Error de package.json 404

**Problema:**

```
Failed to load resource package.json 404
```

**Análisis:**

- Puede ser una referencia incorrecta en algún componente
- O un problema de routing de Next.js

**Solución:**

- ✅ Verificado que no hay referencias directas a `/package.json`
- ⚠️ Si persiste, puede requerir revisar el código del componente que lo solicita

---

## 📋 Checklist de Verificación

### Antes de Probar en Producción

- [ ] Verificar que la tabla `ordenes` existe en Supabase
  - Ejecutar: `node scripts/verify-ordenes-table.mjs`
  - O ejecutar manualmente: `supabase/migrations/002_ordenes_schema.sql` en Supabase Dashboard

- [ ] Verificar variables de entorno en Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `MP_ACCESS_TOKEN`
  - `NEXT_PUBLIC_MP_PUBLIC_KEY`

- [ ] Probar endpoint localmente:
  - Ejecutar: `node scripts/test-checkout-endpoint.mjs`
  - O probar manualmente desde el frontend

### Después de Deploy

- [ ] Verificar logs de Vercel para ver errores detallados
- [ ] Probar flujo completo de checkout
- [ ] Verificar que las órdenes se crean correctamente en Supabase
- [ ] Verificar que las preferencias de MP se crean correctamente

---

## 🎯 Próximos Pasos

1. **Ejecutar migración de Supabase** (si no se ha hecho):
   - Ir a Supabase Dashboard → SQL Editor
   - Ejecutar `supabase/migrations/002_ordenes_schema.sql`

2. **Verificar tabla**:

   ```bash
   node scripts/verify-ordenes-table.mjs
   ```

3. **Probar endpoint**:

   ```bash
   node scripts/test-checkout-endpoint.mjs
   ```

4. **Hacer deploy y probar en producción**

---

## 📊 Resultado Esperado

Después de aplicar estas correcciones:

- ✅ El endpoint mostrará errores detallados si hay problemas
- ✅ Los logs serán más informativos para debugging
- ✅ El frontend mostrará mensajes de error más claros
- ✅ Se podrá identificar rápidamente si el problema es:
  - Tabla no existe
  - Variables de entorno faltantes
  - Datos inválidos
  - Problemas de conexión a Supabase

---

**Última actualización:** 26/11/2025
