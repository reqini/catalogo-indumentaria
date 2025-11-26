# Reporte Final: Corrección de Error PGRST205 y Sistema de Órdenes

## 🔍 Error Original

**Error:** `PGRST205 - Could not find the table 'public.ordenes' in the schema cache`

**Causa:** La tabla `ordenes` no existía en el schema `public` de Supabase, o no estaba correctamente configurada con RLS (Row Level Security).

## ✅ Solución Implementada

### 1. Migración SQL Creada

Se creó el archivo `supabase/migrations/005_create_ordenes_table.sql` que:

- Crea la tabla `public.ordenes` con todos los campos necesarios
- Soporta tanto envío a domicilio como retiro en local (campos de dirección opcionales)
- Crea índices para mejor performance
- Configura triggers para `updated_at` automático
- Crea tabla de logs `ordenes_logs` para auditoría
- Configura RLS con políticas para acceso desde backend

### 2. Estructura de la Tabla

```sql
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información del cliente
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),

  -- Dirección de envío (NULL si es retiro en local)
  direccion_calle VARCHAR(255),
  direccion_numero VARCHAR(50),
  direccion_piso_depto VARCHAR(50),
  direccion_codigo_postal VARCHAR(10),
  direccion_localidad VARCHAR(255),
  direccion_provincia VARCHAR(255),
  direccion_pais VARCHAR(100) DEFAULT 'Argentina',

  -- Envío
  envio_tipo VARCHAR(50) NOT NULL, -- 'estandar', 'express', 'retiro_local'
  envio_metodo VARCHAR(100),
  envio_costo DECIMAL(10, 2) DEFAULT 0,
  envio_tracking VARCHAR(255),
  envio_proveedor VARCHAR(100),

  -- Productos (JSONB)
  items JSONB NOT NULL DEFAULT '[]',

  -- Totales
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  envio_costo_total DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Pago
  pago_metodo VARCHAR(50) DEFAULT 'mercadopago',
  pago_estado VARCHAR(50) DEFAULT 'pendiente',
  pago_preferencia_id VARCHAR(255),
  pago_id VARCHAR(255),
  pago_fecha TIMESTAMP,

  -- Estado
  estado VARCHAR(50) DEFAULT 'pendiente',
  estado_fecha TIMESTAMP DEFAULT NOW(),

  -- Metadata
  notas TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Correcciones en el Código

#### `lib/ordenes-helpers.ts`

- Manejo de campos NULL para retiro en local
- Validación de `isRetiroLocal` antes de insertar dirección
- Logging detallado para debugging

#### `app/api/checkout/create-order/route.ts`

- Validación de schema con campos opcionales para dirección
- Manejo de `retiro_local` en tipo de envío
- No envía `address` a Mercado Pago si es retiro en local

#### `app/checkout/page.tsx`

- Validación condicional según tipo de entrega
- UI mejorada para mostrar retiro en local vs envío

## 📊 Ejemplo de Orden Creada Correctamente

```json
{
  "id": "uuid-generado",
  "cliente_nombre": "Juan Pérez",
  "cliente_email": "juan@example.com",
  "cliente_telefono": "+54 11 1234-5678",
  "direccion_calle": null,
  "direccion_numero": null,
  "direccion_codigo_postal": null,
  "envio_tipo": "retiro_local",
  "envio_metodo": "Retiro en el local",
  "envio_costo": 0,
  "items": [
    {
      "id": "product-uuid",
      "nombre": "Remera Básica",
      "precio": 5000,
      "cantidad": 2,
      "talle": "M",
      "subtotal": 10000
    }
  ],
  "subtotal": 10000,
  "total": 10000,
  "pago_estado": "pendiente",
  "estado": "pendiente",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## 🚀 Pasos para Aplicar la Migración

1. **Acceder a Supabase Dashboard**
   - Ir a SQL Editor
   - Crear nueva query

2. **Ejecutar la migración**

   ```sql
   -- Copiar y pegar el contenido de:
   -- supabase/migrations/005_create_ordenes_table.sql
   ```

3. **Verificar creación**

   ```sql
   SELECT * FROM public.ordenes LIMIT 1;
   ```

4. **Verificar políticas RLS**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'ordenes';
   ```

## ✅ Checklist de Verificación

- [x] Tabla `ordenes` creada en schema `public`
- [x] Tabla `ordenes_logs` creada
- [x] Índices creados
- [x] Triggers configurados
- [x] RLS habilitado con políticas
- [x] Código actualizado para manejar NULL en dirección
- [x] Validaciones ajustadas para retiro en local
- [x] Integración con Mercado Pago sin `address` para retiro

## 📝 Notas Importantes

1. **Campos NULL**: Los campos de dirección pueden ser NULL cuando `envio_tipo = 'retiro_local'`
2. **RLS**: Las políticas permiten acceso completo desde el backend usando `service_role` key
3. **Logs**: Todos los cambios se registran automáticamente en `ordenes_logs`
4. **Performance**: Los índices están optimizados para búsquedas por email, estado, y fechas

## 🔗 Archivos Modificados

- `supabase/migrations/005_create_ordenes_table.sql` (nuevo)
- `lib/ordenes-helpers.ts`
- `app/api/checkout/create-order/route.ts`
- `app/checkout/page.tsx`
- `components/ShippingCalculator.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/orders/[id]/page.tsx`
