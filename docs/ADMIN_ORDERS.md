# 🛒 Panel de Gestión de Órdenes

**Fecha:** 26/11/2025  
**Versión:** 1.0.0

---

## 📍 Ubicación

**URL:** `/admin/orders`

**Acceso:** Requiere autenticación con rol `admin` o `superadmin`

---

## 🎯 Funcionalidades

### Listado de Órdenes

- ✅ Tabla con todas las órdenes
- ✅ Filtros por estado (todas, pendiente, pagada, enviada, entregada)
- ✅ Ordenamiento por fecha (más recientes primero)
- ✅ Paginación (50 por página)

### Información Mostrada

- **ID de Orden:** Primeros 8 caracteres del UUID
- **Fecha:** Fecha y hora de creación
- **Cliente:** Nombre, email, teléfono
- **Productos:** Cantidad y nombres
- **Total:** Monto total con envío
- **Estado:** Estado actual de la orden
- **Pago:** Estado del pago
- **Envío:** Método y tracking (si aplica)

### Acciones Disponibles

1. **Ver Detalles:** Navegar a `/admin/orders/[id]`
2. **Marcar como Enviada:** Si estado es `pagada`
3. **Marcar como Entregada:** Si estado es `enviada`

---

## 📄 Vista de Detalle

**URL:** `/admin/orders/[id]`

### Información Mostrada

#### Estado y Pago

- Estado actual de la orden
- Estado del pago
- Payment ID de Mercado Pago
- Preference ID
- Fecha de pago

#### Productos

- Lista completa de productos
- Cantidad y talle de cada uno
- Precio unitario y subtotal

#### Totales

- Subtotal
- Descuento (si aplica)
- Costo de envío
- Total final

#### Cliente

- Nombre completo
- Email
- Teléfono

#### Dirección de Envío

- Calle y número
- Piso/Departamento
- Código postal
- Localidad y provincia

#### Información de Envío

- Método seleccionado
- Proveedor
- Número de seguimiento
- Costo

#### Historial

- Logs de todos los cambios
- Fecha y hora de cada cambio
- Usuario que realizó el cambio
- Datos anteriores y nuevos

---

## 🔧 API Endpoints

### GET `/api/admin/orders`

Lista todas las órdenes con filtros opcionales.

**Query Parameters:**

- `estado`: Filtrar por estado (`pendiente`, `pagada`, `enviada`, `entregada`)
- `pago_estado`: Filtrar por estado de pago
- `limit`: Cantidad de resultados (default: 50)
- `offset`: Offset para paginación (default: 0)

**Response:**

```json
{
  "orders": [
    {
      "id": "uuid",
      "cliente_nombre": "Juan Pérez",
      "cliente_email": "juan@example.com",
      "total": 50000,
      "estado": "pagada",
      "pago_estado": "aprobado",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

### GET `/api/admin/orders/[id]`

Obtiene detalles completos de una orden.

**Response:**

```json
{
  "order": {
    "id": "uuid",
    "cliente_nombre": "Juan Pérez",
    "items": [...],
    "total": 50000,
    "estado": "pagada",
    ...
  },
  "logs": [
    {
      "id": "uuid",
      "accion": "pago_aprobado",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

### PATCH `/api/admin/orders/[id]/status`

Actualiza el estado de una orden.

**Request:**

```json
{
  "estado": "enviada",
  "envio_tracking": "TRACK-1234567890-ABC123", // Opcional
  "envio_proveedor": "OCA" // Opcional
}
```

**Response:**

```json
{
  "order": {
    "id": "uuid",
    "estado": "enviada",
    ...
  }
}
```

**Acciones automáticas:**

- ✅ Crea log de cambio de estado
- ✅ Envía notificación al cliente (si estado es `enviada` o `entregada`)
- ✅ Actualiza fecha de estado

---

## 🎨 UI/UX

### Estados Visuales

- **Pendiente:** Amarillo (`bg-yellow-100`)
- **Pagada:** Verde (`bg-green-100`)
- **Enviada:** Azul (`bg-blue-100`)
- **Entregada:** Morado (`bg-purple-100`)
- **Cancelada:** Rojo (`bg-red-100`)

### Iconos

- ⏳ Pendiente: `Clock`
- ✅ Pagada: `CheckCircle2`
- 📦 Enviada: `Truck`
- 📬 Entregada: `Package`
- ❌ Cancelada: `XCircle`

---

## 📊 Resumen Ejecutivo

El panel muestra un resumen con:

- Total de órdenes
- Cantidad de pendientes
- Cantidad de enviadas
- Cantidad de entregadas

---

## 🔐 Seguridad

- ✅ Requiere autenticación JWT
- ✅ Verifica rol `admin` o `superadmin`
- ✅ Validación de datos con Zod
- ✅ Logs de auditoría para todos los cambios

---

**Última actualización:** 26/11/2025
