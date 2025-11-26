# 🔄 Diagrama de Flujo - API de Órdenes

**Fecha:** 26/11/2025  
**Versión:** 1.0

---

## 📊 Flujo Completo de Checkout y Orden

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (app/checkout/page.tsx)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Usuario completa formulario
                              │    - Datos personales
                              │    - Dirección
                              │    - Método de envío seleccionado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/checkout/create-order                    │
│              (app/api/checkout/create-order/route.ts)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Validar datos con Zod
                              │    - cliente: { nombre, email, telefono }
                              │    - direccion: { calle, numero, CP, etc }
                              │    - envio: { tipo, metodo, costo }
                              │    - items: [{ id, nombre, precio, cantidad }]
                              │
                              │ 3. Validar stock para cada item
                              │    - Verificar stock por talle
                              │    - Retornar error si insuficiente
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              createOrder(orderData)                             │
│              (lib/ordenes-helpers.ts)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Preparar datos de inserción
                              │    - Convertir tipos numéricos
                              │    - Manejar valores null/undefined
                              │
                              │ 5. Insertar en Supabase
                              │    INSERT INTO ordenes (...)
                              │
                              │ 6. Si error:
                              │    - Logging detallado
                              │    - Lanzar error con código y mensaje
                              │
                              │ 7. Si éxito:
                              │    - Retornar orden creada
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/pago                                    │
│              (app/api/pago/route.ts)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 8. Preparar items para MP
                              │    - Filtrar item de envío
                              │    - Agregar envío como item separado
                              │
                              │ 9. Crear preferencia en MP
                              │    - items: productos + envío
                              │    - payer: datos del cliente
                              │    - back_urls: success/failure/pending
                              │    - external_reference: orderId
                              │    - notification_url: /api/mp/webhook
                              │
                              │ 10. Retornar initPoint
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 11. Redirigir a Mercado Pago
                              │     window.location.href = initPoint
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              MERCADO PAGO (Hosted Checkout)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 12. Usuario completa pago
                              │     - Aprobado / Rechazado / Pendiente
                              │
                              │ 13. MP redirige según resultado
                              │     - /pago/success?orderId=xxx
                              │     - /pago/failure?orderId=xxx
                              │     - /pago/pending?orderId=xxx
                              │
                              │ 14. MP envía webhook
                              │     POST /api/mp/webhook
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/mp/webhook                              │
│              (app/api/mp/webhook/route.ts)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 15. Verificar firma (si configurado)
                              │
                              │ 16. Obtener pago de MP API
                              │     GET /v1/payments/{payment_id}
                              │
                              │ 17. Buscar orden por external_reference
                              │     getOrderById(payment.external_reference)
                              │
                              │ 18. Verificar idempotencia
                              │     - Si ya procesado, retornar OK
                              │
                              │ 19. Si pago aprobado:
                              │     - updateOrderStatus('pagada')
                              │     - updateOrderPayment('aprobado')
                              │     - Actualizar stock de productos
                              │     - Crear solicitud de envío
                              │     - Enviar notificaciones
                              │
                              │ 20. Si pago rechazado:
                              │     - updateOrderPayment('rechazado')
                              │     - Crear log
                              │
                              │ 21. Si pago pendiente:
                              │     - updateOrderPayment('pendiente')
                              │     - Crear log
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE (ordenes table)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 22. Orden actualizada
                              │     - estado: 'pagada'
                              │     - pago_estado: 'aprobado'
                              │     - pago_id: payment.id
                              │     - envio_tracking: (si aplica)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD                                   │
│              (app/admin/orders/page.tsx)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 23. Admin ve orden actualizada
                              │     - Lista de órdenes
                              │     - Detalles de orden
                              │     - Cambiar estado manualmente
                              │
                              ▼
                        [FIN DEL FLUJO]
```

---

## 🔄 Flujo de Estados de Orden

```
pendiente (creada)
    │
    ├─> pagada (pago aprobado)
    │       │
    │       └─> enviada (envío creado)
    │               │
    │               └─> entregada (envío completado)
    │
    ├─> rechazada (pago rechazado)
    │
    └─> cancelada (cancelada manualmente)
```

---

## 📋 Endpoints Involucrados

1. **POST /api/checkout/create-order**
   - Crea orden en BD
   - Crea preferencia en MP
   - Retorna initPoint

2. **POST /api/pago**
   - Crea preferencia en Mercado Pago
   - Valida stock
   - Retorna preferencia con initPoint

3. **POST /api/mp/webhook**
   - Recibe notificaciones de MP
   - Actualiza estado de orden
   - Actualiza stock
   - Crea envío
   - Envía notificaciones

4. **GET /pago/success**
   - Página de éxito después del pago
   - Muestra información de la orden

5. **GET /pago/failure**
   - Página de error después del pago
   - Permite reintentar

6. **GET /pago/pending**
   - Página de pago pendiente
   - Informa que se notificará cuando se apruebe

---

## 🔐 Validaciones y Seguridad

### Validaciones en Frontend

- ✅ Validación de formulario con Zod
- ✅ Validación de código postal
- ✅ Validación de método de envío seleccionado

### Validaciones en Backend

- ✅ Validación de datos con Zod schema
- ✅ Validación de stock antes de crear orden
- ✅ Validación de productos existentes
- ✅ Validación de credenciales de MP

### Seguridad

- ✅ Verificación de firma de webhook (opcional)
- ✅ Idempotencia en webhook
- ✅ Validación de external_reference
- ✅ Logs de auditoría

---

## 📊 Datos de Ejemplo

### Request a /api/checkout/create-order

```json
{
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "1123456789"
  },
  "direccion": {
    "calle": "Av. Corrientes",
    "numero": "1234",
    "pisoDepto": "1A",
    "codigoPostal": "C1000",
    "localidad": "Ciudad Autónoma de Buenos Aires",
    "provincia": "Buenos Aires",
    "pais": "Argentina"
  },
  "envio": {
    "tipo": "estandar",
    "metodo": "OCA Estándar",
    "costo": 3500,
    "demora": "3-5 días hábiles",
    "proveedor": "OCA"
  },
  "items": [
    {
      "id": "uuid-del-producto",
      "nombre": "Remera Deportiva",
      "precio": 10000,
      "cantidad": 1,
      "talle": "M",
      "subtotal": 10000,
      "imagenPrincipal": "/images/product.jpg"
    }
  ],
  "subtotal": 10000,
  "descuento": 0,
  "envioCosto": 3500,
  "total": 13500
}
```

### Response de /api/checkout/create-order

```json
{
  "orderId": "uuid-de-la-orden",
  "preferenceId": "preference-id-de-mp",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

---

**Última actualización:** 26/11/2025
